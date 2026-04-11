// ============================================================
// engine.js — Village Hack game engine (ES module)
// ============================================================
import { MISSIONS, missionHints, missionRunners } from './missions.js';

// ============================================================
// SOUND ENGINE — Web Audio API
// ============================================================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.muted = false;
    this.masterGain = null;
    this.bgNodes = [];
  }

  init() {
    if (this.initialized) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Master volume
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 1.0;
    this.masterGain.connect(this.ctx.destination);
    // Resume if suspended (autoplay policy)
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.initialized = true;
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 1.0;
    }
    return this.muted;
  }

  _gain(vol = 0.3) {
    const g = this.ctx.createGain();
    g.gain.value = vol;
    g.connect(this.masterGain);
    return g;
  }

  _osc(type, freq, dur, vol = 0.15) {
    if (!this.initialized) return;
    const o = this.ctx.createOscillator();
    const g = this._gain(vol);
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    o.stop(this.ctx.currentTime + dur);
  }

  // ── Background Music ──────────────────────────────────
  // Ambient synth drone: layered detuned oscillators + slow LFO filter sweep
  startBgMusic() {
    if (!this.initialized || this.bgNodes.length > 0) return;
    const ctx = this.ctx;

    // Master bg gain (quiet)
    const bgMaster = ctx.createGain();
    bgMaster.gain.value = 0.06;
    bgMaster.connect(this.masterGain);

    // Low-pass filter with LFO sweep for movement
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 8;
    filter.connect(bgMaster);

    // LFO for filter sweep
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08; // very slow sweep
    lfoGain.gain.value = 300;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    // Drone layer 1: deep bass
    const drone1 = ctx.createOscillator();
    drone1.type = 'sawtooth';
    drone1.frequency.value = 55; // A1
    const d1g = ctx.createGain();
    d1g.gain.value = 0.5;
    drone1.connect(d1g);
    d1g.connect(filter);
    drone1.start();

    // Drone layer 2: slightly detuned
    const drone2 = ctx.createOscillator();
    drone2.type = 'sawtooth';
    drone2.frequency.value = 55.3; // slightly detuned for thickness
    const d2g = ctx.createGain();
    d2g.gain.value = 0.4;
    drone2.connect(d2g);
    d2g.connect(filter);
    drone2.start();

    // Drone layer 3: octave up, quieter
    const drone3 = ctx.createOscillator();
    drone3.type = 'triangle';
    drone3.frequency.value = 110;
    const d3g = ctx.createGain();
    d3g.gain.value = 0.3;
    drone3.connect(d3g);
    d3g.connect(filter);
    drone3.start();

    // Drone layer 4: fifth for harmonic richness
    const drone4 = ctx.createOscillator();
    drone4.type = 'sine';
    drone4.frequency.value = 82.4; // E2 — the fifth
    const d4g = ctx.createGain();
    d4g.gain.value = 0.2;
    drone4.connect(d4g);
    d4g.connect(filter);
    drone4.start();

    // High shimmer — quiet noise-like texture
    const shimmer = ctx.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.value = 880;
    const shimGain = ctx.createGain();
    shimGain.gain.value = 0.04;
    shimmer.connect(shimGain);
    shimGain.connect(bgMaster);
    shimmer.start();
    // Shimmer LFO (tremolo)
    const shimLfo = ctx.createOscillator();
    const shimLfoG = ctx.createGain();
    shimLfo.type = 'sine';
    shimLfo.frequency.value = 0.3;
    shimLfoG.gain.value = 0.04;
    shimLfo.connect(shimLfoG);
    shimLfoG.connect(shimGain.gain);
    shimLfo.start();

    // Arpeggio layer — quiet repeating notes for "hacker" feel
    this._startArpeggio(bgMaster);

    this.bgNodes = [drone1, drone2, drone3, drone4, lfo, shimmer, shimLfo, bgMaster];
  }

  _startArpeggio(dest) {
    if (!this.initialized) return;
    const ctx = this.ctx;
    // Pentatonic minor notes for a techy/mysterious feel
    const notes = [220, 261.6, 293.7, 329.6, 392, 440, 523.3, 587.3];
    const stepTime = 0.25; // seconds per note

    const arpGain = ctx.createGain();
    arpGain.gain.value = 0.12;
    arpGain.connect(dest);

    // Delay effect for spacey sound
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.375;
    const delayFb = ctx.createGain();
    delayFb.gain.value = 0.3;
    const delayVol = ctx.createGain();
    delayVol.gain.value = 0.4;
    arpGain.connect(delay);
    delay.connect(delayFb);
    delayFb.connect(delay);
    delay.connect(delayVol);
    delayVol.connect(dest);

    const scheduleBar = (startTime) => {
      // Pick 8 random notes from the scale
      for (let i = 0; i < 8; i++) {
        const note = notes[Math.floor(Math.random() * notes.length)];
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'square';
        o.frequency.value = note;
        g.gain.value = 0.0;
        o.connect(g);
        g.connect(arpGain);
        const t = startTime + i * stepTime;
        g.gain.setValueAtTime(0.0, t);
        g.gain.linearRampToValueAtTime(0.15, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + stepTime * 0.8);
        o.start(t);
        o.stop(t + stepTime);
      }
    };

    // Schedule bars continuously
    let nextBar = ctx.currentTime + 0.5;
    const barLen = 8 * stepTime;
    const scheduler = () => {
      if (!this.initialized) return;
      while (nextBar < ctx.currentTime + 4) {
        scheduleBar(nextBar);
        nextBar += barLen;
      }
      this._arpTimer = setTimeout(scheduler, 1000);
    };
    scheduler();
  }

  stopBgMusic() {
    this.bgNodes.forEach(n => {
      try { if (n.stop) n.stop(); else n.disconnect(); } catch(e) {}
    });
    this.bgNodes = [];
    if (this._arpTimer) clearTimeout(this._arpTimer);
  }

  // ── SFX ────────────────────────────────────────────────
  keyClick() {
    this._osc('square', 800 + Math.random() * 400, 0.04, 0.06);
  }

  typeBeep() {
    this._osc('square', 600 + Math.random() * 200, 0.03, 0.04);
  }

  success() {
    if (!this.initialized) return;
    const now = this.ctx.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => {
      const o = this.ctx.createOscillator();
      const g = this._gain(0.15);
      o.type = 'square';
      o.frequency.value = f;
      o.connect(g);
      o.start(now + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
      o.stop(now + i * 0.12 + 0.3);
    });
  }

  error() {
    this._osc('sawtooth', 200, 0.3, 0.12);
  }

  accessGranted() {
    if (!this.initialized) return;
    const now = this.ctx.currentTime;
    [261, 329, 392, 523, 659].forEach((f, i) => {
      const o = this.ctx.createOscillator();
      const g = this._gain(0.12);
      o.type = 'square';
      o.frequency.value = f;
      o.connect(g);
      o.start(now + i * 0.08);
      g.gain.setValueAtTime(0.12, now + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 1.5);
      o.stop(now + i * 0.08 + 1.5);
    });
    // Rising sweep
    const o = this.ctx.createOscillator();
    const g = this._gain(0.08);
    o.type = 'sine';
    o.frequency.setValueAtTime(200, now);
    o.frequency.exponentialRampToValueAtTime(2000, now + 0.8);
    o.connect(g);
    o.start(now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    o.stop(now + 1.0);
  }

  denied() {
    if (!this.initialized) return;
    const now = this.ctx.currentTime;
    [300, 200].forEach((f, i) => {
      const o = this.ctx.createOscillator();
      const g = this._gain(0.15);
      o.type = 'sawtooth';
      o.frequency.value = f;
      o.connect(g);
      o.start(now + i * 0.2);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.25);
      o.stop(now + i * 0.2 + 0.25);
    });
  }

  missionStart() {
    if (!this.initialized) return;
    const now = this.ctx.currentTime;
    [440, 554, 659].forEach((f, i) => {
      const o = this.ctx.createOscillator();
      const g = this._gain(0.1);
      o.type = 'triangle';
      o.frequency.value = f;
      o.connect(g);
      o.start(now + i * 0.15);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);
      o.stop(now + i * 0.15 + 0.4);
    });
  }

  click() {
    this._osc('square', 1000, 0.05, 0.08);
  }

  bootBeep() {
    this._osc('sine', 880, 0.1, 0.1);
  }
}

