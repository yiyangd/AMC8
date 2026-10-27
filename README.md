# STEMHUB · AMC 8

**Topic-Based Practice Workbook** — 650 questions, 7 chapters, 55 topics.

Live site: **https://yiyangd.github.io/AMC8/**

Browse by chapter and section, filter by original Part A/B/C, search question IDs or bilingual topic names, enlarge question images, and reveal English answers and numbered explanations. No sign-in is required.

## Run locally

Use Node.js 24 LTS.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4321/AMC8/`.

```sh
npm run check
npm run build
npm run validate
npm run preview
```

The static build includes every question image and normalized content record. GitHub Actions never reads local source PDFs or a D: drive.

## Content and re-import

`src/data/workbook.json` is the normalized, committed content snapshot. `public/questions/` contains 650 full question crops from the final STEMHUB workbook. The importer preserves the workbook's chapter/section numbering and verifies each primary topic against the audited matrix. Answers and explanations are imported from the three reviewed English JSON files; they are not regenerated.

With the original source library available locally, install PyMuPDF and Pillow in your Python environment, then run:

```sh
python scripts/import_content.py --source-root "D:\AMC8_Codex"
npm run check
npm run build
npm run validate
```

The importer records source hashes, question-to-workbook-page mappings, image dimensions, topic checks and counts in its receipt. Existing source files are read only. Commit the regenerated snapshot and images together.

Parts refer to the **original exam question number**: A = Q1–10, B = Q11–20, C = Q21–25. They are not a fixed difficulty rating. There is no separate 2021 exam.

## Publish

Push to `main`. `.github/workflows/deploy.yml` checks types, builds all static pages, validates content and links, and deploys the `dist` artifact to GitHub Pages. Repository Settings → Pages must use **GitHub Actions** as its source.

Astro is configured with `site: https://yiyangd.github.io`, `base: /AMC8` and trailing slashes. Keep all internal links and assets behind the shared base-path helper.

References: [Astro GitHub Pages deployment](https://docs.astro.build/en/guides/deploy/github/), [GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Validation

`npm run validate` verifies all 650 unique questions, 7 chapters, 55 sections, part counts, sorting, answer completeness, generated routes, anchors, images and internal links. Receipts are in `reports/`.

For responsive browser checks, start the preview server and run:

```sh
npx playwright install chromium
npm run test:browser
```

Set `TEST_ORIGIN` to test a deployed origin, or `PLAYWRIGHT_CHANNEL=msedge` to use an installed Edge browser. Browser checks cover desktop/tablet/mobile layouts, filtering, search, direct anchors, disclosures, zoom, drawer, math formatting and special shared/multipart questions. Screenshots are local QA artifacts and are not committed.
