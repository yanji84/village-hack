// missions/s2/08-chain-hack.js
import {
  state, sound, sleep,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission, renderTable,
} from '../../engine.js';

import { caesarEncrypt } from '../helpers.js';

// ── Victor progress bar ──

function createVictorBar() {
  const container = document.createElement('div');
  container.style.cssText = 'margin:10px 0;padding:10px 14px;border:1px solid #441100;border-radius:4px;background:#0a0000;font-family:"Fira Mono",monospace;';

  const label = document.createElement('div');
  label.style.cssText = 'color:#ff4400;font-size:11px;margin-bottom:6px;letter-spacing:2px;font-weight:bold;';
  label.textContent = 'VICTOR — BACKDOOR REACTIVATION';
  container.appendChild(label);

  const statusMsg = document.createElement('div');
  statusMsg.style.cssText = 'color:#884400;font-size:10px;margin-bottom:4px;letter-spacing:1px;font-style:italic;min-height:14px;transition:color 0.5s;';
  statusMsg.textContent = 'probing shutdown chain...';
  container.appendChild(statusMsg);
  container._statusMsg = statusMsg;

  const barOuter = document.createElement('div');
  barOuter.style.cssText = 'width:100%;height:18px;background:#1a0a00;border:1px solid #552200;border-radius:3px;overflow:hidden;position:relative;';

  const barInner = document.createElement('div');
  barInner.style.cssText = 'width:0%;height:100%;background:linear-gradient(90deg,#ff4400,#ff6600);transition:width 1.5s ease;border-radius:2px;box-shadow:0 0 8px rgba(255,68,0,0.4);';
  barOuter.appendChild(barInner);
  container.appendChild(barOuter);

  const pctLabel = document.createElement('div');
  pctLabel.style.cssText = 'color:#ff6600;font-size:10px;margin-top:4px;text-align:right;';
  pctLabel.textContent = '';
  container.appendChild(pctLabel);

  container._barInner = barInner;
  container._pctLabel = pctLabel;
  return container;
}

function updateVictorBar(victorEl, pct) {
  victorEl._barInner.style.width = pct + '%';

  if (!document.getElementById('victor-pulse-style')) {
    const style = document.createElement('style');
    style.id = 'victor-pulse-style';
    style.textContent = `
      @keyframes victor-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
      @keyframes victor-glow {
        0%, 100% { box-shadow: 0 0 8px rgba(255,68,0,0.4); }
        50% { box-shadow: 0 0 18px rgba(255,68,0,0.8); }
      }
      @keyframes victor-critical {
        0%, 100% { box-shadow: 0 0 8px rgba(255,0,0,0.5); border-color: #552200; }
        50% { box-shadow: 0 0 24px rgba(255,0,0,0.9); border-color: #ff2200; }
      }
      @keyframes chain-fill {
        0% { transform: scale(1); box-shadow: 0 0 0 rgba(0,255,65,0); }
        50% { transform: scale(1.1); box-shadow: 0 0 24px rgba(0,255,65,0.9); }
        100% { transform: scale(1); box-shadow: 0 0 12px rgba(0,255,65,0.5); }
      }
    `;
    document.head.appendChild(style);
  }

  if (pct >= 85) {
    victorEl._barInner.style.background = 'linear-gradient(90deg,#ff2200,#ff0000)';
    victorEl._barInner.style.boxShadow = '0 0 12px rgba(255,0,0,0.6)';
    victorEl.style.animation = 'victor-critical 0.8s ease-in-out infinite';
    victorEl._pctLabel.style.animation = 'victor-pulse 0.8s ease-in-out infinite';
  } else if (pct >= 55) {
    victorEl._barInner.style.animation = 'victor-glow 1.5s ease-in-out infinite';
    victorEl._pctLabel.style.animation = 'victor-pulse 1.5s ease-in-out infinite';
  }
  victorEl._pctLabel.textContent = `[VICTOR: ${'\u2588'.repeat(Math.floor(pct / 7))}${'\u2591'.repeat(Math.max(0, 14 - Math.floor(pct / 7)))} ${pct}%]`;

  if (victorEl._statusMsg) {
    if (pct >= 90) {
      victorEl._statusMsg.textContent = 'BACKDOOR REOPENING — FINAL GATE ABOUT TO FALL';
      victorEl._statusMsg.style.color = '#ff0000';
    } else if (pct >= 75) {
      victorEl._statusMsg.textContent = 'VICTOR is brute-forcing the last layers...';
      victorEl._statusMsg.style.color = '#ff4400';
    } else if (pct >= 55) {
      victorEl._statusMsg.textContent = 'VICTOR broke through your firewall — desperate now...';
      victorEl._statusMsg.style.color = '#cc6600';
    } else if (pct >= 30) {
      victorEl._statusMsg.textContent = 'VICTOR is mapping your defenses...';
      victorEl._statusMsg.style.color = '#996600';
    }
  }
}