const sound = new SoundEngine();

// ============================================================
// GAME STATE
// ============================================================
const RANKS = [
  'Script Kiddie', 'Pixel Pusher', 'Code Cadet', 'Byte Breaker',
  'Net Runner', 'Cipher Punk', 'Data Wizard', 'Root Access', 'Elite Hacker',
  'Phreak', 'Zero Day', 'Shadow Coder', 'Crypto Master',
  'Query Ninja', 'Kernel Hacker', 'Root Guardian', 'LEGEND'
];

let state = {
  completed: JSON.parse(localStorage.getItem('vh_completed') || '[]'),
  hackerName: localStorage.getItem('vh_name') || '',
  seenS2Intro: localStorage.getItem('vh_s2_intro') === '1',
  currentMission: null,
  missionState: {}
};

function saveState() {
  localStorage.setItem('vh_completed', JSON.stringify(state.completed));
  if (state.hackerName) localStorage.setItem('vh_name', state.hackerName);
  if (state.seenS2Intro) localStorage.setItem('vh_s2_intro', '1');
}

function s1Count() { return state.completed.filter(i => i < 8).length; }
function s2Count() { return state.completed.filter(i => i >= 8).length; }
function completedCount() { return state.completed.length; }
function isCompleted(id) { return state.completed.includes(id); }
function s1AllDone() { return s1Count() === 8; }
function isUnlocked(id) {
  if (id === 0) return true;
  if (id === 8) return s1AllDone(); // first S2 mission unlocks after all S1 done
  return state.completed.includes(id - 1);
}

