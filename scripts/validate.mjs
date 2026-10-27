#!/usr/bin/env node
/** Offline content/build audit. No source workspace or third-party parser needed in CI. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = '/AMC8';
const EXPECTED_YEARS = Array.from({ length: 27 }, (_, i) => 2000 + i).filter(y => y !== 2021);
const GROUPS = [['2001Q7', '2001Q8', '2001Q9'], ['2002Q8', '2002Q9', '2002Q10'],
  ['2003Q8', '2003Q9', '2003Q10'], ['2006Q14', '2006Q15', '2006Q16']];
const SPECIALS = [...GROUPS.flat(), '2008Q25', '2022Q4', '2025Q13'];
const VOID = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const exists = file => fs.existsSync(file) && fs.statSync(file).isFile();
const positive = value => Number.isFinite(value) && value > 0;
const cleanId = value => String(value ?? '').replace(/^(?:question-|q-)/i, '').replace(/q/i, 'Q');
const normal = value => String(value ?? '').replace(/\^\{([^{}]+)\}|_\{([^{}]+)\}/g, (_, a, b) => a ?? b)
  .replace(/[\^_]([A-Za-z0-9])/g, '$1').replace(/\s+/g, ' ').trim();
const natural = (a, b) => String(a).localeCompare(String(b), 'en', { numeric: true });
const expectedPart = n => n <= 10 ? 'A' : n <= 20 ? 'B' : 'C';
const sortQuestions = (a, b) => a.part.localeCompare(b.part) || a.year - b.year || a.number - b.number;

function decode(value) {
  const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—' };
  return String(value).replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (match, key) => {
    if (key[0] !== '#') return entities[key.toLowerCase()] ?? match;
    const code = key[1].toLowerCase() === 'x' ? parseInt(key.slice(2), 16) : parseInt(key.slice(1), 10);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
  });
}

/** Small non-executing HTML tree, including proper handling of quoted > and raw script bodies. */
function parseHtml(html) {
  const root = { tag: '#root', attrs: {}, children: [], parent: null };
  const stack = [root];
  const tokens = html.match(/<!--[\s\S]*?-->|<![^>]*>|<\/?[A-Za-z][^>"']*(?:(?:"[^"]*"|'[^']*')[^>"']*)*>|[^<]+|</g) ?? [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.startsWith('<!--') || token.startsWith('<!')) continue;
    if (token.startsWith('</')) {
      const tag = token.match(/^<\/\s*([^\s>]+)/)?.[1]?.toLowerCase();
      for (let j = stack.length - 1; j > 0; j--) {
        if (stack[j].tag === tag) { stack.length = j; break; }
      }
      continue;
    }
    if (token[0] !== '<' || !/^<[A-Za-z]/.test(token)) {
      stack.at(-1).children.push({ tag: '#text', text: decode(token), parent: stack.at(-1) });
      continue;
    }
    const tag = token.match(/^<([^\s/>]+)/)[1].toLowerCase();
    const attrs = {};
    const attrText = token.slice(token.indexOf(tag) + tag.length).replace(/\/?\s*>$/, '');
    for (const match of attrText.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
      attrs[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4] ?? '');
    }
    const node = { tag, attrs, children: [], parent: stack.at(-1) };
    stack.at(-1).children.push(node);
    if (['script', 'style'].includes(tag)) {
      const raw = [];
      while (i + 1 < tokens.length && !new RegExp(`^</${tag}\\s*>`, 'i').test(tokens[i + 1])) raw.push(tokens[++i]);
      if (i + 1 < tokens.length) i++;
      node.children.push({ tag: '#text', text: raw.join(''), parent: node });
    } else if (!VOID.has(tag) && !/\/\s*>$/.test(token)) stack.push(node);
  }
  return root;
}
function descendants(node, test = () => true) {
  const out = [];
  for (const child of node.children ?? []) {
    if (test(child)) out.push(child);
    out.push(...descendants(child, test));
  }
  return out;
}
const hasClass = (node, name) => (node.attrs?.class ?? '').split(/\s+/).includes(name);
const inTag = (node, tag) => { for (let p = node; p; p = p.parent) if (p.tag === tag) return true; return false; };
function nodeText(node, skip = () => false) {
  if (skip(node)) return '';
  if (node.tag === '#text') return node.text;
  return (node.children ?? []).map(child => nodeText(child, skip)).join('');
}
function imageSize(buffer) {
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20), format: 'PNG' };
  }
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') throw new Error('Not a WebP/PNG image');
  for (let pos = 12; pos + 8 <= buffer.length;) {
    const kind = buffer.toString('ascii', pos, pos + 4), size = buffer.readUInt32LE(pos + 4), data = pos + 8;
    if (kind === 'VP8X' && data + 10 <= buffer.length) return { width: buffer.readUIntLE(data + 4, 3) + 1, height: buffer.readUIntLE(data + 7, 3) + 1, format: 'WebP' };
    if (kind === 'VP8L' && data + 5 <= buffer.length && buffer[data] === 0x2f) {
      const bits = buffer.readUInt32LE(data + 1);
      return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1, format: 'WebP' };
    }
    if (kind === 'VP8 ' && data + 10 <= buffer.length && buffer.toString('hex', data + 3, data + 6) === '9d012a') {
      return { width: buffer.readUInt16LE(data + 6) & 0x3fff, height: buffer.readUInt16LE(data + 8) & 0x3fff, format: 'WebP' };
    }
    pos = data + size + (size % 2);
  }
  throw new Error('Image dimensions not found');
}
function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
    ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
}

