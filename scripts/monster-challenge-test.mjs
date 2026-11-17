import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';

const origin = (process.env.TEST_ORIGIN || 'http://127.0.0.1:4321').replace(/\/$/, '');
const challengeUrl = `${origin}/AMC8/play/`;
const encounters = [
  ['2010Q1', 'ACB'], ['2006Q2', 'BAC'], ['2025Q2', 'BCAB'], ['2005Q1', 'BAC'],
  ['2008Q1', 'CAB'], ['2023Q1', 'ABCA'], ['2017Q1', 'CABC'], ['2014Q1', 'ABC'],
  ['2026Q1', 'BCBA'], ['2026Q2', 'BACB'], ['2017Q5', 'BCAC'], ['2016Q8', 'CABC'],
  ['2018Q5', 'BCAB'], ['2013Q3', 'ABCA'], ['2000Q8', 'BCAB'], ['2006Q9', 'BCAB'],
  ['2018Q2', 'ACBA'], ['2022Q8', 'CBAC'], ['2020Q12', 'CABA'], ['2019Q17', 'ABCA'],
].map(([sourceId, answers]) => ({ sourceId, answers }));
const fractionEncounters = [
  ['2012Q4', 'ACB'], ['2024Q2', 'CABA'], ['2000Q2', 'BCAB'],
  ['2005Q6', 'BACB'], ['2019Q3', 'CABC'], ['2012Q20', 'ACBAC'],
].map(([sourceId, answers]) => ({ sourceId, answers }));
const workbook = JSON.parse(await readFile(new URL('../src/data/workbook.json', import.meta.url), 'utf8'));
const sourceSections = new Map(workbook.sections.map(section => [section.id, section]));
const sourceQuestions = new Map(workbook.questions.map(question => [question.id, question]));
const sectionFixtures = { '1.1': encounters, '1.2': fractionEncounters };
for (const [sectionId, levels] of Object.entries(sectionFixtures)) {
  assert.deepEqual(levels.map(({ sourceId }) => sourceId).sort(), [...sourceSections.get(sectionId).questionIds].sort());
}
const workbookSectionPath = sectionId => `/AMC8/sections/${sourceSections.get(sectionId).slug}/`;

const correctAt = (encounter, step) => encounters[encounter - 1].answers[step - 1];
const wrongAt = (encounter, step) => ['A', 'B', 'C'].find(letter => letter !== correctAt(encounter, step));
const options = { headless: true };
if (process.env.PLAYWRIGHT_CHANNEL) options.channel = process.env.PLAYWRIGHT_CHANNEL;

const browser = await chromium.launch(options);
const issues = [];
const checkedWorkbookHtml = new Map();

function challenge(page) {
  const root = page.locator('[data-challenge]');
  return {
    root,
    action: name => root.locator(`[data-action="${name}"]`),
    start: sectionId => root.locator(`[data-start-section="${sectionId}"]`),
    field: name => root.locator(`[data-field="${name}"]`),
    target: letter => root.locator(`[data-target="${letter}"]`),
    state: name => expect(root).toHaveAttribute('data-state', name),
    hitProgress: root.locator('[data-charge]'),
    player: root.locator('[data-player]'),
    foe: root.locator('[data-arena] [data-foe]'),
    arena: root.locator('[data-arena]'),
    attackMarker: root.locator('[data-attack-marker]'),
  };
}

async function open(page, fromSection) {
  page.on('pageerror', error => issues.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400 && response.url().startsWith(`${origin}/`)) {
      issues.push(`${response.status()}: ${response.url()}`);
    }
  });
  if (fromSection) {
    await page.goto(`${origin}${workbookSectionPath(fromSection)}`);
    await page.locator(`main a[href$="/play/?section=${fromSection}"]`).click();
    await expect(page).toHaveURL(`${challengeUrl}?section=${fromSection}`);
  } else {
    await page.goto(challengeUrl);
  }
  const game = challenge(page);
  await game.state('intro');
  await expect(game.root).not.toHaveAttribute('data-section', /.+/);
  for (const [sectionId, levels] of Object.entries(sectionFixtures)) {
    const start = game.start(sectionId);
    await expect(start).toBeVisible();
    await expect(start).toContainText(`${levels.length} levels`);
    if (sectionId === fromSection) await expect(start).toHaveAttribute('data-recommended', /.*/);
    else await expect(start).not.toHaveAttribute('data-recommended', /.*/);
  }
  return game;
}