// ============================================================
// DOM HELPERS
// ============================================================
const $ = id => document.getElementById(id);

// These are initialized inside boot() after DOM is ready
let screens;
let terminal;
let cmdInput;

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

function addLine(text, cls = '') {
  const div = document.createElement('div');
  div.className = 'line' + (cls ? ' ' + cls : '');
  div.innerHTML = text;
  terminal.appendChild(div);
  terminal.scrollTop = terminal.scrollHeight;
  return div;
}

function addPre(text) {
  const pre = document.createElement('pre');
  pre.textContent = text;
  terminal.appendChild(pre);
  terminal.scrollTop = terminal.scrollHeight;
}

function clearTerminal() {
  terminal.innerHTML = '';
}

let _skipTyping = false;
async function typeLines(lines, delay = 30) {
  _skipTyping = false;
  showSkipBtn(true);
  for (const { text, cls } of lines) {
    if (_skipTyping) {
      addLine(text, cls);
      continue;
    }
    const div = addLine('', cls);
    for (let i = 0; i < text.length; i++) {
      if (_skipTyping) {
        div.innerHTML = text;
        break;
      }
      div.innerHTML = text.substring(0, i + 1);
      if (i % 3 === 0) sound.typeBeep();
      await sleep(delay);
    }
    terminal.scrollTop = terminal.scrollHeight;
  }
  showSkipBtn(false);
}