function selfTest() {
  const doc = parseHtml('<article data-question-id="2003Q9"><img alt="a > b"><details data-answer="true"><summary>Show answer &amp; explanation</summary><p>x<sup>2</sup></p></details></article><script>if(a<b){x="<p>"}</script>');
  const articles = descendants(doc, n => n.tag === 'article');
  if (articles.length !== 1 || descendants(doc, n => n.tag === 'img')[0].attrs.alt !== 'a > b') throw new Error('HTML parser self-test failed');
  if (descendants(doc, n => n.tag === 'details').length !== 1 || cleanId('q-2003q9') !== '2003Q9') throw new Error('Anchor self-test failed');
  if (normal(nodeText(articles[0])) !== 'Show answer & explanationx2') throw new Error('Entity/math self-test failed');
  const outside = nodeText(articles[0], n => n.tag === 'details');
  if (outside !== '' || !inTag(descendants(doc, n => n.tag === 'sup')[0], 'details')) throw new Error('Answer enclosure self-test failed');
  const synthetic = Buffer.alloc(30); synthetic.write('RIFF', 0); synthetic.write('WEBP', 8); synthetic.write('VP8X', 12); synthetic.writeUInt32LE(10, 16); synthetic.writeUIntLE(649, 24, 3); synthetic.writeUIntLE(999, 27, 3);
  const size = imageSize(synthetic);
  if (size.width !== 650 || size.height !== 1000) throw new Error('Image metadata self-test failed');
  return 6;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--self-test')) { console.log(JSON.stringify({ passed: true, selfTests: selfTest() })); return; }
  const sourceAt = args.indexOf('--source-root');
  if (sourceAt !== -1 && !args[sourceAt + 1]) throw new Error('--source-root requires a path');
  const sourceRoot = sourceAt === -1 ? null : path.resolve(args[sourceAt + 1]);
  const unknown = args.filter((arg, i) => arg !== '--source-root' && !(sourceAt >= 0 && i === sourceAt + 1));
  if (unknown.length) throw new Error(`Unknown option: ${unknown.join(' ')}`);
  const errors = [], warnings = [], counts = {}, stats = { selfTests: selfTest() };
  let errorCount = 0;
  const check = (ok, code, detail) => {
    counts[code] = (counts[code] ?? 0) + 1;
    if (!ok) { errorCount++; if (errors.length < 200) errors.push({ code, detail }); }
    return Boolean(ok);
  };
  const dataFile = path.join(project, 'src/data/workbook.json');
  let data = { chapters: [], sections: [], questions: [] };
  if (check(exists(dataFile), 'DATA_FILE', 'src/data/workbook.json must exist')) {
    try { data = readJson(dataFile); } catch (error) { check(false, 'DATA_JSON', error.message); }
  }
  for (const key of ['chapters', 'sections', 'questions']) if (!check(Array.isArray(data[key]), 'DATA_ARRAY', key)) data[key] = [];
  const { chapters, sections, questions } = data;
  check(chapters.length === 7, 'CHAPTER_COUNT', chapters.length);
  check(sections.length === 55, 'SECTION_COUNT', sections.length);
  check(questions.length === 650, 'QUESTION_COUNT', questions.length);
  const qmap = new Map(questions.map(q => [q.id, q])), smap = new Map(sections.map(s => [s.id, s]));
  check(qmap.size === questions.length, 'UNIQUE_QUESTION_ID', 'Question IDs must occur once');
  check(smap.size === sections.length && new Set(sections.map(s => s.slug)).size === sections.length, 'UNIQUE_SECTION', 'IDs and slugs');
  check(new Set(chapters.map(c => String(c.id))).size === 7, 'UNIQUE_CHAPTER', 'IDs');
  check(chapters.every((c, i) => Number(c.id) === i + 1), 'CHAPTER_ORDER', 'Chapters1–7 in order');
  check(sections.every((s, i) => i === 0 || natural(sections[i - 1].id, s.id) < 0), 'SECTION_ORDER', 'Natural chapter/section order');
  const partTotals = { A: 0, B: 0, C: 0 }, yearCounts = {}, assigned = new Map(), imageBuffers = new Map();
  let receipt = null;
  const receiptFile = path.join(project, 'reports/import_receipt.json');
  if (exists(receiptFile)) {
    try { receipt = readJson(receiptFile); } catch (error) { check(false, 'IMPORT_RECEIPT_JSON', error.message); }
    if (receipt) {
      check(receipt.passed === true && receipt.imagesComplete === 650, 'IMPORT_COMPLETE', 'Import must finish before validation');
      check(receipt.workbookJsonSha256 === hash(fs.readFileSync(dataFile)), 'IMPORT_DATA_HASH', 'Frozen imported JSON hash');
    }
  } else warnings.push({ code: 'IMPORT_RECEIPT_ABSENT', detail: 'Content/dimension checks run; frozen source provenance receipt is unavailable.' });

  for (const c of chapters) {
    check(typeof c.titleEn === 'string' && c.titleEn.trim() && typeof c.titleZh === 'string' && c.titleZh.trim(), 'CHAPTER_TITLES', c.id);
    check(c.questionCount === questions.filter(q => String(q.chapterId) === String(c.id)).length, 'CHAPTER_QUESTION_TOTAL', c.id);
    check(c.sectionCount === sections.filter(s => String(s.chapterId) === String(c.id)).length, 'CHAPTER_SECTION_TOTAL', c.id);
  }
  for (const s of sections) {
    check(/^\d+\.\d+$/.test(s.id) && s.slug === s.id.replaceAll('.', '-'), 'SECTION_ID_SLUG', s.id);
    check(chapters.some(c => String(c.id) === String(s.chapterId)) && Number(s.id.split('.')[0]) === Number(s.chapterId), 'SECTION_CHAPTER', s.id);
    check(typeof s.code === 'string' && /^[A-Z]{2}\d{2}$/.test(s.code), 'SECTION_CODE', s.id);
    check(typeof s.titleEn === 'string' && s.titleEn.trim() && typeof s.titleZh === 'string' && s.titleZh.trim(), 'SECTION_TITLES', s.id);
    if (!check(Array.isArray(s.questionIds), 'SECTION_QUESTIONS', s.id)) continue;
    const sq = s.questionIds.map(id => qmap.get(id)).filter(Boolean);
    for (const id of s.questionIds) assigned.set(id, (assigned.get(id) ?? 0) + 1);
    check(sq.length === s.questionIds.length, 'SECTION_KNOWN_QUESTIONS', s.id);
    check(sq.every(q => q.sectionId === s.id && String(q.chapterId) === String(s.chapterId)), 'SECTION_MAPPING', s.id);
    const ordered = [...sq].sort(sortQuestions).map(q => q.id);
    check(JSON.stringify(ordered) === JSON.stringify(s.questionIds), 'PART_YEAR_NUMBER_ORDER', s.id);
    for (const p of ['A', 'B', 'C']) check(s.partCounts?.[p] === sq.filter(q => q.part === p).length, 'SECTION_PART_TOTAL', `${s.id}/${p}`);
  }
  for (const q of questions) {
    check(q.id === `${q.year}Q${q.number}` && EXPECTED_YEARS.includes(q.year) && Number.isInteger(q.number) && q.number >= 1 && q.number <= 25, 'QUESTION_ID_YEAR_NUMBER', q.id);
    check(assigned.get(q.id) === 1 && smap.has(q.sectionId), 'QUESTION_ASSIGNED_ONCE', q.id);
    check(q.part === expectedPart(q.number), 'QUESTION_PART', q.id);
    if (q.part in partTotals) partTotals[q.part]++;
    yearCounts[q.year] = (yearCounts[q.year] ?? 0) + 1;
    check(Number.isInteger(q.workbookPage) && q.workbookPage > 0 && q.workbookPage <= 267, 'WORKBOOK_PAGE', q.id);
    check(/^[A-E]$/.test(q.answer?.choice ?? ''), 'ANSWER_CHOICE', q.id);
    check(typeof q.answer?.value === 'string' && q.answer.value.trim(), 'ANSWER_VALUE', q.id);
    check(!/\p{Script=Han}/u.test(q.answer?.value ?? ''), 'ENGLISH_ANSWER_VALUE', q.id);
    check(Array.isArray(q.answer?.steps) && q.answer.steps.length > 0 && q.answer.steps.every(step => typeof step === 'string' && step.trim()), 'ANSWER_STEPS', q.id);
    check(q.image?.src === `questions/${q.id}.webp`, 'QUESTION_IMAGE_PATH', q.id);
    check(Number.isInteger(q.image?.width) && q.image.width > 0 && Number.isInteger(q.image?.height) && q.image.height > 0 && positive(q.image?.displayWidth) && q.image.displayWidth <= q.image.width, 'IMAGE_METADATA', q.id);
    const file = path.join(project, 'public', q.image?.src ?? '__missing__');
    if (check(exists(file), 'PUBLIC_IMAGE_EXISTS', q.id)) {
      try {
        const buffer = fs.readFileSync(file), actual = imageSize(buffer); imageBuffers.set(q.id, buffer);
        check(actual.width === q.image.width && actual.height === q.image.height, 'IMAGE_ACTUAL_DIMENSIONS', q.id);
        if (receipt?.images?.[q.id]) {
          const r = receipt.images[q.id];
          check(r.sha256 === hash(buffer) && r.width === actual.width && r.height === actual.height, 'IMPORT_IMAGE_HASH', q.id);
          check(r.sourcePixelsPreservedByLosslessEncoding === true, 'IMPORT_LOSSLESS_IMAGE', q.id);
        } else if (receipt) check(false, 'IMPORT_IMAGE_RECORD', q.id);
      } catch (error) { check(false, 'IMAGE_DECODE_METADATA', `${q.id}: ${error.message}`); }
    }
  }
  check(JSON.stringify(partTotals) === JSON.stringify({ A: 260, B: 260, C: 130 }), 'TOTAL_PARTS', partTotals);
  check(EXPECTED_YEARS.every(y => yearCounts[y] === 25) && Object.keys(yearCounts).length === 26, 'ALL26_YEARS', yearCounts);
  check(!JSON.stringify(data).includes('answer_value_source'), 'NO_PRIVATE_SOURCE_ANSWER_FIELDS', 'Source-only answer values must not enter public data');
  const specialReports = SPECIALS.map(id => ({ id, sharedGroup: GROUPS.find(g => g.includes(id)) ?? null,
    risk: id === '2008Q25' ? 'Corrected concentric-circle shading is mandatory; old licensed artwork was reversed.'
      : ['2022Q4', '2025Q13'].includes(id) ? 'Legacy source spans two images/pages; choices on continuation must remain in the final crop.'
      : 'Standalone sibling source crop omits shared material; final accepted workbook crop must already include it.',
    imagePresent: imageBuffers.has(id), cropProvenancePresent: Boolean(receipt?.images?.[id]?.contentBbox) }));

  // Optional local evidence audit. The default build/CI path has no dependency on D:\\AMC8_Codex.
  if (sourceRoot) {
    try {
      const audit = readJson(path.join(sourceRoot, 'output/amc8_audit_matrix/audit_records.json'));
      const amap = new Map(audit.map(a => [a.id, a]));
      const categoryChapter = { AR: 1, AL: 2, GE: 3, NT: 4, CO: 5, PS: 6, LO: 7 };
      for (const q of questions) {
        const a = amap.get(q.id), s = smap.get(q.sectionId);
        check(a?.primary?.subtype_id === s?.code && categoryChapter[a?.primary?.category_id] === Number(q.chapterId), 'SOURCE_CLASSIFICATION', q.id);
        check(a?.answer_choice === q.answer?.choice, 'SOURCE_ANSWER_CHOICE', q.id);
      }
      if (receipt) for (const [key, value] of Object.entries(receipt.sourceFingerprints ?? {})) {
        const source = path.resolve(sourceRoot, value.path);
        check(exists(source) && hash(fs.readFileSync(source)) === value.sha256, 'SOURCE_FINGERPRINT', key);
      }
      const manifestRelative = receipt?.sourceFingerprints?.workbookManifest?.path ?? 'output/amc8_topic_workbook/stemhub_topic_based/layout_manifest.json';
      const manifest = readJson(path.join(sourceRoot, manifestRelative));
      const placements = new Map(manifest.placements.map(p => [p.id, p]));
      for (const q of questions) check(placements.get(q.id)?.body_page === q.workbookPage, 'SOURCE_WORKBOOK_PAGE', q.id);
      for (const special of specialReports) {
        const p = placements.get(special.id), a = p?.assets?.[0], r = receipt?.images?.[special.id];
        special.sourcePdfPage = p?.pdf_page; special.contentBbox = p?.content_bbox;
        special.sharedContextIncluded = a?.shared_context_included; special.legacySourceImageParts = a?.source_images?.length;
        check(Boolean(p && r) && p.pdf_page === r.pdfPage && JSON.stringify(p.content_bbox) === JSON.stringify(r.contentBbox), 'SPECIAL_CROP_PROVENANCE', special.id);
        if (special.sharedGroup) check(a?.shared_context_included === true, 'SPECIAL_SHARED_CONTEXT', special.id);
        if (special.id === '2008Q25') check(/2008_exam_print_corrected\.pdf/i.test(a?.source_pdf ?? ''), 'SPECIAL_CORRECTED_2008', special.id);
        if (['2022Q4', '2025Q13'].includes(special.id)) check(a?.source_images?.length === 2, 'SPECIAL_CONTINUATION_OPTIONS', special.id);
      }
      stats.sourceValidation = { requested: true, questionClassifications: questions.length, specialQuestions: SPECIALS.length };
    } catch (error) { check(false, 'SOURCE_VALIDATION', error.message); }
  } else stats.sourceValidation = { requested: false, status: 'skipped; use --source-root for local matrix/PDF evidence checks' };

  const dist = path.join(project, 'dist'), htmlFiles = walk(dist).filter(f => f.endsWith('.html'));
  check(exists(path.join(dist, 'index.html')), 'BUILT_HOME', 'Run npm run build first');
  const docs = new Map(htmlFiles.map(file => [file, parseHtml(fs.readFileSync(file, 'utf8'))]));
  const docIds = new Map();
  for (const [file, doc] of docs) {
    const ids = descendants(doc, n => Boolean(n.attrs?.id)).map(n => n.attrs.id);
    check(new Set(ids).size === ids.length, 'UNIQUE_HTML_IDS', path.relative(dist, file));
    docIds.set(file, new Set(ids));
  }
  function localTarget(raw, currentFile, label = 'INTERNAL_LINK') {
    if (!raw || /^(?:mailto:|tel:|data:)/i.test(raw)) return;
    if (/^(?:javascript:|vbscript:)/i.test(raw)) { check(false, label, raw); return; }
    const relative = path.relative(dist, currentFile).split(path.sep).join('/');
    const url = new URL(raw, `https://local.invalid${BASE}/${relative.replace(/index\.html$/, '')}`);
    if (url.origin !== 'https://local.invalid' && !(url.pathname === BASE || url.pathname.startsWith(`${BASE}/`))) return;
    if (!check(url.pathname === BASE || url.pathname.startsWith(`${BASE}/`), 'BASE_PATH', `${path.relative(dist, currentFile)} -> ${raw}`)) return;
    let relativeTarget;
    try { relativeTarget = decodeURIComponent(url.pathname.slice(BASE.length)).replace(/^\//, ''); }
    catch { check(false, label, raw); return; }
    let target = path.resolve(dist, relativeTarget);
    if (!target.startsWith(`${dist}${path.sep}`) && target !== dist) { check(false, label, raw); return; }
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
    else if (!path.extname(target)) target = path.join(target, 'index.html');
    if (check(exists(target), label, `${path.relative(dist, currentFile)} -> ${raw}`) && url.hash && target.endsWith('.html')) {
      let anchor; try { anchor = decodeURIComponent(url.hash.slice(1)); } catch { anchor = url.hash.slice(1); }
      check(docIds.get(target)?.has(anchor), 'LINK_ANCHOR_TARGET', `${raw} (${path.relative(dist, currentFile)})`);
    }
    return target;
  }
  const renderedQuestionIds = [];
  for (const [file, doc] of docs) {
    for (const node of descendants(doc, n => Boolean(n.attrs))) {
      for (const attribute of ['href', 'src', 'poster', 'data-image']) if (node.attrs[attribute]) localTarget(node.attrs[attribute], file);
      if (node.attrs.srcset) for (const entry of node.attrs.srcset.split(',')) localTarget(entry.trim().split(/\s+/)[0], file, 'SRCSET_TARGET');
      // The active chapter's navigation accordion is intentionally open. Only answers must be closed.
      if (node.tag === 'details' && (node.attrs['data-answer'] === 'true' || hasClass(node, 'answer-panel'))) {
        check(!Object.hasOwn(node.attrs, 'open'), 'DETAILS_CLOSED_BY_DEFAULT', path.relative(dist, file));
      }
    }
    const wrappers = descendants(doc, n => Boolean(n.attrs?.['data-question-id']));
    for (const wrapper of wrappers) {
      const id = wrapper.attrs['data-question-id'], q = qmap.get(id); renderedQuestionIds.push(id);
      if (!check(Boolean(q), 'RENDERED_KNOWN_QUESTION', id)) continue;
      check(cleanId(wrapper.attrs.id) === id, 'QUESTION_ANCHOR', id);
      check(wrapper.attrs['data-part'] === q.part, 'RENDERED_PART', id);
      const imgs = descendants(wrapper, n => n.tag === 'img');
      check(imgs.length === 1 && imgs[0].attrs.src === `${BASE}/${q.image.src}`, 'RENDERED_QUESTION_IMAGE', id);
      if (imgs[0]) check(Number(imgs[0].attrs.width) === q.image.width && Number(imgs[0].attrs.height) === q.image.height, 'RENDERED_IMAGE_DIMENSIONS', id);
      const answers = descendants(wrapper, n => n.tag === 'details' && (n.attrs['data-answer'] === 'true' || hasClass(n, 'answer-panel')));
      if (check(answers.length === 1, 'ONE_ANSWER_DETAILS', id)) {
        const answer = answers[0], summary = descendants(answer, n => n.tag === 'summary')[0];
        const summaryText = normal(nodeText(summary ?? { children: [] }));
        check(Boolean(summary) && !/\b[A-E]\b|\d/.test(summaryText), 'SUMMARY_NO_ANSWER_LEAK', id);
        const line = descendants(answer, n => hasClass(n, 'answer-line'))[0];
        check(normal(nodeText(line ?? { children: [] })).includes(`Answer ${q.answer.choice}`) && normal(nodeText(line ?? { children: [] })).includes(normal(q.answer.value)), 'RENDERED_ANSWER_VALUE', id);
        const ol = descendants(answer, n => n.tag === 'ol' && hasClass(n, 'solution-steps'))[0];
        const steps = descendants(ol ?? { children: [] }, n => n.tag === 'li').map(n => normal(nodeText(n)));
        check(JSON.stringify(steps) === JSON.stringify(q.answer.steps.map(normal)), 'RENDERED_ALL_STEPS', id);
      }
      const outside = normal(nodeText(wrapper, n => n.tag === 'details' || ['script', 'style'].includes(n.tag)));
      check(!/\b(?:correct\s+answer|answer)\s*[:：]?\s*\(?[A-E]\)?\b/i.test(outside), 'NO_VISIBLE_ANSWER_LABEL', id);
      check(!q.answer.steps.some(step => normal(step).length >= 16 && outside.includes(normal(step))), 'NO_SOLUTION_STEP_LEAK', id);
      const exposed = descendants(wrapper, n => Boolean(n.attrs) && !inTag(n, 'details') &&
        (Object.keys(n.attrs).some(a => /^data-answer-(?:choice|value|steps)$/.test(a)) || hasClass(n, 'answer-content') || hasClass(n, 'solution-steps')));
      check(exposed.length === 0, 'ANSWER_MARKUP_ENCLOSED', id);
    }
    for (const node of descendants(doc, n => hasClass(n, 'answer-content') || hasClass(n, 'answer-line') || hasClass(n, 'solution-steps'))) {
      check(inTag(node, 'details'), 'GLOBAL_ANSWER_ENCLOSURE', path.relative(dist, file));
    }
  }
  check(renderedQuestionIds.length === 650 && new Set(renderedQuestionIds).size === 650 && questions.every(q => renderedQuestionIds.includes(q.id)), 'ALL650_RENDERED_ONCE', renderedQuestionIds.length);
  for (const s of sections) {
    const file = path.join(dist, 'sections', s.slug, 'index.html'), doc = docs.get(file);
    if (!check(Boolean(doc), 'BUILT_SECTION', s.id)) continue;
    const ids = descendants(doc, n => Boolean(n.attrs?.['data-question-id'])).map(n => n.attrs['data-question-id']);
    check(JSON.stringify(ids) === JSON.stringify(s.questionIds), 'BUILT_SECTION_ORDER', s.id);
    const h1 = descendants(doc, n => n.tag === 'h1')[0];
    check(normal(nodeText(h1 ?? { children: [] })) === normal(s.titleEn), 'SECTION_PAGE_TITLE', s.id);
    for (const p of ['A', 'B', 'C']) {
      const group = descendants(doc, n => n.attrs?.['data-part-group'] === p);
      check(group.length === (s.partCounts[p] > 0 ? 1 : 0), 'BUILT_PART_GROUP', `${s.id}/${p}`);
    }
  }
  for (const c of chapters) {
    const file = path.join(dist, 'chapters', String(c.id), 'index.html'), doc = docs.get(file);
    if (!check(Boolean(doc), 'BUILT_CHAPTER', c.id)) continue;
    const links = descendants(doc, n => n.tag === 'a' && hasClass(n, 'section-link'));
    const expected = sections.filter(s => String(s.chapterId) === String(c.id)).map(s => `${BASE}/sections/${s.slug}/`);
    check(JSON.stringify(links.map(n => n.attrs.href)) === JSON.stringify(expected), 'CHAPTER_ALL_SECTION_LINKS', c.id);
  }
  const home = docs.get(path.join(dist, 'index.html'));
  const cards = descendants(home ?? { children: [] }, n => n.attrs?.['data-chapter-id'] && hasClass(n, 'chapter-card'));
  check(cards.length === 7, 'HOME_ALL_CHAPTER_CARDS', cards.length);
  for (const c of chapters) {
    const card = cards.find(n => String(n.attrs['data-chapter-id']) === String(c.id));
    check(Boolean(card) && card.attrs.href === `${BASE}/chapters/${c.id}/` && normal(nodeText(card)).includes(normal(c.titleEn)) && normal(nodeText(card)).includes(`${c.sectionCount} topics`) && normal(nodeText(card)).includes(`${c.questionCount} questions`), 'HOME_CHAPTER_CARD_CONTENT', c.id);
  }
  const distImages = walk(path.join(dist, 'questions')).filter(f => /\.webp$/i.test(f));
  check(distImages.length === 650, 'BUILT650_IMAGES', distImages.length);
  for (const q of questions) {
    const file = path.join(dist, q.image.src);
    check(exists(file) && imageBuffers.has(q.id) && hash(fs.readFileSync(file)) === hash(imageBuffers.get(q.id)), 'DIST_IMAGE_UNCHANGED', q.id);
  }
  const searchFile = path.join(dist, 'search-index.json');
  if (check(exists(searchFile), 'SEARCH_INDEX_EXISTS', 'Built search index')) {
    try {
      const entries = readJson(searchFile), qentries = entries.filter(e => e.kind === 'question');
      check(qentries.length === 650 && new Set(qentries.map(e => e.id)).size === 650, 'SEARCH650_QUESTIONS', qentries.length);
      check(entries.filter(e => e.kind === 'chapter').length === 7 && entries.filter(e => e.kind === 'section').length === 55, 'SEARCH_NAVIGATION_TOTALS', entries.length);
      for (const entry of entries) {
        check(!Object.keys(entry).some(k => /answer|solution|steps/i.test(k)), 'SEARCH_NO_ANSWER_LEAK', entry.id);
        localTarget(entry.href, path.join(dist, 'index.html'), 'SEARCH_HREF_TARGET');
      }
    } catch (error) { check(false, 'SEARCH_INDEX_JSON', error.message); }
  }
  Object.assign(stats, { chapters: chapters.length, sections: sections.length, questions: questions.length,
    years: EXPECTED_YEARS, partCounts: partTotals, htmlPages: htmlFiles.length, renderedQuestionAnchors: renderedQuestionIds.length,
    builtQuestionImages: distImages.length, dataSha256: exists(dataFile) ? hash(fs.readFileSync(dataFile)) : null });
  const report = { schemaVersion: 'amc8-content-audit-v1', passed: errorCount === 0, generatedAt: new Date().toISOString(),
    basePath: BASE, stats, errorCount, warningCount: warnings.length, errors, warnings, checks: counts,
    specialPlacementReview: { scope: '12 shared-context questions, corrected2008Q25, two-page2022Q4/2025Q13; optional local source cross-check.', questions: specialReports } };
  const reportFile = path.join(project, 'reports/content_audit.json');
  fs.mkdirSync(path.dirname(reportFile), { recursive: true });
  fs.writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ passed: report.passed, questions: questions.length, chapters: chapters.length, sections: sections.length,
    htmlPages: htmlFiles.length, errorCount, warningCount: warnings.length, report: 'reports/content_audit.json' }));
  for (const error of errors.slice(0, 8)) console.error(`${error.code}: ${JSON.stringify(error.detail)}`);
  if (errorCount) process.exitCode = 1;
}

main().catch(error => { console.error(`Validation failed: ${error.stack ?? error.message}`); process.exitCode = 1; });