async function center(locator, scroll = true) {
  if (scroll) await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  assert(box, 'Control must have visible bounds');
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function mouseDown(page, locator) {
  // Sample the live target location without asking Playwright to wait for it to stop moving.
  const { x, y } = await center(locator, false);
  await page.mouse.move(x, y);
  await page.mouse.down();
}

async function shoot(page, locator) {
  await mouseDown(page, locator);
  await page.mouse.up();
}

async function expectHits(game, count) {
  await expect(game.hitProgress).toHaveJSProperty('value', count);
  await expect(game.field('hits')).toHaveText(new RegExp(`^${count}\\s*/\\s*3$`));
}

async function arenaAxis(locator, axis) {
  return locator.evaluate((element, coordinate) =>
    Number.parseFloat(getComputedStyle(element).getPropertyValue(`--${coordinate}`)), axis);
}

async function moveWithKeyboard(page, game, key, axis, direction) {
  const initial = await arenaAxis(game.player, axis);
  await page.keyboard.down(key);
  await expect.poll(async () => ((await arenaAxis(game.player, axis)) - initial) * direction).toBeGreaterThan(0);
  await page.keyboard.up(key);
}

async function atQuestion(game, encounter, step, shields, sectionId = '1.1') {
  await game.state('question');
  await expect(game.root).toHaveAttribute('data-section', sectionId);
  await expect(game.field('section-number')).toHaveText(sectionId);
  await expect(game.field('encounter')).toHaveText(String(encounter));
  await expect(game.field('encounter-total')).toHaveText(String(sectionFixtures[sectionId].length));
  await expect(game.field('step')).toHaveText(String(step));
  await expect(game.field('shields')).toHaveText(String(shields));
}

async function withAutomaticDodging(page, game, play) {
  let finished = false;
  await Promise.all([
    (async () => {
      try {
        await play();
      } finally {
        finished = true;
      }
    })(),
    (async () => {
      let heldKey;
      try {
        while (!finished) {
          const warning = await game.arena.getAttribute('data-attack') === 'warning';
          if (warning && !heldKey) {
            heldKey = await arenaAxis(game.player, 'x') < 50 ? 'd' : 'a';
            await page.keyboard.down(heldKey);
          } else if (!warning && heldKey) {
            await page.keyboard.up(heldKey);
            heldKey = undefined;
          }
          if (!finished) await new Promise(resolve => setTimeout(resolve, 40));
        }
      } finally {
        if (heldKey) await page.keyboard.up(heldKey);
      }
    })(),
  ]);
}

async function emptyShot(page, game) {
  const position = await game.root.locator('[data-arena]').evaluate(arena => {
    const bounds = arena.getBoundingClientRect();
    for (const xFraction of [0.2, 0.4, 0.6, 0.8]) {
      for (const yFraction of [0.78, 0.63, 0.38]) {
        const x = bounds.left + bounds.width * xFraction;
        const y = bounds.top + bounds.height * yFraction;
        const hit = document.elementFromPoint(x, y);
        if (arena.contains(hit) && !hit.closest('button, [data-player], [data-target]')) return { x, y };
      }
    }
    return undefined;
  });
  assert(position, 'Arena should have open space for a missed shot');
  await page.mouse.click(position.x, position.y);
}

async function finishStep(game, encounter, step, shields) {
  if (step === encounters[encounter - 1].answers.length) {
    await game.state('review');
    return;
  }
  await atQuestion(game, encounter, step + 1, shields);
  await expectHits(game, 0);
}

async function breakWithMouse(page, game, encounter, step, shields, startingHits = 0) {
  const target = game.target(correctAt(encounter, step));
  for (let hit = startingHits + 1; hit <= 3; hit++) {
    await shoot(page, target);
    await expectHits(game, hit);
  }
  await game.state('step-cleared');
  await finishStep(game, encounter, step, shields);
}

async function wrongHit(page, game, letter, expectedHits, expectedShields) {
  const target = game.target(letter);
  await shoot(page, target);
  await game.state('question');
  await expect(target).toHaveAttribute('data-hit', 'wrong');
  await expectHits(game, expectedHits);
  await expect(game.field('shields')).toHaveText(String(expectedShields));
  await expect(game.field('feedback')).toContainText(/\S/);
}

async function setPageHidden(page, hidden) {
  await page.evaluate(isHidden => {
    // Chromium headless keeps both test tabs visible. Exercise the browser visibility handler directly.
    if (isHidden) {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    } else {
      Reflect.deleteProperty(document, 'hidden');
      Reflect.deleteProperty(document, 'visibilityState');
    }
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
}

async function verifyReview(page, game, { sourceId, answers }) {
  await game.state('review');
  const label = new RegExp(sourceId.replace('Q', '\\s*Q'));
  await expect(game.field('review-source-id')).toContainText(label);
  await expect(game.root.locator('[data-review-steps] li')).toHaveCount(answers.length);
  const anchor = `q-${sourceId.toLowerCase()}`;
  const href = await game.root.locator('[data-review-link]').getAttribute('href');
  assert(href, `Missing workbook link for ${sourceId}`);
  const url = new URL(href, challengeUrl);
  assert.equal(url.pathname, workbookSectionPath(sourceQuestions.get(sourceId).sectionId));
  assert.equal(url.hash, `#${anchor}`);
  if (!checkedWorkbookHtml.has(url.pathname)) {
    const response = await page.request.get(url.href);
    assert(response.ok(), `${sourceId} workbook link should resolve`);
    checkedWorkbookHtml.set(url.pathname, await response.text());
  }
  assert(checkedWorkbookHtml.get(url.pathname).includes(`id="${anchor}"`), `${sourceId} workbook section must contain the source question`);
}

async function inspectDesktop(page, game) {
  await game.start('1.1').click();
  await game.state('approach');
  await moveWithKeyboard(page, game, 'd', 'x', 1);
  await moveWithKeyboard(page, game, 'w', 'y', -1);
  await atQuestion(game, 1, 1, 3);
  await expect(game.attackMarker).toBeHidden();
  await expect(game.hitProgress).toHaveAttribute('max', '3');
  const initialFoeX = await arenaAxis(game.foe, 'x');
  await expect.poll(async () => Math.abs((await arenaAxis(game.foe, 'x')) - initialFoeX)).toBeGreaterThan(1);
  await expect(game.field('stem')).toContainText(/\S/);
  await expect(game.field('prompt')).toContainText(/\S/);
  await expect(game.root.locator('[data-option]')).toHaveCount(3);
  await expect(game.field('stem-zh')).toBeHidden();
  await game.action('language').click();
  await expect(game.field('stem-zh')).toBeVisible();
  await expect(game.field('stem-zh')).toContainText(/\S/);
  await expect(game.field('prompt-zh')).toBeVisible();

  await atQuestion(game, 1, 1, 3);
  await emptyShot(page, game);
  await expect(game.root.locator('[data-beam]')).toHaveAttribute('data-kind', 'shot');
  await atQuestion(game, 1, 1, 3);
  await expectHits(game, 0);
  console.log('PASS Section 1.1 entry, player and monster movement, translation, reading grace and harmless empty shot');

  await wrongHit(page, game, wrongAt(1, 1), 0, 3);
  await expect(game.field('feedback')).toContainText(/^Incorrect\./);
  await expect(game.field('feedback-zh')).toBeVisible();

  const firstTarget = game.target(correctAt(1, 1));
  await mouseDown(page, firstTarget);
  await expectHits(game, 1);
  await page.waitForTimeout(500);
  await expectHits(game, 1);
  await atQuestion(game, 1, 1, 3);
  await page.mouse.up();

  await wrongHit(page, game, wrongAt(1, 1), 1, 3);
  await shoot(page, firstTarget);
  await expectHits(game, 2);
  await atQuestion(game, 1, 1, 3);
  await mouseDown(page, firstTarget);
  await game.state('step-cleared');
  await expectHits(game, 3);
  await finishStep(game, 1, 1, 3);
  await page.waitForTimeout(250);
  await expectHits(game, 0);
  await page.mouse.up();
  console.log('PASS three separate clicks clear a step, wrong shots preserve hits and shields, and holding fires only once');

  await breakWithMouse(page, game, 1, 2, 3);
  await breakWithMouse(page, game, 1, 3, 3);
  await verifyReview(page, game, encounters[0]);
  await game.action('next').click();
  await game.state('approach');
  await moveWithKeyboard(page, game, 'ArrowLeft', 'x', -1);
  await atQuestion(game, 2, 1, 3);
  await breakWithMouse(page, game, 2, 1, 3);
  await expect(game.root.locator('[data-results] li')).toHaveCount(1);
  await breakWithMouse(page, game, 2, 2, 3);
  await breakWithMouse(page, game, 2, 3, 3);
  await verifyReview(page, game, encounters[1]);
  await game.action('next').click();
  await game.state('approach');
  await moveWithKeyboard(page, game, 'ArrowDown', 'y', 1);
  await atQuestion(game, 3, 1, 3);
  console.log('PASS desktop pointer shots clear moving targets across steps and monsters');
}

async function expectAttackWarning(game) {
  await expect(game.arena).toHaveAttribute('data-attack', 'warning', { timeout: 10000 });
  await expect(game.attackMarker).toBeVisible();
}

async function inspectActiveAttacks(page) {
  const game = await open(page);
  await game.start('1.1').click();
  await atQuestion(game, 1, 1, 3);
  await expect(game.attackMarker).toBeHidden();
  await expectAttackWarning(game);
  await atQuestion(game, 1, 1, 3);
  await expect(game.root.locator('[data-attack-status]')).toContainText(/\S/);
  await setPageHidden(page, true);
  const frozenFoeX = await arenaAxis(game.foe, 'x');
  await shoot(page, game.target(correctAt(1, 1)));
  await page.waitForTimeout(1500);
  await expect(game.arena).toHaveAttribute('data-attack', 'warning');
  await expect(game.field('shields')).toHaveText('3');
  await expectHits(game, 0);
  assert.equal(await arenaAxis(game.foe, 'x'), frozenFoeX, 'The monster should stop moving when the tab is hidden');
  await setPageHidden(page, false);
  await expect(game.field('shields')).toHaveText('2');
  await expect(game.attackMarker).toBeHidden();
  await atQuestion(game, 1, 1, 2);

  await expectAttackWarning(game);
  const lockedX = await game.attackMarker.evaluate(marker => marker.style.getPropertyValue('--attack-x'));
  const initialX = await arenaAxis(game.player, 'x');
  await page.keyboard.down('d');
  try {
    await shoot(page, game.target(correctAt(1, 1)));
    await expectHits(game, 1);
    await expect.poll(() => arenaAxis(game.player, 'x'), { intervals: [50, 100] }).toBeGreaterThan(initialX + 17);
    assert.equal(await game.attackMarker.evaluate(marker => marker.style.getPropertyValue('--attack-x')), lockedX,
      'The attack must stay aimed at the warning location when the player moves');
    await page.waitForFunction(() => document.querySelector('[data-arena]')?.dataset.attack === 'impact', null,
      { timeout: 3500 });
    await expect(game.field('shields')).toHaveText('2');
    await expectHits(game, 1);
  } finally {
    await page.keyboard.up('d');
  }
  await breakWithMouse(page, game, 1, 1, 2, 1);
  console.log('PASS hidden play pauses, warnings precede damage, and players can dodge while clicking moving targets');

  const secondTarget = game.target(correctAt(1, 2));
  await shoot(page, secondTarget);
  await shoot(page, secondTarget);
  await expectHits(game, 2);
  await expectAttackWarning(game);
  await atQuestion(game, 1, 2, 1);
  await expectHits(game, 2);
  await expectAttackWarning(game);
  await game.state('empty');
  await expect(game.field('shields')).toHaveText('0');
  await expect(game.field('step')).toHaveText('2');
  await expectHits(game, 2);
  await game.action('recover').click();
  await atQuestion(game, 1, 2, 3);
  await expectHits(game, 2);
  await breakWithMouse(page, game, 1, 2, 3, 2);
  console.log('PASS monster attacks exhaust shields and recovery retains both earned hits on the same step');
}

async function tabTo(page, control) {
  for (let tabCount = 0; tabCount < 35; tabCount++) {
    if (await control.evaluate(element => element === document.activeElement)) return;
    await page.keyboard.press('Tab');
  }
  await expect(control).toBeFocused();
}

async function inspectKeyboard(page, game) {
  await tabTo(page, game.start('1.1'));
  await page.keyboard.press('Enter');
  await atQuestion(game, 1, 1, 3);
  for (const step of [1, 2, 3]) {
    await tabTo(page, game.target(encounters[0].answers[step - 1]));
    await page.keyboard.down('Enter');
    await expectHits(game, 1);
    await page.keyboard.down('Enter');
    await page.keyboard.down('Enter');
    await expectHits(game, 1);
    await page.keyboard.up('Enter');
    await page.keyboard.press('Enter');
    await expectHits(game, 2);
    await page.keyboard.down('Enter');
    await game.state('step-cleared');
    await finishStep(game, 1, step, 3);
    if (step < 3) {
      await tabTo(page, game.target(encounters[0].answers[step]));
      await page.keyboard.down('Enter');
      await atQuestion(game, 1, step + 1, 3);
    }
    await page.keyboard.up('Enter');
  }
  await tabTo(page, game.action('next'));
  await page.keyboard.press('Enter');
  await atQuestion(game, 2, 1, 3);
  console.log('PASS keyboard-only start, target selection and encounter navigation without repeat votes');
}

async function inspectTouch(context, page) {
  const device = await context.newCDPSession(page);
  const game = await open(page);
  const touchStart = async (locator, scroll = true) => {
    const point = await center(locator, scroll);
    await device.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
  };
  const touchEnd = () => device.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

  await game.start('1.1').tap();
  await game.state('approach');
  const initialX = await arenaAxis(game.player, 'x');
  await touchStart(game.root.locator('[data-move="right"]'));
  await expect.poll(() => arenaAxis(game.player, 'x')).toBeGreaterThan(initialX);
  await touchEnd();
  await atQuestion(game, 1, 1, 3);
  const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
  assert(noOverflow, 'Mobile challenge should fit the viewport');

  const moveButton = game.root.locator('[data-move="right"]');
  await moveButton.scrollIntoViewIfNeeded();
  const movePoint = await center(moveButton);
  await expectAttackWarning(game);
  const target = game.target(correctAt(1, 1));
  const shotPoint = await center(target, false);
  const warningX = await arenaAxis(game.player, 'x');
  await device.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ ...movePoint, id: 1 }, { ...shotPoint, id: 2 }],
  });
  await expectHits(game, 1);
  await expect.poll(() => arenaAxis(game.player, 'x')).toBeGreaterThan(warningX + 17);
  await page.waitForFunction(() => document.querySelector('[data-arena]')?.dataset.attack === 'impact', null,
    { timeout: 3500 });
  await expect(game.field('shields')).toHaveText('3');
  await expectHits(game, 1);
  await touchEnd();
  for (const hit of [2, 3]) {
    await touchStart(target, false);
    await touchEnd();
    await expectHits(game, hit);
  }
  await game.state('step-cleared');
  await finishStep(game, 1, 1, 3);
  console.log('PASS mobile layout, three distinct taps, and two-finger dodging while independently shooting');
}