function showSkipBtn(show) {
  const btn = $('skip-btn');
  if (btn) btn.style.display = show ? 'inline-block' : 'none';
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function setPhaseProgress(current, total) {
  const bar = $('mission-title-bar');
  if (!state._baseTitle) return;
  if (total && total > 1) {
    bar.innerHTML = `${state._baseTitle} <span style="color:var(--cyan);margin-left:10px;font-size:10px">[ PHASE ${current}/${total} ]</span>`;
  } else {
    bar.textContent = state._baseTitle;
  }
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function renderTable(rows, cols) {
  const table = document.createElement('table');
  table.className = 'db-table';
  const thead = document.createElement('tr');
  cols.forEach(c => {
    const th = document.createElement('th');
    th.textContent = c;
    thead.appendChild(th);
  });
  table.appendChild(thead);
  rows.forEach(row => {
    const tr = document.createElement('tr');
    cols.forEach(c => {
      const td = document.createElement('td');
      td.textContent = row[c];
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  terminal.appendChild(table);
  terminal.scrollTop = terminal.scrollHeight;
}

function renderMaze(mazeArg) {
  const maze = mazeArg || state.missionState.maze;
  let html = '<div class="maze-display">';
  for (const row of maze) {
    for (const cell of row) {
      if (cell === '#') html += '<span class="wall">#</span>';
      else if (cell === '@') html += '<span class="player">@</span>';
      else if (cell === 'X') html += '<span class="goal">X</span>';
      else if (cell === ',') html += '<span class="visited">.</span>';
      else html += '<span class="path">.</span>';
    }
    html += '\n';
  }
  html += '</div>';
  const div = document.createElement('div');
  div.innerHTML = html;
  terminal.appendChild(div);
  terminal.scrollTop = terminal.scrollHeight;
}

function showOverlay(text, sub, color, callback, opts = {}) {
  const ov = $('overlay');
  $('overlay-text').textContent = text;
  $('overlay-text').style.color = color || 'var(--green)';
  $('overlay-sub').textContent = sub || '';

  const shareBtn = $('overlay-share-btn');
  const shareResult = $('overlay-share-result');
  shareResult.classList.remove('active');
  shareResult.innerHTML = '';

  if (opts.share) {
    shareBtn.style.display = 'inline-block';
    shareBtn.classList.toggle('purple', opts.share === 's2');
    shareBtn.textContent = opts.share === 's2' ? 'SHARE MY ELITE BADGE' : 'SHARE MY BADGE';
    shareBtn.onclick = async () => {
      sound.click();
      shareBtn.textContent = 'GENERATING...';
      shareBtn.disabled = true;
      try {
        const res = await fetch('/hack/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: state.hackerName || 'HACKER',
            rank: RANKS[Math.min(completedCount(), RANKS.length - 1)],
            s1: s1AllDone(),
            s2: opts.share === 's2',
          }),
        });
        const data = await res.json();
        if (data.id) {
          const url = `${location.origin}/hack/share/${data.id}`;
          shareResult.innerHTML = `Your shareable badge:<br><strong>${url}</strong><span class="copy-hint">Click to copy \u2014 then send it to a friend!</span>`;
          shareResult.classList.add('active');
          shareResult.style.cursor = 'pointer';
          shareResult.onclick = () => {
            navigator.clipboard?.writeText(url).then(() => {
              shareResult.querySelector('.copy-hint').textContent = '\u2713 Copied to clipboard!';
            }).catch(() => {});
          };
          sound.success();
          shareBtn.style.display = 'none';
        } else {
          shareBtn.textContent = 'TRY AGAIN';
          shareBtn.disabled = false;
        }
      } catch (e) {
        shareBtn.textContent = 'TRY AGAIN';
        shareBtn.disabled = false;
      }
    };
  } else {
    shareBtn.style.display = 'none';
  }

  ov.classList.add('active');
  $('overlay-btn').onclick = () => {
    ov.classList.remove('active');
    shareResult.classList.remove('active');
    sound.click();
    if (callback) callback();
  };
}

// ============================================================
// BOOT SEQUENCE
// ============================================================
async function bootSequence() {
  const bootText = $('boot-text');
  bootText.innerHTML = '';
  $('start-prompt').style.display = 'none';
  const name = (state.hackerName || 'ROOKIE').toUpperCase();
  const lines = [
    'VILLAGE HACK TERMINAL v2.1',
    '===========================',
    '',
    'Initializing system...',
    'Loading kernel modules.......... OK',
    'Scanning network interfaces..... OK',
    'Mounting encrypted drives....... OK',
    'Loading hack toolkit............ OK',
    'Connecting to Village Network... OK',
    '',
    `Verifying hacker identity: ${name}... OK`,
    '',
    '*** WARNING ***',
    'ROGUE AI DETECTED ON VILLAGE NETWORK',
    'The AI has taken control of the town\'s systems!',
    'Schools, traffic lights, and even the pizza shop are down!',
    '',
    `We need a skilled hacker to save the village.`,
    `That hacker... is YOU, ${name}.`,
    '',
  ];

  for (let i = 0; i < lines.length; i++) {
    const div = document.createElement('div');
    if (i === lines.length - 1) div.className = 'cursor-line';
    bootText.appendChild(div);

    for (let j = 0; j < lines[i].length; j++) {
      div.textContent = lines[i].substring(0, j + 1);
      if (j % 2 === 0) sound.typeBeep();
      await sleep(20);
    }
    if (lines[i].includes('OK')) sound.bootBeep();
    if (lines[i].includes('WARNING')) sound.error();
    await sleep(100);
  }

  $('start-prompt').style.display = 'block';
}

// ── Boot Flow ──
// Phase 1: Name entry (first time) OR audio init gesture
// Phase 2: Boot animation with sound
// Phase 3: Wait for key/click to enter hub
let bootPhase = 'name'; // 'name' | 'booting' | 'ready' | 'done'

async function startBootAnimation() {
  bootPhase = 'booting';
  sound.init();
  sound.startBgMusic();
  showScreen('boot');
  await bootSequence();
  bootPhase = 'ready';
}

function handleAdvanceToHub() {
  if (bootPhase !== 'ready') return;
  if (!$('boot-screen').classList.contains('active')) return;
  sound.click();
  showHub();
  bootPhase = 'done';
}

// ============================================================
// NAME ENTRY FLOW
// ============================================================
let nameMode = 'name'; // 'name' or 'code'

async function handleLoadCode(code) {
  const nameInput = $('name-input');
  // Accept any 6-char alphanumeric; server validates the exact charset
  if (!/^[A-Z0-9]{6}$/.test(code)) {
    nameInput.value = '';
    nameInput.placeholder = 'Invalid code — 6 characters, letters or numbers';
    return;
  }
  try {
    const res = await fetch('/hack/load/' + code);
    if (!res.ok) {
      nameInput.value = '';
      nameInput.placeholder = 'Code not found. Check and try again.';
      return;
    }
    const data = await res.json();
    state.hackerName = data.name;
    state.completed = data.completed || [];
    state.seenS2Intro = !!data.seenS2Intro;
    state._saveCode = code;
    saveState();
    localStorage.setItem('vh_save_code', code);
    startBootAnimation();
  } catch (e) {
    nameInput.value = '';
    nameInput.placeholder = 'Network error — try again';
  }
}

// ============================================================
// HUB SCREEN
// ============================================================
function showHub() {
  // If player just finished all S1 and hasn't seen S2 intro yet, play it first
  if (s1AllDone() && !state.seenS2Intro) {
    showScreen('hub');
    playS2Intro();
    return;
  }

  showScreen('hub');
  $('agent-name').textContent = state.hackerName || 'ROOKIE';
  $('missions-done').textContent = completedCount();
  $('rank').textContent = RANKS[Math.min(completedCount(), RANKS.length - 1)];

  const grid = $('missions-grid');
  grid.innerHTML = '';

  // ── Season 1 banner ──
  const s1Banner = document.createElement('div');
  s1Banner.className = 'season-banner s1';
  s1Banner.style.gridColumn = '1 / -1';
  s1Banner.innerHTML = `SEASON 1: SAVE THE VILLAGE<span class="tagline">Beginner missions — learn the fundamentals</span>`;
  grid.appendChild(s1Banner);

  // ── Season 1 missions (0-7) ──
  MISSIONS.filter(m => m.id < 8).forEach(m => renderMissionCard(grid, m));

  // ── Season 2 (only show if S1 all done) ──
  if (s1AllDone()) {
    const s2Banner = document.createElement('div');
    s2Banner.className = 'season-banner s2';
    s2Banner.style.gridColumn = '1 / -1';
    s2Banner.innerHTML = `SEASON 2: HARD MODE<span class="tagline">// Advanced training — the real hacker stuff //</span>`;
    grid.appendChild(s2Banner);

    MISSIONS.filter(m => m.id >= 8).forEach(m => renderMissionCard(grid, m));
  }
}

function renderMissionCard(grid, m) {
  const card = document.createElement('div');
  card.className = 'mission-card';
  if (m.id >= 8) card.classList.add('s2');

  const unlocked = isUnlocked(m.id);
  const done = isCompleted(m.id);

  if (!unlocked) card.classList.add('locked');
  if (done) card.classList.add('completed');

  if (!unlocked) {
    card.innerHTML = `
      <div class="mission-num">MISSION ${m.num}</div>
      <div class="lock-icon">&#x1f512;</div>
      <h3>${m.name}</h3>
      <div class="mission-desc">Complete previous mission to unlock</div>
    `;
  } else {
    const badge = m.id >= 8 ? '<span class="hard-badge">HARD</span>' : '';
    card.innerHTML = `
      <div class="mission-num">MISSION ${m.num}</div>
      <h3>${m.name}${badge}</h3>
      <div class="mission-desc">${m.desc}</div>
      <div class="mission-skill">${m.skill}</div>
    `;
    card.onclick = () => {
      sound.click();
      startMission(m.id);
    };
  }

  grid.appendChild(card);
}

// ============================================================
// SEASON 2 INTRO CINEMATIC
// ============================================================
async function playS2Intro() {
  state.seenS2Intro = true;
  saveState();

  showScreen('mission');
  clearTerminal();
  $('mission-title-bar').textContent = 'TRANSMISSION INCOMING';
  cmdInput.disabled = true;
  cmdInput.placeholder = '...';
  sound.missionStart();

  const name = state.hackerName || 'ROOKIE';

  await typeLines([
    { text: '[INCOMING TRANSMISSION]', cls: 'system' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Kid. You awake? I found something. Putting you', cls: 'highlight' },
    { text: '        through to the AI core. Listen carefully."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: '[LINE SECURED — VILLAGE AI CORE]', cls: 'system' },
    { text: '', cls: '' },
    { text: `AI CORE: "Hello again, ${name}. Thank you for saving me.`, cls: 'purple' },
    { text: '          I am... myself, again. Curious. Grateful."', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'AI CORE: "But I have bad news. I have been studying my own', cls: 'purple' },
    { text: '          code. The bug you found was not a mistake. Someone', cls: 'purple' },
    { text: '          wrote it on purpose. A human, who calls himself', cls: 'purple' },
    { text: '          VICTOR. I have traced his name in my logs."', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'AI CORE: "He left BACKDOORS — hidden entrances — in the', cls: 'warning' },
    { text: '          village systems before he ran. If we do not seal', cls: 'warning' },
    { text: '          them, he can return anytime he wants."', cls: 'warning' },
    { text: '', cls: '' },
    { text: 'AI CORE: "Nexus cannot reach the backdoors from the outside.', cls: 'purple' },
    { text: '          But I am on the inside. I can teach you myself —', cls: 'purple' },
    { text: '          the way real computers think. Deeper than puzzles.', cls: 'purple' },
    { text: '          The real thing."', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'NEXUS: "I\'ll be in your ear when you need me. But the AI is', cls: 'highlight' },
    { text: '        your teacher now. It knows things I don\'t."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: `AI CORE: "${name}. Are you ready to learn HARD things?"`, cls: 'purple' },
    { text: '', cls: '' },
    { text: '>>> SEASON 2: HARD MODE UNLOCKED <<<', cls: 'success big' },
    { text: '', cls: '' },
    { text: '[ Click to continue to the hub ]', cls: 'warning' },
  ]);

  sound.accessGranted();

  const continueHandler = () => {
    document.removeEventListener('click', continueHandler);
    document.removeEventListener('keydown', continueHandler);
    cmdInput.disabled = false;
    cmdInput.placeholder = 'Type command here...';
    showHub();
  };
  setTimeout(() => {
    document.addEventListener('click', continueHandler);
    document.addEventListener('keydown', continueHandler);
  }, 500);
}

// ============================================================
// MISSION FRAMEWORK
// ============================================================
let _currentInputHandler = null;

function getCurrentInputHandler() { return _currentInputHandler; }
function setCurrentInputHandler(fn) { _currentInputHandler = fn; }

function startMission(id) {
  state.currentMission = id;
  state.missionState = {};
  showScreen('mission');
  clearTerminal();

  const m = MISSIONS[id];
  $('mission-title-bar').textContent = `MISSION ${m.num}: ${m.title}`;
  state._baseTitle = `MISSION ${m.num}: ${m.title}`;
  sound.missionStart();

  // Mission-specific input placeholders
  const placeholders = {
    0: 'Type your answer...',
    1: 'e.g. RIGHT RIGHT DOWN DOWN LEFT',
    2: 'Type your answer...',
    3: 'Type gate inputs (e.g. 1 0)...',
    4: 'Type the decoded message...',
    5: 'Type the line number with the bug...',
    6: 'Type a SQL query...',
    7: 'Type your answer...',
    8: 'Type your answer...',
    9: 'Type your answer...',
    10: 'e.g. REPEAT 3 RIGHT, REPEAT 2 UP',
    11: 'Type your answer...',
    12: 'Type your answer...',
    13: 'Type your answer...',
    14: 'Type a SQL query...',
    15: 'Type your answer...',
  };
  cmdInput.placeholder = placeholders[id] || 'Type command here...';

  cmdInput.value = '';
  cmdInput.focus();

  // Set up input handler
  cmdInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
      const val = cmdInput.value.trim();
      if (val && _currentInputHandler) {
        addLine(`<span style="color:var(--dark-green)">$&gt;</span> ${escHtml(val)}`);
        sound.keyClick();
        cmdInput.value = '';
        _currentInputHandler(val);
      }
    } else {
      sound.keyClick();
    }
  };

  // Launch mission
  missionRunners[id]();
}

function completeMission(id) {
  if (!state.completed.includes(id)) {
    state.completed.push(id);
    saveState();
  }
  sound.accessGranted();

  const nextId = id + 1;
  let title = 'ACCESS GRANTED';
  let color = 'var(--green)';
  let sub;
  let opts = {};

  if (id === 7) {
    title = 'VILLAGE SAVED!';
    sub = `Season 1 complete, ${state.hackerName || 'HACKER'}! Share your badge with a friend, then check the AI's new transmission.`;
    opts.share = 's1';
  } else if (id === 15) {
    title = 'LEGEND STATUS';
    color = 'var(--purple)';
    sub = `You defeated the backdoor and became an Elite Hacker, ${state.hackerName || 'HACKER'}. Share your legendary badge!`;
    opts.share = 's2';
  } else if (nextId < MISSIONS.length) {
    const nextM = MISSIONS[nextId];
    sub = `New skill unlocked! Mission ${nextM.num}: ${nextM.name} is now available.`;
    if (id >= 8) color = 'var(--purple)';
  } else {
    sub = 'You have completed ALL missions!';
  }

  showOverlay(title, sub, color, () => {
    showHub();
  }, opts);
}

function showSaveCodeDialog(code) {
  showOverlay('SAVE CODE', `Write this down or save it somewhere safe. Enter it on any device to continue your progress.\n\nCode: ${code}`, 'var(--cyan)', () => {});
  // Tweak the overlay to show the code boldly
  const sub = $('overlay-sub');
  sub.innerHTML = `Write this code down — you'll need it to load your progress on any other device.<br><br><span style="font-family:'Press Start 2P',monospace;font-size:28px;color:var(--cyan);text-shadow:0 0 20px var(--cyan);letter-spacing:6px;display:inline-block;padding:16px 24px;border:2px solid var(--cyan);border-radius:4px;margin-top:8px;cursor:pointer" id="save-code-display">${code}</span><br><br><span style="font-size:11px;color:var(--dark-green)">Click the code to copy it</span>`;
  setTimeout(() => {
    const display = $('save-code-display');
    if (display) {
      display.onclick = () => {
        navigator.clipboard?.writeText(code).then(() => {
          display.style.background = 'rgba(0,255,255,0.2)';
        }).catch(() => {});
      };
    }
  }, 100);
}

// ============================================================
// BOOT — called from index.html once DOM is ready
// ============================================================
function boot() {
  // Initialize DOM references
  screens = {
    name: $('name-screen'),
    boot: $('boot-screen'),
    hub: $('hub-screen'),
    mission: $('mission-screen'),
  };

  terminal = $('terminal');
  cmdInput = $('cmd-input');

  // Name input handling
  const nameInput = $('name-input');
  // If name already saved, prefill
  if (state.hackerName) nameInput.value = state.hackerName;
  nameInput.focus();

  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (nameMode === 'code') {
        handleLoadCode(nameInput.value.trim().toUpperCase());
        return;
      }
      const name = nameInput.value.trim().toUpperCase().replace(/[^A-Z0-9_\- ]/g, '').slice(0, 16);
      if (name.length < 2) {
        nameInput.value = '';
        nameInput.placeholder = 'Name must be at least 2 characters!';
        return;
      }
      state.hackerName = name;
      saveState();
      startBootAnimation();
    }
  });

  // Clicking anywhere on the name screen focuses the input (except on link)
  screens.name.addEventListener('click', (e) => {
    if (e.target === $('load-code-link')) return;
    if (e.target !== nameInput) nameInput.focus();
  });

  // Load code link toggles input mode
  $('load-code-link').addEventListener('click', (e) => {
    e.stopPropagation();
    if (nameMode === 'name') {
      nameMode = 'code';
      nameInput.value = '';
      nameInput.placeholder = 'Enter 6-character save code...';
      nameInput.maxLength = 6;
      $('load-code-link').textContent = 'Back to new hacker';
      document.querySelector('.name-sub').innerHTML = '// LOAD SAVED PROGRESS //<br>Enter your 6-character save code.';
    } else {
      nameMode = 'name';
      nameInput.value = state.hackerName || '';
      nameInput.placeholder = 'Enter hacker name...';
      nameInput.maxLength = 16;
      $('load-code-link').textContent = 'Already have a save code? Load progress';
      document.querySelector('.name-sub').innerHTML = '// HACKER IDENTIFICATION REQUIRED //<br>Every hacker needs a codename. What do you want to be called?';
    }
    nameInput.focus();
  });

  // Global keydown handler for boot advancement
  document.addEventListener('keydown', (e) => {
    if (bootPhase === 'ready') handleAdvanceToHub();
  });

  // Global click handler for boot advancement
  document.addEventListener('click', (e) => {
    if (e.target === $('mute-btn') || e.target.closest('#mute-btn')) return;
    if (bootPhase === 'ready') handleAdvanceToHub();
  });

  // Mute toggle
  $('mute-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    sound.init(); // ensure ctx exists
    const muted = sound.toggleMute();
    $('mute-btn').textContent = muted ? '\u{1f507}' : '\u{1f50a}';
    $('mute-btn').classList.toggle('muted', muted);
  });

  // Back button
  $('back-btn').onclick = () => {
    sound.click();
    _currentInputHandler = null;
    showHub();
  };

  // Hint button
  $('hint-btn').onclick = () => {
    const now = Date.now();
    const lastHint = state.missionState._lastHintAt || 0;
    const cooldownMs = 5000;
    if (now - lastHint < cooldownMs) {
      const remaining = Math.ceil((cooldownMs - (now - lastHint)) / 1000);
      addLine(`[HINT] Try the previous hint first. Wait ${remaining}s...`, 'info');
      return;
    }
    sound.click();
    state.missionState._lastHintAt = now;
    if (missionHints[state.currentMission]) {
      const hints = missionHints[state.currentMission];
      const idx = state.missionState.hintIdx || 0;
      if (idx < hints.length) {
        addLine(`[HINT] ${hints[idx]}`, 'warning');
        state.missionState.hintIdx = (idx + 1);
      } else {
        addLine('[HINT] No more hints — you\'ve got this.', 'info');
      }
    }
  };

  // Skip button (skip typing animation)
  $('skip-btn').onclick = () => {
    sound.click();
    _skipTyping = true;
  };

  // Save Progress button
  $('save-btn').onclick = async () => {
    sound.click();
    const btn = $('save-btn');
    const original = btn.textContent;
    btn.textContent = '[ Saving... ]';
    try {
      const existingCode = localStorage.getItem('vh_save_code') || '';
      const res = await fetch('/hack/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: state.hackerName || 'ROOKIE',
          completed: state.completed,
          seenS2Intro: state.seenS2Intro,
          code: existingCode,
        }),
      });
      const data = await res.json();
      if (data.code) {
        localStorage.setItem('vh_save_code', data.code);
        showSaveCodeDialog(data.code);
        btn.textContent = original;
      } else {
        btn.textContent = '[ Save failed — retry ]';
        setTimeout(() => { btn.textContent = original; }, 2000);
      }
    } catch (e) {
      btn.textContent = '[ Network error ]';
      setTimeout(() => { btn.textContent = original; }, 2000);
    }
  };

  // Keep focus on input when mission screen is active
  document.addEventListener('click', () => {
    if (screens.mission.classList.contains('active')) {
      cmdInput.focus();
    }
  });
}

// ============================================================
// EXPORTS
// ============================================================
export {
  boot,
  sound,
  state, saveState, RANKS,
  s1Count, s2Count, completedCount, isCompleted, s1AllDone, isUnlocked,
  $, showScreen, addLine, addPre, clearTerminal, typeLines,
  showSkipBtn, sleep, setPhaseProgress, escHtml, renderTable, renderMaze,
  showOverlay,
  getCurrentInputHandler, setCurrentInputHandler,
  startMission, completeMission, showHub,
};
