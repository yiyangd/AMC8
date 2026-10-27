#!/usr/bin/env python3
"""Import the accepted AMC 8 workbook without modifying any source files.

Requires Python 3.10+, PyMuPDF and Pillow (with WebP support).

    python scripts/import_content.py
    python scripts/import_content.py --source-root D:/AMC8_Codex --output-root .

The final, already corrected PDF is the only image source. Every image is a
4x crop of its accepted top-left content_bbox, including shared conditions and
all answer options. No OCR, reflow, or legacy website images are used.
Existing images are reused only when their complete recipe, dimensions and
SHA-256 match the previous receipt. A checkpoint is saved every 20 new images.
"""
from __future__ import annotations

import argparse
from collections import Counter, OrderedDict
from concurrent.futures import ProcessPoolExecutor, as_completed
from hashlib import sha256
import io
import json
import math
import multiprocessing
import os
from pathlib import Path
import sys

import fitz
from PIL import Image, features
import PIL


REPO = Path(__file__).resolve().parents[1]
SCALE = 4
DISPLAY_FONT_PX = 18
RECIPE = {
    "version": "accepted-pdf-content-bbox-v1",
    "scale": SCALE,
    "dpi": 72 * SCALE,
    "colorspace": "RGB",
    "alpha": False,
    "format": "WebP",
    "lossless": True,
    "quality": 95,
    "method": 4,
    "pymupdf": fitz.VersionBind,
    "pillow": PIL.__version__,
    "libwebp": features.version("webp"),
}
SOURCE_FILES = {
    "workbookManifest": "output/amc8_topic_workbook/stemhub_topic_based/layout_manifest.json",
    "workbookPdf": "output/pdf/AMC8_2000-2026_Topic-Based_Practice_Workbook_STEMHUB.pdf",
    "audit": "output/amc8_audit_matrix/audit_records.json",
    "taxonomy": "output/amc8_audit_matrix/taxonomy.json",
    "sectionInventory": "output/amc8_companion_textbook/inventory/section_inventory.json",
    "questionInventory": "output/amc8_companion_textbook/inventory/question_inventory.json",
    "solutionsManifest": "output/amc8_topic_workbook/solutions_en_2026-10-26/solutions_manifest.json",
    "solutionsEarly": "output/amc8_topic_workbook/solutions_en_2026-10-26/content_2000_2008_en.json",
    "solutionsMiddle": "output/amc8_topic_workbook/solutions_en_2026-10-26/content_2009_2017_en.json",
    "solutionsRecent": "output/amc8_topic_workbook/solutions_en_2026-10-26/content_2018_2026_en.json",
}
_PDF = None


