import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';

const origin = (process.env.TEST_ORIGIN || 'http://127.0.0.1:4321').replace(/\/$/, '');
const challengeUrl = origin + '/AMC8/play/';
const levelsBySection = {
  '1.1': [
    ['2010Q1', 'ACB'], ['2006Q2', 'BAC'], ['2025Q2', 'BCAB'], ['2005Q1', 'BAC'],
    ['2008Q1', 'CAB'], ['2023Q1', 'ABCA'], ['2017Q1', 'CABC'], ['2014Q1', 'ABC'],
    ['2026Q1', 'BCBA'], ['2026Q2', 'BACB'], ['2017Q5', 'BCAC'], ['2016Q8', 'CABC'],
    ['2018Q5', 'BCAB'], ['2013Q3', 'ABCA'], ['2000Q8', 'BCAB'], ['2006Q9', 'BCAB'],
    ['2018Q2', 'ACBA'], ['2022Q8', 'CBAC'], ['2020Q12', 'CABA'], ['2019Q17', 'ABCA'],
  ],
  '1.2': [
    ['2012Q4', 'ACB'], ['2024Q2', 'CABA'], ['2000Q2', 'BCAB'], ['2005Q6', 'BACB'],
    ['2019Q3', 'CABC'], ['2012Q20', 'ACBAC'],
  ],
};
const workbook = JSON.parse(await readFile(new URL('../src/data/workbook.json', import.meta.url), 'utf8'));
const sourceSections = new Map(workbook.sections.map(section => [section.id, section]));
const sourceQuestions = new Map(workbook.questions.map(question => [question.id, question]));
const sectionPath = id => '/AMC8/sections/' + sourceSections.get(id).slug + '/';
const startButton = (page, id) => page.locator('[data-start-section="' + id + '"]');
const keyForPart = { A: '1', B: '2', C: '3' };
const normalizeAnswer = text => text.trim()
  .replace(/\[\[([^\]]+)\]\]/g, '$1')
  .replace(/\s+(?:students|points)$/i, '')
  .replace(/[,$\s]/g, '')
  .replaceAll('−', '-');

for (const [id, levels] of Object.entries(levelsBySection)) {
  assert.deepEqual(levels.map(([sourceId]) => sourceId).sort(), [...sourceSections.get(id).questionIds].sort());
}
const allLevels = Object.values(levelsBySection).flat();
assert.equal(allLevels.length, 26);
assert.equal(allLevels.reduce((sum, [, answers]) => sum + answers.length, 0), 99);

const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
});
const issues = [];
const checkedWorkbookHtml = new Map();
const figureQuestions = new Set(['2025Q2', '2000Q8']);
const gridQuestion = '2026Q2';

async function withPage(options, test) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  page.on('pageerror', error => issues.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400 && response.url().startsWith(origin + '/')) {
      issues.push(response.status() + ' ' + response.url());
    }
  });
  try {
    await test(page);
  } finally {
    await context.close();
  }
}

async function expectScreen(page, screen) {
  await expect(page.locator('#app')).toHaveAttribute('data-screen', screen);
}

async function openChooser(page, fromSection) {
  if (fromSection) {
    await page.goto(origin + sectionPath(fromSection));
    const entry = page.locator('main a[href$="/play/?section=' + fromSection + '"]');
    await entry.click();
    await expect(page).toHaveURL(challengeUrl + '?section=' + fromSection);
  } else {
    await page.goto(challengeUrl);
  }
  await expectScreen(page, 'intro');
  await expect(page.locator('[data-start-section]')).toHaveCount(2);
  for (const id of Object.keys(levelsBySection)) {
    await expect(startButton(page, id)).toBeVisible();
    if (id === fromSection) await expect(startButton(page, id)).toHaveAttribute('aria-current', 'true');
    else await expect(startButton(page, id)).not.toHaveAttribute('aria-current', 'true');
  }
  await expect(page.locator('#intro-back-link')).toHaveAttribute('href', fromSection ? sectionPath(fromSection) : '/AMC8/');
}

