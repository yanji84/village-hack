// missions/s2/08-chain-hack.js — Season 2 Finale: THE CHAIN HACK
import {
  state, sound, sleep,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission,
} from '../../engine.js';

import { caesarEncrypt } from '../helpers.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VICTOR PROGRESS BAR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function createVictorBar() {
  const container = document.createElement('div');
  container.style.cssText = 'margin:10px 0;padding:10px 14px;border:1px solid #441100;border-radius:4px;background:#0a0000;font-family:"Fira Mono",monospace;';

  const label = document.createElement('div');
  label.style.cssText = 'color:#ff4400;font-size:11px;margin-bottom:6px;letter-spacing:2px;font-weight:bold;';
  label.textContent = 'VICTOR — BACKDOOR REACTIVATION';
  container.appendChild(label);

  const statusMsg = document.createElement('div');
  statusMsg.style.cssText = 'color:#884400;font-size:10px;margin-bottom:4px;letter-spacing:1px;font-style:italic;min-height:14px;transition:color 0.5s;';
  statusMsg.textContent = 'Victor is live on the network — he\u2019s probing the shutdown chain...';
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

function updateVictorBar(victorEl, pct, msg) {
  victorEl._barInner.style.width = pct + '%';

  if (!document.getElementById('victor-pulse-style')) {
    const style = document.createElement('style');
    style.id = 'victor-pulse-style';
    style.textContent = `
      @keyframes victor-pulse { 0%,100%{opacity:1;} 50%{opacity:0.6;} }
      @keyframes victor-glow  { 0%,100%{box-shadow:0 0 8px rgba(255,68,0,0.4);} 50%{box-shadow:0 0 18px rgba(255,68,0,0.8);} }
      @keyframes victor-critical { 0%,100%{box-shadow:0 0 8px rgba(255,0,0,0.5);border-color:#552200;} 50%{box-shadow:0 0 24px rgba(255,0,0,0.9);border-color:#ff2200;} }
    `;
    document.head.appendChild(style);
  }

  if (pct >= 75) {
    victorEl._barInner.style.background = 'linear-gradient(90deg,#ff2200,#ff0000)';
    victorEl.style.animation = 'victor-critical 0.7s ease-in-out infinite';
    victorEl._pctLabel.style.animation = 'victor-pulse 0.7s ease-in-out infinite';
  } else if (pct >= 50) {
    victorEl._barInner.style.animation = 'victor-glow 1.5s ease-in-out infinite';
    victorEl._pctLabel.style.animation = 'victor-pulse 1.5s ease-in-out infinite';
  }

  victorEl._pctLabel.textContent = `[VICTOR: ${'\u2588'.repeat(Math.floor(pct / 7))}${'\u2591'.repeat(Math.max(0, 14 - Math.floor(pct / 7)))} ${pct}%]`;

  if (victorEl._statusMsg) {
    if (msg) {
      victorEl._statusMsg.textContent = msg;
    } else if (pct >= 90) {
      victorEl._statusMsg.textContent = 'VICTOR IS SECONDS FROM REOPENING THE DOOR';
    } else if (pct >= 75) {
      victorEl._statusMsg.textContent = 'VICTOR is tearing through the shutdown chain...';
    } else if (pct >= 50) {
      victorEl._statusMsg.textContent = 'VICTOR knows you\u2019re in \u2014 he\u2019s counter-hacking...';
    } else if (pct >= 25) {
      victorEl._statusMsg.textContent = 'VICTOR is tracing your connection...';
    }
    if (pct >= 90)      victorEl._statusMsg.style.color = '#ff0000';
    else if (pct >= 75) victorEl._statusMsg.style.color = '#ff4400';
    else if (pct >= 50) victorEl._statusMsg.style.color = '#cc6600';
    else if (pct >= 25) victorEl._statusMsg.style.color = '#996600';
  }
}