async function inspectReducedMotion(page) {
  const game = await open(page);
  await game.start('1.1').click();
  await atQuestion(game, 1, 1, 3);
  const position = await game.foe.boundingBox();
  assert(position, 'The monster should remain visible with reduced motion');
  await page.waitForTimeout(300);
  assert.deepEqual(await game.foe.boundingBox(), position, 'Reduced motion should keep the monster from patrolling');
  await shoot(page, game.target(correctAt(1, 1)));
  await expectHits(game, 1);
  console.log('PASS reduced motion keeps targets still and shooting remains available');
}

function normalizedAnswer(text) {
  return text.trim().replace(/\s+(?:students|points)$/i, '').replace(/[,$\s]/g, '').replaceAll('−', '-');
}

async function verifyQuestionReference(page, game, sourceId) {
  const figure = game.root.locator('[data-level-figure]');
  const grid = game.root.locator('[data-level-grid]');
  if (sourceId === '2025Q2' || sourceId === '2000Q8') {
    await expect(figure).toBeVisible();
    await expect.poll(() => figure.locator('img').evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
    await expect(figure.locator('img')).toHaveAttribute('alt', /\S/);
    await figure.press('Enter');
    await expect(page.locator('#image-dialog')).toBeVisible();
    await page.clock.runFor(7000);
    await expect(game.field('shields')).toHaveText('3');
    await expect(game.attackMarker).toBeHidden();
    await page.locator('#image-dialog [data-close-dialog]').press('Enter');
    await expect(page.locator('#image-dialog')).toBeHidden();
  } else {
    await expect(figure).toBeHidden();
  }
  if (sourceId === '2026Q2') {
    await expect(grid).toBeVisible();
    await expect(grid.locator('tr')).toHaveCount(5);
    await expect(grid.locator('td')).toHaveCount(35);
    assert.equal((await grid.locator('td').allTextContents()).reduce((sum, value) => sum + Number(value), 0), 53);
  } else {
    await expect(grid).toBeHidden();
  }
}

async function playThroughSection(page, game, sectionId, levels) {
  await game.start(sectionId).press('Enter');

  for (const [index, level] of levels.entries()) {
    const { sourceId, answers } = level;
    await game.state('approach');
    await page.clock.runFor(1260);
    await atQuestion(game, index + 1, 1, 3, sectionId);
    await expect(game.field('step-total')).toHaveText(String(answers.length));
    await verifyQuestionReference(page, game, sourceId);
    for (const [step, answer] of Array.from(answers).entries()) {
      await game.state('question');
      await expect(game.field('step')).toHaveText(String(step + 1));
      await expect(game.root.locator('[data-results] li')).toHaveCount(step);
      if (step === answers.length - 1) {
        const answerText = await game.root.locator(`[data-option="${answer}"]`).innerText();
        const sourceValue = sourceQuestions.get(sourceId).answer.value;
        assert.equal(normalizedAnswer(answerText), normalizedAnswer(sourceValue), `${sourceId} final game answer`);
      }
      await expectHits(game, 0);
      for (const hit of [1, 2, 3]) {
        await game.target(answer).press('Enter');
        await expectHits(game, hit);
        await game.state(hit === 3 ? 'step-cleared' : 'question');
      }
      await page.clock.runFor(500);
    }
    await verifyReview(page, game, level);
    await game.action('next').press('Enter');
  }
  const totalSteps = levels.reduce((total, level) => total + level.answers.length, 0);
  await game.state('summary');
  await expect(game.root).toHaveAttribute('data-section', sectionId);
  await expect(game.field('summary-title')).toHaveText(`Section ${sectionId} complete`);
  await expect(game.root.locator('[data-workbook-link]')).toHaveAttribute('href', workbookSectionPath(sectionId));
  await expect(game.field('score')).toHaveText(`${totalSteps} / ${totalSteps}`);
  await expect(game.root.locator('[data-review-card]:visible')).toHaveCount(levels.length);
  for (const { sourceId, answers } of levels) {
    const card = game.root.locator(`[data-review-card="${sourceId}"]`);
    await expect(card).toBeVisible();
    await expect(card.locator('[data-card-steps] li')).toHaveCount(answers.length);
    await expect(card.locator('a')).toHaveAttribute('href', new RegExp(`#q-${sourceId.toLowerCase()}$`));
  }
  console.log(`PASS section ${sectionId}: all ${levels.length} levels in order, ${totalSteps} checkpoints, correct score, and workbook references`);
}

async function inspectFullSections(page) {
  const now = new Date('2026-11-16T12:00:00Z');
  await page.clock.install({ time: now });
  await page.clock.pauseAt(now.getTime() + 1000);
  const game = await open(page);
  await playThroughSection(page, game, '1.1', encounters);
  await game.action('choose').press('Enter');
  await game.state('intro');
  await playThroughSection(page, game, '1.2', fractionEncounters);

  await game.action('restart').press('Enter');
  await page.clock.runFor(1260);
  await atQuestion(game, 1, 1, 3, '1.2');
  await game.target(['A', 'B', 'C'].find(letter => letter !== fractionEncounters[0].answers[0])).press('Enter');
  await atQuestion(game, 1, 1, 3, '1.2');
  await expectHits(game, 0);
  await expect(game.field('feedback')).toContainText(/^Incorrect\./);
  await game.target(fractionEncounters[0].answers[0]).press('Enter');
  await expectHits(game, 1);

  await game.action('choose').press('Enter');
  await game.state('intro');
  await expect(game.root).not.toHaveAttribute('data-section', /.+/);
  await game.start('1.1').press('Enter');
  await page.clock.runFor(1260);
  await atQuestion(game, 1, 1, 3, '1.1');
  await expect(game.root.locator('[data-results] li')).toHaveCount(0);
  await game.action('choose').press('Enter');
  await game.state('intro');
  await game.start('1.2').press('Enter');
  await page.clock.runFor(1260);
  await atQuestion(game, 1, 1, 3, '1.2');
  await expect(game.root.locator('[data-results] li')).toHaveCount(0);
  await expectHits(game, 0);
  console.log('PASS replay keeps the same section and switching resets health, hits, and progress');
}

try {
  const fullSection = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await inspectFullSections(fullSection);
  await fullSection.close();

  const fractionLink = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const fractionLinkGame = await open(fractionLink, '1.2');
  await fractionLinkGame.start('1.2').click();
  await atQuestion(fractionLinkGame, 1, 1, 3, '1.2');
  await fractionLink.close();
  console.log('PASS the Section 1.2 workbook link opens the original game with 1.2 recommended');

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const desktopGame = await open(desktop, '1.1');
  await withAutomaticDodging(desktop, desktopGame, () => inspectDesktop(desktop, desktopGame));
  await desktop.close();

  const dodge = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await inspectActiveAttacks(dodge);
  await dodge.close();

  const keyboard = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const keyboardGame = await open(keyboard);
  await withAutomaticDodging(keyboard, keyboardGame, () => inspectKeyboard(keyboard, keyboardGame));
  await keyboard.close();

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobile = await mobileContext.newPage();
  await inspectTouch(mobileContext, mobile);
  await mobileContext.close();

  const reducedMotion = await browser.newPage({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } });
  await inspectReducedMotion(reducedMotion);
  assert.deepEqual(issues, [], 'The challenge must load without browser or resource errors');
} finally {
  await browser.close();
}