async function clickWhenReady(page, locator) {
  await page.waitForFunction(() => performance.now() - window.__shooter.S.shownAt > 400);
  await locator.click();
}

async function advanceTo(page, state) {
  await page.evaluate(target => {
    const game = window.__shooter;
    const reached = () => game.S.screen === target || game.S.phase === target;
    for (let i = 0; i < 240 && !reached(); i++) game.advance(0.05);
    if (!reached()) {
      throw new Error('Expected ' + target + '; reached ' + game.S.screen + '/' + game.S.phase);
    }
  }, state);
}

async function shoot(page, part, target) {
  return page.evaluate(({ part, key, target }) => {
    const game = window.__shooter;
    const { S } = game;
    const send = type => window.dispatchEvent(new KeyboardEvent(type, { key }));
    send('keydown');
    try {
      if (target === 'stepClear') {
        for (let i = 0; i < 120 && S.phase !== 'break'; i++) game.advance(0.05);
        if (S.phase !== 'break' || S.locked !== part || S.armor <= 0) {
          throw new Error('Correct part ' + part + ' did not lock before breaking');
        }
      }
      for (let i = 0; i < 240 && S.phase !== target; i++) game.advance(0.05);
      if (S.phase !== target) throw new Error('Shot at ' + part + ' did not enter ' + target);
      return {
        cleared: S.cleared,
        hearts: S.hearts,
        feedback: S.feedback?.key,
        sealed: game.pods.find(pod => pod.key === part).state === 'sealed',
        firstTry: S.stats[S.ei].firstTry[S.si],
      };
    } finally {
      send('keyup');
    }
  }, { part, key: keyForPart[part], target });
}

async function verifyInitialPrompt(page, sourceId) {
  const bounds = await page.locator('#qcard').evaluate(card => {
    const cardTop = card.getBoundingClientRect().top + card.clientTop;
    const top = Math.max(0, cardTop);
    const bottom = Math.min(window.innerHeight, cardTop + card.clientHeight);
    const badge = card.querySelector('#q-badge').getBoundingClientRect();
    const prompt = card.querySelector('#q-prompt').getBoundingClientRect();
    return {
      scrollTop: card.scrollTop,
      top,
      bottom,
      badgeTop: badge.top,
      badgeBottom: badge.bottom,
      promptTop: prompt.top,
      promptBottom: prompt.bottom,
    };
  });
  const diagnostic = sourceId + ' initial question card: ' + JSON.stringify(bounds);
  assert.equal(bounds.scrollTop, 0, diagnostic);
  assert(bounds.badgeTop >= bounds.top - 1 && bounds.badgeBottom <= bounds.bottom + 1, diagnostic);
  assert(bounds.promptTop >= bounds.top - 1, diagnostic);
  assert(bounds.promptBottom > bounds.promptTop && bounds.promptBottom <= bounds.bottom + 1, diagnostic);
}