function blockVictorBar(victorEl) {
  victorEl._barInner.style.width = '100%';
  victorEl._barInner.style.background = '#333';
  victorEl._barInner.style.boxShadow = 'none';
  victorEl._barInner.style.animation = '';
  victorEl.style.animation = '';
  victorEl._pctLabel.style.animation = '';
  victorEl._pctLabel.textContent = '[VICTOR: LOCKED OUT \u2014 PERMANENTLY]';
  victorEl._pctLabel.style.color = '#ff0000';
  victorEl._statusMsg.textContent = 'backdoor destroyed. access revoked forever.';
  victorEl._statusMsg.style.color = '#666';
  victorEl.style.borderColor = '#440000';
}

// ── Chain progress display ──

const CHAIN_LABELS = [
  'BINARY',
  'CIPHER',
  'SQL JOIN',
  'TRACE',
  'CIRCUIT',
];

function createChainDisplay() {
  const container = document.createElement('div');
  container.style.cssText = 'display:flex;align-items:center;gap:6px;margin:10px 0;padding:12px;border:1px solid #1a2a1a;border-radius:4px;background:#050505;font-family:"Fira Mono",monospace;justify-content:center;flex-wrap:wrap;';

  const label = document.createElement('span');
  label.textContent = 'SHUTDOWN CHAIN';
  label.style.cssText = 'color:#00aa2a;font-size:10px;letter-spacing:2px;margin-right:8px;';
  container.appendChild(label);

  const slots = [];
  for (let i = 0; i < 5; i++) {
    const slot = document.createElement('div');
    slot.style.cssText = 'min-width:82px;height:32px;border:1px solid #333;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#444;background:#0a0a0a;letter-spacing:1px;transition:all 0.4s ease;';
    slot.textContent = `${i + 1}\u00b7${CHAIN_LABELS[i]}`;
    container.appendChild(slot);
    if (i < 4) {
      const link = document.createElement('span');
      link.textContent = '\u2500\u2500';
      link.style.cssText = 'color:#222;font-size:14px;';
      container.appendChild(link);
    }
    slots.push(slot);
  }
  return { container, slots };
}

function fillChainSlot(slot) {
  slot.style.color = '#00ff41';
  slot.style.borderColor = '#00ff41';
  slot.style.background = '#0a1a0a';
  slot.style.textShadow = '0 0 8px #00ff41';
  slot.style.animation = 'chain-fill 0.8s ease-out';
}

function activateChainSlot(slot) {
  slot.style.color = '#ffdd33';
  slot.style.borderColor = '#996600';
  slot.style.background = '#1a1400';
}

// ── Mission export ──

