import { chromium } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin = (process.env.TEST_ORIGIN || 'http://127.0.0.1:4321').replace(/\/$/, '');
const base = `${origin}/AMC8/`;
const data = JSON.parse(await readFile(new URL('../src/data/workbook.json', import.meta.url), 'utf8'));
await mkdir(new URL('../reports/screenshots/', import.meta.url), { recursive: true });
const options = { headless: true };
if (process.env.PLAYWRIGHT_CHANNEL) options.channel = process.env.PLAYWRIGHT_CHANNEL;
const browser = await chromium.launch(options);
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const issues = [];
page.on('pageerror', error => issues.push(error.message));
page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(origin)) issues.push(`${response.status()}: ${response.url()}`); });
const checks = [];
async function check(name, fn) { await fn(); checks.push(name); console.log(`PASS ${name}`); }
async function noOverflow() { assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Horizontal page overflow'); }
try {
  await check('Homepage: seven cards, desktop grid', async () => {
    await page.goto(base); await page.locator('.chapter-card').last().waitFor();
    assert.equal(await page.locator('.chapter-card').count(), 7);
    assert.equal(await page.locator('.chapter-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length), 3);
    await noOverflow(); await page.screenshot({ path: 'reports/screenshots/home-desktop.png', fullPage: true });
  });
  await check('Chapter navigation and 30-question sample section', async () => {
    await page.locator('.chapter-card').first().click();
    assert.equal(await page.locator('.section-link').count(), 8);
    await page.locator('main .section-link[href$="/1-3/"]').click();
    assert.equal(await page.locator('.question-card').count(), 30);
    assert.equal(await page.locator('.answer-panel[open]').count(), 0);
    assert.equal(await page.locator('.section-nav a[aria-current="page"]').count(), 1);
    await page.screenshot({ path: 'reports/screenshots/ratios-desktop.png' });
  });
  await check('Part filters and answer disclosure', async () => {
    const section = data.sections.find(s => s.id === '1.3');
    for (const part of ['A', 'B', 'C']) {
      await page.locator(`[data-filter="${part}"]`).click();
      assert.equal(await page.locator('.question-card:visible').count(), section.partCounts[part]);
    }
    await page.locator('[data-filter="All"]').click();
    const first = page.locator('.answer-panel').first();
    await first.locator('summary').click(); assert(await first.getAttribute('open') !== null);
    assert(await first.locator('.solution-steps li').count() > 0);
    assert(await first.locator('.answer-line').isVisible());
    await first.locator('summary').click(); assert.equal(await first.getAttribute('open'), null);
  });
  await check('Search: ID, year, English and Chinese; hidden-part anchor reveal', async () => {
    await page.locator('[data-filter="C"]').click();
    await page.locator('.search-trigger').click();
    const input = page.locator('#workbook-search');
    await input.fill('2003Q9');
    const result = page.locator('.search-result').first(); await result.waitFor();
    assert.match(await result.innerText(), /2003Q9/); await result.click();
    await page.waitForURL('**/#q-2003q9');
    assert(await page.locator('#q-2003q9').isVisible());
    assert.equal(await page.locator('[data-filter="All"]').getAttribute('aria-pressed'), 'true');
    // Searching the current hash must reveal it even when hashchange will not fire.
    await page.locator('[data-filter="C"]').click();
    await page.locator('.search-trigger').click(); await input.fill('2003Q9');
    await page.locator('.search-result').first().click();
    assert(await page.locator('#q-2003q9').isVisible());
    for (const term of ['2026', 'ratios', '比例']) {
      await page.locator('.search-trigger').click(); await input.fill(term);
      await page.locator('.search-result').first().waitFor();
      assert(await page.locator('.search-result').count() > 0);
      await page.keyboard.press('Escape');
    }
  });
  await check('Image enlargement and keyboard close', async () => {
    await page.locator('#q-2003q9 .question-image-button').click();
    assert(await page.locator('#image-dialog').isVisible());
    await page.locator('.zoom-image').evaluate(img => img.decode());
    await page.keyboard.press('Escape');
    assert(!(await page.locator('#image-dialog').isVisible()));
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('data-question')), '2003Q9');
  });
  await check('Deep refresh and previous/next links', async () => {
    await page.reload(); assert(await page.locator('#q-2003q9').isVisible());
    const next = page.locator('.section-pagination a').last();
    const href = await next.getAttribute('href'); await next.click(); assert(page.url().endsWith(href));
    await page.goBack(); assert(page.url().includes('/sections/1-3/'));
  });
  await check('Tablet: two cards per row and responsive reading', async () => {
    await page.setViewportSize({ width: 820, height: 1180 }); await page.goto(base);
    assert.equal(await page.locator('.chapter-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length), 2);
    await noOverflow(); await page.screenshot({ path: 'reports/screenshots/home-tablet.png', fullPage: true });
    await page.goto(`${base}sections/1-3/`); await noOverflow();
  });
  await check('Mobile: one column, drawer, focus and no overflow', async () => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.goto(base);
    assert.equal(await page.locator('.chapter-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length), 1);
    await noOverflow(); await page.screenshot({ path: 'reports/screenshots/home-mobile.png', fullPage: true });
    await page.goto(`${base}sections/1-3/`); await noOverflow();
    await page.locator('.menu-toggle').click();
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
    assert(await page.locator('.sidebar .nav-home').isVisible());
    await page.keyboard.press('Control+k');
    assert(await page.locator('#search-dialog').isVisible());
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.activeElement?.className), 'menu-toggle');
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    await page.screenshot({ path: 'reports/screenshots/ratios-mobile.png' });
  });
  await check('Special materials, geometry and multipart image decoding', async () => {
    const ids = ['2001Q7','2001Q8','2001Q9','2002Q8','2002Q9','2002Q10','2003Q8','2003Q9','2003Q10','2006Q14','2006Q15','2006Q16','2008Q25','2022Q4','2025Q13'];
    for (const id of ids) {
      const q = data.questions.find(q => q.id === id); const s = data.sections.find(s => s.id === q.sectionId);
      await page.goto(`${base}sections/${s.slug}/#q-${id.toLowerCase()}`);
      const card = page.locator(`#q-${id.toLowerCase()}`);
      await card.locator('img').evaluate(img => img.decode());
      assert(await card.locator('img').evaluate(img => img.naturalWidth > 400));
      await card.locator('summary').click(); await noOverflow();
      if (['2008Q25','2022Q4','2025Q13'].includes(id)) await card.screenshot({ path: `reports/screenshots/${id}-mobile.png` });
    }
  });
  await check('Empty Part disabled and mathematical text safety', async () => {
    const s = data.sections.find(s => Object.values(s.partCounts).includes(0));
    await page.goto(`${base}sections/${s.slug}/`);
    for (const part of ['A','B','C']) if (!s.partCounts[part]) assert(await page.locator(`[data-filter="${part}"]`).isDisabled());
    const q = data.questions.find(q => q.answer.steps.some(step => step.includes('^{')));
    const qs = data.sections.find(s => s.id === q.sectionId);
    await page.goto(`${base}sections/${qs.slug}/#q-${q.id.toLowerCase()}`);
    const card = page.locator(`#q-${q.id.toLowerCase()}`); await card.locator('summary').click();
    assert(await card.locator('sup').count() > 0);
    assert(!(await card.locator('.answer-content').innerText()).includes('^{'));
    const sub = data.questions.find(q => q.id === '2014Q24');
    const ss = data.sections.find(s => s.id === sub.sectionId);
    await page.goto(`${base}sections/${ss.slug}/#q-2014q24`);
    await page.locator('#q-2014q24 summary').click();
    assert((await page.locator('#q-2014q24 sub').allTextContents()).includes('100'));
  });
  assert.deepEqual(issues, [], 'Browser console/resource errors');
  await writeFile(new URL('../reports/browser_audit.json', import.meta.url), JSON.stringify({ passed: true, origin, checks, issues, viewports: ['1440×1000','820×1180','390×844'] }, null, 2) + '\n');
} finally { await browser.close(); }