async function verifyReference(page, sourceId) {
  const figure = page.locator('#q-figure');
  const dialog = page.locator('#figure-dialog');
  const grid = page.locator('#q-grid');
  if (figureQuestions.has(sourceId)) {
    await expect(figure).toBeVisible();
    await expect(figure.locator('img')).toHaveAttribute('alt', /\S/);
    await expect.poll(() => figure.locator('img').evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
    await verifyInitialPrompt(page, sourceId);
    await figure.press('Enter');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('#figure-caption')).toContainText(/\S/);
    await expect.poll(() => dialog.locator('img').evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
    await page.keyboard.down('1');
    await page.evaluate(() => window.__shooter.advance(2));
    await page.keyboard.up('1');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    assert.deepEqual(await page.evaluate(() => [__shooter.S.phase, __shooter.S.hearts]), ['think', 5]);
  } else {
    await expect(figure).toBeHidden();
  }
  if (sourceId === gridQuestion) {
    await expect(grid).toBeVisible();
    await verifyInitialPrompt(page, sourceId);
    await expect(grid.locator('tbody tr')).toHaveCount(5);
    await expect(grid.locator('td')).toHaveCount(35);
    const entries = await grid.locator('td').allTextContents();
    assert.equal(entries.reduce((sum, entry) => sum + Number(entry), 0), 53);
  } else {
    await expect(grid).toBeHidden();
  }
}

async function verifyReview(page, sectionId, sourceId, stepCount) {
  await expectScreen(page, 'review');
  await expect(page.locator('#rv-steps li')).toHaveCount(stepCount);
  const official = sourceQuestions.get(sourceId).answer.choice;
  await expect(page.locator('#rv-answer')).toContainText('(' + official + ')');
  const href = await page.locator('#rv-link').getAttribute('href');
  assert(href, 'Missing workbook link for ' + sourceId);
  const link = new URL(href, page.url());
  const anchor = 'q-' + sourceId.toLowerCase();
  assert.equal(link.pathname, sectionPath(sectionId));
  assert.equal(link.hash, '#' + anchor);
  if (!checkedWorkbookHtml.has(link.pathname)) {
    const response = await page.request.get(origin + link.pathname);
    assert(response.ok(), 'Workbook page should resolve for ' + sourceId);
    checkedWorkbookHtml.set(link.pathname, await response.text());
  }
  assert(checkedWorkbookHtml.get(link.pathname).includes('id="' + anchor + '"'), 'Workbook anchor missing for ' + sourceId);
}

async function expectHistory(page, sectionId, earnedEntries, currentId) {
  const levels = levelsBySection[sectionId];
  const rows = page.locator('#run-history-list li');
  await expect(rows).toHaveCount(levels.length);
  const { roster, current } = await rows.evaluateAll(rows => ({
    roster: rows.map(row => {
      const rating = row.querySelector('.history-stars');
      return {
        id: row.dataset.sourceId,
        label: row.querySelector('.history-question')?.textContent.trim(),
        stars: rating?.getAttribute('aria-label') ?? null,
        hasStars: Boolean(rating) || /[★☆⭐]/u.test(row.textContent),
      };
    }),
    current: rows.filter(row => row.getAttribute('aria-current') === 'step').map(row => row.dataset.sourceId),
  }));
  const earned = new Map(earnedEntries);
  assert.deepEqual(roster, levels.map(([id]) => {
    const stars = earned.get(id);
    return {
      id,
      label: id.replace('Q', ' · Q'),
      stars: stars ? stars + ' of 3 stars' : null,
      hasStars: Boolean(stars),
    };
  }));
  if (currentId !== undefined) assert.deepEqual(current, [currentId]);
}

async function expectWideHistory(page) {
  const sidebar = page.locator('#run-history');
  await expect(sidebar).toBeVisible();
  await expect(page.locator('#history-toggle')).toBeHidden();
  const [arena, card, history] = await Promise.all([
    page.locator('.scene').boundingBox(), page.locator('#qcard').boundingBox(), sidebar.boundingBox(),
  ]);
  assert(arena && card && history, 'Battle, question, and history must all be visible');
  assert(history.x >= card.x + card.width + 7.5, 'History should sit to the right of the question card');
  assert(history.x + history.width <= arena.x + arena.width + 1, 'History should fit inside the arena');
}

async function completeEncounter(page, answers) {
  for (const answer of answers) {
    await advanceTo(page, 'think');
    await shoot(page, answer, 'stepClear');
  }
  await advanceTo(page, 'review');
}

async function playSection(page, sectionId) {
  const levels = levelsBySection[sectionId];
  await clickWhenReady(page, startButton(page, sectionId));
  const history = [];
  const data = await page.evaluate(() => window.__shooter.ENC.map(encounter => ({
    sourceId: encounter.id,
    answer: encounter.steps.at(-1).options[encounter.steps.at(-1).correct].text.en,
    keys: encounter.steps.map(step => step.correct).join(''),
  })));
  assert.deepEqual(data.map(({ sourceId, keys }) => [sourceId, keys]), levels);
  for (const { sourceId, answer } of data) {
    assert.equal(normalizeAnswer(answer), normalizeAnswer(sourceQuestions.get(sourceId).answer.value), sourceId);
  }

  for (const [index, [sourceId, answers]] of levels.entries()) {
    await advanceTo(page, 'think');
    await expectHistory(page, sectionId, history, sourceId);
    await expect(page.locator('#q-source')).toContainText(new RegExp(sourceId.replace('Q', '.*Problem\\s+')));
    await verifyReference(page, sourceId);
    for (const [step, answer] of Array.from(answers).entries()) {
      const state = await page.evaluate(() => {
        const game = window.__shooter;
        return [game.S.ei, game.S.si, game.S.cleared, game.S.hearts, game.S.phase];
      });
      assert.deepEqual(state, [index, step, step, 5, 'think'], sourceId);
      await expect(page.locator('#q-badge')).toContainText('Step ' + (step + 1) + ' of ' + answers.length);
      await expect(page.locator('#q-solved li')).toHaveCount(step);
      assert.deepEqual(await shoot(page, answer, 'stepClear'), {
        cleared: step + 1, hearts: 5, feedback: undefined, sealed: false, firstTry: true,
      });
      await advanceTo(page, step === answers.length - 1 ? 'review' : 'think');
    }
    await verifyReview(page, sectionId, sourceId, answers.length);
    history.push([sourceId, 3]);
    await expectHistory(page, sectionId, history);
    await clickWhenReady(page, page.locator('#btn-next'));
  }
  const steps = levels.reduce((sum, [, answers]) => sum + answers.length, 0);
  await expectScreen(page, 'summary');
  await expect(page.locator('#sm-first')).toHaveText(steps + ' / ' + steps);
  await expect(page.locator('#sm-score')).toHaveText(String(steps * 100));
  await expect(page.locator('#sm-stars')).toHaveText(levels.length * 3 + ' / ' + levels.length * 3);
  await expect(page.locator('#sm-list li')).toHaveCount(levels.length);
  await expect(page.locator('#sm-link')).toHaveAttribute('href', sectionPath(sectionId));
  console.log('PASS section ' + sectionId + ': ' + levels.length + ' encounters, ' + steps + ' steps, reviews and workbook links');
}

async function testRetry(page) {
  await openChooser(page);
  const [[firstId, firstAnswers], [retryId, retryAnswers], [thirdId, thirdAnswers]] = levelsBySection['1.1'];
  await clickWhenReady(page, startButton(page, '1.1'));
  await advanceTo(page, 'think');
  await expectHistory(page, '1.1', [], firstId);
  await expectWideHistory(page);
  assert.equal(await page.locator('#run-history-list').evaluate(list => list.scrollTop), 0);
  await completeEncounter(page, firstAnswers);
  const history = [[firstId, 3]];
  await expectHistory(page, '1.1', history);
  await clickWhenReady(page, page.locator('#btn-next'));
  await advanceTo(page, 'think');
  await expectWideHistory(page);
  let hearts = 5;
  for (const answer of retryAnswers) {
    for (const wrong of ['A', 'B', 'C'].filter(part => part !== answer)) {
      const result = await shoot(page, wrong, 'counter');
      assert.equal(result.hearts, --hearts);
      assert.equal(result.feedback, wrong);
      assert.equal(result.sealed, true);
      await expect(page.locator('#q-feedback')).toHaveAttribute('data-kind', 'wrong');
      if (!hearts) break;
      await advanceTo(page, 'think');
    }
    if (!hearts) break;
    await shoot(page, answer, 'stepClear');
    await advanceTo(page, 'think');
  }
  await advanceTo(page, 'down');
  await expect(page.locator('#dn-hint')).toBeVisible();
  await expectHistory(page, '1.1', history);
  await clickWhenReady(page, page.locator('#btn-retry'));
  await advanceTo(page, 'think');
  assert.deepEqual(await page.evaluate(() => {
    const { S } = window.__shooter;
    return [S.ei, S.si, S.hearts, S.stats[1].retries];
  }), [1, 0, 5, 1]);
  await expectHistory(page, '1.1', history, retryId);
  await completeEncounter(page, retryAnswers);
  history.push([retryId, 1]);
  await expectHistory(page, '1.1', history);
  await clickWhenReady(page, page.locator('#btn-next'));
  await advanceTo(page, 'think');
  await shoot(page, ['A', 'B', 'C'].find(part => part !== thirdAnswers[0]), 'counter');
  await expectHistory(page, '1.1', history, thirdId);
  await completeEncounter(page, thirdAnswers);
  history.push([thirdId, 2]);
  await expectHistory(page, '1.1', history);
  console.log('PASS incorrect answers, knockout and retry preserve history, with earned 3-, 1- and 2-star entries');
}

async function inspectMobileReferences(page) {
  await openChooser(page);
  await page.locator('#btn-zh-intro').tap();
  await clickWhenReady(page, startButton(page, '1.1'));
  const remaining = new Set([...figureQuestions, gridQuestion]);
  for (const [sourceId, answers] of levelsBySection['1.1']) {
    await advanceTo(page, 'think');
    if (remaining.delete(sourceId)) await verifyReference(page, sourceId);
    if (!remaining.size) break;
    await completeEncounter(page, answers);
    await clickWhenReady(page, page.locator('#btn-next'));
  }
  assert.equal(remaining.size, 0);
  const { width, height } = page.viewportSize();
  console.log('PASS bilingual prompts fit initially on ' + width + '×' + height + ' for both figures and the grid');
}

async function inspectTouch(page) {
  const [[sourceId, answers], [nextId]] = levelsBySection['1.1'];
  await openChooser(page);
  await page.locator('#btn-zh-intro').tap();
  await page.waitForFunction(() => performance.now() - window.__shooter.S.shownAt > 400);
  await startButton(page, '1.1').tap();
  await advanceTo(page, 'think');
  await expect(page.locator('#app')).toHaveAttribute('data-layout', 'stacked');
  await verifyInitialPrompt(page, '2010Q1');
  await expect(page.locator('#q-stem .zh')).toBeVisible();

  const historyToggle = page.locator('#history-toggle');
  const historyList = page.locator('#run-history-list');
  const historyDialog = page.locator('#history-dialog');
  const closeHistory = historyDialog.getByRole('button', { name: /close/i });
  await expect(historyToggle).toBeVisible();
  await expect(historyToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(historyList).toBeHidden();
  await historyToggle.tap();
  await expect(historyDialog.locator('#run-history-list')).toBeVisible();
  await expectHistory(page, '1.1', [], sourceId);
  assert.equal(await historyList.evaluate(list => list.scrollTop), 0);
  await closeHistory.tap();
  await expect(historyList).toBeHidden();

  const session = await page.context().newCDPSession(page);
  const touch = (type, ...touchPoints) => session.send('Input.dispatchTouchEvent', { type, touchPoints });
  const partPoint = letter => page.locator('.opt[data-k="' + letter + '"]').evaluate(row => {
    const card = document.querySelector('#qcard');
    const top = card.getBoundingClientRect().top;
    card.scrollTop += row.getBoundingClientRect().top - top - card.clientHeight / 2;
    const box = row.getBoundingClientRect();
    return { x: box.left + 50, y: (Math.max(box.top, top) + Math.min(box.bottom, top + card.clientHeight)) / 2, id: 1 };
  });
  const cardState = () => page.locator('#qcard').evaluate(card => [card.scrollTop, card.scrollHeight - card.clientHeight]);
  const wrong = await partPoint('B');
  const [before, max] = await cardState();
  const direction = max - before > 35 ? -1 : 1;
  await touch('touchStart', wrong);
  for (let i = 1; i <= 5; i++) await touch('touchMove', { ...wrong, y: wrong.y + direction * 14 * i });
  await touch('touchEnd');
  await expect.poll(async () => ((await cardState())[0] - before) * -direction).toBeGreaterThan(5);
  await page.evaluate(() => window.__shooter.advance(0.75));
  assert.deepEqual(await page.evaluate(() => [__shooter.S.phase, __shooter.S.hearts, __shooter.input.rowKey]), ['think', 5, null]);

  const correct = levelsBySection['1.1'][0][1][0];
  const option = await partPoint(correct);
  const joystick = await page.evaluate(() => {
    const game = window.__shooter;
    const canvas = document.querySelector('#arena').getBoundingClientRect();
    return {
      x: canvas.left + game.player.x / game.W * canvas.width,
      y: canvas.top + (game.player.y + game.view.top) * game.view.scale,
      id: 2,
    };
  });
  const playerStart = await page.evaluate(() => window.__shooter.player.x);
  await touch('touchStart', joystick);
  await touch('touchStart', joystick, option);
  await expect.poll(() => page.evaluate(() => window.__shooter.input.rowKey)).toBe(correct);
  await touch('touchMove', { ...joystick, x: joystick.x + 30 }, option);
  await advanceTo(page, 'stepClear');
  assert(await page.evaluate(start => window.__shooter.player.x > start, playerStart), 'Touch joystick should move the player');
  await advanceTo(page, 'think');
  await page.evaluate(() => window.__shooter.advance(0.75));
  assert.deepEqual(await page.evaluate(() => [__shooter.S.si, __shooter.S.phase, __shooter.S.hearts]), [1, 'think', 5]);
  await touch('touchEnd');
  assert.deepEqual(await page.evaluate(() => [__shooter.input.rowKey, __shooter.input.stick]), [null, null]);
  console.log('PASS touch scrolling from options, hold to break, simultaneous joystick and fresh trigger on next step');

  await completeEncounter(page, answers.slice(1));
  await clickWhenReady(page, page.locator('#btn-next'));
  await advanceTo(page, 'think');
  await expect(historyToggle).toBeVisible();
  await expect(historyToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(historyList).toBeHidden();
  await historyToggle.tap();
  await expect(historyToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(historyList).toBeVisible();
  await expect(historyDialog.locator('#run-history-list')).toBeVisible();
  await expectHistory(page, '1.1', [[sourceId, 3]], nextId);
  await expect(historyList.locator('.history-stars')).toHaveAccessibleName('3 of 3 stars');
  assert(await page.evaluate(() => {
    const game = window.__shooter;
    const time = game.S.phaseT;
    game.advance(2);
    return game.S.phaseT === time;
  }), 'History dialog should pause the battle');
  await closeHistory.tap();
  await expect(historyToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(historyList).toBeHidden();
  await historyToggle.press('Space');
  await expect(historyDialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(historyDialog).toBeHidden();
  assert.deepEqual(await page.evaluate(() => [__shooter.S.ei, __shooter.S.phase, __shooter.S.hearts]), [1, 'think', 5]);
  console.log('PASS compact roster shows all levels from the start and adds only earned stars');
}

try {
  await withPage({ viewport: { width: 1440, height: 1000 } }, async page => {
    for (const id of Object.keys(levelsBySection)) {
      await openChooser(page, id);
      await page.locator('#intro-back-link').click();
      await expect(page).toHaveURL(origin + sectionPath(id));
    }
    console.log('PASS existing workbook entry URLs, recommended sections, and back links');
    await openChooser(page);
    await page.locator('#btn-zh-intro').click();
    await playSection(page, '1.1');
    await clickWhenReady(page, page.locator('#btn-choose'));
    await expectScreen(page, 'intro');
    await playSection(page, '1.2');
    await clickWhenReady(page, page.locator('#btn-again'));
    await advanceTo(page, 'think');
    await expectHistory(page, '1.2', [], '2012Q4');
    assert.deepEqual(await page.evaluate(() => {
      const { S, ENC } = window.__shooter;
      return [ENC[0].id, S.ei, S.si, S.hearts, S.score];
    }), ['2012Q4', 0, 0, 5, 0]);
  });
  await withPage({ viewport: { width: 1600, height: 900 } }, testRetry);
  for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 568 }]) {
    await withPage({ viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, inspectMobileReferences);
  }
  await withPage({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, inspectTouch);
  assert.deepEqual(issues, [], 'The game must load without browser or resource errors');
} finally {
  await browser.close();
}
