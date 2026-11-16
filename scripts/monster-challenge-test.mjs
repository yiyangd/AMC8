import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';

const origin = (process.env.TEST_ORIGIN || 'http://127.0.0.1:4321').replace(/\/$/, '');
const challengeUrl = `${origin}/AMC8/play/`;
const encounters = [
  { sourceId: '2005Q1', answers: 'BAC' },
  { sourceId: '2008Q1', answers: 'CAB' },
  { sourceId: '2014Q1', answers: 'ABC' },
];
const options = { headless: true };
if (process.env.PLAYWRIGHT_CHANNEL) options.channel = process.env.PLAYWRIGHT_CHANNEL;

const browser = await chromium.launch(options);
const issues = [];

function challenge(page) {
  const root = page.locator('[data-challenge]');
  return {
    root,
    action: name => root.locator(`[data-action="${name}"]`),
    field: name => root.locator(`[data-field="${name}"]`),
    target: letter => root.locator(`[data-target="${letter}"]`),
    state: name => expect(root).toHaveAttribute('data-state', name),
    charge: root.locator('[data-charge]'),
    player: root.locator('[data-player]'),
    arena: root.locator('[data-arena]'),
    attackMarker: root.locator('[data-attack-marker]'),
  };
}

async function open(page, fromSection = false) {
  page.on('pageerror', error => issues.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400 && response.url().startsWith(`${origin}/`)) {
      issues.push(`${response.status()}: ${response.url()}`);
    }
  });
  if (fromSection) {
    await page.goto(`${origin}/AMC8/sections/1-1/`);
    await page.locator('main a[href$="/play/"]').click();
    await expect(page).toHaveURL(challengeUrl);
  } else {
    await page.goto(challengeUrl);
  }
  const game = challenge(page);
  await game.state('intro');
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

async function atQuestion(game, encounter, step, shields) {
  await game.state('question');
  await expect(game.field('encounter')).toHaveText(String(encounter));
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
  if (step === 3) {
    await game.state('review');
    return;
  }
  await atQuestion(game, encounter, step + 1, shields);
  await expect(game.charge).toHaveJSProperty('value', 0);
}

async function breakWithMouse(page, game, encounter, step, shields) {
  const answer = encounters[encounter - 1].answers[step - 1];
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

async function verifyReview(page, game, sourceId) {
  await game.state('review');
  const label = new RegExp(sourceId.replace('Q', '\\s*Q'));
  await expect(game.field('review-source-id')).toContainText(label);
  await expect(game.root.locator('[data-review-steps] li')).toHaveCount(3);
  const anchor = `q-${sourceId.toLowerCase()}`;
  const href = await game.root.locator('[data-review-link]').getAttribute('href');
  assert(href, `Missing workbook link for ${sourceId}`);
  const url = new URL(href, challengeUrl);
  assert.equal(url.pathname, '/AMC8/sections/1-1/');
  assert.equal(url.hash, `#${anchor}`);
  const response = await page.request.get(url.href);
  assert(response.ok(), `${sourceId} workbook link should resolve`);
  assert((await response.text()).includes(`id="${anchor}"`), `${sourceId} workbook section must contain the source question`);
}

async function inspectDesktop(page, game) {
  await game.action('start').click();
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

  await wrongHit(page, game, 'A', 2, true);
  await expect(game.root.locator('[data-beam]')).toHaveAttribute('data-kind', 'counter');
  await expect(game.field('feedback')).toContainText('One division recovers the starting number.');
  await expect(game.field('feedback-zh')).toBeVisible();
  await atQuestion(game, 1, 1, 2);
  await page.waitForTimeout(700);
  await atQuestion(game, 1, 1, 2);
  await page.mouse.up();

  await mouseDown(page, game.target('B'));
  await game.state('breaking');
  await expect.poll(() => readCharge(game)).toBeGreaterThan(200);
  await page.mouse.up();
  await expectPaused(page, game);

  await mouseDown(page, game.target('B'));
  await expect.poll(() => readCharge(game)).toBeGreaterThan(550);
  await setPageHidden(page, true);
  await expectPaused(page, game);
  await setPageHidden(page, false);
  await expectPaused(page, game);
  await page.mouse.up();

  await mouseDown(page, game.target('B'));
  await finishStep(game, 1, 1, 2);
  // Keep the pointer pressed into the next question. It may neither answer nor chip a target.
  await page.waitForTimeout(350);
  await atQuestion(game, 1, 2, 2);
  await expect(game.charge).toHaveJSProperty('value', 0);
  await page.mouse.up();
  console.log('PASS a held wrong shot counters once, release and tab hiding pause charge, holding does not cross steps');

  await breakWithMouse(page, game, 1, 2, 2);
  await breakWithMouse(page, game, 1, 3, 2);
  await verifyReview(page, game, encounters[0].sourceId);
  await game.action('next').click();
  await game.state('approach');
  await moveWithKeyboard(page, game, 'ArrowLeft', 'x', -1);
  await atQuestion(game, 2, 1, 3);
  await breakWithMouse(page, game, 2, 1, 3);
  const results = game.root.locator('[data-results] li');
  await expect(results).toHaveCount(1);
  const solvedSteps = await results.allTextContents();
  for (const shields of [2, 1, 0]) {
    await wrongHit(page, game, 'B', shields);
    if (shields) await atQuestion(game, 2, 2, shields);
  }
  await game.state('empty');
  await game.action('recover').click();
  await atQuestion(game, 2, 2, 3);
  await expect(results).toHaveText(solvedSteps);
  await breakWithMouse(page, game, 2, 2, 3);
  await breakWithMouse(page, game, 2, 3, 3);
  await verifyReview(page, game, encounters[1].sourceId);
  await game.action('next').click();
  await game.state('approach');
  await moveWithKeyboard(page, game, 'ArrowDown', 'y', 1);
  await atQuestion(game, 3, 1, 3);
  for (const step of [1, 2, 3]) await breakWithMouse(page, game, 3, step, 3);
  await verifyReview(page, game, encounters[2].sourceId);
  await game.action('next').click();
  await game.state('summary');
  await expect(game.field('score')).toHaveText(/7\s*\/\s*9/);
  for (const { sourceId } of encounters) {
    const card = game.root.locator(`[data-review-card="${sourceId}"]`);
    await expect(card).toBeVisible();
    await expect(card.locator('[data-card-steps] li')).toHaveCount(3);
    await expect(card.locator('a')).toHaveAttribute('href', new RegExp(`#q-${sourceId.toLowerCase()}$`));
  }
  const firstCard = game.root.locator('[data-review-card="2005Q1"]');
  await firstCard.locator('summary').click();
  const [workbook] = await Promise.all([page.waitForEvent('popup'), firstCard.locator('a').click()]);
  await expect(workbook.locator('#q-2005q1')).toBeVisible();
  await workbook.close();
  await game.state('summary');
  console.log('PASS recovery preserves the current step, all nine choices resolve and every workbook source is linked');
}

async function expectAttackWarning(game) {
  await expect(game.arena).toHaveAttribute('data-attack', 'warning', { timeout: 10000 });
  await expect(game.attackMarker).toBeVisible();
}

async function inspectActiveAttacks(page) {
  const game = await open(page);
  await game.action('start').click();
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
  await mouseDown(page, game.target('B'));
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

  await wrongHit(page, game, 'B', 1);
  await atQuestion(game, 1, 2, 1);
  await mouseDown(page, game.target('A'));
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
  await tabTo(page, game.action('start'));
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

  await game.action('start').tap();
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
  const shotPoint = await center(game.target('B'));
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

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const desktopGame = await open(desktop, true);
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
