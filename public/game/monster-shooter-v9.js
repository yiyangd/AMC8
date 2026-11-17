/* AMC 8 Monster Shooter — engine.
 * Plain JavaScript, no dependencies. Runs from file:// or any static host.
 * The workbook builds the section and question data into the play page.
 *
 * Screen layout, read top to bottom: HUD, question card, monster with one answer on each part, player.
 * On narrow screens the card moves above the canvas and also lists the answers.
 */
(() => {
  'use strict';

  const DATA = JSON.parse(document.getElementById('shooter-data').textContent);
  const requestedId = new URLSearchParams(window.location.search).get('section');
  const requestedSection = DATA.sections.find(section => section.id === requestedId);
  const sectionButtons = [...document.querySelectorAll('[data-start-section]')];
  let activeSection = requestedSection ?? DATA.sections[0];
  let ENC = activeSection.encounters;

  // ================================================================ config
  const H = 600, TAU = Math.PI * 2;   // H: height of the play field in logical units
  let W = 800;                        // width of the play field; follows the shape of the window
  const KEYS = ['A', 'B', 'C'];
  const KEY_COLOR = { A: '#38bdf8', B: '#fbbf24', C: '#f472b6' };
  const FONT = '"Segoe UI", system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';

  const CFG = {
    maxHearts: 5,
    breakSeconds: 2.4,          // sustained fire needed to break the correct part
    fireRate: 9,                // shots per second
    rowHoldMs: 160,             // stationary touch before an answer row starts firing
    rowMoveLimit: 10,           // CSS pixels travelled before a touch becomes a gesture
    bulletSpeed: 1150,
    playerSpeed: 285,
    stunSeconds: 0.7,           // an orb hit jams the blaster; it never costs a heart
    orbGrace: 0.5,              // quiet time before the first orb of a break phase
    orbInterval: i => Math.max(0.8, 1.2 - 0.08 * i),    // i = difficulty along the section
    orbSpeed: i => 195 + 12 * i,
    orbDifficultyMax: 5,
    zone: { left: 34, top: 412, bottom: 552 },          // where the player may walk; the right edge is W - left
    actorScale: 1.2,                      // wide screens draw the monster, its parts and the player this much bigger
    monsterY: 136,                        // where the monster hovers when no card floats above it (narrow screens)
    monsterRange: [92, 168],              // wide screens: it settles just under the question card, within this range
    sky: { overlay: 240, stacked: 40 },   // empty sky above the play field: room for the question card, or just the HUD
    width: { min: 800, max: 1500 },       // 1500 fills a 16:9 window
    time: { enter: 1.45, counter: 1.05, stepClear: 1.2, rearm: 0.6, dying: 1.9 },
    stepPoints: [100, 50, 20],  // first try, second try, third try
  };

  // A and C sit to the sides of the monster, B below it; side * spread() is the horizontal offset
  const POD_AT = { A: { side: -1, oy: 80 }, B: { side: 0, oy: 112 }, C: { side: 1, oy: 80 } };
  const CRACKS = [
    [[-80, -30], [-54, -8], [-68, 14], [-42, 34]],
    [[72, -44], [48, -18], [64, 4], [40, 30]],
    [[-12, -74], [6, -52], [-8, -40]],
    [[-72, 42], [-51, 54], [-30, 47], [-20, 66]],
    [[56, 59], [33, 56], [24, 36]],
  ];
  const MOVE_KEY = { w: [0, -1], arrowup: [0, -1], s: [0, 1], arrowdown: [0, 1], a: [-1, 0], arrowleft: [-1, 0], d: [1, 0], arrowright: [1, 0] };
  const FIRE_KEY = { 1: 'A', 2: 'B', 3: 'C', j: 'A', k: 'B', l: 'C' };

  const T = (en, zh) => ({ en, zh });
  const MSG = {
    keepFiring: T('Keep firing to break this part, and dodge the orbs.', '持续射击打掉这个部位，注意躲开能量球。'),
    status: {
      enter: T('A monster is coming…', '怪兽来了……'),
      first: T('Read the question above, then shoot part A, B or C.', '先读上面的题目，再射击 A、B 或 C 部位。'),
      think: T('Think first. Then aim at the right part and fire.', '先想清楚，再瞄准正确的部位开火。'),
      counter: T('Wrong part. It strikes back! Read the hint above.', '打错部位，它反击了！看看上面的提示。'),
      break: T('Weak point! Hold fire to break it. Dodge the orbs.', '命中弱点！持续开火打掉它，躲开能量球。'),
      stepClear: T('Part destroyed!', '部位击破！'),
      rearm: T('New parts are growing. Read the next step above.', '新的部位长出来了。读上面的下一步。'),
      dying: T('Monster defeated!', '怪兽被打败了！'),
    },
  };

  // ================================================================ helpers
  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const zoneRight = () => W - CFG.zone.left;
  const spread = () => clamp(W * 0.21, 200, 300);   // distance between neighbouring parts: wider scenes spread them out
  const plateWidth = () => spread() - 44;           // widest line of answer text under a part
  const actor = () => (view.stacked ? 1 : CFG.actorScale);

  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem('amc8shooter.' + key); return v === null ? fallback : JSON.parse(v); } catch (err) { return fallback; }
    },
    set(key, value) { try { localStorage.setItem('amc8shooter.' + key, JSON.stringify(value)); } catch (err) { /* private mode */ } },
  };

  const FRAC = /\[\[([^\]\/]+)\/([^\]]+)\]\]/g;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = s => esc(s).replace(FRAC, '<span class="frac"><span>$1</span><span>$2</span></span>');
  const plain = s => String(s).replace(FRAC, '$1/$2');
  // English line plus a Chinese help line; the help line is dropped when it would just repeat (plain numbers)
  const bi = o => `<span class="en">${fmt(o.en)}</span>${o.zh && o.zh !== o.en ? `<span class="zh" lang="zh">${fmt(o.zh)}</span>` : ''}`;
  const starsHtml = n => '★'.repeat(n) + `<span class="off">${'★'.repeat(3 - n)}</span>`;

  // ================================================================ DOM
  const el = {
    app: $('app'), wrap: $('stage-wrap'), stage: $('stage'), scene: $('scene'), canvas: $('arena'), legend: $('legend'),
    card: $('qcard'), corner: $('corner'), source: $('q-source'), type: $('q-type'), stem: $('q-stem'), solved: $('q-solved'),
    reference: $('q-reference'), now: $('q-now'), heading: $('q-heading'), badge: $('q-badge'), prompt: $('q-prompt'), options: $('q-options'), feedback: $('q-feedback'),
    figure: $('q-figure'), figurePreview: $('q-figure-image'), grid: $('q-grid'),
    figureDialog: $('figure-dialog'), figureImage: $('figure-image'), figureCaption: $('figure-caption'),
  };
  const ov = { intro: $('ov-intro'), review: $('ov-review'), down: $('ov-down'), summary: $('ov-summary') };
  const ctx = el.canvas.getContext('2d');
  // cardBottom: lower edge of the floating question card in play-field coordinates (-Infinity when it does not float)
  const view = { scale: 1, dpr: 1, top: CFG.sky.overlay, stacked: false, cardBottom: -Infinity };

  // ================================================================ audio (synthesised, no files)
  const audio = {
    ctx: null, out: null, noiseBuf: null, muted: store.get('muted', false),
    ensure() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try {
        if (!this.ctx) {
          this.ctx = new AC();
          this.out = this.ctx.createGain(); this.out.gain.value = 0.55; this.out.connect(this.ctx.destination);
          const n = Math.floor(this.ctx.sampleRate * 0.6);
          this.noiseBuf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
          const d = this.noiseBuf.getChannelData(0);
          for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
      } catch (err) { this.ctx = null; }
    },
    tone(freq, dur, { type = 'square', vol = 0.06, to = 0, delay = 0 } = {}) {
      if (this.muted || !this.ctx) return;
      const t0 = this.ctx.currentTime + delay, osc = this.ctx.createOscillator(), g = this.ctx.createGain();
      osc.type = type; osc.frequency.setValueAtTime(freq, t0);
      if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
      g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g); g.connect(this.out); osc.start(t0); osc.stop(t0 + dur + 0.03);
    },
    noise(dur, { vol = 0.1, cutoff = 1500, delay = 0 } = {}) {
      if (this.muted || !this.ctx) return;
      const t0 = this.ctx.currentTime + delay, src = this.ctx.createBufferSource(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
      src.buffer = this.noiseBuf; f.type = 'lowpass'; f.frequency.value = cutoff;
      g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(f); f.connect(g); g.connect(this.out); src.start(t0, Math.random() * 0.1, dur + 0.05);
    },
  };
  const sfx = {
    shoot: () => audio.tone(900, 0.07, { vol: 0.022, to: 430 }),
    hit: () => audio.noise(0.05, { vol: 0.05, cutoff: 3200 }),
    tink: () => audio.tone(1500, 0.04, { type: 'triangle', vol: 0.025 }),
    orb: () => audio.tone(240, 0.16, { type: 'sine', vol: 0.06, to: 420 }),
    lock: () => { audio.tone(523, 0.09, { type: 'triangle', vol: 0.1 }); audio.tone(784, 0.16, { type: 'triangle', vol: 0.1, delay: 0.08 }); },
    wrong: () => { audio.tone(200, 0.3, { type: 'sawtooth', vol: 0.08, to: 90 }); audio.noise(0.22, { vol: 0.1, cutoff: 700 }); },
    stun: () => audio.tone(320, 0.22, { vol: 0.05, to: 140 }),
    pop: () => audio.noise(0.12, { vol: 0.09, cutoff: 1100 }),
    boom: () => { audio.noise(0.5, { vol: 0.24, cutoff: 900 }); audio.tone(120, 0.42, { type: 'sine', vol: 0.2, to: 40 }); },
    clear: () => [523, 659, 784].forEach((f, i) => audio.tone(f, 0.12, { type: 'triangle', vol: 0.09, delay: i * 0.09 })),
    win: () => [523, 659, 784, 1047].forEach((f, i) => audio.tone(f, 0.2, { type: 'triangle', vol: 0.1, delay: i * 0.12 })),
    down: () => [392, 330, 262].forEach((f, i) => audio.tone(f, 0.22, { type: 'triangle', vol: 0.09, delay: i * 0.16 })),
    roar: () => audio.tone(110, 0.5, { type: 'sawtooth', vol: 0.06, to: 60 }),
  };

  // ================================================================ state
  const newStats = () => ENC.map(e => ({ mistakes: 0, retries: 0, stunned: 0, stars: 0, firstTry: e.steps.map(() => null) }));

  const S = {
    screen: 'intro',            // intro | play | review | down | summary
    phase: 'idle',              // enter | think | counter | break | stepClear | rearm | dying
    phaseT: 0, time: 0,
    ei: 0, si: 0, cleared: 0,   // monster index, step index, steps cleared on this monster
    thinkSeq: 0,                // bumps whenever a new chance to answer starts
    hearts: CFG.maxHearts, score: 0, hpShown: ENC[0].steps.length,
    locked: null, armor: 1, stepWrong: 0,
    orbTimer: 0, orbTurn: 0,
    feedback: null, lastHint: null,
    hoverKey: null, panelHover: null,
    shake: 0, redFlash: 0, tipCd: 0, banner: null,
    bigBoom: false, boomT: 0,
    runStart: 0, shownAt: 0,
    stats: newStats(),
  };

  const player = { x: W / 2, y: 495, r: 17, aim: -Math.PI / 2, fireCd: 0, stun: 0, inv: 0, recoil: 0, flash: 0, walkT: 0, moving: false, kx: 0, ky: 0 };
  const monster = { x: W / 2, y: CFG.monsterY, homeY: null, t: 0, hurt: 0, roar: 0, lunge: 0, jx: 0, jy: 0, sway: 0, swayPhase: 0, visible: true, look: ENC[0].monster.look };
  // plate: the answer text shown under a part; rect: where that text sits right now (pressing it aims at the part)
  const pods = KEYS.map((key, i) => ({ key, i, side: POD_AT[key].side, ox: POD_AT[key].side * spread(), oy: POD_AT[key].oy, x: 0, y: 0, r: 37, state: 'idle', grow: 0, flash: 0, plate: null, rect: null }));
  const podOf = key => pods[KEYS.indexOf(key)];
  let bullets = [], orbs = [], particles = [], floats = [], zaps = [];

  const input = {
    keys: new Set(),
    mouse: { x: W / 2, y: 340, down: false, inside: false },
    touchAim: null,             // { id, x, y }
    stick: null,                // { id, ox, oy, dx, dy }
    autoKey: null,              // part held with 1 / 2 / 3
    rowKey: null, rowPointer: null,   // part held through an answer row of the card (narrow screens)
    rowPress: null,                    // pending touch on an answer row
    space: false,
    lastType: 'mouse',
    commitSeq: -1, commitKey: null,   // which part the current trigger press may answer with
  };

  let showZh = store.get('zh', false);

  const enc = () => ENC[S.ei];
  const step = () => enc().steps[S.si];
  const canTarget = () => S.screen === 'play' && (S.phase === 'think' || S.phase === 'break');
  const targetable = p => p.grow > 0.6 && (S.phase === 'think' ? p.state === 'idle' : S.phase === 'break' && p.state === 'breaking');
  const totalStars = () => S.stats.reduce((sum, s) => sum + s.stars, 0);
  const ready = () => performance.now() - S.shownAt > 400;   // ignore clicks carried over from the fight

  function podAt(x, y, reach) {
    let best = null, bestD = Infinity;
    for (const p of pods) {
      if (p.state === 'gone' || p.grow < 0.6) continue;
      let d = Math.hypot(x - p.x, y - p.y);
      const r = p.rect;   // pressing the answer text counts as aiming at its part
      if (r && x >= r.x - 4 && x <= r.x + r.w + 4 && y >= r.y - 4 && y <= r.y + r.h + 4) d = Math.min(d, p.r * 0.5);
      if (d < p.r * 1.22 * reach && d < bestD) { bestD = d; best = p.key; }
    }
    return best;
  }

  // ================================================================ flow
  function setScreen(name) {
    S.screen = name; S.shownAt = performance.now();
    el.app.dataset.screen = name;
    if (name === 'intro') delete el.app.dataset.section;
    else el.app.dataset.section = activeSection.id;
    for (const key of Object.keys(ov)) ov[key].hidden = key !== name;
    clearInput();
    if (name !== 'play') {
      const btn = name === 'intro' && requestedSection
        ? sectionButtons.find(button => button.dataset.startSection === requestedId)
        : ov[name].querySelector('[data-primary]');
      setTimeout(() => { if (S.screen === name && btn) btn.focus({ preventScroll: true }); }, 650);
    }
  }

  function setPhase(name) {
    cancelRowPress();
    S.phase = name; S.phaseT = 0;
  }

  function wrapLines(text, maxWidth) {
    const cjk = /[㐀-鿿]/.test(text);
    const parts = cjk ? Array.from(text) : text.split(' ');
    const lines = [];
    let line = '';
    for (const part of parts) {
      const next = line ? line + (cjk ? '' : ' ') + part : part;
      if (line && ctx.measureText(next).width > maxWidth) { lines.push(line); line = part; } else line = next;
    }
    if (line) lines.push(line);
    return lines;
  }

  /* Lay out the answer text of the current step, one plate per part. Short answers (a number) get a big font. */
  function setLabels() {
    const widest = lines => Math.max(0, ...lines.map(line => ctx.measureText(line).width));
    const up = actor() > 1, zhSize = up ? 14.5 : 13.5;
    for (const p of pods) {
      const text = step().options[p.key].text, en = plain(text.en), zh = plain(text.zh);
      const big = en.length <= 14, size = big ? (up ? 21 : 19) : (up ? 17 : 15.5);
      ctx.font = `700 ${size}px ${FONT}`;
      const enLines = big ? [en] : wrapLines(en, plateWidth()), wEn = widest(enLines);
      ctx.font = `400 ${zhSize}px ${FONT}`;
      const zhLines = zh !== en ? wrapLines(zh, plateWidth()) : [], wZh = widest(zhLines);
      p.plate = { en: enLines, zh: zhLines, big, size, lh: Math.round(size * 1.28), zhSize, zhLh: Math.round(zhSize * 1.34), wEn, wZh };
      p.rect = null;
    }
  }

  function startRun(section = activeSection) {
    activeSection = section;
    ENC = section.encounters;
    audio.ensure();
    S.stats = newStats(); S.hearts = CFG.maxHearts; S.score = 0; S.runStart = performance.now();
    startEncounter(0);
  }

  function startEncounter(index) {
    S.ei = index; S.si = 0; S.cleared = 0;
    S.locked = null; S.armor = 1; S.stepWrong = 0; S.feedback = null; S.lastHint = null; S.hpShown = enc().steps.length;
    bullets = []; orbs = []; zaps = [];
    Object.assign(monster, { x: W / 2, y: -260, homeY: null, t: 0, hurt: 0, roar: 0.9, lunge: 0, jx: 0, jy: 0, sway: 0, swayPhase: 0, visible: true, look: enc().monster.look });
    for (const p of pods) { p.state = 'idle'; p.grow = 0; p.flash = 0; }
    setLabels();
    Object.assign(player, { x: W / 2, y: 495, stun: 0, inv: 0, kx: 0, ky: 0 });
    S.banner = { text: enc().monster.boss ? 'BOSS' : `MONSTER ${index + 1} / ${ENC.length}`, sub: enc().monster.name.en, t: 0, dur: 1.7 };
    setScreen('play'); setPhase('enter'); renderCard();
    el.card.scrollTop = 0;
    el.reference.scrollTop = 0;
    sfx.roar();
  }

  function startThink() { S.thinkSeq++; setPhase('think'); }

  function nextStep() {
    S.si++; S.locked = null; S.armor = 1; S.stepWrong = 0; S.feedback = null;
    for (const p of pods) { p.state = 'idle'; p.grow = 0; p.flash = 0; }
    setLabels();
    setPhase('rearm'); renderCard();
    revealInCard(el.badge, true);
    attention(el.heading, 'new');
  }

  function startDying() {
    S.bigBoom = false; S.boomT = 0;
    S.banner = { text: 'DEFEATED!', sub: '', col: '#fde047', t: 0, dur: 1.7 };
    setPhase('dying');
  }

  function knockOut() {
    $('dn-hint').innerHTML = S.lastHint ? `<b>Hint · ${S.lastHint.key}</b><br>${bi(S.lastHint.body)}` : '';
    $('dn-hint').hidden = !S.lastHint;
    setScreen('down'); renderCard(); sfx.down();
  }

  function retryEncounter() {
    S.stats[S.ei].retries++;
    S.hearts = CFG.maxHearts;
    startEncounter(S.ei);
  }

  function showReview() {
    const e = enc(), st = S.stats[S.ei];
    st.stars = st.mistakes === 0 ? 3 : st.mistakes <= 2 ? 2 : 1;
    S.hearts = Math.min(CFG.maxHearts, S.hearts + 1);
    $('rv-kicker').textContent = `Monster defeated · AMC 8 ${e.year} Problem ${e.number}`;
    $('rv-stars').innerHTML = starsHtml(st.stars);
    $('rv-title').innerHTML = bi(e.method.title);
    $('rv-steps').innerHTML = e.steps.map(s => `<li>${bi(s.explanation)}</li>`).join('');
    $('rv-answer').textContent = `On the real test this is choice (${e.answer}).`;
    $('rv-link').href = e.url;
    $('btn-next').textContent = S.ei < ENC.length - 1 ? 'Next monster →' : 'See results →';
    setScreen('review'); renderCard(); sfx.win();
  }

  function showSummary() {
    const secs = Math.round((performance.now() - S.runStart) / 1000);
    const first = S.stats.reduce((sum, s) => sum + s.firstTry.filter(v => v === true).length, 0);
    const totalSteps = ENC.reduce((sum, e) => sum + e.steps.length, 0);
    $('sm-kicker').textContent = `Section ${activeSection.id} cleared`;
    $('sm-stars').textContent = `${totalStars()} / ${ENC.length * 3}`;
    $('sm-first').textContent = `${first} / ${totalSteps}`;
    $('sm-time').textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
    $('sm-score').textContent = String(S.score);
    $('sm-list').innerHTML = ENC.map((e, i) => {
      const s = S.stats[i];
      const missed = s.firstTry.map((ok, j) => (ok === false ? `Step ${j + 1}` : '')).filter(Boolean);
      const note = missed.length ? `<small class="miss">AMC 8 ${e.year} Problem ${e.number} · review ${missed.join(', ')}</small>` : `<small>AMC 8 ${e.year} Problem ${e.number} · every step right first time</small>`;
      return `<li><span class="stars stars--sm">${starsHtml(s.stars)}</span><div><b>${bi(e.method.title)}</b>${note}</div></li>`;
    }).join('');
    $('sm-link').href = activeSection.url;
    $('sm-link').textContent = `Section ${activeSection.id} workbook ↗`;
    setScreen('summary'); renderCard(); sfx.win();
  }

  // ================================================================ combat events
  function addFloat(x, y, text, col, size) { floats.push({ x, y, text, col, size, life: 1.1, max: 1.1 }); }

  function burst(x, y, col, n, speed) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), v = rand(0.25, 1) * speed, life = rand(0.35, 0.85);
      particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life, max: life, size: rand(2.5, 6), col });
    }
  }

  function tink(x, y) { burst(x, y, '#e2e8f0', 2, 130); sfx.tink(); }

  function tip(p, text) {
    if (S.tipCd > 0) return;
    S.tipCd = 1.6; addFloat(p.x, p.y - p.r - 18, text, '#cbd5e1', 15);
  }

  function wrongAnswer(p) {
    const stats = S.stats[S.ei];
    p.state = 'sealed'; p.flash = 1;
    S.stepWrong++; stats.mistakes++;
    if (stats.firstTry[S.si] === null) stats.firstTry[S.si] = false;
    S.hearts = Math.max(0, S.hearts - 1);
    player.inv = 1.4; S.shake = 15; S.redFlash = 1;
    monster.roar = 0.9; monster.lunge = 1;
    zaps.push({ from: p, t: 0, dur: 0.45, col: '#f87171' });
    addFloat(p.x, p.y - p.r - 18, '✗', '#f87171', 34);
    addFloat(player.x, player.y - 52 * actor(), '−1 ♥', '#fca5a5', 22);
    burst(player.x, player.y - 6, '#f87171', 16, 240);
    S.feedback = { kind: 'wrong', key: p.key, title: `Hint · ${p.key} is not it`, body: step().options[p.key].hint };
    S.lastHint = S.feedback;
    sfx.wrong();
    setPhase('counter'); renderCard();
    revealInCard(el.feedback);
    attention(el.card, 'wrong');
  }

  function lockCorrect(p) {
    const stats = S.stats[S.ei];
    if (stats.firstTry[S.si] === null) stats.firstTry[S.si] = true;
    S.locked = p.key; S.armor = 1;
    p.state = 'breaking'; p.flash = 1;
    for (const q of pods) if (q !== p && q.state === 'idle') q.state = 'guard';
    const pts = CFG.stepPoints[Math.min(S.stepWrong, 2)];
    S.score += pts;
    addFloat(p.x, p.y - p.r - 22, `WEAK POINT!  +${pts}`, '#fde047', 20);
    S.feedback = { kind: 'right', key: p.key, title: `Correct · ${p.key}`, body: MSG.keepFiring };
    S.orbTimer = CFG.orbGrace; S.orbTurn = 0;
    sfx.lock();
    setPhase('break'); renderCard();
    revealInCard(view.stacked ? el.options.querySelector('.is-locked') : el.feedback);
  }

  function damage(p, b) {
    S.armor -= 1 / (CFG.breakSeconds * CFG.fireRate);
    p.flash = 0.3; monster.hurt = Math.max(monster.hurt, 0.22);
    burst(b.x, b.y, '#fde047', 3, 170); sfx.hit();
    if (S.armor <= 0) breakPod(p);
  }

  function breakPod(p) {
    S.armor = 0; S.cleared++;
    p.state = 'gone';
    for (const q of pods) if (q !== p) q.state = 'retract';
    burst(p.x, p.y, KEY_COLOR[p.key], 36, 340); burst(p.x, p.y, '#fde047', 20, 250); burst(p.x, p.y, '#ffffff', 10, 420);
    for (const o of orbs) burst(o.x, o.y, o.col, 5, 120);
    orbs = [];
    S.shake = 20; monster.hurt = 1; monster.roar = 1;
    addFloat(p.x, p.y - 40, 'BROKEN!', '#ffffff', 26);
    S.feedback = null;
    sfx.boom(); sfx.clear();
    setPhase('stepClear'); renderCard();
  }

  function stunPlayer(o) {
    player.stun = CFG.stunSeconds; player.inv = CFG.stunSeconds + 0.6;
    player.kx = o.vx * 1.3; player.ky = o.vy * 1.3;
    S.shake = Math.max(S.shake, 8); S.stats[S.ei].stunned++;
    addFloat(player.x, player.y - 52 * actor(), 'STUNNED!', '#c4b5fd', 18);
    burst(o.x, o.y, o.col, 10, 200); sfx.stun();
  }

  // ================================================================ update
  /* Where the blaster points, whether it is firing, and which part (if any) is under the aim.
     `present` is false when no pointer is actually on the arena, so nothing lights up by accident. */
  function rawAim() {
    const held = input.rowKey || input.autoKey;
    if (held) {
      const p = podOf(held);
      if (p.state !== 'gone' && p.grow > 0.6) return { x: p.x, y: p.y, firing: true, key: held, present: true };
    }
    if (input.touchAim) { const a = input.touchAim; return { x: a.x, y: a.y, firing: true, key: podAt(a.x, a.y, 1.3), present: true }; }
    const m = input.mouse, firing = m.down || input.space;
    return { x: m.x, y: m.y, firing, key: podAt(m.x, m.y, 1), present: firing || (m.inside && input.lastType === 'mouse') };
  }

  function resolveAim() {
    const aim = rawAim();
    // Once the right part is found the blaster locks onto it: holding fire is enough,
    // so the break phase is about dodging, not about chasing a swaying target.
    if (S.screen === 'play' && S.phase === 'break' && aim.firing) {
      const p = podOf(S.locked);
      return { x: p.x, y: p.y, firing: true, key: S.locked, present: true };
    }
    return aim;
  }

  /* A trigger press may answer with exactly one part: the one under the aim when the press began.
     Sweeping across other parts while holding, or a hold carried over from the last step, never answers. */
  function triggerPress(key) {
    input.commitSeq = S.screen === 'play' && S.phase === 'think' ? S.thinkSeq : -1;
    input.commitKey = key;
  }

  function fire(aim) {
    const pl = player, A = actor(), px = pl.x + 10 * A, py = pl.y - 6 * A;
    pl.fireCd = 1 / CFG.fireRate; pl.recoil = 1; pl.flash = 1;
    const key = canTarget() && aim.key ? aim.key : null;
    const commit = !!key && S.phase === 'think' && input.commitSeq === S.thinkSeq && input.commitKey === key;
    bullets.push({
      x: px + Math.cos(pl.aim) * 38 * A, y: py + Math.sin(pl.aim) * 38 * A,
      vx: Math.cos(pl.aim) * CFG.bulletSpeed, vy: Math.sin(pl.aim) * CFG.bulletSpeed,
      key, commit, life: 1.4, dead: false,
    });
    sfx.shoot();
  }

  function updatePlayer(dt) {
    const pl = player;
    let mx = 0, my = 0;
    for (const k of input.keys) { const v = MOVE_KEY[k]; if (v) { mx += v[0]; my += v[1]; } }
    if (input.stick) { mx += input.stick.dx; my += input.stick.dy; }
    const mag = Math.hypot(mx, my);
    if (mag > 1) { mx /= mag; my /= mag; }
    const speed = CFG.playerSpeed * (pl.stun > 0 ? 0.35 : 1);
    pl.x = clamp(pl.x + (mx * speed + pl.kx) * dt, CFG.zone.left, zoneRight());
    pl.y = clamp(pl.y + (my * speed + pl.ky) * dt, CFG.zone.top, CFG.zone.bottom);
    const damp = Math.pow(0.002, dt); pl.kx *= damp; pl.ky *= damp;
    pl.moving = mag > 0.05; if (pl.moving) pl.walkT += dt;
    pl.stun = Math.max(0, pl.stun - dt); pl.inv = Math.max(0, pl.inv - dt); pl.fireCd = Math.max(0, pl.fireCd - dt);
    pl.recoil = Math.max(0, pl.recoil - dt * 9); pl.flash = Math.max(0, pl.flash - dt * 12);

    const aim = resolveAim(), A = actor(), px = pl.x + 10 * A, py = pl.y - 6 * A;
    if (Math.hypot(aim.x - px, aim.y - py) > 26 * A) pl.aim = Math.atan2(aim.y - py, aim.x - px);

    const hover = canTarget() && aim.present && aim.key && targetable(podOf(aim.key)) ? aim.key : null;
    if (hover !== S.hoverKey) { S.hoverKey = hover; syncHover(); }

    if (aim.firing && pl.stun <= 0 && pl.fireCd <= 0) fire(aim);
  }

  const plateShown = p => S.screen === 'play' && p.plate && p.state !== 'gone' && p.state !== 'retract' && p.grow >= 0.9
    && !(S.phase === 'break' && p.state !== 'breaking') && (!view.stacked || p.plate.big);

  function plateBox(p) {
    const pl = p.plate, zhLines = showZh ? pl.zh.length : 0;
    const w = Math.max(58, Math.max(pl.wEn, zhLines ? pl.wZh : 0) + 26);
    const h = pl.en.length * pl.lh + zhLines * pl.zhLh + 12;
    return { x: clamp(p.x - w / 2, 8, W - w - 8), y: p.y + p.r + (p.state === 'breaking' ? 20 : 10), w, h };
  }

  function updateMonster(dt) {
    const m = monster;
    m.t += dt;
    m.hurt = Math.max(0, m.hurt - dt * 2.2); m.roar = Math.max(0, m.roar - dt * 1.3); m.lunge = Math.max(0, m.lunge - dt * 2.4);
    // On wide screens the monster settles just under the question card, and drifts when the card grows or shrinks.
    const A = actor();
    const base = view.stacked ? CFG.monsterY : clamp(view.cardBottom + 40 + 110 * A, CFG.monsterRange[0], CFG.monsterRange[1]);
    m.homeY = m.homeY === null ? base : lerp(m.homeY, base, 1 - Math.pow(0.02, dt));
    const homeY = m.homeY + (m.look.size - 1) * 60;   // bigger monsters hover a little lower
    if (S.screen === 'play' && S.phase === 'enter') {
      m.x = W / 2; m.y = lerp(-260, homeY, easeOut(clamp(S.phaseT / 1.2, 0, 1)));
    } else {
      const breaking = S.screen === 'play' && S.phase === 'break';
      m.sway = lerp(m.sway, breaking ? 128 : 24, 1 - Math.pow(0.05, dt));
      m.swayPhase += dt * (breaking ? 1.25 : 0.6);
      m.x = lerp(m.x, W / 2 + Math.sin(m.swayPhase) * m.sway, 1 - Math.pow(0.001, dt));
      const recoil = S.screen === 'play' && S.phase === 'stepClear' ? Math.sin(clamp(S.phaseT / 0.5, 0, 1) * Math.PI) * 26 : 0;
      m.y = homeY + Math.sin(m.t * 1.6) * 6 + Math.sin(m.lunge * Math.PI) * 30 - recoil;
    }
    const dying = S.screen === 'play' && S.phase === 'dying';
    m.jx = dying ? rand(-6, 6) : 0; m.jy = dying ? rand(-6, 6) : 0;

    const sprouting = !(S.screen === 'play' && S.phase === 'enter' && S.phaseT < 0.9);
    for (const p of pods) {
      p.x = m.x + m.jx + p.ox + Math.cos(m.t * 1.3 + p.i * 2) * 4;
      p.y = m.y + m.jy + p.oy * A + Math.sin(m.t * 2.1 + p.i * 2) * 5;
      if (p.state === 'retract') p.grow = Math.max(0, p.grow - dt * 3.2);
      else if (p.state !== 'gone' && sprouting) p.grow = Math.min(1, p.grow + dt * 2.6);
      p.flash = Math.max(0, p.flash - dt * 3);
      p.rect = plateShown(p) ? plateBox(p) : null;
    }
  }

  function hitPod(b, p) {
    if (S.screen !== 'play') { tink(b.x, b.y); return; }
    if (S.phase === 'think') {
      if (p.state !== 'idle') { tink(b.x, b.y); tip(p, 'Already tried'); return; }
      if (!b.commit) { tink(b.x, b.y); tip(p, 'Press on a part to answer'); return; }
      if (p.key !== step().correct) { wrongAnswer(p); return; }
      lockCorrect(p);
    }
    if (S.phase === 'break') {
      if (p.key === S.locked) damage(p, b); else tink(b.x, b.y);
      return;
    }
    tink(b.x, b.y);
  }

  function updateBullets(dt) {
    const m = monster, bodyR = 80 * m.look.size * actor();
    for (const b of bullets) {
      b.life -= dt;
      if (b.key) {
        const p = podOf(b.key);
        if (p.state === 'gone' || p.grow < 0.3) b.key = null;
        else {
          const dx = p.x - b.x, dy = p.y - b.y, d = Math.hypot(dx, dy) || 1;
          if (d <= CFG.bulletSpeed * dt + p.r * 0.55) {
            b.x = p.x - dx / d * p.r * 0.7; b.y = p.y - dy / d * p.r * 0.7;
            hitPod(b, p); b.dead = true; continue;
          }
          b.vx = dx / d * CFG.bulletSpeed; b.vy = dy / d * CFG.bulletSpeed;   // steer so an aimed shot never misses
        }
      }
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (!b.key && m.visible) {
        let blocked = Math.hypot(b.x - m.x, b.y - m.y) < bodyR;
        if (!blocked) {
          for (const p of pods) {
            if (p.state !== 'gone' && p.grow > 0.6 && Math.hypot(b.x - p.x, b.y - p.y) < p.r) { blocked = true; p.flash = Math.max(p.flash, 0.25); break; }
          }
        }
        if (blocked) { tink(b.x, b.y); b.dead = true; continue; }
      }
      if (b.life <= 0 || b.x < -30 || b.x > W + 30 || b.y < -view.top - 30 || b.y > H + 30) b.dead = true;
    }
    bullets = bullets.filter(b => !b.dead);
  }

  function updateOrbs(dt) {
    if (S.phase === 'break') {
      S.orbTimer -= dt;
      if (S.orbTimer <= 0) {
        const difficulty = CFG.orbDifficultyMax * S.ei / Math.max(1, ENC.length - 1);
        const shooters = pods.filter(p => p.key !== S.locked && p.state !== 'gone' && p.grow > 0.6);
        if (shooters.length) {
          const p = shooters[S.orbTurn++ % shooters.length];
          const d = Math.hypot(player.x - p.x, player.y - p.y) || 1, v = CFG.orbSpeed(difficulty);
          orbs.push({ x: p.x, y: p.y, vx: (player.x - p.x) / d * v, vy: (player.y - p.y) / d * v, r: 11, col: p.state === 'sealed' ? '#f87171' : KEY_COLOR[p.key], t: 0, dead: false });
          p.flash = 0.8; sfx.orb();
        }
        S.orbTimer = CFG.orbInterval(difficulty);
      }
    }
    for (const o of orbs) {
      o.x += o.vx * dt; o.y += o.vy * dt; o.t += dt;
      if (player.inv <= 0 && Math.hypot(o.x - player.x, o.y - (player.y - 4 * actor())) < o.r + player.r - 2) { stunPlayer(o); o.dead = true; }
      if (o.x < -30 || o.x > W + 30 || o.y < -30 || o.y > H + 30) o.dead = true;
    }
    orbs = orbs.filter(o => !o.dead);
  }

  function updateFx(dt) {
    for (const p of particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 320 * dt; p.vx *= 1 - 1.5 * dt; p.life -= dt; }
    particles = particles.filter(p => p.life > 0);
    for (const f of floats) { f.y -= 34 * dt; f.life -= dt; }
    floats = floats.filter(f => f.life > 0);
    for (const z of zaps) z.t += dt;
    zaps = zaps.filter(z => z.t < z.dur);
    S.shake = Math.max(0, S.shake - 42 * dt); S.redFlash = Math.max(0, S.redFlash - 1.6 * dt); S.tipCd = Math.max(0, S.tipCd - dt);
    if (S.banner) { S.banner.t += dt; if (S.banner.t >= S.banner.dur) S.banner = null; }
    const hp = enc().steps.length - S.cleared - (S.phase === 'break' ? 1 - S.armor : 0);
    S.hpShown = lerp(S.hpShown, hp, 1 - Math.pow(0.0005, dt));
  }

  function update(dt) {
    if (el.figureDialog.open) return;
    S.time += dt;
    updateFx(dt);
    if (S.screen === 'intro' || S.screen === 'down') { updateMonster(dt); return; }
    if (S.screen !== 'play') return;

    S.phaseT += dt;
    updatePlayer(dt); updateMonster(dt); updateBullets(dt); updateOrbs(dt);

    switch (S.phase) {
      case 'enter': if (S.phaseT >= CFG.time.enter) startThink(); break;
      case 'counter': if (S.phaseT >= CFG.time.counter) { if (S.hearts <= 0) knockOut(); else startThink(); } break;
      case 'stepClear': if (S.phaseT >= CFG.time.stepClear) { if (S.cleared >= enc().steps.length) startDying(); else nextStep(); } break;
      case 'rearm': if (S.phaseT >= CFG.time.rearm) startThink(); break;
      case 'dying': {
        const m = monster;
        S.boomT -= dt;
        if (!S.bigBoom && S.boomT <= 0) {
          S.boomT = 0.13;
          burst(m.x + rand(-80, 80), m.y + rand(-60, 70), pick(['#fde047', '#fb923c', m.look.body]), 12, 220);
          S.shake = Math.max(S.shake, 7); sfx.pop();
        }
        if (!S.bigBoom && S.phaseT > 1.1) {
          S.bigBoom = true; m.visible = false;
          burst(m.x, m.y, m.look.body, 60, 460); burst(m.x, m.y, '#fde047', 40, 360); burst(m.x, m.y, '#ffffff', 24, 520);
          S.shake = 26; sfx.boom();
        }
        if (S.phaseT >= CFG.time.dying) showReview();
        break;
      }
      default: break;
    }
  }

  // ================================================================ drawing
  // Everything except the HUD is drawn in play-field coordinates: y = 0 is the top of the play field,
  // and the sky kept free for the question card lies above it at negative y.
  const HORIZON = 262;
  const stars = Array.from({ length: 80 }, () => ({ fx: Math.random(), fy: Math.random(), s: rand(1, 2.4), tw: rand(0.6, 2), ph: rand(0, TAU) }));

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
    const k = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + k, y); ctx.arcTo(x + w, y, x + w, y + h, k); ctx.arcTo(x + w, y + h, x, y + h, k); ctx.arcTo(x, y + h, x, y, k); ctx.arcTo(x, y, x + w, y, k); ctx.closePath();
  }

  function heartPath(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.95);
    ctx.bezierCurveTo(x - s * 1.55, y - s * 0.05, x - s * 0.8, y - s * 1.15, x, y - s * 0.35);
    ctx.bezierCurveTo(x + s * 0.8, y - s * 1.15, x + s * 1.55, y - s * 0.05, x, y + s * 0.95);
    ctx.closePath();
  }

  function starPath(x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, k = i % 2 ? r * 0.45 : r;
      ctx.lineTo(x + Math.cos(a) * k, y + Math.sin(a) * k);
    }
    ctx.closePath();
  }

  function drawBackground() {
    const top = view.top;
    const sky = ctx.createLinearGradient(0, -top, 0, H);
    sky.addColorStop(0, '#080e28'); sky.addColorStop(0.6, '#0e1a3c'); sky.addColorStop(1, '#070b18');
    ctx.fillStyle = sky; ctx.fillRect(-20, -top - 20, W + 40, H + top + 40);

    ctx.fillStyle = '#c7d2fe';
    for (const s of stars) {
      ctx.globalAlpha = 0.25 + 0.55 * Math.abs(Math.sin(S.time * s.tw + s.ph));
      ctx.fillRect(s.fx * W, -top + s.fy * (top + HORIZON - 12), s.s, s.s);
    }
    ctx.globalAlpha = 1;

    const floor = ctx.createLinearGradient(0, HORIZON, 0, H);
    floor.addColorStop(0, 'rgba(56,189,248,0.03)'); floor.addColorStop(1, 'rgba(56,189,248,0.13)');
    ctx.fillStyle = floor; ctx.fillRect(-20, HORIZON, W + 40, H - HORIZON + 20);

    ctx.strokeStyle = 'rgba(125,211,252,0.14)'; ctx.lineWidth = 1;
    ctx.beginPath();
    const scroll = (S.time * 0.35) % 1;
    for (let i = 0; i < 11; i++) { const k = (i + scroll) / 11, y = HORIZON + (H - HORIZON) * k * k; ctx.moveTo(-20, y); ctx.lineTo(W + 20, y); }
    for (let i = -14; i <= 14; i++) { ctx.moveTo(W / 2 + i * 28, HORIZON); ctx.lineTo(W / 2 + i * 150, H + 20); }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(253,224,71,0.14)'; ctx.setLineDash([10, 12]);
    ctx.beginPath(); ctx.moveTo(20, CFG.zone.top - 34); ctx.lineTo(W - 20, CFG.zone.top - 34); ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawHorns(lk) {
    ctx.fillStyle = lk.horn; ctx.strokeStyle = lk.dark; ctx.lineWidth = 4; ctx.lineJoin = 'round';
    const tri = (a, b, c) => { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.closePath(); ctx.fill(); ctx.stroke(); };
    switch (lk.horns) {
      case 'spike': tri([-74, -42], [-96, -116], [-36, -72]); tri([74, -42], [96, -116], [36, -72]); break;
      case 'ears': for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * 72, -62, 27, 0, TAU); ctx.fill(); ctx.stroke(); } break;
      case 'antenna':
        for (const sx of [-1, 1]) {
          ctx.beginPath(); ctx.moveTo(sx * 30, -72); ctx.quadraticCurveTo(sx * 40, -102, sx * 58, -110); ctx.stroke();
          ctx.beginPath(); ctx.arc(sx * 58, -110, 10, 0, TAU); ctx.fill(); ctx.stroke();
        }
        break;
      case 'leaf': ctx.beginPath(); ctx.moveTo(0, -76); ctx.quadraticCurveTo(-46, -104, -6, -126); ctx.quadraticCurveTo(36, -104, 0, -76); ctx.fill(); ctx.stroke(); break;
      case 'crown': tri([-64, -54], [-72, -108], [-32, -74]); tri([-22, -76], [0, -118], [22, -76]); tri([64, -54], [72, -108], [32, -74]); break;
      default: break;
    }
  }

  function drawArm(p, cx, cy, s) {
    const ax = cx + Math.sign(p.ox) * 62 * s, ay = cy + 44 * s;
    const mx = (ax + p.x) / 2 + Math.sin(monster.t * 2 + p.i * 2) * 7, my = Math.max(ay, p.y) + 20;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo(mx, my, p.x, p.y);
    ctx.strokeStyle = monster.look.dark; ctx.lineWidth = 20 * p.grow; ctx.stroke();
    ctx.strokeStyle = monster.look.body; ctx.lineWidth = 12 * p.grow; ctx.stroke();
  }

  function drawMonster() {
    const m = monster;
    if (!m.visible) return;
    const lk = m.look, s = lk.size * actor(), cx = m.x + m.jx, cy = m.y + m.jy;

    const near = clamp((cy + 160) / (CFG.monsterY + 160), 0, 1);   // the shadow grows as the monster flies in
    ctx.fillStyle = `rgba(0,0,0,${0.24 * near})`;
    ctx.beginPath(); ctx.ellipse(cx, CFG.zone.top - 44, 170 * s * near, 13 * near, 0, 0, TAU); ctx.fill();

    for (const p of pods) if (p.state !== 'gone' && p.grow > 0.02) drawArm(p, cx, cy, s);

    ctx.save();
    ctx.translate(cx, cy); ctx.scale(s, s);
    const wob = Math.sin(m.t * 2.3) * 3;
    drawHorns(lk);

    const skin = ctx.createRadialGradient(-28, -36, 12, 0, 0, 112);
    skin.addColorStop(0, lk.light); skin.addColorStop(0.55, lk.body); skin.addColorStop(1, lk.dark);
    ctx.fillStyle = skin; ctx.strokeStyle = lk.dark; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(0, 0, 96 + wob, 82 - wob, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.globalAlpha = 0.5; ctx.fillStyle = lk.belly;
    ctx.beginPath(); ctx.ellipse(0, 36, 56, 34, 0, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;

    // one crack per step cleared
    ctx.strokeStyle = 'rgba(15,23,42,0.75)'; ctx.lineWidth = 3.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const crack = pts => { ctx.beginPath(); pts.forEach((pt, i) => (i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1]))); ctx.stroke(); };
    for (let i = 0; i < Math.min(S.cleared, CRACKS.length); i++) crack(CRACKS[i]);

    // eyes follow the player
    const eyeSets = { 1: [[0, -22, 27]], 2: [[-34, -24, 20], [34, -24, 20]], 3: [[-48, -20, 15], [0, -32, 17], [48, -20, 15]] };
    const look = Math.atan2(player.y - cy, player.x - cx);
    for (const [ex, ey, er] of eyeSets[lk.eyes]) {
      const side = Math.sign(ex);
      if (m.hurt > 0.3) {
        ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(ex - er * 0.6, ey - er * 0.5); ctx.lineTo(ex + er * 0.4, ey); ctx.lineTo(ex - er * 0.6, ey + er * 0.5); ctx.stroke();
        continue;
      }
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(ex, ey, er, er * 1.08, 0, 0, TAU); ctx.fill();
      const px = ex + Math.cos(look) * er * 0.38, py = ey + Math.sin(look) * er * 0.38;
      ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(px, py, er * 0.48, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px - er * 0.15, py - er * 0.18, er * 0.14, 0, TAU); ctx.fill();
      ctx.strokeStyle = lk.dark; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(ex - er * 1.05, ey - er * (1.25 - 0.25 * side)); ctx.lineTo(ex + er * 1.05, ey - er * (1.25 + 0.25 * side)); ctx.stroke();
    }

    // mouth opens when it roars
    const open = clamp(m.roar * 1.6, 0, 1);
    ctx.fillStyle = '#1f0a12';
    ctx.beginPath(); ctx.ellipse(0, 32, 30 + open * 8, 6 + open * 20, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff';
    for (const tx of [-18, -6, 6, 18]) { ctx.beginPath(); ctx.moveTo(tx - 5, 27 - open * 14); ctx.lineTo(tx + 5, 27 - open * 14); ctx.lineTo(tx, 36 - open * 8); ctx.closePath(); ctx.fill(); }

    if (m.hurt > 0) {
      ctx.globalAlpha = Math.min(0.7, m.hurt); ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(0, 0, 96 + wob, 82 - wob, 0, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function drawPod(p) {
    if (p.state === 'gone' || p.grow <= 0.02) return;
    const col = KEY_COLOR[p.key], sealed = p.state === 'sealed', breaking = p.state === 'breaking';
    const r = p.r * p.grow;
    const hovered = (S.hoverKey === p.key || (S.panelHover === p.key && canTarget())) && targetable(p);
    let x = p.x, y = p.y;
    if (breaking) { x += rand(-2.5, 2.5); y += rand(-2.5, 2.5); }

    ctx.save();
    ctx.translate(x, y);
    if (hovered || breaking) { ctx.shadowColor = breaking ? '#fde047' : col; ctx.shadowBlur = 28; }
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU);
    ctx.fillStyle = sealed ? '#475569' : breaking ? '#fde047' : col; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.76, 0, TAU);
    ctx.fillStyle = sealed ? '#1e293b' : '#0b1226'; ctx.fill();

    ctx.fillStyle = sealed ? '#64748b' : '#fff';
    ctx.font = `800 ${Math.round(r * 0.95)}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(p.key, 0, r * 0.06);

    if (sealed) {
      ctx.strokeStyle = '#f87171'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-r * 0.52, -r * 0.52); ctx.lineTo(r * 0.52, r * 0.52); ctx.moveTo(r * 0.52, -r * 0.52); ctx.lineTo(-r * 0.52, r * 0.52); ctx.stroke();
    }
    if (breaking) {
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.arc(0, 0, r + 10, 0, TAU); ctx.stroke();
      ctx.strokeStyle = '#34d399'; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, 0, r + 10, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(1 - S.armor, 0.001, 1)); ctx.stroke();
    }
    if (hovered && !breaking) {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      const spin = S.time * 2.2;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(0, 0, r + 9, spin + i * Math.PI / 2, spin + i * Math.PI / 2 + 0.8); ctx.stroke(); }
    }
    if (p.flash > 0) {
      ctx.globalAlpha = p.flash * 0.75; ctx.fillStyle = sealed ? '#f87171' : '#fff';
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  /* The answer a part stands for, written right under it. */
  function drawPlate(p) {
    const r = p.rect;
    if (!r) return;
    const pl = p.plate, sealed = p.state === 'sealed', hovered = S.hoverKey === p.key && !sealed;
    roundRect(r.x, r.y, r.w, r.h, 12);
    ctx.fillStyle = hovered ? 'rgba(20,30,62,0.97)' : 'rgba(8,13,30,0.9)'; ctx.fill();
    ctx.lineWidth = hovered ? 2.6 : 1.5; ctx.strokeStyle = sealed ? '#475569' : p.state === 'breaking' ? '#fde047' : KEY_COLOR[p.key]; ctx.stroke();

    const cx = r.x + r.w / 2;
    let y = r.y + 6;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `700 ${pl.size}px ${FONT}`;
    for (const line of pl.en) {
      const mid = y + pl.lh / 2;
      ctx.fillStyle = sealed ? '#64748b' : '#fff'; ctx.fillText(line, cx, mid + 0.5);
      if (sealed) {
        const half = ctx.measureText(line).width / 2;
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx - half, mid); ctx.lineTo(cx + half, mid); ctx.stroke();
      }
      y += pl.lh;
    }
    if (showZh && pl.zh.length) {
      ctx.font = `400 ${pl.zhSize}px ${FONT}`; ctx.fillStyle = sealed ? '#475569' : '#9aa8c7';
      for (const line of pl.zh) { ctx.fillText(line, cx, y + pl.zhLh / 2 + 0.5); y += pl.zhLh; }
    }
  }

  function drawPlayer() {
    const pl = player, A = actor();
    ctx.save();
    ctx.translate(pl.x, pl.y); ctx.scale(A, A);
    if (pl.inv > 0 && Math.floor(S.time * 16) % 2 === 0) ctx.globalAlpha = 0.4;

    ctx.fillStyle = 'rgba(0,0,0,0.38)';
    ctx.beginPath(); ctx.ellipse(0, 25, 21, 7, 0, 0, TAU); ctx.fill();

    const sw = pl.moving ? Math.sin(pl.walkT * 15) * 4 : 0;
    ctx.fillStyle = '#1e3a8a'; roundRect(-12, 9 + sw, 10, 14, 4); ctx.fill(); roundRect(2, 9 - sw, 10, 14, 4); ctx.fill();
    ctx.fillStyle = '#f8fafc'; roundRect(-13, 20 + sw, 12, 6, 3); ctx.fill(); roundRect(1, 20 - sw, 12, 6, 3); ctx.fill();

    ctx.fillStyle = pl.stun > 0 ? '#7c3aed' : '#14b8a6'; roundRect(-16, -15, 32, 29, 10); ctx.fill();
    ctx.fillStyle = '#0d9488'; roundRect(-21, -11, 8, 19, 4); ctx.fill();
    ctx.fillStyle = '#f59e0b'; roundRect(-10, -11, 20, 22, 6); ctx.fill();
    ctx.fillStyle = '#b45309'; roundRect(-6, 1, 12, 6, 3); ctx.fill();

    ctx.save();
    ctx.translate(10, -6); ctx.rotate(pl.aim);
    const k = pl.recoil * 5;
    ctx.fillStyle = '#0d9488'; roundRect(-3 - k, -4.5, 16, 9, 4.5); ctx.fill();
    ctx.fillStyle = '#e2e8f0'; roundRect(9 - k, -5.5, 25, 11, 3); ctx.fill();
    ctx.fillStyle = '#38bdf8'; roundRect(13 - k, -2.5, 13, 5, 2.5); ctx.fill();
    ctx.fillStyle = '#475569'; roundRect(32 - k, -4, 6, 8, 2); ctx.fill();
    if (pl.flash > 0) { ctx.fillStyle = `rgba(186,230,253,${pl.flash})`; ctx.beginPath(); ctx.arc(43, 0, 5 + pl.flash * 7, 0, TAU); ctx.fill(); }
    ctx.restore();

    // head seen from behind: ears, hair, cap
    ctx.fillStyle = '#fcd9b6'; ctx.beginPath(); ctx.arc(-11.5, -23, 3.5, 0, TAU); ctx.arc(11.5, -23, 3.5, 0, TAU); ctx.fill();
    ctx.fillStyle = '#3f2d20'; ctx.beginPath(); ctx.arc(0, -25, 12, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(0, -27, 12.5, Math.PI, TAU); ctx.closePath(); ctx.fill();
    roundRect(-12.5, -29.5, 25, 5, 2.5); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -39.5, 3, 0, TAU); ctx.fill();

    if (pl.stun > 0) {
      ctx.globalAlpha = 1; ctx.fillStyle = '#fde047';
      for (let i = 0; i < 3; i++) { const a = S.time * 7 + i * TAU / 3; starPath(Math.cos(a) * 17, -50 + Math.sin(a) * 6, 5); ctx.fill(); }
    }
    ctx.restore();
  }

  function drawBullets() {
    ctx.lineCap = 'round';
    for (const b of bullets) {
      const v = Math.hypot(b.vx, b.vy) || 1, tx = b.x - b.vx / v * 20, ty = b.y - b.vy / v * 20;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = 'rgba(56,189,248,0.45)'; ctx.lineWidth = 7; ctx.stroke();
      ctx.strokeStyle = '#f0f9ff'; ctx.lineWidth = 3; ctx.stroke();
    }
  }

  function drawOrbs() {
    for (const o of orbs) {
      const r = o.r + Math.sin(o.t * 14) * 1.5;
      const glow = ctx.createRadialGradient(o.x, o.y, 1, o.x, o.y, r * 2.2);
      glow.addColorStop(0, '#fff'); glow.addColorStop(0.35, o.col); glow.addColorStop(1, o.col + '00');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(o.x, o.y, r * 2.2, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(o.x, o.y, r, 0, TAU); ctx.stroke();
    }
  }

  function drawZaps() {
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    for (const z of zaps) {
      const x1 = z.from.x, y1 = z.from.y, x2 = player.x, y2 = player.y - 8;
      ctx.beginPath(); ctx.moveTo(x1, y1);
      for (let i = 1; i < 8; i++) ctx.lineTo(lerp(x1, x2, i / 8) + rand(-16, 16), lerp(y1, y2, i / 8) + rand(-16, 16));
      ctx.lineTo(x2, y2);
      ctx.globalAlpha = 1 - z.t / z.dur;
      ctx.strokeStyle = z.col; ctx.lineWidth = 9; ctx.stroke();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.globalAlpha = clamp(p.life / p.max, 0, 1); ctx.fillStyle = p.col;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function drawFloats() {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    for (const f of floats) {
      ctx.globalAlpha = clamp(f.life / f.max * 1.6, 0, 1);
      ctx.font = `800 ${f.size}px ${FONT}`;
      ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(6,10,23,0.85)'; ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.col; ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }

  function drawBanner() {
    const b = S.banner;
    if (!b) return;
    const k = b.t / b.dur, a = k < 0.15 ? k / 0.15 : k > 0.75 ? (1 - k) / 0.25 : 1;
    ctx.save();
    ctx.globalAlpha = clamp(a, 0, 1); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    const y = b.y || 330, size = b.size || 42;
    ctx.strokeStyle = 'rgba(6,10,23,0.88)'; ctx.lineWidth = Math.max(5, size / 5);
    ctx.font = `900 ${size}px ${FONT}`; ctx.strokeText(b.text, W / 2, y); ctx.fillStyle = b.col || '#fff'; ctx.fillText(b.text, W / 2, y);
    if (b.sub) { ctx.font = `700 21px ${FONT}`; ctx.lineWidth = 6; ctx.strokeText(b.sub, W / 2, y + 34); ctx.fillStyle = '#fde047'; ctx.fillText(b.sub, W / 2, y + 34); }
    ctx.restore();
  }

  /* Hearts, the monster's name and health, stars and score: pinned to the very top of the canvas. */
  function drawHUD() {
    const shade = ctx.createLinearGradient(0, 0, 0, 66);
    shade.addColorStop(0, 'rgba(6,10,23,0.9)'); shade.addColorStop(1, 'rgba(6,10,23,0)');
    ctx.fillStyle = shade; ctx.fillRect(0, 0, W, 66);

    for (let i = 0; i < CFG.maxHearts; i++) {
      const on = i < S.hearts;
      heartPath(30 + i * 30, 28, 11);
      ctx.fillStyle = on ? '#f43f5e' : 'rgba(148,163,184,0.16)'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = on ? '#fecdd3' : 'rgba(148,163,184,0.5)'; ctx.stroke();
    }
    if (S.screen === 'intro') return;

    const stepCount = enc().steps.length;
    const bw = 280, bx = (W - bw) / 2, by = 31, bh = 12, gap = 5, seg = (bw - gap * (stepCount - 1)) / stepCount;
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.font = `700 14px ${FONT}`; ctx.fillStyle = '#e8eeff';
    ctx.fillText(`${enc().monster.name.en}  ·  ${S.ei + 1} / ${ENC.length}`, W / 2, 23);
    for (let i = 0; i < stepCount; i++) {
      const x = bx + i * (seg + gap), fill = clamp(S.hpShown - i, 0, 1);
      roundRect(x, by, seg, bh, 6); ctx.fillStyle = 'rgba(148,163,184,0.22)'; ctx.fill();
      if (fill > 0.02) { roundRect(x, by, Math.max(bh, seg * fill), bh, 6); ctx.fillStyle = fill < 0.999 ? '#fde047' : '#f43f5e'; ctx.fill(); }
    }

    ctx.textBaseline = 'middle'; ctx.textAlign = 'right'; ctx.font = `700 17px ${FONT}`;
    ctx.fillStyle = '#e8eeff'; ctx.fillText(String(S.score).padStart(4, '0'), W - 24, 29);
    ctx.fillStyle = '#fde047'; ctx.fillText(`★ ${totalStars()}`, W - 92, 29);
  }

  function drawStatus() {
    if (S.screen !== 'play' || view.stacked) return;   // too small to read on a phone; the card above carries the guidance there
    const first = S.phase === 'think' && S.ei === 0 && S.si === 0 && S.stepWrong === 0;
    const m = first ? MSG.status.first : MSG.status[S.phase];
    if (!m) return;
    const text = showZh ? m.zh : m.en;   // one language at a time keeps the line short
    ctx.font = `600 14px ${FONT}`;
    const w = Math.min(W - 40, ctx.measureText(text).width + 30);
    roundRect((W - w) / 2, H - 33, w, 25, 12.5); ctx.fillStyle = 'rgba(8,13,30,0.78)'; ctx.fill();
    ctx.fillStyle = S.phase === 'counter' ? '#fca5a5' : S.phase === 'break' ? '#fde047' : '#cbd5e1';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, W / 2, H - 20, W - 70);
  }

  function drawStick() {
    const s = input.stick;
    if (!s) return;
    ctx.fillStyle = 'rgba(148,163,184,0.16)'; ctx.strokeStyle = 'rgba(226,232,240,0.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(s.ox, s.oy, 56, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(226,232,240,0.75)';
    ctx.beginPath(); ctx.arc(s.ox + s.dx * 56, s.oy + s.dy * 56, 22, 0, TAU); ctx.fill();
  }

  function drawCrosshair() {
    if (S.screen !== 'play' || input.lastType !== 'mouse' || !input.mouse.inside || input.autoKey || input.rowKey) return;
    const { x, y } = input.mouse, col = S.hoverKey ? KEY_COLOR[S.hoverKey] : '#e2e8f0';
    const shape = () => {
      ctx.beginPath(); ctx.arc(x, y, 12, 0, TAU);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { ctx.moveTo(x + dx * 7, y + dy * 7); ctx.lineTo(x + dx * 19, y + dy * 19); }
      ctx.stroke();
    };
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(6,10,23,0.85)'; ctx.lineWidth = 5; shape();
    ctx.strokeStyle = col; ctx.lineWidth = 2.2; shape();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 2, 0, TAU); ctx.fill();
  }

  function render() {
    const k = view.scale * view.dpr, top = view.top;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.clearRect(0, 0, W, H + top);

    ctx.save();
    ctx.translate(0, top);   // from here on: play-field coordinates
    ctx.save();
    if (S.shake > 0) ctx.translate(rand(-1, 1) * S.shake * 0.5, rand(-1, 1) * S.shake * 0.5);
    drawBackground();
    drawMonster();
    for (const p of pods) drawPod(p);
    for (const p of pods) drawPlate(p);
    drawOrbs(); drawBullets(); drawPlayer(); drawZaps(); drawParticles(); drawFloats();
    ctx.restore();
    if (S.redFlash > 0) { ctx.fillStyle = `rgba(248,113,113,${S.redFlash * 0.3})`; ctx.fillRect(0, -top, W, H + top); }
    drawBanner(); drawStatus(); drawStick(); drawCrosshair();
    ctx.restore();

    drawHUD();
  }

  // ================================================================ question card
  function syncHover() {
    for (const li of el.options.children) li.classList.toggle('is-hover', li.dataset.k === S.hoverKey);
  }

  /* Scroll within the card just enough to show the relevant content. */
  function revealInCard(node, alignStart = false) {
    const card = el.card;
    if (!node || card.scrollHeight <= card.clientHeight) return;
    const bounds = node.getBoundingClientRect();
    const top = card.getBoundingClientRect().top + card.clientTop;
    const bottom = top + card.clientHeight;
    if (alignStart || bounds.top < top || bounds.height > card.clientHeight) card.scrollTop += bounds.top - top;
    else if (bounds.bottom > bottom) card.scrollTop += bounds.bottom - bottom;
  }

  /* On stacked screens, lead with the step when the reference would push it out of view. */
  function updatePromptOrder() {
    const card = el.card;
    if (!view.stacked || card.hidden || el.now.hidden) return;
    if (card.hasAttribute('data-reference')) {
      card.setAttribute('data-prompt-first', '');
      return;
    }

    const cardStyle = getComputedStyle(card);
    const stepStyle = getComputedStyle(el.now);
    const headingStyle = getComputedStyle(el.heading);
    const available = card.clientHeight - parseFloat(cardStyle.paddingTop) - parseFloat(cardStyle.paddingBottom);
    const separator = parseFloat(stepStyle.marginTop) + parseFloat(stepStyle.paddingTop) + parseFloat(stepStyle.borderTopWidth);
    const headingHeight = el.heading.getBoundingClientRect().height - parseFloat(headingStyle.paddingBottom) - parseFloat(headingStyle.borderBottomWidth);
    const referenceHeight = el.reference.getBoundingClientRect().height;
    card.toggleAttribute('data-prompt-first', referenceHeight + separator + headingHeight > available + 1);
  }

  /* Measure the floating card for the monster below it and the controls beside it. */
  function measureCard() {
    if (view.stacked || el.card.hidden) {
      view.cardBottom = -Infinity;
      el.stage.removeAttribute('data-wide');
      return;
    }
    const card = el.card.getBoundingClientRect(), scene = el.scene.getBoundingClientRect();
    view.cardBottom = (card.bottom - scene.top) / view.scale - view.top;
    el.stage.toggleAttribute('data-wide', el.legend.getBoundingClientRect().right + 8 <= card.left);
  }

  /* Pull the eye to the card: a new step slides in, a wrong shot flashes the frame red. */
  function attention(node, kind) {
    if (!node.animate) return;
    if (kind === 'new') node.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 450, easing: 'ease-out' });
    else node.animate([{ boxShadow: '0 0 0 5px rgba(248,113,113,0.75)' }, { boxShadow: '0 0 0 0 rgba(248,113,113,0)' }], { duration: 800, easing: 'ease-out' });
  }

  function renderProblemMedia(encounter) {
    if (el.card.dataset.sourceId === encounter.id) return;
    el.card.dataset.sourceId = encounter.id;
    el.card.toggleAttribute('data-reference', Boolean(encounter.figure || encounter.grid));

    el.figure.hidden = !encounter.figure;
    if (encounter.figure) {
      el.figurePreview.src = encounter.figure.src;
      el.figurePreview.alt = encounter.figure.description.en;
    } else {
      el.figurePreview.removeAttribute('src');
      el.figurePreview.alt = '';
    }

    el.grid.hidden = !encounter.grid;
    const rows = el.grid.tBodies[0];
    rows.replaceChildren();
    for (const values of encounter.grid ?? []) {
      const row = rows.insertRow();
      for (const value of values) row.insertCell().textContent = String(value);
    }
  }

  function renderCard() {
    const active = S.screen === 'play' || S.screen === 'review' || S.screen === 'down';
    el.card.hidden = !active;
    if (!active) return;

    const e = enc();
    el.source.textContent = `AMC 8 · ${e.year} · Problem ${e.number}`;
    el.type.hidden = S.cleared < 1;
    el.type.innerHTML = `Type · ${esc(e.method.title.en)}<span class="zh zh-inline" lang="zh"> ${esc(e.method.title.zh)}</span>`;
    el.stem.innerHTML = bi(e.stem);
    el.stem.classList.toggle('is-long', e.stem.en.length > 150);   // short problems get bigger type
    renderProblemMedia(e);
    el.solved.hidden = S.cleared === 0;
    el.solved.innerHTML = e.steps.slice(0, S.cleared).map(st => `<li>${bi(st.takeaway)}</li>`).join('');

    const stepCount = e.steps.length;
    const open = S.cleared < stepCount && S.cleared === S.si;   // the current step is still unanswered
    el.now.hidden = !open;
    if (open) {
      const st = step();
      const kind = S.si === stepCount - 1 ? DATA.stepKinds.at(-1) : DATA.stepKinds[Math.min(S.si, 1)];
      el.badge.innerHTML = `Step ${S.si + 1} of ${stepCount} · ${esc(kind.en)}<span class="zh zh-inline" lang="zh"> ${esc(kind.zh)}</span>`;
      el.prompt.innerHTML = bi(st.prompt);
      el.options.innerHTML = KEYS.map(key => {
        const cls = podOf(key).state === 'sealed' ? ' is-sealed' : S.locked === key ? ' is-locked' : '';
        return `<li class="opt${cls}" data-k="${key}" title="Hold to fire at part ${key}"><b class="opt-key">${key}</b><span class="opt-text">${bi(st.options[key].text)}</span><i class="opt-mark"></i></li>`;
      }).join('');
    }

    const f = open ? S.feedback : null;
    el.feedback.hidden = !f;
    if (f) { el.feedback.dataset.kind = f.kind; el.feedback.innerHTML = `<b>${esc(f.title)}</b>${bi(f.body)}`; }
    syncHover();
    updatePromptOrder();
    measureCard();
  }

  // ================================================================ input
  function cancelRowPress() {
    if (!input.rowPress) return;
    clearTimeout(input.rowPress.timer);
    input.rowPress = null;
  }

  function clearInput() {
    cancelRowPress();
    input.keys.clear(); input.mouse.down = false; input.touchAim = null; input.stick = null;
    input.autoKey = null; input.rowKey = null; input.rowPointer = null; input.space = false;
  }

  function toLogical(e) {
    const r = el.canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * (H + view.top) - view.top };
  }

  window.addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey || S.screen !== 'play' || el.figureDialog.open) return;
    const k = e.key.toLowerCase();
    if (k === ' ' && e.target === el.figure) return;
    if (MOVE_KEY[k] || FIRE_KEY[k] || k === ' ') e.preventDefault();
    if (e.repeat) return;
    if (MOVE_KEY[k]) input.keys.add(k);
    if (FIRE_KEY[k]) { input.autoKey = FIRE_KEY[k]; triggerPress(FIRE_KEY[k]); }
    if (k === ' ') { input.space = true; triggerPress(podAt(input.mouse.x, input.mouse.y, 1)); }
  });
  window.addEventListener('keyup', e => {
    const k = e.key.toLowerCase();
    input.keys.delete(k);
    if (FIRE_KEY[k] && input.autoKey === FIRE_KEY[k]) input.autoKey = null;
    if (k === ' ') input.space = false;
  });
  window.addEventListener('blur', clearInput);
  document.addEventListener('visibilitychange', clearInput);

  el.canvas.addEventListener('pointerdown', e => {
    audio.ensure();
    input.lastType = e.pointerType;
    if (S.screen !== 'play') return;
    const p = toLogical(e);
    if (e.pointerType === 'mouse') {
      if (e.button !== 0) return;
      Object.assign(input.mouse, { x: p.x, y: p.y, down: true, inside: true });
      triggerPress(podAt(p.x, p.y, 1));
    } else {
      e.preventDefault();
      const onPart = podAt(p.x, p.y, 1.3);
      if (!input.stick && !onPart && p.y > CFG.zone.top - 34) input.stick = { id: e.pointerId, ox: p.x, oy: p.y, dx: 0, dy: 0 };
      else if (!input.touchAim) { input.touchAim = { id: e.pointerId, x: p.x, y: p.y }; input.mouse.x = p.x; input.mouse.y = p.y; triggerPress(onPart); }
    }
    try { el.canvas.setPointerCapture(e.pointerId); } catch (err) { /* synthetic events have no capture */ }
  });
  el.canvas.addEventListener('pointermove', e => {
    const p = toLogical(e);
    if (e.pointerType === 'mouse') { Object.assign(input.mouse, { x: p.x, y: p.y, inside: true }); input.lastType = 'mouse'; return; }
    const s = input.stick, a = input.touchAim;
    if (s && s.id === e.pointerId) {
      const dx = p.x - s.ox, dy = p.y - s.oy, d = Math.hypot(dx, dy), reach = Math.min(d, 56) / 56;
      s.dx = d ? dx / d * reach : 0; s.dy = d ? dy / d * reach : 0;
    } else if (a && a.id === e.pointerId) { a.x = p.x; a.y = p.y; input.mouse.x = p.x; input.mouse.y = p.y; }
  });
  const releasePointer = e => {
    if (e.pointerType === 'mouse') input.mouse.down = false;
    if (input.stick && input.stick.id === e.pointerId) input.stick = null;
    if (input.touchAim && input.touchAim.id === e.pointerId) input.touchAim = null;
    if (input.rowPress?.id === e.pointerId) cancelRowPress();
    if (input.rowPointer === e.pointerId) { input.rowKey = null; input.rowPointer = null; }
  };
  window.addEventListener('pointerup', releasePointer);
  window.addEventListener('pointercancel', releasePointer);
  el.canvas.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') input.mouse.inside = false; });
  el.canvas.addEventListener('contextmenu', e => e.preventDefault());

  // narrow screens: holding an answer row of the card fires at that part
  function fireFromRow(key, pointerId) {
    audio.ensure();
    input.rowKey = key; input.rowPointer = pointerId;
    triggerPress(key);
  }

  el.options.addEventListener('pointerdown', e => {
    const li = e.target.closest('.opt');
    if (!li || S.screen !== 'play' || (e.pointerType === 'mouse' && e.button !== 0)) return;
    if (input.rowPress || input.rowPointer !== null) return;
    const key = li.dataset.k;
    if (e.pointerType === 'mouse') {
      e.preventDefault();
      fireFromRow(key, e.pointerId);
      return;
    }
    if (!canTarget()) return;

    // Let the browser claim a vertical swipe before committing an answer.
    const press = { id: e.pointerId, x: e.clientX, y: e.clientY, distance: 0, timer: null };
    input.rowPress = press;
    press.timer = setTimeout(() => {
      input.rowPress = null;
      if (view.stacked) fireFromRow(key, press.id);
    }, CFG.rowHoldMs);
  });
  window.addEventListener('pointermove', e => {
    const press = input.rowPress;
    if (press?.id !== e.pointerId) return;
    press.distance += Math.hypot(e.clientX - press.x, e.clientY - press.y);
    press.x = e.clientX; press.y = e.clientY;
    if (press.distance >= CFG.rowMoveLimit) cancelRowPress();
  });
  el.options.addEventListener('pointerover', e => { const li = e.target.closest('.opt'); S.panelHover = li ? li.dataset.k : null; });
  el.options.addEventListener('pointerleave', () => { S.panelHover = null; });
  el.options.addEventListener('contextmenu', e => e.preventDefault());

  // ================================================================ buttons
  function applyLanguage() {
    document.body.classList.toggle('show-zh', showZh);
    for (const id of ['btn-zh', 'btn-zh-intro']) $(id).setAttribute('aria-pressed', String(showZh));
    updatePromptOrder();
  }
  function applySound() {
    $('btn-sound').setAttribute('aria-pressed', String(!audio.muted));
    $('btn-sound').textContent = audio.muted ? 'Sound off' : 'Sound on';
  }
  for (const id of ['btn-zh', 'btn-zh-intro']) {
    $(id).addEventListener('click', e => { showZh = !showZh; store.set('zh', showZh); applyLanguage(); e.currentTarget.blur(); });
  }
  $('btn-sound').addEventListener('click', e => { audio.muted = !audio.muted; store.set('muted', audio.muted); audio.ensure(); applySound(); e.currentTarget.blur(); });
  for (const button of sectionButtons) {
    const section = DATA.sections.find(item => item.id === button.dataset.startSection);
    if (!section) continue;
    if (section === requestedSection) button.setAttribute('aria-current', 'true');
    button.addEventListener('click', () => { if (ready()) startRun(section); });
  }
  if (requestedSection) $('intro-back-link').href = requestedSection.url;
  $('btn-choose').addEventListener('click', () => { if (ready()) { setScreen('intro'); renderCard(); } });
  $('btn-again').addEventListener('click', () => { if (ready()) startRun(); });
  $('btn-retry').addEventListener('click', () => { if (ready()) retryEncounter(); });
  $('btn-next').addEventListener('click', () => {
    if (!ready()) return;
    if (S.ei < ENC.length - 1) startEncounter(S.ei + 1); else showSummary();
  });
  el.figure.addEventListener('click', () => {
    const figure = enc().figure;
    if (!figure || el.figureDialog.open) return;
    clearInput();
    el.figureImage.src = figure.src;
    el.figureCaption.textContent = showZh ? figure.description.zh : figure.description.en;
    el.figureCaption.lang = showZh ? 'zh' : 'en';
    el.figureDialog.showModal();
  });
  el.figureDialog.addEventListener('close', clearInput);

  // ================================================================ boot
  /* Fit the scene to the window. Wide windows: one tall canvas with sky at the top for the question card.
     Narrow, portrait or short windows: the card sits above a shorter canvas. */
  function resize() {
    const cs = getComputedStyle(el.wrap);
    const wrapW = Math.max(1, el.wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
    const wrapH = el.wrap.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const stacked = wrapW < 720 || wrapW < wrapH * 1.02 || wrapH < 420;
    const layout = stacked ? 'stacked' : 'overlay';
    if (el.app.dataset.layout !== layout) el.app.dataset.layout = layout;
    view.stacked = stacked; view.top = stacked ? CFG.sky.stacked : CFG.sky.overlay;

    const total = H + view.top;
    let availH = wrapH;
    if (stacked) {
      const gap = parseFloat(getComputedStyle(el.stage).rowGap);
      availH -= el.corner.getBoundingClientRect().height + gap;
      const cardAndSceneH = Math.max(0, availH - gap);
      // Let the card use the space above a full-width scene, while keeping the controls and scene within the viewport.
      const fullWidthSceneH = wrapW * total / CFG.width.min;
      const minSceneH = Math.min(140, cardAndSceneH * 0.6);
      const cardH = Math.min(Math.max(wrapH * 0.4, cardAndSceneH - fullWidthSceneH), cardAndSceneH - minSceneH);
      el.card.style.maxHeight = `${Math.floor(cardH)}px`;
      updatePromptOrder();
      if (!el.card.hidden) availH = cardAndSceneH - el.card.getBoundingClientRect().height;
    } else {
      el.card.style.maxHeight = '';
    }
    availH = Math.max(1, availH);
    W = Math.round(clamp(wrapW / availH * total, CFG.width.min, CFG.width.max));
    const scale = Math.min(wrapW / W, availH / total);
    const w = Math.max(1, Math.floor(W * scale)), h = Math.max(1, Math.floor(total * scale));
    el.scene.style.width = `${w}px`; el.scene.style.height = `${h}px`;
    el.stage.style.setProperty('--u', scale.toFixed(4));
    view.scale = w / W; view.dpr = Math.min(window.devicePixelRatio || 1, 2);
    el.canvas.width = Math.round(w * view.dpr); el.canvas.height = Math.round(h * view.dpr);
    player.x = clamp(player.x, CFG.zone.left, zoneRight());
    player.r = 17 * actor();
    for (const p of pods) { p.ox = p.side * spread(); p.r = 37 * actor(); }
    if (S.screen === 'play' || S.screen === 'down') setLabels();   // the answer text wraps to the new spacing
    measureCard();
    render();
  }
  if (window.ResizeObserver) {
    new ResizeObserver(resize).observe(el.wrap);
    // the card changes height as steps and hints come and go: above the canvas that resizes the scene, floating it only moves the monster
    new ResizeObserver(() => { if (view.stacked) resize(); else measureCard(); }).observe(el.card);
  }
  window.addEventListener('resize', resize);

  let last = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = clamp((now - last) / 1000, 0, 0.034);
    last = now;
    if (document.hidden) return;
    update(dt); render();
  }

  applyLanguage(); applySound();
  setScreen('intro'); renderCard(); resize();
  requestAnimationFrame(frame);

  // handle for automated checks: step the simulation without waiting for real time
  window.__shooter = {
    S, CFG, player, monster, pods, input, view,
    get ENC() { return ENC; },
    get W() { return W; },
    advance(seconds) { for (let t = 0; t < seconds; t += 1 / 60) update(1 / 60); render(); },
  };
})();
