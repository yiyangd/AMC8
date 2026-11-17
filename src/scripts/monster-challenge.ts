import { challengeSections } from '../data/monster-challenge-sections';
import { choiceKeys, type ChoiceKey, type Localized } from '../data/monster-challenge-types';

type Phase = 'intro' | 'approach' | 'question' | 'breaking' | 'counter' | 'empty' | 'step-cleared' | 'review' | 'summary';
type Point = { x: number; y: number };
type Direction = 'up' | 'left' | 'down' | 'right';
type ChallengeSection = (typeof challengeSections)[number];
type AttackSite = { aim: Point; origin: Point; remaining: number };
type Attack = (AttackSite & { stage: 'warning' }) | (AttackSite & { stage: 'impact'; hit: boolean });

const chargeDuration = 2000;
const maxShields = 3;
const timings = { approach: 1200, counter: 550, 'step-cleared': 450 };
const attackTimings = [
  { first: 3700, repeat: 3350, warning: 1400 },
  { first: 3100, repeat: 2850, warning: 1250 },
  { first: 2700, repeat: 2350, warning: 1150 },
];
const projectileTravel = 360;
const attackImpact = 380;
const attackMessages = {
  idle: { en: 'Move when the warning ring appears.', zh: '警示圈出现时，移动躲开。' },
  warning: { en: 'Move out of the ring!', zh: '快移出警示圈！' },
  hit: { en: 'Hit! You lost a shield.', zh: '被击中了！护盾减少一格。' },
  dodged: { en: 'Dodged!', zh: '躲开了！' },
};
const initialPosition = { x: 20, y: 76 };
const directionByKey: Record<string, Direction | undefined> = {
  w: 'up', a: 'left', s: 'down', d: 'right',
  arrowup: 'up', arrowleft: 'left', arrowdown: 'down', arrowright: 'right',
};

const correctFeedback = {
  en: 'Correct! Hold your shot until the armor breaks.',
  zh: '选对了！持续射击这个部位，直到护甲击破。',
};
const automaticFeedback = {
  en: 'Correct! Breaking the armor.',
  zh: '选对了！正在击破护甲。',
};

