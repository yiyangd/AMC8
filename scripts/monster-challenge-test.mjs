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
    charge: root.locator('[data-charge]'),
    player: root.locator('[data-player]'),
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

async function center(locator) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  assert(box, 'Control must have visible bounds');
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function mouseDown(page, locator) {
  const { x, y } = await center(locator);
  await page.mouse.move(x, y);
  await page.mouse.down();
}

async function readCharge(game) {
  return game.charge.evaluate(element => element.value);
}

async function playerAxis(game, axis) {
  return game.player.evaluate((element, coordinate) =>
    Number.parseFloat(getComputedStyle(element).getPropertyValue(`--${coordinate}`)), axis);
}

async function moveWithKeyboard(page, game, key, axis, direction) {
  const initial = await playerAxis(game, axis);
  await page.keyboard.down(key);
  await expect.poll(async () => ((await playerAxis(game, axis)) - initial) * direction).toBeGreaterThan(0);
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
            heldKey = await playerAxis(game, 'x') < 50 ? 'd' : 'a';
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
  await expect(game.charge).toHaveJSProperty('value', 0);
}

async function breakWithMouse(page, game, encounter, step, shields) {
  const answer = correctAt(encounter, step);
  await mouseDown(page, game.target(answer));
  await game.state('breaking');
  await finishStep(game, encounter, step, shields);
  await page.mouse.up();
}

async function wrongHit(page, game, letter, expectedShields, hold = false) {
  await mouseDown(page, game.target(letter));
  await game.state('counter');
  await expect(game.field('shields')).toHaveText(String(expectedShields));
  await expect(game.field('feedback')).toContainText(/\S/);
  if (!hold) await page.mouse.up();
}