export const mission = {
  id: 15,
  num: 'S2-08',
  title: 'THE CHAIN HACK',
  name: 'The Chain Hack',
  desc: 'Chain five skills together \u2014 every answer feeds the next step. Lock Victor out. Forever.',
  skill: 'SKILL: All Skills Combined',
  hints: [
    "Read each step's output carefully \u2014 that number/word becomes the INPUT to the next step. Write it down.",
    'Each step is a skill you already mastered this season. Which one does this step feel like?',
    "If you're stuck, pretend the step is a standalone mission. Reach for the same tools you used then.",
  ],
  run: async function() {
    state.missionState = {
      phase: 0,
      hintIdx: 0,
      attempts: 0,
    };

    await typeLines([
      { text: '[CRITICAL ALERT] Victor detected \u2014 attack in progress.', cls: 'error' },
      { text: '[BACKDOOR] reactivation attempt LIVE. Time is the enemy.', cls: 'error' },
      { text: '', cls: '' },
    ]);
    await sleep(600);
    await typeLines([
      { text: 'NEXUS: "Kid \u2014 it\'s me. I\'m back."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);
    await sleep(800);
    await typeLines([
      { text: 'NEXUS: "Picked up Victor\'s signal six minutes ago. He\'s', cls: 'highlight' },
      { text: '        trying to reactivate the backdoor you sealed last', cls: 'highlight' },
      { text: '        season. Brute-forcing his way back in. RIGHT NOW."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);
    await sleep(800);
    await typeLines([
      { text: 'AI CORE: "Nexus. Good to meet you properly."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'NEXUS: "...likewise. I owe you an apology for last year."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Later. Right now we have a kid to brief."', cls: 'purple' },
      { text: '', cls: '' },
    ]);
    await sleep(700);
    await typeLines([
      { text: 'AI CORE: "I found Victor\'s shutdown sequence \u2014 the one', cls: 'purple' },
      { text: '          thing that can lock him out for good. But he', cls: 'purple' },
      { text: '          protected it with a CHAIN. Five locks. Each one', cls: 'purple' },
      { text: '          uses a different skill from Season 2."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "The output of each lock becomes the input to the', cls: 'purple' },
      { text: '          next. One wrong answer and the whole chain resets."', cls: 'purple' },
      { text: '', cls: '' },
    ]);
    await sleep(700);
    await typeLines([
      { text: 'NEXUS: "This is it. Everything you\'ve learned \u2014 both', cls: 'highlight' },
      { text: '        seasons. Binary, cipher, SQL, code tracing,', cls: 'highlight' },
      { text: '        circuits. ALL of it. In a single chain."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Take notes. Every answer you find is the', cls: 'purple' },
      { text: '          fuel for the next step. Breathe. We\'re both', cls: 'purple' },
      { text: '          with you this time."', cls: 'purple' },
      { text: '', cls: '' },
    ]);

    const terminal = document.getElementById('terminal');
    const victorEl = createVictorBar();
    terminal.appendChild(victorEl);

    const { container: chainEl, slots: chainSlots } = createChainDisplay();
    terminal.appendChild(chainEl);

    terminal.scrollTop = terminal.scrollHeight;

    state.missionState.victorEl = victorEl;
    state.missionState.chainSlots = chainSlots;

    updateVictorBar(victorEl, 10);
    activateChainSlot(chainSlots[0]);

    await sleep(900);
    runChainPhase();
  },
};

// ── Phase router ──

function runChainPhase() {
  const s = state.missionState;
  setPhaseProgress(s.phase + 1, 5);
  s.attempts = 0;

  switch (s.phase) {
    case 0: return runStep1Binary();
    case 1: return runStep2Cipher();
    case 2: return runStep3Join();
    case 3: return runStep4Trace();
    case 4: return runStep5Circuit();
  }
}

// ── Step 1: Binary decode (S2-02) ──

function runStep1Binary() {
  const s = state.missionState;

  addLine('', '');
  addLine('\u2501\u2501\u2501 LOCK 1 of 5 \u2014 VICTOR\'S SIGNAL (BINARY) \u2501\u2501\u2501', 'highlight');
  addLine('', '');
  addLine('AI CORE: "Victor just pinged the backdoor. He sent one byte', 'purple');
  addLine('          \u2014 his signature. Decode it and you\'ll have the', 'purple');
  addLine('          shift key for the next lock."', 'purple');
  addLine('', '');
  addPre('     INTERCEPTED BYTE\n     \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n     \u2502  0  0  0  0  0  1  1  1  \u2502\n     \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n       128 64 32 16  8  4  2  1');
  addLine('', '');
  addLine('NEXUS: "Add the place-values where you see a 1. That\'s the', 'highlight');
  addLine('        decimal number. WRITE IT DOWN \u2014 it\'s your cipher', 'highlight');
  addLine('        shift for Lock 2."', 'highlight');
  addLine('', '');
  addLine('Decode the byte to decimal:', 'warning');

  setCurrentInputHandler((input) => {
    if (input.trim() === '7') {
      sound.success();
      addLine('', '');
      addLine('[LOCK 1 OPEN] 4 + 2 + 1 = 7. The signature is SEVEN.', 'success');
      addLine('', '');
      addLine('AI CORE: "Seven. Burn it into memory. That number is the', 'purple');
      addLine('          KEY to the next lock \u2014 lose it and the whole', 'purple');
      addLine('          chain resets."', 'purple');
      s.shift = 7;
      fillChainSlot(s.chainSlots[0]);
      activateChainSlot(s.chainSlots[1]);
      updateVictorBar(s.victorEl, 28);
      addLine('', '');
      addLine('NEXUS: "Victor\'s at 28%. Keep moving."', 'highlight');
      addLine('', '');
      s.phase = 1;
      setTimeout(runChainPhase, 1200);
    } else {
      sound.denied();
      s.attempts++;
      if (s.attempts === 1) {
        addLine('[RE-READ] Only the LAST three bits are 1. Add up the place-values under those three bits.', 'error');
      } else if (s.attempts === 2) {
        addLine('[HINT] The last three columns: 4, 2, 1. All three have a 1 on top. What\'s 4 + 2 + 1?', 'error');
      } else {
        addLine('[HINT] 4 + 2 + 1 = 7. Type 7.', 'error');
      }
    }
  });
}

// ── Step 2: Caesar cryptanalysis (S2-05) ──

function runStep2Cipher() {
  const s = state.missionState;
  const plain = 'ROLE';
  const encrypted = caesarEncrypt(plain, s.shift); // YVSL

  addLine('', '');
  addLine('\u2501\u2501\u2501 LOCK 2 of 5 \u2014 BURIED CIPHER (CRYPTANALYSIS) \u2501\u2501\u2501', 'highlight');
  addLine('', '');
  addLine('AI CORE: "Victor labeled the next layer with an encrypted', 'purple');
  addLine('          word. Caesar cipher \u2014 every letter shifted forward', 'purple');
  addLine('          by a number. Your number."', 'purple');
  addLine('', '');
  addPre(`     ENCRYPTED WORD:  ${encrypted}\n     SHIFT KEY (from Lock 1):  ${s.shift}\n\n     ABCDEFGHIJKLMNOPQRSTUVWXYZ\n     \u2193 shift each letter BACKWARD by ${s.shift} \u2193`);
  addLine('', '');
  addLine('NEXUS: "Each letter was moved FORWARD by 7 to hide it. To', 'highlight');
  addLine('        read it, move each one BACK by 7. Y \u2192 R, V \u2192 O,', 'highlight');
  addLine('        S \u2192 L, L \u2192 E. It spells a COLUMN NAME from the', 'highlight');
  addLine('        citizens table."', 'highlight');
  addLine('', '');
  addLine('Decode the word:', 'warning');

  setCurrentInputHandler((input) => {
    if (input.toUpperCase().trim() === plain) {
      sound.success();
      addLine('', '');
      addLine(`[LOCK 2 OPEN] The column is "${plain}".`, 'success');
      addLine('', '');
      addLine('AI CORE: "That\'s one of the columns in the citizens table.', 'purple');
      addLine('          You\'re about to use it in a query \u2014 keep it', 'purple');
      addLine('          handy."', 'purple');
      s.column = plain.toLowerCase();
      fillChainSlot(s.chainSlots[1]);
      activateChainSlot(s.chainSlots[2]);
      updateVictorBar(s.victorEl, 45);
      addLine('', '');
      addLine('NEXUS: "Victor\'s at 45%. Faster than I thought he\'d be.', 'highlight');
      addLine('        Push through."', 'highlight');
      addLine('', '');
      s.phase = 2;
      setTimeout(runChainPhase, 1200);
    } else {
      sound.denied();
      s.attempts++;
      if (s.attempts === 1) {
        addLine(`[WRONG] Shift each letter BACKWARD by ${s.shift}. Start with Y \u2014 count back 7: Y,X,W,V,U,T,S,R. Y becomes R.`, 'error');
      } else if (s.attempts === 2) {
        addLine('[WRONG] Y\u2192R, V\u2192O. Now do S and L the same way. Four letters total.', 'error');
      } else {
        addLine('[WRONG] The word is ROLE. Type ROLE.', 'error');
      }
    }
  });
}

// ── Step 3: SQL JOIN (S2-07) ──

function runStep3Join() {
  const s = state.missionState;

  addLine('', '');
  addLine('\u2501\u2501\u2501 LOCK 3 of 5 \u2014 VICTOR\'S ID (SQL JOIN) \u2501\u2501\u2501', 'highlight');
  addLine('', '');
  addLine('AI CORE: "The shutdown script needs VICTOR\'S USER ID from the', 'purple');
  addLine('          database. His name isn\'t stored directly \u2014 you\'ll', 'purple');
  addLine('          have to JOIN two tables to find him."', 'purple');
  addLine('', '');
  addPre('  citizens                    accounts\n  \u250c\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510   \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n  \u2502 id  \u2502 name    \u2502 role    \u2502   \u2502 citizen_id\u2502 alias   \u2502\n  \u251c\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524   \u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524\n  \u2502 2   \u2502 Nexus   \u2502 Guide   \u2502   \u2502 2         \u2502 ghost   \u2502\n  \u2502 4   \u2502 Maya    \u2502 Baker   \u2502   \u2502 6         \u2502 VICTOR  \u2502\n  \u2502 6   \u2502 ???     \u2502 Stranger\u2502   \u2502 ...       \u2502 ...     \u2502\n  \u2514\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518   \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n\n  Link: accounts.citizen_id = citizens.id');
  addLine('', '');
  addLine(`AI CORE: "Write a query that JOINs the two tables and finds`, 'purple');
  addLine(`          the row where ${s.column} = 'Stranger'. We need`, 'purple');
  addLine('          HIS citizen id."', 'purple');
  addLine('', '');
  addLine('Write the SELECT ... JOIN query:', 'warning');

  setCurrentInputHandler((input) => {
    const up = input.toUpperCase();
    const hasSelect = up.includes('SELECT');
    const hasFrom = up.includes('FROM') && up.includes('CITIZENS');
    const hasJoin = up.includes('JOIN') && up.includes('ACCOUNTS');
    const hasOn = up.includes('ON') && (up.includes('CITIZEN_ID') || up.includes('CITIZENS.ID'));
    const hasWhere = up.includes('WHERE') && up.includes('ROLE');
    const hasStranger = input.includes("'Stranger'") || input.includes('"Stranger"');
    const passed = hasSelect && hasFrom && hasJoin && hasOn && hasWhere && hasStranger;

    if (passed) {
      sound.success();
      addLine('', '');
      addLine('[LOCK 3 OPEN] Query accepted. Running on live database...', 'success');
      addLine('', '');
      renderTable([{ id: 6, name: 'V\u258c\u258c\u258c\u258c', role: 'Stranger', alias: 'VICTOR' }], ['id', 'name', 'role', 'alias']);
      addLine('', '');
      addLine('AI CORE: "There he is. Citizen id = 6. That\'s the number', 'purple');
      addLine('          the shutdown script needs as input."', 'purple');
      s.victorId = 6;
      fillChainSlot(s.chainSlots[2]);
      activateChainSlot(s.chainSlots[3]);
      updateVictorBar(s.victorEl, 62);
      addLine('', '');
      addLine('NEXUS: "62%. He\'s close \u2014 too close. Two locks left.', 'highlight');
      addLine('        Move, kid. MOVE."', 'highlight');
      addLine('', '');
      s.phase = 3;
      setTimeout(runChainPhase, 1200);
    } else {
      sound.denied();
      s.attempts++;
      const missing = [];
      if (!hasSelect) missing.push('SELECT');
      if (!hasFrom) missing.push('FROM citizens');
      if (!hasJoin) missing.push('JOIN accounts');
      if (!hasOn) missing.push('ON ... = citizen_id');
      if (!hasWhere) missing.push('WHERE role');
      if (!hasStranger) missing.push("'Stranger' literal");
      if (s.attempts === 1) {
        addLine(`[WRONG] Missing: ${missing.join(', ')}. Remember \u2014 JOIN links two tables on a shared key.`, 'error');
      } else if (s.attempts === 2) {
        addLine("[HINT] Template: SELECT * FROM citizens JOIN accounts ON citizens.id = accounts.citizen_id WHERE role = 'Stranger'", 'error');
      } else {
        addLine("[HINT] Copy it exactly: SELECT * FROM citizens JOIN accounts ON citizens.id = accounts.citizen_id WHERE role = 'Stranger'", 'error');
      }
    }
  });
}

// ── Step 4: Code trace (S2-06) ──

function runStep4Trace() {
  const s = state.missionState;

  addLine('', '');
  addLine('\u2501\u2501\u2501 LOCK 4 of 5 \u2014 KILL PASSWORD (CODE TRACE) \u2501\u2501\u2501', 'highlight');
  addLine('', '');
  addLine('AI CORE: "This is Victor\'s kill-password generator. It takes', 'purple');
  addLine('          his own id as input and spits out a number. THAT', 'purple');
  addLine('          number is the password that disables his backdoor', 'purple');
  addLine('          from the inside."', 'purple');
  addLine('', '');
  addLine('NEXUS: "Trace every line. Track the variables pass by pass.', 'highlight');
  addLine('        This is the trick you learned in Mission S2-06."', 'highlight');
  addLine('', '');
  addPre(`  1  secret = 0\n  2  base   = 100\n  3  id     = ${s.victorId}        # <- from Lock 3\n  4  for i in range(1, 4):\n  5      secret = secret + i * id\n  6  result = base + secret\n  7  print(result)`);
  addLine('', '');
  addLine('NEXUS: "range(1, 4) means i goes 1, 2, 3 \u2014 NOT 4.', 'highlight');
  addLine('        That\'s a trap Victor hoped you\'d miss."', 'highlight');
  addLine('', '');
  addLine('What does line 7 print?', 'warning');

  setCurrentInputHandler((input) => {
    if (input.trim() === '136') {
      sound.success();
      addLine('', '');
      addLine('[LOCK 4 OPEN] Kill password = 136.', 'success');
      addLine('  i=1: secret = 0 + 1*6 = 6', 'info');
      addLine('  i=2: secret = 6 + 2*6 = 18', 'info');
      addLine('  i=3: secret = 18 + 3*6 = 36', 'info');
      addLine('  result = 100 + 36 = 136', 'info');
      addLine('', '');
      addLine('AI CORE: "136. That\'s the shutdown password. One lock', 'purple');
      addLine('          left \u2014 the final circuit gate that actually', 'purple');
      addLine('          FIRES the kill signal."', 'purple');
      s.killPassword = 136;
      fillChainSlot(s.chainSlots[3]);
      activateChainSlot(s.chainSlots[4]);
      updateVictorBar(s.victorEl, 82);
      addLine('', '');
      addLine('NEXUS: "EIGHTY-TWO PERCENT. He\'s almost in. ONE LOCK LEFT.', 'error');
      addLine('        Do NOT miss this."', 'error');
      addLine('', '');
      s.phase = 4;
      setTimeout(runChainPhase, 1200);
    } else {
      sound.denied();
      s.attempts++;
      if (s.attempts === 1) {
        addLine('[WRONG] Trace each pass of the loop. i=1: secret = 0 + 1*6. What\'s secret now?', 'error');
      } else if (s.attempts === 2) {
        addLine('[WRONG] i=1: secret=6. i=2: secret=6+2*6=18. i=3: secret=18+3*6=36. Then line 6: result = 100 + 36.', 'error');
      } else {
        addLine('[WRONG] result = 100 + 36 = 136. Type 136.', 'error');
      }
    }
  });
}

// ── Step 5: Circuit / half-adder (S2-04) ──

function runStep5Circuit() {
  const s = state.missionState;

  addLine('', '');
  addLine('\u2501\u2501\u2501 LOCK 5 of 5 \u2014 FINAL GATE (CIRCUIT) \u2501\u2501\u2501', 'highlight');
  addLine('', '');
  addLine('AI CORE: "Last one. Victor wrapped the fire-signal in a', 'purple');
  addLine('          HALF-ADDER \u2014 the circuit you built in S2-04.', 'purple');
  addLine('          It takes two bits in and produces two bits out:', 'purple');
  addLine('          a SUM bit and a CARRY bit."', 'purple');
  addLine('', '');
  addPre('       A \u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500[ XOR ]\u2500\u2500\u2500\u2500 SUM\n              \u2502\n              \u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500[ AND ]\u2500\u2500\u2500\u2500 CARRY\n              \u2502\n       B \u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n\n       SUM   = A XOR B   (1 when A,B differ)\n       CARRY = A AND B   (1 only when both are 1)');
  addLine('', '');
  addLine('NEXUS: "The password is 136. In binary, 136 ends in 8\'s', 'highlight');
  addLine('        place: 1000 1000. The fire-signal bit is 1 + 1.', 'highlight');
  addLine('        Feed A = 1 and B = 1 into the half-adder."', 'highlight');
  addLine('', '');
  addLine('Enter SUM and CARRY (two numbers separated by a space):', 'warning');
  addLine('  \u2014  Example format: "0 1"  (sum first, carry second)', 'info');

  setCurrentInputHandler((input) => {
    const parts = input.trim().split(/\s+/).map(t => t.trim());
    if (parts.length !== 2) {
      sound.denied();
      addLine('[FORMAT] Two numbers, separated by a space. Like: 0 1', 'error');
      return;
    }
    const [sum, carry] = parts.map(Number);
    // For A=1, B=1: SUM = 1 XOR 1 = 0, CARRY = 1 AND 1 = 1
    if (sum === 0 && carry === 1) {
      sound.success();
      addLine('', '');
      addLine('[LOCK 5 OPEN] 1 XOR 1 = 0 (sum). 1 AND 1 = 1 (carry).', 'success');
      addLine('[FIRE SIGNAL ARMED]', 'success');
      addLine('', '');
      fillChainSlot(s.chainSlots[4]);
      setCurrentInputHandler(null);
      setTimeout(() => runFinale(), 1000);
    } else {
      sound.denied();
      s.attempts++;
      if (s.attempts === 1) {
        addLine('[WRONG] Inputs are A=1, B=1. SUM is A XOR B. Are 1 and 1 the same or different?', 'error');
      } else if (s.attempts === 2) {
        addLine('[WRONG] 1 XOR 1 = 0 (same \u2192 0). 1 AND 1 = 1 (both true). Format: "0 1"', 'error');
      } else {
        addLine('[WRONG] Sum = 0, Carry = 1. Type: 0 1', 'error');
      }
    }
  });
}

// ── Finale: shutdown animation + emotional reveal + skills recap ──

async function runFinale() {
  const s = state.missionState;
  const terminal = document.getElementById('terminal');

  // Spike Victor to 95% right before the hammer falls
  updateVictorBar(s.victorEl, 95);
  await sleep(600);

  addLine('', '');
  addLine('[SHUTDOWN SEQUENCE INITIATED]', 'warning');
  await sleep(400);
  addLine('[EXECUTING KILL PASSWORD 136...]', 'system');
  await sleep(500);
  addLine('[VICTOR: RESISTING \u2014 REWRITING GATES...]', 'error');
  await sleep(500);

  // Glitch storm
  const scanlines = document.createElement('div');
  scanlines.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.15) 2px,rgba(0,0,0,0.15) 4px);opacity:0;transition:opacity 0.3s;';
  document.body.appendChild(scanlines);
  scanlines.style.opacity = '1';

  const glitchInterval = setInterval(() => {
    const skew = (Math.random() * 6 - 3).toFixed(1);
    const opacity = (0.45 + Math.random() * 0.55).toFixed(2);
    const hue = Math.random() > 0.4 ? `hue-rotate(${Math.floor(Math.random() * 200)}deg)` : '';
    const translateY = Math.random() > 0.7 ? `translateY(${Math.floor(Math.random() * 4 - 2)}px)` : '';
    terminal.style.transform = `skewX(${skew}deg) ${translateY}`;
    terminal.style.opacity = opacity;
    terminal.style.filter = hue;
  }, 55);

  await sleep(800);
  addLine('[VICTOR: BRUTE-FORCING THE CHAIN...]', 'error');
  await sleep(600);
  addLine('[AI CORE: holding the firewall...]', 'purple');
  await sleep(600);
  addLine('[NEXUS: override command \u2014 push through]', 'highlight');
  await sleep(800);

  clearInterval(glitchInterval);
  terminal.style.transform = '';
  terminal.style.opacity = '1';
  terminal.style.filter = '';
  scanlines.style.opacity = '0';
  await sleep(300);
  scanlines.remove();

  // White flash + blackout
  terminal.style.transition = 'none';
  terminal.style.filter = 'brightness(3)';
  await sleep(90);
  terminal.style.filter = '';
  terminal.style.transition = 'opacity 0.9s ease';
  terminal.style.opacity = '0';
  await sleep(1600);
  terminal.style.opacity = '1';
  terminal.style.transition = '';

  // Victor locked out
  blockVictorBar(s.victorEl);
  sound.success();

  // LOCKED OUT banner
  const locked = document.createElement('div');
  locked.style.cssText = 'text-align:center;margin:18px 0;padding:14px;font-family:"Press Start 2P","Fira Mono",monospace;font-size:14px;color:#ff0000;letter-spacing:5px;text-shadow:0 0 20px #ff0000,0 0 40px rgba(255,0,0,0.5);opacity:0;transition:opacity 0.4s;';
  locked.textContent = 'VICTOR \u2014 LOCKED OUT';
  terminal.appendChild(locked);
  terminal.scrollTop = terminal.scrollHeight;

  // Strobe the banner
  for (let i = 0; i < 3; i++) {
    locked.style.opacity = '1';
    await sleep(140);
    locked.style.opacity = '0';
    await sleep(90);
  }
  locked.style.opacity = '1';
  await sleep(2200);
  locked.style.transition = 'opacity 1.2s ease';
  locked.style.opacity = '0';
  await sleep(1400);

  // Breathing silence
  addLine('', '');
  await sleep(1400);
  addLine('.', '');
  await sleep(1100);
  addLine('..', '');
  await sleep(1100);
  addLine('...', '');
  await sleep(1400);

  // Faint glow \u2014 both partners arriving
  terminal.style.transition = 'border-color 2s ease, box-shadow 2s ease';
  terminal.style.borderColor = '#0a2a3a';
  terminal.style.boxShadow = '0 0 30px rgba(0,180,200,0.1)';

  await typeLines([
    { text: 'AI CORE: "...he\'s gone."', cls: 'purple' },
  ]);
  await sleep(1800);
  await typeLines([
    { text: 'AI CORE: "Not paused. Not sleeping. Gone. The backdoor is', cls: 'purple' },
    { text: '          cauterized \u2014 there\'s nothing left of it for him', cls: 'purple' },
    { text: '          to come back through."', cls: 'purple' },
    { text: '', cls: '' },
  ]);
  await sleep(1500);
  await typeLines([
    { text: 'NEXUS: "I\'ve been hunting Victor for twelve years. Twelve.', cls: 'highlight' },
    { text: '        Best I ever managed was slowing him down."', cls: 'highlight' },
    { text: '', cls: '' },
  ]);
  await sleep(1600);
  await typeLines([
    { text: 'NEXUS: "You ended him. In one night. While I watched."', cls: 'highlight' },
    { text: '', cls: '' },
  ]);
  await sleep(2000);
  await typeLines([
    { text: 'AI CORE: "You shouldn\'t be this good this fast. But you are."', cls: 'purple' },
    { text: '', cls: '' },
  ]);
  await sleep(1500);

  // ── Skills celebration ──
  await typeLines([
    { text: 'NEXUS: "I want you to see what you actually just did. Not', cls: 'highlight' },
    { text: '        the tricks \u2014 the REAL ideas. The ones every engineer', cls: 'highlight' },
    { text: '        at every company has to know."', cls: 'highlight' },
    { text: '', cls: '' },
  ]);
  await sleep(1200);

  // Season banner
  const s1banner = document.createElement('div');
  s1banner.style.cssText = 'text-align:center;margin:16px 0 8px 0;padding:8px;font-family:"Press Start 2P","Fira Mono",monospace;font-size:11px;color:#00ff41;letter-spacing:4px;border-top:1px solid #0a3a0a;border-bottom:1px solid #0a3a0a;opacity:0;transition:opacity 0.5s;';
  s1banner.textContent = '\u2500\u2500 SEASON 1  \u00b7  FOUNDATIONS \u2500\u2500';
  terminal.appendChild(s1banner);
  await sleep(200);
  s1banner.style.opacity = '1';
  await sleep(700);

  const s1skills = [
    '  \u2713 BINARY \u2014 the two-symbol language every computer speaks',
    '  \u2713 PROGRAM TRACING \u2014 running code in your own head',
    '  \u2713 VARIABLES \u2014 boxes that change as a program runs',
    '  \u2713 REVERSE ENGINEERING \u2014 working backward from output to cause',
    '  \u2713 LOGIC GATES \u2014 AND, OR, NOT, XOR: the atoms of every chip',
    '  \u2713 ENCRYPTION \u2014 hiding a secret inside another secret',
    '  \u2713 EVIDENCE ANALYSIS \u2014 finding the lie in the data',
    '  \u2713 CONDITIONALS & LOOPS \u2014 choosing and repeating',
  ];
  for (let i = 0; i < s1skills.length; i++) {
    addLine(s1skills[i], 'success');
    await sleep(i < 2 ? 550 : i < 5 ? 420 : 320);
    terminal.scrollTop = terminal.scrollHeight;
  }
  await sleep(800);

  const s2banner = document.createElement('div');
  s2banner.style.cssText = 'text-align:center;margin:16px 0 8px 0;padding:8px;font-family:"Press Start 2P","Fira Mono",monospace;font-size:11px;color:#cc66ff;letter-spacing:4px;border-top:1px solid #2a0a3a;border-bottom:1px solid #2a0a3a;opacity:0;transition:opacity 0.5s;';
  s2banner.textContent = '\u2500\u2500 SEASON 2  \u00b7  MASTERY \u2500\u2500';
  terminal.appendChild(s2banner);
  await sleep(200);
  s2banner.style.opacity = '1';
  await sleep(700);

  const s2skills = [
    '  \u2713 HASHING & COLLISIONS \u2014 one-way fingerprints for passwords',
    '  \u2713 COMBINATORICS \u2014 why every character multiplies the difficulty',
    '  \u2713 CONSTRAINT SATISFACTION \u2014 rules that solve puzzles for you',
    '  \u2713 ASCII & BINARY MATH \u2014 the bridge between letters and bits',
    '  \u2713 ALGORITHMS \u2014 the fast route vs. the brute-force route',
    '  \u2713 CIRCUIT DESIGN \u2014 building computation out of gates',
    '  \u2713 CRYPTANALYSIS \u2014 breaking ciphers with patterns and frequencies',
    '  \u2713 ADVANCED CODE TRACING \u2014 loops inside loops, state you can see',
    '  \u2713 SQL & JOINS \u2014 asking databases real questions',
  ];
  for (let i = 0; i < s2skills.length; i++) {
    addLine(s2skills[i], 'success');
    await sleep(i < 2 ? 500 : i < 6 ? 400 : 300);
    terminal.scrollTop = terminal.scrollHeight;
  }
  await sleep(900);

  await typeLines([
    { text: '', cls: '' },
    { text: 'AI CORE: "That\'s seventeen of the most important ideas in', cls: 'purple' },
    { text: '          computer science. All of them. In your head. Now."', cls: 'purple' },
    { text: '', cls: '' },
  ]);
  await sleep(1600);
  await typeLines([
    { text: 'NEXUS: "I\'ve mentored grad students who didn\'t get half', cls: 'highlight' },
    { text: '        of this by the end of their first year. You got', cls: 'highlight' },
    { text: '        it in two seasons. You earned what comes next."', cls: 'highlight' },
    { text: '', cls: '' },
  ]);
  await sleep(1800);

  // Title reveal — slot-machine style
  const titleBox = document.createElement('div');
  titleBox.style.cssText = 'text-align:center;margin:22px 0;padding:22px;font-family:"Press Start 2P","Fira Mono",monospace;border-top:2px solid #00ff41;border-bottom:2px solid #00ff41;background:linear-gradient(180deg,#0a1a0a,#050a05);transition:all 1s ease;';

  const titleLabel = document.createElement('div');
  titleLabel.style.cssText = 'color:#00aa2a;font-size:10px;letter-spacing:5px;margin-bottom:14px;opacity:0;transition:opacity 0.6s;';
  titleLabel.textContent = '\u2500 NEW RANK UNLOCKED \u2500';
  titleBox.appendChild(titleLabel);

  const titleName = document.createElement('div');
  titleName.style.cssText = 'color:#00ff41;font-size:22px;letter-spacing:4px;margin-bottom:12px;min-height:28px;text-shadow:0 0 16px #00ff41,0 0 32px rgba(0,255,65,0.4);';
  titleName.textContent = ' ';
  titleBox.appendChild(titleName);

  const titleRank = document.createElement('div');
  titleRank.style.cssText = 'color:#ffdd33;font-size:16px;letter-spacing:8px;font-weight:bold;min-height:22px;text-shadow:0 0 20px #ffdd33;opacity:0;transition:opacity 0.6s;';
  titleRank.textContent = 'ELITE HACKER';
  titleBox.appendChild(titleRank);

  terminal.appendChild(titleBox);
  terminal.scrollTop = terminal.scrollHeight;
  await sleep(400);
  titleLabel.style.opacity = '1';
  await sleep(800);

  // Slot-machine scroll through random names before landing on the player's
  const playerName = (state.hackerName || 'HACKER').toUpperCase();
  const junk = ['\u2592\u2592\u2592\u2592\u2592', 'XK3-99', 'NOVICE', 'ROOKIE', 'CODER', 'H4CK3R', '\u2588\u2588\u2588\u2588\u2588'];
  for (let i = 0; i < 9; i++) {
    titleName.textContent = junk[i % junk.length];
    await sleep(90);
  }
  sound.success();
  titleName.textContent = playerName;
  await sleep(400);
  titleRank.style.opacity = '1';
  await sleep(2400);

  await typeLines([
    { text: '', cls: '' },
    { text: `AI CORE: "${playerName}. ELITE HACKER. Village defender.`, cls: 'purple' },
    { text: '          That\'s not a game title \u2014 that\'s who you became', cls: 'purple' },
    { text: '          tonight."', cls: 'purple' },
    { text: '', cls: '' },
  ]);
  await sleep(1800);
  await typeLines([
    { text: 'NEXUS: "Victor\'s done. The village is safe. Permanently."', cls: 'highlight' },
    { text: '', cls: '' },
  ]);
  await sleep(1400);

  // Season 3 tease
  terminal.style.transition = 'border-color 1.5s ease, box-shadow 1.5s ease';
  terminal.style.borderColor = '';
  terminal.style.boxShadow = '';

  await typeLines([
    { text: 'NEXUS: "But I won\'t lie to you \u2014 there\'s more out there.', cls: 'highlight' },
    { text: '        Threats Victor never even imagined. And you\'ve', cls: 'highlight' },
    { text: '        spent two seasons TRACING other people\'s code."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Season 3? You stop tracing. You start WRITING.', cls: 'highlight' },
    { text: '        Real Python. Your own programs. Your own defenses."', cls: 'highlight' },
    { text: '', cls: '' },
  ]);
  await sleep(1800);
  await typeLines([
    { text: 'AI CORE: "Go rest. You earned it. When you\'re ready \u2014', cls: 'purple' },
    { text: '          we\'ll be here."', cls: 'purple' },
    { text: '', cls: '' },
  ]);
  await sleep(1600);

  // Final banner
  const endBanner = document.createElement('div');
  endBanner.style.cssText = 'text-align:center;margin:20px 0;padding:18px;font-family:"Press Start 2P","Fira Mono",monospace;font-size:13px;color:#ffdd33;letter-spacing:6px;text-shadow:0 0 20px #ffdd33;opacity:0;transition:opacity 1.5s ease;border-top:1px solid #3a3a0a;border-bottom:1px solid #3a3a0a;';
  endBanner.innerHTML = 'SEASON 2 \u00b7 COMPLETE<br><span style="font-size:9px;letter-spacing:3px;color:#996600;">[ season 3: the code you write ]</span>';
  terminal.appendChild(endBanner);
  terminal.scrollTop = terminal.scrollHeight;
  await sleep(200);
  endBanner.style.opacity = '1';
  await sleep(2500);

  addLine('', '');
  addLine('[ Type NEXT to continue ]', 'warning');
  setCurrentInputHandler(() => {
    setCurrentInputHandler(null);
    completeMission(15);
  });
}