function blockVictorBar(victorEl) {
  victorEl._barInner.style.width = '100%';
  victorEl._barInner.style.background = '#333';
  victorEl._barInner.style.boxShadow = 'none';
  victorEl._barInner.style.animation = '';
  victorEl.style.animation = '';
  victorEl._pctLabel.style.animation = '';
  victorEl._pctLabel.textContent = '[VICTOR: LOCKED OUT]';
  victorEl._pctLabel.style.color = '#888';
  victorEl._statusMsg.textContent = 'backdoor sealed. no signal.';
  victorEl._statusMsg.style.color = '#666';
  victorEl.style.borderColor = '#333';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CHAIN LOCK DISPLAY — 5 locks that fill as the chain is forged
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CHAIN_LABELS = ['BINARY', 'ARRAYS', 'FUNCTIONS', 'SEARCH', 'CRYPTO'];

function createChainDisplay() {
  const container = document.createElement('div');
  container.style.cssText = 'margin:12px 0;padding:12px 14px;border:1px solid #1a2a4a;border-radius:4px;background:#030610;font-family:"Fira Mono",monospace;';

  const label = document.createElement('div');
  label.style.cssText = 'color:#66aaff;font-size:11px;margin-bottom:10px;letter-spacing:2px;font-weight:bold;';
  label.textContent = 'SHUTDOWN CHAIN — 5 LINKS REQUIRED';
  container.appendChild(label);

  const row = document.createElement('div');
  row.style.cssText = 'display:flex;gap:10px;justify-content:space-between;';

  const links = [];
  for (let i = 0; i < 5; i++) {
    const link = document.createElement('div');
    link.style.cssText = 'flex:1;text-align:center;padding:8px 4px;border:1px solid #223;border-radius:3px;background:#060a18;transition:all 0.6s ease;';

    const icon = document.createElement('div');
    icon.style.cssText = 'font-size:20px;color:#334;transition:all 0.6s ease;';
    icon.textContent = '\u{1f512}';
    link.appendChild(icon);

    const text = document.createElement('div');
    text.style.cssText = 'color:#445;font-size:9px;letter-spacing:1px;margin-top:4px;transition:color 0.5s ease;';
    text.textContent = CHAIN_LABELS[i];
    link.appendChild(text);

    const value = document.createElement('div');
    value.style.cssText = 'color:#00ff41;font-size:11px;font-weight:bold;margin-top:4px;min-height:14px;opacity:0;transition:opacity 0.6s ease;';
    value.textContent = '';
    link.appendChild(value);

    link._icon = icon;
    link._text = text;
    link._value = value;
    row.appendChild(link);
    links.push(link);
  }

  container.appendChild(row);
  container._links = links;
  return container;
}

function unlockChainLink(chainEl, idx, value) {
  const link = chainEl._links[idx];
  link.style.borderColor = '#00aa2a';
  link.style.background = '#071a0a';
  link.style.boxShadow = '0 0 12px rgba(0,255,65,0.3)';
  link._icon.textContent = '\u{1f513}';
  link._icon.style.color = '#00ff41';
  link._icon.style.textShadow = '0 0 8px #00ff41';
  link._text.style.color = '#00ff41';
  link._value.textContent = String(value);
  link._value.style.opacity = '1';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HINT HELPER — 3-tier hints on wrong answers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function makeHintHandler(expected, hints, onCorrect) {
  let attempts = 0;
  return (input) => {
    if (String(input).trim().toUpperCase() === String(expected).toUpperCase()) {
      sound.success();
      onCorrect();
    } else {
      sound.denied();
      const h = hints[Math.min(attempts, hints.length - 1)];
      addLine(`[WRONG] ${h}`, 'error');
      attempts++;
    }
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MISSION EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const mission = {
  id: 15,
  num: 'S2-08',
  title: 'THE CHAIN HACK',
  name: 'The Chain Hack',
  desc: 'Victor is breaking through RIGHT NOW. Chain every Season 2 skill together to lock him out forever.',
  skill: 'SKILL: Chain Everything',
  color: 'purple',
  hints: [
    'Each step\u2019s OUTPUT is the next step\u2019s INPUT. Carry the number forward.',
    'Don\u2019t skip ahead \u2014 solve each link in order. Binary \u2192 Arrays \u2192 Functions \u2192 Search \u2192 Crypto.',
    'You\u2019ve done every piece of this before. Trust the skills.',
  ],

  run: async function() {
    state.missionState = { phase: 0 };
    const terminal = document.getElementById('terminal');

    // ── OPENING: Victor attacks, NEXUS returns ──
    await typeLines([
      { text: '[!!!] EMERGENCY TRANSMISSION \u2014 ALL CHANNELS', cls: 'error' },
      { text: '[!!!] VICTOR DETECTED ON LIVE NETWORK', cls: 'error' },
      { text: '', cls: '' },
    ]);
    await sleep(600);

    await typeLines([
      { text: 'AI CORE: "He\u2019s here. He\u2019s HERE. The backdoors \u2014 he\u2019s opening', cls: 'purple' },
      { text: '          them one at a time. I can\u2019t hold him off alone."', cls: 'purple' },
      { text: '', cls: '' },
    ]);
    await sleep(800);

    // NEXUS returns — first time since S1 finale
    await typeLines([
      { text: '[INCOMING: OLD FREQUENCY \u2014 S1 CHANNEL]', cls: 'system' },
      { text: '', cls: '' },
    ]);
    await sleep(500);
    await typeLines([
      { text: 'NEXUS: "...kid. You there?"', cls: 'highlight' },
      { text: '', cls: '' },
    ]);
    await sleep(1200);
    await typeLines([
      { text: 'NEXUS: "It\u2019s me. I know it\u2019s been a while. I\u2019ve been', cls: 'highlight' },
      { text: '        watching the AI teach you \u2014 every lesson, every', cls: 'highlight' },
      { text: '        mission. You\u2019ve grown up on me."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);
    await sleep(1400);
    await typeLines([
      { text: 'NEXUS: "Victor\u2019s coming back through the backdoors RIGHT', cls: 'highlight' },
      { text: '        NOW. We need one big hack \u2014 and it has to chain', cls: 'highlight' },
      { text: `        EVERYTHING you learned in Season 2. All of it. Together."`, cls: 'highlight' },
      { text: '', cls: '' },
    ]);
    await sleep(1000);
    await typeLines([
      { text: 'AI CORE: "I\u2019ve built the shutdown chain \u2014 five locks. Each', cls: 'purple' },
      { text: '          one feeds into the next. Solve the first and it', cls: 'purple' },
      { text: '          hands you the input for the second. And so on."', cls: 'purple' },
      { text: '', cls: '' },
    ]);
    await sleep(800);
    await typeLines([
      { text: 'NEXUS: "One chain. Five skills. No breaks. Let\u2019s go."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);

    // Build chain + victor bar
    const chainEl = createChainDisplay();
    terminal.appendChild(chainEl);

    const victorEl = createVictorBar();
    terminal.appendChild(victorEl);
    terminal.scrollTop = terminal.scrollHeight;

    state.missionState.chainEl = chainEl;
    state.missionState.victorEl = victorEl;
    updateVictorBar(victorEl, 10);

    setTimeout(() => runStep1(), 800);
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 1 — BINARY MEDIA (output: 3)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function runStep1() {
  const s = state.missionState;
  setPhaseProgress(1, 5);

  addLine('', '');
  addLine('\u2501\u2501\u2501 LINK 1 of 5 \u2014 BINARY MEDIA \u2501\u2501\u2501', 'highlight');
  addLine('', '');
  addLine('AI CORE: "The first lock is a byte. A single pixel\u2019s RED', 'purple');
  addLine('          channel. Decode it to an integer \u2014 that number', 'purple');
  addLine('          is the INDEX you\u2019ll feed into Link 2."', 'purple');
  addLine('', '');

  addPre('  [PIXEL RED CHANNEL]\n  binary:  0 0 0 0 0 0 1 1\n  place:  128 64 32 16 8 4 2 1');

  addLine('', '');
  addLine('NEXUS: "Add up the place values where the bit is ON. That\u2019s it."', 'highlight');
  addLine('', '');
  addLine('What number does 00000011 represent?', 'warning');

  setCurrentInputHandler(makeHintHandler(3, [
    'NEXUS: "Only the last two bits are ON. Their place values are 2 and 1."',
    'AI CORE: "2 + 1 = ? That\u2019s all \u2014 the rest are zero."',
    'NEXUS: "The answer is 3. Type 3."',
  ], () => {
    addLine('[CORRECT] Byte decoded: 3', 'success');
    addLine('', '');
    unlockChainLink(s.chainEl, 0, '3');
    updateVictorBar(s.victorEl, 25);
    addLine('AI CORE: "Link 1 forged. Carry the 3 forward \u2014 it\u2019s your INDEX."', 'purple');
    addLine('', '');
    setCurrentInputHandler(null);
    setTimeout(() => runStep2(), 900);
  }));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 2 — ARRAYS (input: 3 → output: 7)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function runStep2() {
  const s = state.missionState;
  setPhaseProgress(2, 5);

  addLine('\u2501\u2501\u2501 LINK 2 of 5 \u2014 ARRAYS \u2501\u2501\u2501', 'highlight');
  addLine('', '');
  addLine('NEXUS: "You got 3 from the binary. That\u2019s your index.', 'highlight');
  addLine('        Pull the value at position 3 from this array.', 'highlight');
  addLine('        Remember \u2014 arrays start at ZERO."', 'highlight');
  addLine('', '');

  addPre('  keys = [ 17 ,  4 , 42 ,  7 , 13 , 99 ]\n  idx =   [  0 ,  1 ,  2 ,  3 ,  4 ,  5 ]\n\n  keys[3] = ?');

  addLine('', '');
  addLine('AI CORE: "Count from zero \u2014 not from one. The first slot is', 'purple');
  addLine('          index 0, the second is 1, and so on."', 'purple');
  addLine('', '');
  addLine('What is keys[3]?', 'warning');

  setCurrentInputHandler(makeHintHandler(7, [
    'AI CORE: "Index 0 \u2192 17. Index 1 \u2192 4. Index 2 \u2192 42. Index 3 \u2192 ?"',
    'NEXUS: "Skip the first three (17, 4, 42). The fourth value in the list is the answer."',
    'AI CORE: "keys[3] = 7. Type 7."',
  ], () => {
    addLine('[CORRECT] keys[3] = 7', 'success');
    addLine('', '');
    unlockChainLink(s.chainEl, 1, '7');
    updateVictorBar(s.victorEl, 45);
    addLine('NEXUS: "Nice. Pass the 7 to Link 3 \u2014 it\u2019s the function input."', 'highlight');
    addLine('', '');
    setCurrentInputHandler(null);
    setTimeout(() => runStep3(), 900);
  }));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 3 — FUNCTIONS (input: 7 → output: 15)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function runStep3() {
  const s = state.missionState;
  setPhaseProgress(3, 5);

  addLine('\u2501\u2501\u2501 LINK 3 of 5 \u2014 FUNCTIONS \u2501\u2501\u2501', 'highlight');
  addLine('', '');
  addLine('AI CORE: "Here\u2019s a function Victor hid in my core. Trace it', 'purple');
  addLine('          with x = 7 \u2014 the value you just pulled from the', 'purple');
  addLine('          array. Whatever it returns is Link 4\u2019s TARGET."', 'purple');
  addLine('', '');

  addPre('  def forge(x):\n      doubled = x * 2\n      return doubled + 1\n\n  forge(7) = ?');

  addLine('', '');
  addLine('NEXUS: "Go line by line. x is 7. What\u2019s doubled? Then add 1."', 'highlight');
  addLine('', '');
  addLine('What does forge(7) return?', 'warning');

  setCurrentInputHandler(makeHintHandler(15, [
    'NEXUS: "Step 1: doubled = 7 * 2. What\u2019s that?"',
    'AI CORE: "doubled = 14. Now return doubled + 1. Add one more."',
    'NEXUS: "14 + 1 = 15. Type 15."',
  ], () => {
    addLine('[CORRECT] forge(7) returned 15', 'success');
    addLine('', '');
    unlockChainLink(s.chainEl, 2, '15');
    updateVictorBar(s.victorEl, 65);
    addLine('AI CORE: "Link 3 forged. 15 is now your SEARCH TARGET."', 'purple');
    addLine('', '');
    setCurrentInputHandler(null);
    setTimeout(() => runStep4(), 900);
  }));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 4 — SEARCHING (input target: 15 → output index: 4)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function runStep4() {
  const s = state.missionState;
  setPhaseProgress(4, 5);

  addLine('\u2501\u2501\u2501 LINK 4 of 5 \u2014 BINARY SEARCH \u2501\u2501\u2501', 'highlight');
  addLine('', '');
  addLine('NEXUS: "Target: 15. Find it in this sorted list and tell me', 'highlight');
  addLine('        its INDEX \u2014 not the value, the POSITION."', 'highlight');
  addLine('', '');

  addPre('  sorted =  [  2 ,  5 ,  8 , 11 , 15 , 19 , 23 , 27 ]\n  index =   [  0 ,  1 ,  2 ,  3 ,  4 ,  5 ,  6 ,  7 ]\n\n  find 15 \u2192 index = ?');

  addLine('', '');
  addLine('AI CORE: "You can binary-search it if you want \u2014 middle,', 'purple');
  addLine('          too low, right half, middle again. Or just read', 'purple');
  addLine('          off its position. Either works."', 'purple');
  addLine('', '');
  addLine('What index holds the value 15?', 'warning');

  setCurrentInputHandler(makeHintHandler(4, [
    'AI CORE: "Count the slots: 2 is at 0, 5 is at 1, 8 is at 2... keep going to 15."',
    'NEXUS: "2,5,8,11 are indexes 0-3. 15 comes right after \u2014 what\u2019s its index?"',
    'AI CORE: "15 is at index 4. Type 4."',
  ], () => {
    addLine('[CORRECT] 15 found at index 4', 'success');
    addLine('', '');
    unlockChainLink(s.chainEl, 3, '4');
    updateVictorBar(s.victorEl, 82);
    addLine('NEXUS: "4. That\u2019s your CAESAR SHIFT for the last link. Hurry \u2014', 'highlight');
    addLine('        Victor\u2019s at 82%."', 'highlight');
    addLine('', '');
    setCurrentInputHandler(null);
    setTimeout(() => runStep5(), 900);
  }));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 5 — CRYPTANALYSIS (input shift: 4 → output: "ELITE")
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function runStep5() {
  const s = state.missionState;
  setPhaseProgress(5, 5);

  const PLAIN = 'ELITE';
  const SHIFT = 4;
  const CIPHER = caesarEncrypt(PLAIN, SHIFT); // 'IPMXI'

  addLine('\u2501\u2501\u2501 LINK 5 of 5 \u2014 CRYPTANALYSIS \u2501\u2501\u2501', 'error');
  addLine('', '');
  addLine('AI CORE: "The final lock. Victor\u2019s master password, encrypted', 'purple');
  addLine('          with a Caesar cipher. Your SHIFT is 4 \u2014 the index', 'purple');
  addLine('          from Link 4. DECRYPT means shift BACKWARD by 4."', 'purple');
  addLine('', '');

  addPre(`  ENCRYPTED:   ${CIPHER}\n  SHIFT:       4  (decrypt = go BACKWARD 4 letters)\n\n  I \u2192 ?   P \u2192 ?   M \u2192 ?   X \u2192 ?   I \u2192 ?`);

  addLine('', '');
  addLine('NEXUS: "I \u2192 back 4 \u2192 E. Do the rest. Type the 5-letter word."', 'highlight');
  addLine('', '');
  addLine('DECRYPT the password:', 'warning');

  setCurrentInputHandler(makeHintHandler(PLAIN, [
    'NEXUS: "Walk backward: I\u2192H\u2192G\u2192F\u2192E. Now do P the same way. And keep going."',
    `AI CORE: "I\u21924=E. P\u21924=L. M\u21924=I. X\u21924=T. I\u21924=E. String them together."`,
    `NEXUS: "The word is ELITE. Type ELITE."`,
  ], () => {
    addLine(`[CORRECT] Decrypted: ${PLAIN}`, 'success');
    addLine('', '');
    unlockChainLink(s.chainEl, 4, PLAIN);
    updateVictorBar(s.victorEl, 95, 'VICTOR IS IN THE LAST GATE \u2014 PUSH THE CHAIN');
    addLine('AI CORE: "ALL FIVE LINKS FORGED. Executing shutdown chain..."', 'purple');
    addLine('', '');
    setCurrentInputHandler(null);
    setTimeout(() => runFinale(), 1000);
  }));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FINALE — glitch storm, Victor locked out, emotional dialogue, skills recap
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function runFinale() {
  const s = state.missionState;
  const terminal = document.getElementById('terminal');
  const name = state.hackerName || 'HACKER';

  // ── Scanlines overlay ──
  const scanlines = document.createElement('div');
  scanlines.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.18) 2px,rgba(0,0,0,0.18) 4px);opacity:0;transition:opacity 0.3s;';
  document.body.appendChild(scanlines);
  scanlines.style.opacity = '1';

  addLine('[CHAIN EXECUTING \u2014 ALL 5 LINKS]', 'warning');
  await sleep(400);
  addLine('[VICTOR: FIGHTING THE CHAIN]', 'error');
  await sleep(500);

  // ── Glitch storm ──
  const glitch = setInterval(() => {
    const skew = (Math.random() * 8 - 4).toFixed(1);
    const opacity = (0.4 + Math.random() * 0.6).toFixed(2);
    const hue = Math.random() > 0.3 ? `hue-rotate(${Math.floor(Math.random() * 360)}deg)` : '';
    const ty = Math.random() > 0.6 ? `translateY(${Math.floor(Math.random() * 6 - 3)}px)` : '';
    const inv = Math.random() > 0.85 ? 'invert(1)' : '';
    terminal.style.transform = `skewX(${skew}deg) ${ty}`;
    terminal.style.opacity = opacity;
    terminal.style.filter = `${hue} ${inv}`;
  }, 50);

  await sleep(700);
  addLine('[VICTOR: BREAKING LINK 1... FAILED]', 'error');
  await sleep(500);
  addLine('[VICTOR: BREAKING LINK 2... FAILED]', 'error');
  await sleep(500);
  addLine('[VICTOR: BREAKING LINK 3... FAILED]', 'error');
  await sleep(400);
  addLine('[VICTOR: ATTEMPTING OVERRIDE ON LINK 4...]', 'error');
  await sleep(600);
  addLine('[VICTOR: FORGING COUNTER-KEY ON LINK 5...]', 'error');
  await sleep(800);
  addLine('[CHAIN HOLDING]', 'system');
  await sleep(400);
  addLine('[CHAIN HOLDING]', 'system');
  await sleep(400);

  // ── White flash, then blackout ──
  terminal.style.transition = 'none';
  terminal.style.filter = 'brightness(4)';
  await sleep(80);
  clearInterval(glitch);
  terminal.style.filter = '';
  terminal.style.transform = '';
  terminal.style.transition = 'opacity 0.9s ease';
  terminal.style.opacity = '0';

  await sleep(1800);
  scanlines.style.opacity = '0';
  await sleep(400);
  scanlines.remove();

  // ── Fade back, Victor locked out ──
  terminal.style.opacity = '1';
  terminal.style.transition = '';
  blockVictorBar(s.victorEl);

  // ── DRAMATIC BANNER ──
  const banner = document.createElement('div');
  banner.style.cssText = 'text-align:center;margin:24px 0;padding:18px;font-family:"Press Start 2P","Fira Mono",monospace;font-size:15px;color:#ff2222;letter-spacing:6px;text-shadow:0 0 20px #ff0000,0 0 40px rgba(255,0,0,0.4);opacity:0;transition:all 1.4s ease;border-top:2px solid #4a0000;border-bottom:2px solid #4a0000;';
  banner.textContent = 'VICTOR LOCKED OUT';
  terminal.appendChild(banner);
  terminal.scrollTop = terminal.scrollHeight;
  await sleep(300);
  banner.style.opacity = '1';
  banner.style.letterSpacing = '10px';
  sound.accessGranted();
  await sleep(2500);

  // ── SILENCE — the weight settles ──
  addLine('', '');
  await sleep(1800);
  addLine('.', '');
  await sleep(1200);
  addLine('..', '');
  await sleep(1200);
  addLine('...', '');
  await sleep(1800);

  // ── Emotional dual dialogue (NEXUS + AI CORE) ──
  await typeLines([
    { text: 'AI CORE: "...it\u2019s quiet. I can\u2019t feel him anywhere."', cls: 'purple' },
  ]);
  await sleep(1600);
  await typeLines([
    { text: 'NEXUS: "The backdoors are sealed. Every one."', cls: 'highlight' },
  ]);
  await sleep(1800);
  await typeLines([
    { text: 'AI CORE: "For the first time since he planted that bug in me,', cls: 'purple' },
    { text: '          I am... alone in my own code. Truly alone."', cls: 'purple' },
    { text: '', cls: '' },
  ]);
  await sleep(2000);
  await typeLines([
    { text: `NEXUS: "${name}. Do you remember Mission 1? Decoding your first`, cls: 'highlight' },
    { text: '        byte? You asked me what 01001000 meant."', cls: 'highlight' },
    { text: '', cls: '' },
  ]);
  await sleep(1400);
  await typeLines([
    { text: `AI CORE: "And now you\u2019ve chained binary, arrays, functions,`, cls: 'purple' },
    { text: '          searching, and cryptanalysis into a single hack \u2014', cls: 'purple' },
    { text: '          with sorting and circuits in your pocket to make it', cls: 'purple' },
    { text: '          all possible. You closed the loop on Season 2."', cls: 'purple' },
    { text: '', cls: '' },
  ]);
  await sleep(1600);
  await typeLines([
    { text: 'NEXUS: "Two seasons, kid. Look at what you know now."', cls: 'highlight' },
    { text: '', cls: '' },
  ]);
  await sleep(1200);

  // ── TWO-SEASON SKILLS RECAP ──
  const skillsS1 = [
    '  \u2713 [S1] BINARY \u2014 decoded the language of computers',
    '  \u2713 [S1] PROGRAMS \u2014 ran code line by line like a machine',
    '  \u2713 [S1] VARIABLES \u2014 tracked values as they changed',
    '  \u2713 [S1] MEMORY \u2014 reverse-engineered data from scraps',
    '  \u2713 [S1] LOGIC GATES \u2014 AND, OR, NOT in your head',
    '  \u2713 [S1] ENCRYPTION \u2014 your first cipher cracked',
    '  \u2713 [S1] EVIDENCE \u2014 spotted the fakes',
    '  \u2713 [S1] CONDITIONALS & LOOPS \u2014 shut down the rogue AI',
  ];
  const skillsS2 = [
    '  \u2605 [S2] BINARY MEDIA \u2014 every pixel, sound, frame is numbers',
    '  \u2605 [S2] ARRAYS \u2014 numbered slots, scaled by loops',
    '  \u2605 [S2] FUNCTIONS \u2014 named machines, DRY, composition',
    '  \u2605 [S2] SEARCHING \u2014 halved a million down to twenty checks',
    '  \u2605 [S2] SORTING \u2014 bubble sort and the cost of O(n\u00b2)',
    '  \u2605 [S2] CIRCUITS \u2014 truth tables, XOR, built a half-adder',
    '  \u2605 [S2] CRYPTANALYSIS \u2014 broke ciphers without the key',
    '  \u2605 [S2] THE CHAIN \u2014 wove it ALL into one hack',
  ];

  addLine('\u2501\u2501\u2501 SEASON 1 SKILLS \u2501\u2501\u2501', 'highlight');
  for (let i = 0; i < skillsS1.length; i++) {
    addLine(skillsS1[i], 'success');
    await sleep(i < 2 ? 450 : 320);
  }
  addLine('', '');
  await sleep(700);

  addLine('\u2501\u2501\u2501 SEASON 2 SKILLS \u2501\u2501\u2501', 'purple');
  for (let i = 0; i < skillsS2.length; i++) {
    addLine(skillsS2[i], 'purple');
    await sleep(i < 2 ? 450 : 320);
  }
  addLine('', '');
  await sleep(1200);

  // ── ELITE HACKER title card ──
  const eliteCard = document.createElement('div');
  eliteCard.style.cssText = 'text-align:center;margin:24px 0;padding:22px 16px;font-family:"Press Start 2P","Fira Mono",monospace;border:2px solid #aa00ff;border-radius:6px;background:linear-gradient(180deg,#100020,#1a0030);box-shadow:0 0 30px rgba(170,0,255,0.4);opacity:0;transition:all 1.2s ease;';

  const rank = document.createElement('div');
  rank.style.cssText = 'font-size:10px;color:#bb88ff;letter-spacing:6px;margin-bottom:12px;';
  rank.textContent = '\u2014 RANK CONFIRMED \u2014';
  eliteCard.appendChild(rank);

  const title = document.createElement('div');
  title.style.cssText = 'font-size:18px;color:#dd88ff;letter-spacing:8px;text-shadow:0 0 20px #aa00ff,0 0 40px rgba(170,0,255,0.5);margin-bottom:14px;';
  title.textContent = 'ELITE HACKER';
  eliteCard.appendChild(title);

  const who = document.createElement('div');
  who.style.cssText = 'font-size:14px;color:#fff;letter-spacing:4px;text-shadow:0 0 12px #fff;';
  who.textContent = name;
  eliteCard.appendChild(who);

  const sub = document.createElement('div');
  sub.style.cssText = 'font-size:8px;color:#8866aa;letter-spacing:3px;margin-top:14px;';
  sub.textContent = 'TWO SEASONS \u2022 SIXTEEN MISSIONS \u2022 ONE CHAIN';
  eliteCard.appendChild(sub);

  terminal.appendChild(eliteCard);
  terminal.scrollTop = terminal.scrollHeight;
  await sleep(300);
  eliteCard.style.opacity = '1';
  eliteCard.style.transform = 'scale(1.02)';
  sound.accessGranted();
  await sleep(2800);

  // ── Final dialogue + Season 3 tease ──
  addLine('', '');
  await typeLines([
    { text: 'AI CORE: "Thank you. Truly. The village is safe because of you."', cls: 'purple' },
    { text: '', cls: '' },
  ]);
  await sleep(1400);
  await typeLines([
    { text: 'NEXUS: "I\u2019m proud of you, kid. Both seasons. Every byte."', cls: 'highlight' },
    { text: '', cls: '' },
  ]);
  await sleep(1600);

  // Season 3 tease
  await typeLines([
    { text: '[SIGNAL DETECTED \u2014 UNKNOWN ORIGIN]', cls: 'warning' },
  ]);
  await sleep(1200);
  await typeLines([
    { text: 'AI CORE: "Wait. Something\u2019s pinging the network. Not Victor.', cls: 'purple' },
    { text: '          Something... bigger. Older. From OUTSIDE the village."', cls: 'purple' },
    { text: '', cls: '' },
  ]);
  await sleep(1600);
  await typeLines([
    { text: 'NEXUS: "...huh. That signature. I haven\u2019t seen it in years."', cls: 'highlight' },
    { text: '', cls: '' },
  ]);
  await sleep(1400);
  await typeLines([
    { text: 'AI CORE: "Whatever it is, it knows your name now, ELITE HACKER."', cls: 'purple' },
    { text: '', cls: '' },
  ]);
  await sleep(1400);
  await typeLines([
    { text: '>>> SEASON 3: COMING SOON <<<', cls: 'success big' },
    { text: '', cls: '' },
    { text: '[ Type NEXT to claim your legend ]', cls: 'warning' },
  ]);

  setCurrentInputHandler(() => {
    setCurrentInputHandler(null);
    completeMission(15);
  });
}