function mountChallenge(root: HTMLElement) {
  function find<T extends Element = HTMLElement>(selector: string) {
    const element = root.querySelector<T>(selector);
    if (!element) throw new Error(`Missing Monster Challenge element ${selector}`);
    return element;
  }

  const field = (name: string) => find(`[data-field="${name}"]`);
  const action = (name: string) => find<HTMLButtonElement>(`[data-action="${name}"]`);
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-panel]'));
  const sectionButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-start-section]'));
  const reviewGroups = Array.from(root.querySelectorAll<HTMLElement>('[data-section-review]'));
  const workbookLink = find<HTMLAnchorElement>('[data-workbook-link]');
  const workbookHome = workbookLink.getAttribute('href')!;
  const sectionLinks: Record<string, string> = JSON.parse(root.dataset.sectionLinks ?? '{}');
  const requestedSectionId = new URLSearchParams(window.location.search).get('section');
  const requestedSection = challengeSections.find(section => section.id === requestedSectionId);
  const chooseSection = action('choose');
  const arena = find('[data-arena]');
  const attackMarker = find('[data-attack-marker]');
  const attackEmitter = find('[data-attack-emitter]');
  const attackProjectile = find('[data-attack-projectile]');
  const attackStatus = find('[data-attack-status]');
  const attackStatusZh = find('[data-attack-status-zh]');
  const player = find('[data-player]');
  const muzzle = player.querySelector('[data-muzzle]') ?? player;
  const beam = find<SVGSVGElement>('[data-beam]');
  const beamLine = find<SVGLineElement>('[data-beam-line]');
  const chargeDisplay = find<HTMLProgressElement>('[data-charge]');
  const results = find('[data-results]');
  const figureButton = find<HTMLButtonElement>('[data-level-figure]');
  const figureImage = find<HTMLImageElement>('[data-level-figure-image]');
  const figureDescription = find('#monster-figure-description');
  const numberGrid = find<HTMLTableElement>('[data-level-grid]');
  const gridRows = find<HTMLTableSectionElement>('[data-level-grid] tbody');
  const prompt = field('prompt');
  const recover = action('recover');
  const language = action('language');
  const next = action('next');
  const reviewLink = find<HTMLAnchorElement>('[data-review-link]');
  const sources: Record<string, string> = JSON.parse(root.dataset.sources ?? '{}');
  const figures: Record<string, string> = JSON.parse(root.dataset.figures ?? '{}');
  const targets = choiceKeys.map(key => ({
    key,
    button: find<HTMLButtonElement>(`[data-target="${key}"]`),
    option: find(`[data-option="${key}"]`),
  }));
  const keyMoves = new Map<string, Direction>();
  const touchMoves = new Map<number, Direction>();

  let phase: Phase = 'intro';
  let activeSection: ChallengeSection = challengeSections[0];
  let encounterIndex = 0;
  let stepIndex = 0;
  let shields = maxShields;
  let showChinese = false;
  let firstChoices: Map<number, boolean>[] = [];
  let position = { ...initialPosition };
  let feedback: Localized | null = null;
  let struck: ChoiceKey | null = null;
  let charge = 0;
  let firingPointer: number | null = null;
  let keyboardFiring = false;
  let miss: { point: Point; time: number } | null = null;
  let attack: Attack | null = null;
  let attackDelay = 0;
  let attackMessage: keyof typeof attackMessages = 'idle';
  let phaseTime = 0;
  let frameId = 0;
  let lastFrame = 0;
  let blurred = false;

  const currentEncounter = () => activeSection.levels[encounterIndex];
  const currentStep = () => currentEncounter().steps[stepIndex];
  const attackTiming = () => attackTimings[Math.floor(encounterIndex * attackTimings.length / activeSection.levels.length)];
  const inArena = () => phase !== 'intro' && phase !== 'review' && phase !== 'summary';
  const paused = () => blurred || document.hidden || Boolean(document.querySelector('dialog[open]'));

  function setText(element: Element, text: string) {
    if (element.textContent !== text) element.textContent = text;
  }

  function renderShields() {
    root.dataset.shields = String(shields);
    setText(field('shields'), String(shields));
  }

  function showTranslation(name: string, value: Localized | null) {
    setText(field(name), value?.en ?? '');
    const help = field(`${name}-zh`);
    setText(help, showChinese ? value?.zh ?? '' : '');
    help.hidden = !showChinese || !value;
  }

  function localizedNodes(value: Localized) {
    const english = document.createTextNode(value.en);
    if (!showChinese) return [english];
    const chinese = document.createElement('span');
    chinese.className = 'challenge-zh';
    chinese.lang = 'zh';
    chinese.textContent = value.zh;
    return [english, chinese];
  }

  function setList(list: Element, values: readonly Localized[]) {
    list.replaceChildren(...values.map(value => {
      const item = document.createElement('li');
      item.append(...localizedNodes(value));
      return item;
    }));
    if (list instanceof HTMLElement) list.hidden = values.length === 0;
  }

  function renderQuestionReference() {
    const { sourceId, figure, grid } = currentEncounter();
    figureButton.hidden = !figure;
    figureDescription.hidden = !figure;
    if (figure) {
      const src = figures[sourceId];
      if (figureImage.getAttribute('src') !== src) figureImage.src = src;
      figureImage.alt = figure.description.en;
      figureButton.dataset.image = src;
      figureButton.dataset.imageDescription = showChinese ? figure.description.zh : figure.description.en;
      figureButton.dataset.imageLanguage = showChinese ? 'zh' : 'en';
      figureButton.dataset.question = sourceId;
      figureDescription.replaceChildren(...localizedNodes(figure.description));
    }
    numberGrid.hidden = !grid;
    if (grid && numberGrid.dataset.sourceId !== sourceId) {
      gridRows.replaceChildren();
      for (const row of grid) {
        const tableRow = gridRows.insertRow();
        for (const value of row) tableRow.insertCell().textContent = String(value);
      }
      numberGrid.dataset.sourceId = sourceId;
    }
  }

  function renderGame() {
    const encounter = currentEncounter();
    const step = currentStep();
    const cleared = stepIndex + Number(phase === 'step-cleared');
    const active = phase === 'question' || phase === 'breaking';

    arena.dataset.monster = String(encounterIndex % 3);
    root.toggleAttribute('data-final-armor', phase === 'step-cleared' && cleared === encounter.steps.length);
    renderShields();
    renderAttack();
    setText(field('section-number'), activeSection.id);
    setText(field('encounter'), String(encounterIndex + 1));
    setText(field('encounter-total'), String(activeSection.levels.length));
    setText(field('step'), String(stepIndex + 1));
    setText(field('step-total'), String(encounter.steps.length));
    setText(field('monster'), encounter.monster.en);
    const strategy = field('strategy');
    strategy.replaceChildren(...(cleared ? localizedNodes(encounter.title) : []));
    strategy.hidden = cleared === 0;
    showTranslation('stem', encounter.stem);
    renderQuestionReference();
    showTranslation('prompt', step.prompt);
    showTranslation('feedback', feedback);
    const feedbackField = field('feedback');
    feedbackField.hidden = !feedback;
    feedbackField.dataset.kind = struck === step.correct || phase === 'step-cleared' ? 'correct' : 'wrong';
    setList(results, encounter.steps.slice(0, cleared).map(item => item.unlocked));
    recover.hidden = phase !== 'empty';
    chargeDisplay.hidden = phase !== 'breaking';
    chargeDisplay.value = charge;

    for (const { key, button, option } of targets) {
      const canFire = active && (phase === 'question' || key === struck);
      option.replaceChildren(...localizedNodes(step.options[key].text));
      button.hidden = phase === 'approach';
      button.setAttribute('aria-disabled', String(!canFire));
      if (key === struck) button.dataset.hit = key === step.correct ? 'correct' : 'wrong';
      else delete button.dataset.hit;
    }
  }

  function render() {
    root.dataset.state = phase;
    if (phase === 'intro') delete root.dataset.section;
    else root.dataset.section = activeSection.id;
    chooseSection.hidden = phase === 'intro';
    const linkedSection = phase === 'intro' ? requestedSection : activeSection;
    workbookLink.href = linkedSection ? sectionLinks[linkedSection.id] : workbookHome;
    setText(field('workbook-back'), linkedSection ? `Back to Section ${linkedSection.id}` : 'Back to workbook');
    const visiblePanel = inArena() ? 'game' : phase;
    for (const panel of panels) panel.hidden = panel.dataset.panel !== visiblePanel;
    if (inArena()) renderGame();
    if (phase === 'review') {
      const encounter = currentEncounter();
      const source = encounter.sourceId.replace('Q', ' Q');
      setText(field('review-source-id'), source);
      showTranslation('review-title', encounter.title);
      setList(find('[data-review-steps]'), encounter.steps.map(step => step.explanation));
      reviewLink.href = sources[encounter.sourceId];
      reviewLink.textContent = `View original question · ${source}`;
      next.textContent = encounterIndex < activeSection.levels.length - 1 ? 'Next monster' : 'Finish challenge';
    }
    if (phase === 'summary') {
      const correct = firstChoices.flatMap(row => [...row.values()]).filter(Boolean).length;
      const total = activeSection.levels.reduce((sum, encounter) => sum + encounter.steps.length, 0);
      setText(field('summary-title'), `Section ${activeSection.id} complete`);
      setText(field('score'), `${correct} / ${total}`);
      for (const group of reviewGroups) group.hidden = group.dataset.sectionReview !== activeSection.id;
      for (const encounter of activeSection.levels) {
        const card = find(`[data-review-card="${encounter.sourceId}"]`);
        card.querySelector('[data-card-title]')?.replaceChildren(...localizedNodes(encounter.title));
        const steps = card.querySelector('[data-card-steps]');
        if (steps) setList(steps, encounter.steps.map(step => step.explanation));
      }
    }
  }

  function changePhase(value: Phase) {
    phase = value;
    phaseTime = 0;
    render();
  }

  function drawPlayer() {
    player.style.setProperty('--x', `${position.x}%`);
    player.style.setProperty('--y', `${position.y}%`);
  }

  function startEncounter(index: number) {
    encounterIndex = index;
    stepIndex = 0;
    shields = maxShields;
    position = { ...initialPosition };
    feedback = null;
    struck = null;
    charge = 0;
    keyboardFiring = false;
    resetInput();
    resetAttack();
    changePhase('approach');
    drawPlayer();
    if (!frameId) frameId = requestAnimationFrame(tick);
  }

  function resetInput() {
    keyMoves.clear();
    touchMoves.clear();
    firingPointer = null;
    miss = null;
    lastFrame = 0;
    beam.toggleAttribute('hidden', true);
    player.removeAttribute('data-firing');
  }

  function selectTarget(key: ChoiceKey, pointer: number | null) {
    if (paused()) return false;
    if (phase === 'question') {
      const step = currentStep();
      const right = key === step.correct;
      const choices = firstChoices[encounterIndex];
      if (!choices.has(stepIndex)) choices.set(stepIndex, right);
      miss = null;
      struck = key;
      if (!right) {
        shields -= 1;
        feedback = step.options[key].hint ?? null;
        resetAttack();
        changePhase('counter');
        return true;
      }
      feedback = pointer === null ? automaticFeedback : correctFeedback;
      changePhase('breaking');
    }
    if (phase !== 'breaking' || key !== struck || firingPointer !== null || keyboardFiring) return false;
    firingPointer = pointer;
    keyboardFiring = pointer === null;
    return true;
  }

  function center(element: Element): Point {
    const { x, y, width, height } = element.getBoundingClientRect();
    return { x: x + width / 2, y: y + height / 2 };
  }

  function attackRadius(width: number, height: number) {
    return Math.max(25, Math.min(width, height) * .14);
  }

  function sizeAttackMarker() {
    const { width, height } = arena.getBoundingClientRect();
    attackMarker.style.setProperty('--attack-size', `${attackRadius(width, height) * 2}px`);
  }

  function renderAttack() {
    attackMarker.hidden = attack === null;
    if (attack) arena.dataset.attack = attack.stage;
    else delete arena.dataset.attack;
    if (attack?.stage === 'impact' && attack.hit) root.dataset.playerHit = 'true';
    else delete root.dataset.playerHit;
    const message = attackMessages[attackMessage];
    setText(attackStatus, message.en);
    setText(attackStatusZh, showChinese ? message.zh : '');
    attackStatusZh.hidden = !showChinese;
  }

  function resetAttack() {
    attack = null;
    attackDelay = attackTiming().first;
    attackMessage = 'idle';
    attackProjectile.hidden = true;
    renderAttack();
  }

  function beginWarning() {
    const bounds = arena.getBoundingClientRect();
    const emitter = center(attackEmitter);
    attack = {
      stage: 'warning',
      aim: { ...position },
      origin: { x: (emitter.x - bounds.x) * 100 / bounds.width, y: (emitter.y - bounds.y) * 100 / bounds.height },
      remaining: attackTiming().warning,
    };
    attackMarker.style.setProperty('--attack-x', `${attack.aim.x}%`);
    attackMarker.style.setProperty('--attack-y', `${attack.aim.y}%`);
    sizeAttackMarker();
    attackMessage = 'warning';
    renderAttack();
  }

  function drawProjectile(warning: AttackSite) {
    const progress = 1 - warning.remaining / projectileTravel;
    const x = warning.origin.x + (warning.aim.x - warning.origin.x) * progress;
    const y = warning.origin.y + (warning.aim.y - warning.origin.y) * progress;
    attackProjectile.style.setProperty('--projectile-x', `${x}%`);
    attackProjectile.style.setProperty('--projectile-y', `${y}%`);
    attackProjectile.hidden = false;
  }

  function resolveAttack(warning: AttackSite) {
    const { width, height } = arena.getBoundingClientRect();
    const dx = (position.x - warning.aim.x) * width / 100;
    const dy = (position.y - warning.aim.y) * height / 100;
    const hit = Math.hypot(dx, dy) <= attackRadius(width, height);
    attack = { ...warning, stage: 'impact', remaining: attackImpact, hit };
    attackProjectile.hidden = true;
    attackMessage = hit ? 'hit' : 'dodged';
    renderAttack();
    if (!hit) return;

    shields -= 1;
    if (shields) {
      renderShields();
      return;
    }
    keyboardFiring = false;
    resetInput();
    changePhase('empty');
    if (document.activeElement?.matches('[data-target]')) recover.focus({ preventScroll: true });
  }

  function advanceAttack(elapsed: number) {
    if (attack?.stage === 'impact') {
      attack.remaining -= elapsed;
      if (attack.remaining <= 0) {
        attack = null;
        attackDelay = attackTiming().repeat;
        renderAttack();
      }
      return;
    }
    if (phase !== 'question' && phase !== 'breaking') return;
    if (!attack) {
      attackDelay -= elapsed;
      if (attackDelay <= 0) beginWarning();
      return;
    }

    attack.remaining -= elapsed;
    if (attack.remaining <= 0) resolveAttack(attack);
    else if (attack.remaining <= projectileTravel) drawProjectile(attack);
  }

  function drawBeam(target: Point | Element, kind: 'shot' | 'counter') {
    const bounds = arena.getBoundingClientRect();
    const own = center(muzzle);
    const other = target instanceof Element ? center(target) : target;
    const start = kind === 'shot' ? own : other;
    const end = kind === 'shot' ? other : own;
    beamLine.setAttribute('x1', String((start.x - bounds.x) * 1000 / bounds.width));
    beamLine.setAttribute('y1', String((start.y - bounds.y) * 1000 / bounds.height));
    beamLine.setAttribute('x2', String((end.x - bounds.x) * 1000 / bounds.width));
    beamLine.setAttribute('y2', String((end.y - bounds.y) * 1000 / bounds.height));
    beam.dataset.kind = kind;
    beam.removeAttribute('hidden');
    player.toggleAttribute('data-firing', kind === 'shot');
  }

  function movePlayer(elapsed: number) {
    const directions = new Set([...keyMoves.values(), ...touchMoves.values()]);
    const x = Number(directions.has('right')) - Number(directions.has('left'));
    const y = Number(directions.has('down')) - Number(directions.has('up'));
    if (!x && !y) return;
    const distance = elapsed * .032 / Math.hypot(x, y);
    position.x = Math.max(7, Math.min(92, position.x + x * distance));
    position.y = Math.max(12, Math.min(88, position.y + y * distance));
    drawPlayer();
  }

  function tick(now: number) {
    frameId = 0;
    if (!inArena()) return;
    frameId = requestAnimationFrame(tick);
    if (paused()) {
      resetInput();
      return;
    }
    const elapsed = lastFrame ? Math.min(now - lastFrame, 50) : 0;
    lastFrame = now;
    phaseTime += elapsed;
    movePlayer(elapsed);

    const target = targets.find(item => item.key === struck)?.button;
    if (phase === 'approach' && phaseTime >= timings.approach) {
      changePhase('question');
      if (document.activeElement === document.body) prompt.focus({ preventScroll: true });
    } else if (phase === 'counter' && phaseTime >= timings.counter) {
      struck = null;
      changePhase(shields ? 'question' : 'empty');
      if (!shields && document.activeElement?.matches('[data-target]')) recover.focus({ preventScroll: true });
    } else if (phase === 'breaking' && (firingPointer !== null || keyboardFiring)) {
      charge = Math.min(charge + elapsed, chargeDuration);
      chargeDisplay.value = charge;
      if (charge === chargeDuration) {
        firingPointer = null;
        keyboardFiring = false;
        feedback = currentStep().explanation;
        changePhase('step-cleared');
      }
    } else if (phase === 'step-cleared' && phaseTime >= timings['step-cleared']) {
      if (stepIndex === currentEncounter().steps.length - 1) {
        resetInput();
        resetAttack();
        changePhase('review');
        field('review-title').focus();
        return;
      }
      stepIndex += 1;
      charge = 0;
      struck = null;
      attackDelay = Math.max(1200, attackDelay);
      changePhase('question');
      if (document.activeElement?.matches('[data-target]')) prompt.focus({ preventScroll: true });
    }

    advanceAttack(elapsed);
    if (miss) {
      miss.time -= elapsed;
      if (miss.time <= 0) miss = null;
    }
    if (target && phase === 'counter') drawBeam(target, 'counter');
    else if (target && phase === 'breaking' && (firingPointer !== null || keyboardFiring)) drawBeam(target, 'shot');
    else if (miss) drawBeam(miss.point, 'shot');
    else {
      beam.toggleAttribute('hidden', true);
      player.removeAttribute('data-firing');
    }
  }

  function startRun(section: ChallengeSection) {
    activeSection = section;
    firstChoices = section.levels.map(() => new Map<number, boolean>());
    startEncounter(0);
  }

  for (const button of sectionButtons) {
    const section = challengeSections.find(item => item.id === button.dataset.startSection);
    if (!section) continue;
    button.toggleAttribute('data-recommended', section.id === requestedSection?.id);
    button.addEventListener('click', () => startRun(section));
  }
  chooseSection.addEventListener('click', () => {
    cancelAnimationFrame(frameId);
    frameId = 0;
    resetInput();
    resetAttack();
    keyboardFiring = false;
    changePhase('intro');
    sectionButtons.find(button => button.dataset.startSection === activeSection.id)?.focus();
  });
  action('restart').addEventListener('click', () => startRun(activeSection));
  next.addEventListener('click', () => {
    if (phase !== 'review') return;
    if (encounterIndex < activeSection.levels.length - 1) startEncounter(encounterIndex + 1);
    else {
      changePhase('summary');
      find('[data-panel="summary"]').focus();
    }
  });
  recover.addEventListener('click', () => {
    if (phase !== 'empty') return;
    shields = maxShields;
    resetAttack();
    const resumeShot = struck === currentStep().correct;
    if (resumeShot) feedback = correctFeedback;
    changePhase(resumeShot ? 'breaking' : 'question');
    prompt.focus({ preventScroll: true });
  });
  language.addEventListener('click', () => {
    showChinese = !showChinese;
    language.setAttribute('aria-pressed', String(showChinese));
    render();
  });

  for (const { key, button } of targets) {
    button.addEventListener('pointerdown', event => {
      if (event.button !== 0 || !selectTarget(key, event.pointerId)) return;
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
    });
    button.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      if (!event.repeat) selectTarget(key, null);
    });
    button.addEventListener('click', event => {
      if (event.detail === 0) selectTarget(key, null);
    });
    button.addEventListener('contextmenu', event => event.preventDefault());
  }

  arena.addEventListener('pointerdown', event => {
    if (event.button !== 0 || paused() || (phase !== 'question' && phase !== 'breaking')) return;
    if (event.target instanceof Element && event.target.closest('button')) return;
    miss = { point: { x: event.clientX, y: event.clientY }, time: 125 };
  });

  root.querySelectorAll<HTMLButtonElement>('[data-move]').forEach(button => {
    button.addEventListener('pointerdown', event => {
      if (event.button !== 0 || paused() || !inArena()) return;
      event.preventDefault();
      touchMoves.set(event.pointerId, button.dataset.move as Direction);
      button.setPointerCapture(event.pointerId);
    });
    button.addEventListener('contextmenu', event => event.preventDefault());
  });

  function releasePointer(event: PointerEvent) {
    if (firingPointer === event.pointerId) firingPointer = null;
    touchMoves.delete(event.pointerId);
  }

  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) {
    window.addEventListener(name, releasePointer);
  }
  window.addEventListener('keydown', event => {
    const key = event.key.toLowerCase();
    const direction = directionByKey[key];
    if (!direction || paused() || !inArena() || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    if (!event.repeat) keyMoves.set(key, direction);
  });
  window.addEventListener('keyup', event => keyMoves.delete(event.key.toLowerCase()));
  window.addEventListener('resize', () => {
    if (attack) sizeAttackMarker();
  });
  window.addEventListener('blur', () => {
    blurred = true;
    resetInput();
  });
  window.addEventListener('focus', () => {
    blurred = false;
    resetInput();
  });
  document.addEventListener('visibilitychange', resetInput);
  render();
}

const challenge = document.querySelector<HTMLElement>('[data-challenge]');
if (challenge) mountChallenge(challenge);