def digest(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest()


def json_bytes(data) -> bytes:
    return (json.dumps(data, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def require(condition: bool, message: str):
    if not condition:
        raise ValueError(message)


def image_key(pdf_sha: str, placement: dict) -> str:
    payload = {
        "pdfSha256": pdf_sha, "id": placement["id"],
        "pdfPage": placement["pdf_page"], "contentBbox": placement["content_bbox"],
        "recipe": RECIPE,
    }
    return sha256(json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def worker_init(pdf_path: str):
    global _PDF
    _PDF = fitz.open(pdf_path)


def render_image(job: dict) -> tuple[str, dict]:
    page = _PDF[job["pdfPage"] - 1]
    pix = page.get_pixmap(
        matrix=fitz.Matrix(SCALE, SCALE), clip=fitz.Rect(job["contentBbox"]),
        colorspace=fitz.csRGB, alpha=False,
    )
    require((pix.width, pix.height) == (job["width"], job["height"]),
            f"Raster bounds changed for {job['id']}")
    image = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    buffer = io.BytesIO()
    image.save(buffer, format="WEBP", lossless=True, quality=95, method=4, exact=True)
    encoded = buffer.getvalue()
    Path(job["outputPath"]).write_bytes(encoded)
    # Decode the actual file bytes: dimensions and losslessness are assertions,
    # not assumptions about the encoder.
    with Image.open(io.BytesIO(encoded)) as decoded:
        require(decoded.size == image.size, f"Invalid encoded dimensions: {job['id']}")
        require(decoded.convert("RGB").tobytes() == pix.samples,
                f"WebP encoding altered source pixels: {job['id']}")
    return job["id"], {
        "src": f"questions/{job['id']}.webp", "width": pix.width, "height": pix.height,
        "sha256": sha256(encoded).hexdigest(), "bytes": len(encoded),
        "recipeSha256": job["recipeSha256"], "pdfPage": job["pdfPage"],
        "contentBbox": job["contentBbox"], "equivalentFontSizePt": job["fontSize"],
        "sourcePixelsPreservedByLosslessEncoding": True,
    }


def cached_image_is_valid(path: Path, record: dict, job: dict) -> bool:
    if not path.is_file() or record.get("recipeSha256") != job["recipeSha256"]:
        return False
    if (record.get("width"), record.get("height")) != (job["width"], job["height"]):
        return False
    if not record.get("sourcePixelsPreservedByLosslessEncoding") or digest(path) != record.get("sha256"):
        return False
    try:
        with Image.open(path) as image:
            return image.format == "WEBP" and image.size == (job["width"], job["height"])
    except (OSError, ValueError):
        return False


def prepare(source_root: Path, output_root: Path):
    paths = {key: source_root / relative for key, relative in SOURCE_FILES.items()}
    require(all(path.is_file() for path in paths.values()), "One or more required source files are missing.")
    fingerprints = {key: {"path": SOURCE_FILES[key], "sha256": digest(path)} for key, path in paths.items()}
    docs = {key: load_json(path) for key, path in paths.items() if key != "workbookPdf"}
    layout, audit_doc, taxonomy = docs["workbookManifest"], docs["audit"], docs["taxonomy"]
    placements = layout["placements"]
    audit = {q["id"]: q for q in audit_doc}
    inventory = {q["id"]: q for q in docs["questionInventory"]["questions"]}
    section_inventory = {s["section"]: s for s in docs["sectionInventory"]["sections"]}
    ids = [q["id"] for q in placements]
    require(len(ids) == len(set(ids)) == 650, "Workbook must have 650 unique questions.")
    require(set(ids) == set(audit) == set(inventory), "Workbook, audit and frozen inventory ID sets differ.")
    require(layout["meta"]["output_sha256"] == fingerprints["workbookPdf"]["sha256"], "PDF does not match the final manifest.")
    require(layout["meta"]["source_audit_sha256"] == fingerprints["audit"]["sha256"], "Final workbook uses a different audit.")
    require(Counter(q["part"] for q in placements) == Counter({"A": 260, "B": 260, "C": 130}), "Part counts differ.")
    years = sorted({q["year"] for q in placements})
    require(years == [y for y in range(2000, 2027) if y != 2021], "Contest year set differs.")
    require(all(sum(q["year"] == year for q in placements) == 25 for year in years), "A year does not have 25 questions.")
    categories = {c["id"]: c for c in taxonomy["categories"]}
    subtypes = {s["id"]: s for s in taxonomy["subtypes"]}
    solution_data = {}
    for key, expected_count in [("solutionsEarly", 225), ("solutionsMiddle", 225), ("solutionsRecent", 200)]:
        batch = docs[key]
        require(len(batch) == expected_count and not (set(solution_data) & set(batch)), "Solution batch count or uniqueness differs.")
        expected_hash = docs["solutionsManifest"]["content_input_sha256"][paths[key].name]
        require(fingerprints[key]["sha256"] == expected_hash, "Solution content does not match its accepted manifest.")
        solution_data.update(batch)
    require(docs["solutionsManifest"]["passed"] is True, "English solutions have not passed their source acceptance.")
    require(set(solution_data) == set(ids), "Solution and workbook ID sets differ.")

    body_pages = [p for p in layout["pages"] if p["kind"] == "body"]
    sections = OrderedDict()
    chapters = OrderedDict()
    for page in body_pages:
        chapter_id, sid, code = page["chapter"], page["section"], page["subtype_id"]
        require(page["chapter_code"] in categories, f"Unknown chapter category {sid}")
        inv = section_inventory[sid]
        require((chapter_id, code, page["chapter_en"], page["chapter_zh"], page["title_en"], page["title_zh"]) ==
                (inv["chapter"], inv["subtype_id"], inv["chapter_en"], inv["chapter_zh"], inv["title_en"], inv["title_zh"]),
                f"Workbook names/code differ from frozen inventory: {sid}")
        require(subtypes[code]["category_id"] == page["chapter_code"] and subtypes[code]["short_name_zh"] == page["title_zh"],
                f"Taxonomy disagrees with section {sid}")
        chapter = {"id": chapter_id, "titleEn": page["chapter_en"], "titleZh": page["chapter_zh"], "questionCount": 0, "sectionCount": 0}
        if chapter_id not in chapters:
            chapters[chapter_id] = chapter
        else:
            require(all(chapters[chapter_id][k] == chapter[k] for k in ["titleEn", "titleZh"]), "Inconsistent chapter title.")
        if sid not in sections:
            sections[sid] = {"id": sid, "slug": sid.replace(".", "-"), "chapterId": chapter_id, "code": code,
                             "titleEn": page["title_en"], "titleZh": page["title_zh"], "questionIds": [],
                             "partCounts": {"A": 0, "B": 0, "C": 0}}
            chapters[chapter_id]["sectionCount"] += 1
    require(len(chapters) == 7 and len(sections) == 55, "Chapter/section count differs.")
    require([c["sectionCount"] for c in chapters.values()] == [8, 10, 14, 7, 6, 6, 4], "Section counts by chapter differ.")
    require("NT07" not in {s["code"] for s in sections.values()} and sections["4.7"]["code"] == "NT08", "NT section omission/mapping differs.")

    questions, jobs = [], []
    pdf = fitz.open(paths["workbookPdf"])
    try:
        require(len(pdf) == layout["meta"]["pdf_page_count"] == 283, "Final workbook must have 283 physical pages.")
        for q in placements:
            qid, sid, part = q["id"], q["section"], q["part"]
            a, inv, sec = audit[qid], inventory[qid], sections[sid]
            require(a["primary"]["subtype_id"] == q["subtype_id"] == sec["code"], f"Primary mismatch: {qid}")
            require(a["primary"]["category_id"] == subtypes[sec["code"]]["category_id"], f"Primary category mismatch: {qid}")
            require((inv["section"], inv["part"], inv["body_page"], inv["pdf_page"]) == (sid, part, q["body_page"], q["pdf_page"]), f"Inventory page mismatch: {qid}")
            expected_part = "A" if q["question_number"] <= 10 else "B" if q["question_number"] <= 20 else "C"
            require(part == expected_part, f"Source question-position Part mismatch: {qid}")
            require(qid == f"{q['year']}Q{q['question_number']}", f"Noncanonical question ID: {qid}")
            require(q["pdf_page"] == q["body_page"] + 16, f"Physical/printed page mismatch: {qid}")
            crop = fitz.Rect(q["content_bbox"])
            page = pdf[q["pdf_page"] - 1]
            require(not crop.is_empty and all(math.isfinite(v) for v in crop), f"Invalid crop: {qid}")
            require(page.rect.contains(crop), f"Crop outside page: {qid}")
            require(page.rotation == 0, f"Unexpected page rotation: {qid}")
            raster_rect = (crop * fitz.Matrix(SCALE, SCALE)).irect
            font = float(q["font_size"])
            require(font > 0, f"Missing equivalent font size: {qid}")
            solution = solution_data[qid]
            require(solution["answer_choice"] == a["answer_choice"] and solution["answer_value_source"] == a["answer_value"], f"Accepted answer differs from audit: {qid}")
            require(solution["answer_choice"] in "ABCDE" and len(solution["answer_choice"]) == 1, f"Invalid choice: {qid}")
            require(isinstance(solution["steps_en"], list) and all(isinstance(s, str) and s.strip() for s in solution["steps_en"]), f"Missing English steps: {qid}")
            require(isinstance(solution["answer_value_en"], str) and solution["answer_value_en"].strip(), f"Missing English value: {qid}")
            questions.append({
                "id": qid, "year": q["year"], "number": q["question_number"],
                "chapterId": q["chapter"], "sectionId": sid, "part": part,
                "workbookPage": q["body_page"],
                "image": {"src": f"questions/{qid}.webp", "width": raster_rect.width, "height": raster_rect.height,
                          "displayWidth": round(crop.width * DISPLAY_FONT_PX / font, 4)},
                "answer": {"choice": solution["answer_choice"], "value": solution["answer_value_en"], "steps": solution["steps_en"]},
            })
            sec["questionIds"].append(qid)
            sec["partCounts"][part] += 1
            chapters[q["chapter"]]["questionCount"] += 1
            jobs.append({"id": qid, "pdfPage": q["pdf_page"], "contentBbox": list(crop),
                         "width": raster_rect.width, "height": raster_rect.height, "fontSize": font,
                         "recipeSha256": image_key(fingerprints["workbookPdf"]["sha256"], q),
                         "outputPath": str(output_root / "public/questions" / f"{qid}.webp")})
    finally:
        pdf.close()
    for sid, sec in sections.items():
        inv = section_inventory[sid]
        require(sec["questionIds"] == sum((inv["question_ids_by_part"][p] for p in "ABC"), []), f"Section order mismatch: {sid}")
        require(sec["partCounts"] == inv["part_counts"], f"Section counts mismatch: {sid}")
    data = {
        "meta": {"schemaVersion": "amc8-topic-website-v1", "questionCount": 650, "sectionCount": 55, "chapterCount": 7,
                 "years": years, "yearRange": [2000, 2026], "unavailableYears": [2021],
                 "partCounts": {"A": 260, "B": 260, "C": 130}, "taxonomyVersion": taxonomy["version"],
                 "sourceWorkbook": paths["workbookPdf"].name, "sourceWorkbookSha256": fingerprints["workbookPdf"]["sha256"],
                 "workbookManifestSha256": fingerprints["workbookManifest"]["sha256"], "auditSha256": fingerprints["audit"]["sha256"],
                 "imageScale": SCALE, "imageDpi": 72 * SCALE, "imageEncoding": "WebP lossless", "displayFontPx": DISPLAY_FONT_PX},
        "chapters": list(chapters.values()), "sections": list(sections.values()), "questions": questions,
    }
    require("answer_value_source" not in json.dumps(data), "A source-only answer field leaked into public data.")
    return data, jobs, paths, fingerprints


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, default=REPO.parent)
    parser.add_argument("--output-root", type=Path, default=REPO)
    parser.add_argument("--workers", type=int, default=min(4, os.cpu_count() or 1))
    args = parser.parse_args()
    source_root, output_root = args.source_root.resolve(), args.output_root.resolve()
    require(features.check("webp"), "Pillow was built without WebP support.")
    require(args.workers > 0, "--workers must be positive.")
    data, jobs, sources, fingerprints = prepare(source_root, output_root)
    data_path = output_root / "src/data/workbook.json"
    receipt_path = output_root / "reports/import_receipt.json"
    image_directory = output_root / "public/questions"
    data_path.parent.mkdir(parents=True, exist_ok=True)
    receipt_path.parent.mkdir(parents=True, exist_ok=True)
    image_directory.mkdir(parents=True, exist_ok=True)
    old_receipt = {}
    if receipt_path.is_file():
        try:
            old_receipt = load_json(receipt_path)
        except (ValueError, OSError):
            pass
    cached = old_receipt.get("images", {})
    records, pending = {}, []
    for job in jobs:
        record = cached.get(job["id"], {})
        if cached_image_is_valid(Path(job["outputPath"]), record, job):
            records[job["id"]] = record
        else:
            pending.append(job)
    # Publish the complete deterministic contract early so the UI can compile
    # while the image export runs. The receipt remains in_progress until all
    # assets are verified; consumers should require its final passed flag.
    encoded_data = json_bytes(data)
    if not data_path.is_file() or data_path.read_bytes() != encoded_data:
        data_path.write_bytes(encoded_data)
    print(json.dumps({"event": "data_ready", "data": str(data_path), "questions": 650,
                      "imagesToRender": len(pending), "imagesReused": len(records),
                      "sample": {k: v for k, v in data["questions"][0].items() if k != "answer"},
                      "answerFields": ["choice", "value", "steps"]}, ensure_ascii=True), flush=True)

    def save_receipt(passed=False):
        receipt = {
            "schemaVersion": "amc8-content-import-v1", "passed": passed,
            "status": "complete" if passed else "in_progress", "sourceFingerprints": fingerprints,
            "recipe": RECIPE, "questionCount": 650, "sectionCount": 55, "chapterCount": 7,
            "partCounts": {"A": 260, "B": 260, "C": 130},
            "imagesComplete": len(records), "imageBytes": sum(r["bytes"] for r in records.values()),
            "workbookJsonSha256": digest(data_path),
            "images": {job["id"]: records[job["id"]] for job in jobs if job["id"] in records},
            "checks": {"primarySubtypeMatchesAuditForAll650": True, "sourceNamesMatchFrozenInventory": True,
                       "taxonomyCodesMatchWorkbook": True, "NT07OmittedAndNT08IsSection4_7": True,
                       "englishSolutionInputsMatchAcceptedHashes": True, "answerChoicesAndSourceValuesMatchAudit": True,
                       "publicDataUsesEnglishAnswerValueOnly": True, "imageSourceIsFinalAcceptedPdfOnly": True,
                       "sharedContextAlreadyIncludedInFinalQuestionCrops": True, "noLegacyWebsiteImagesUsed": True,
                       "everyRenderedImageIsPixelLossless": all(r["sourcePixelsPreservedByLosslessEncoding"] for r in records.values()),
                       "all650ImagesVerified": passed, "sourcesUnchangedAfterImport": passed},
            "issues": [],
        }
        receipt_path.write_bytes(json_bytes(receipt))
        return receipt

    save_receipt()
    if pending:
        with ProcessPoolExecutor(max_workers=args.workers, initializer=worker_init, initargs=(str(sources["workbookPdf"]),)) as executor:
            futures = [executor.submit(render_image, job) for job in pending]
            for completed, future in enumerate(as_completed(futures), 1):
                qid, record = future.result()
                records[qid] = record
                if completed % 20 == 0 or completed == len(pending):
                    save_receipt()
                    print(json.dumps({"event": "images", "complete": len(records), "total": 650}), flush=True)
    require(len(records) == 650, "Not all question images completed.")
    for job in jobs:
        require(cached_image_is_valid(Path(job["outputPath"]), records[job["id"]], job), f"Final image check failed: {job['id']}")
    require({p.name for p in image_directory.glob("*.webp")} == {f"{job['id']}.webp" for job in jobs}, "Unexpected/missing .webp files in public/questions.")
    require(all(digest(path) == fingerprints[key]["sha256"] for key, path in sources.items()), "A source file changed during import.")
    receipt = save_receipt(passed=True)
    print(json.dumps({"event": "complete", "passed": True, "images": 650,
                      "imageBytes": receipt["imageBytes"], "workbookJsonSha256": receipt["workbookJsonSha256"],
                      "receipt": str(receipt_path)}, ensure_ascii=True), flush=True)


if __name__ == "__main__":
    multiprocessing.freeze_support()
    main()