async function expectPaused(page, game) {
  const charge = await readCharge(game);
  await page.waitForTimeout(250);
  assert.equal(await readCharge(game), charge, 'Interruption must stop charge without clearing progress');
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
  await expect(game.field('stem')).toContainText(/\S/);
  await expect(game.field('prompt')).toContainText(/\S/);
  await expect(game.root.locator('[data-option]')).toHaveCount(3);
  await expect(game.field('stem-zh')).toBeHidden();
  await game.action('language').click();
  await expect(game.field('stem-zh')).toBeVisible();
  await expect(game.field('stem-zh')).toContainText(/\S/);
  await expect(game.field('prompt-zh')).toBeVisible();

  await expect(game.attackMarker).toBeHidden();
  await atQuestion(game, 1, 1, 3);
  await emptyShot(page, game);
  await expect(game.root.locator('[data-beam]')).toHaveAttribute('data-kind', 'shot');
  await atQuestion(game, 1, 1, 3);
  await expect(game.charge).toHaveJSProperty('value', 0);
  console.log('PASS Section 1.1 entry, movement, translation, initial reading grace and harmless empty shot');

  await wrongHit(page, game, wrongAt(1, 1), 2, true);
  await expect(game.root.locator('[data-beam]')).toHaveAttribute('data-kind', 'counter');
  await expect(game.field('feedback-zh')).toBeVisible();
  await atQuestion(game, 1, 1, 2);
  await page.waitForTimeout(700);
  await atQuestion(game, 1, 1, 2);
  await page.mouse.up();

  const firstTarget = game.target(correctAt(1, 1));
  await mouseDown(page, firstTarget);
  await game.state('breaking');
  await expect.poll(() => readCharge(game)).toBeGreaterThan(200);
  await page.mouse.up();
  await expectPaused(page, game);

  await mouseDown(page, firstTarget);
  await expect.poll(() => readCharge(game)).toBeGreaterThan(550);
  await setPageHidden(page, true);
  await expectPaused(page, game);
  await setPageHidden(page, false);
  await expectPaused(page, game);
  await page.mouse.up();

  await mouseDown(page, firstTarget);
  await finishStep(game, 1, 1, 2);
  // Keep the pointer pressed into the next question. It may neither answer nor chip a target.
  await page.waitForTimeout(350);
  await atQuestion(game, 1, 2, 2);
  await expect(game.charge).toHaveJSProperty('value', 0);
  await page.mouse.up();
  console.log('PASS a held wrong shot counters once, release and tab hiding pause charge, holding does not cross steps');

  await breakWithMouse(page, game, 1, 2, 2);
  await breakWithMouse(page, game, 1, 3, 2);
  await verifyReview(page, game, encounters[0]);
  await game.action('next').click();
  await game.state('approach');
  await moveWithKeyboard(page, game, 'ArrowLeft', 'x', -1);
  await atQuestion(game, 2, 1, 3);
  await breakWithMouse(page, game, 2, 1, 3);
  const results = game.root.locator('[data-results] li');
  await expect(results).toHaveCount(1);
  const solvedSteps = await results.allTextContents();
  for (const shields of [2, 1, 0]) {
    await wrongHit(page, game, wrongAt(2, 2), shields);
    if (shields) await atQuestion(game, 2, 2, shields);
  }
  await game.state('empty');
  await game.action('recover').click();
  await atQuestion(game, 2, 2, 3);
  await expect(results).toHaveText(solvedSteps);
  await breakWithMouse(page, game, 2, 2, 3);
  await breakWithMouse(page, game, 2, 3, 3);
  await verifyReview(page, game, encounters[1]);
  await game.action('next').click();
  await game.state('approach');
  await moveWithKeyboard(page, game, 'ArrowDown', 'y', 1);
  await atQuestion(game, 3, 1, 3);
  console.log('PASS recovery preserves the current step and earlier answers');
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
  await page.waitForTimeout(1500);
  await expect(game.arena).toHaveAttribute('data-attack', 'warning');
  await expect(game.field('shields')).toHaveText('3');
  await setPageHidden(page, false);
  await expect(game.field('shields')).toHaveText('2');
  await expect(game.attackMarker).toBeHidden();
  await atQuestion(game, 1, 1, 2);

  await expectAttackWarning(game);
  const lockedX = await game.attackMarker.evaluate(marker => marker.style.getPropertyValue('--attack-x'));
  const initialX = await playerAxis(game, 'x');
  await mouseDown(page, game.target(correctAt(1, 1)));
  await game.state('breaking');
  await page.keyboard.down('d');
  try {
    await expect.poll(() => playerAxis(game, 'x'), { intervals: [50, 100] }).toBeGreaterThan(initialX + 17);
    assert.equal(await game.attackMarker.evaluate(marker => marker.style.getPropertyValue('--attack-x')), lockedX,
      'The attack must stay aimed at the warning location when the player moves');
    await page.waitForFunction(() => document.querySelector('[data-arena]')?.dataset.attack === 'impact', null,
      { timeout: 3500 });
    await expect(game.field('shields')).toHaveText('2');
    await expect.poll(() => readCharge(game)).toBeGreaterThan(600);
  } finally {
    await page.keyboard.up('d');
  }
  await finishStep(game, 1, 1, 2);
  await page.mouse.up();
  console.log('PASS warnings precede damage, stationary players lose one shield, and moving while charging dodges the same attack');

  await wrongHit(page, game, wrongAt(1, 2), 1);
  await atQuestion(game, 1, 2, 1);
  await mouseDown(page, game.target(correctAt(1, 2)));
  await game.state('breaking');
  await expect.poll(() => readCharge(game)).toBeGreaterThan(250);
  await page.mouse.up();
  const savedCharge = await readCharge(game);
  await expectAttackWarning(game);
  await game.state('empty');
  await expect(game.field('shields')).toHaveText('0');
  await expect(game.field('step')).toHaveText('2');
  await game.action('recover').click();
  await game.state('breaking');
  await expect(game.field('shields')).toHaveText('3');
  assert.equal(await readCharge(game), savedCharge, 'Recovering from an active attack must retain armor damage');
  await breakWithMouse(page, game, 1, 2, 3);
  console.log('PASS the last shield can break between shots, and recovery restores the same locked answer and charge');
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
    await game.state('breaking');
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
  const touchStart = async locator => {
    const point = await center(locator);
    await device.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
  };
  const touchEnd = () => device.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

  await game.start('1.1').tap();
  await game.state('approach');
  const initialX = await playerAxis(game, 'x');
  await touchStart(game.root.locator('[data-move="right"]'));
  await expect.poll(() => playerAxis(game, 'x')).toBeGreaterThan(initialX);
  await touchEnd();
  await atQuestion(game, 1, 1, 3);
  const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
  assert(noOverflow, 'Mobile challenge should fit the viewport');

  const moveButton = game.root.locator('[data-move="right"]');
  await moveButton.scrollIntoViewIfNeeded();
  const shotPoint = await center(game.target(correctAt(1, 1)));
  const movePoint = await center(moveButton);
  await expectAttackWarning(game);
  const warningX = await playerAxis(game, 'x');
  await device.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ ...movePoint, id: 1 }, { ...shotPoint, id: 2 }],
  });
  await game.state('breaking');
  await expect.poll(() => playerAxis(game, 'x')).toBeGreaterThan(warningX + 17);
  await finishStep(game, 1, 1, 3);
  await touchEnd();
  console.log('PASS mobile touch movement, readable layout, and two-finger dodge while holding a shot');
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

async function advanceLongLevel(page, game) {
  let heldKey;
  try {
    for (let remaining = 2510; remaining > 0; remaining -= 500) {
      const warning = await game.arena.getAttribute('data-attack') === 'warning';
      if (warning && !heldKey) {
        heldKey = await playerAxis(game, 'x') < 50 ? 'd' : 'a';
        await page.keyboard.down(heldKey);
      } else if (!warning && heldKey) {
        await page.keyboard.up(heldKey);
        heldKey = undefined;
      }
      await page.clock.runFor(Math.min(500, remaining));
    }
  } finally {
    if (heldKey) await page.keyboard.up(heldKey);
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
      await game.target(answer).press('Enter');
      await game.state('breaking');
      if (answers.length > 4) await advanceLongLevel(page, game);
      else await page.clock.runFor(2510);
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
  await game.state('counter');
  await expect(game.field('shields')).toHaveText('2');

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
  await expect(game.charge).toHaveJSProperty('value', 0);
  console.log('PASS replay keeps the same section and switching resets health, charge, and progress');
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
  assert.deepEqual(issues, [], 'The challenge must load without browser or resource errors');
} finally {
  await browser.close();
}
