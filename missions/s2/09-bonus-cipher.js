// missions/s2/09-bonus-cipher.js — BONUS: BUILD YOUR OWN CIPHER
import {
  state, sound, sleep, $,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission, escHtml,
} from '../../engine.js';
import { caesarEncrypt } from '../helpers.js';

export const mission = {
  id: 16,
  num: 'BONUS',
  title: 'BUILD YOUR OWN CIPHER',
  name: 'Build Your Own Cipher',
  desc: 'You\'ve been breaking ciphers since Season 1. Now you WRITE one. Build a working Caesar cipher encoder from scratch.',
  skill: 'SKILL: Writing Real Code',
  color: 'gold',
  hints: [
    'Phase 1: You need to set up three variables — the message text, the shift number, and an empty string for the result.',
    'Phase 2: A for loop goes through each letter. Try: for letter in message',
    'Phase 3: Convert a letter to a number (A=0), add the shift, use % 26 to wrap, then convert back to a letter.',
  ],
  run: async function() {
    state.missionState = { phase: 0, editorLines: {}, attempts: {} };
    await introSequence();
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CODE EDITOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let editorContainer = null;
let editorLineEls = {};
let editorInputEls = {};
let runBtn = null;

const PROGRAM_LINES = [
  { num: 1, id: 'var_message',   template: null,         placeholder: 'message = ___' },
  { num: 2, id: 'var_shift',     template: null,         placeholder: 'shift = ___' },
  { num: 3, id: 'var_result',    template: null,         placeholder: 'result = ___' },
  { num: 4, id: 'loop',          template: null,         placeholder: 'for ___ in ___:' },
  { num: 5, id: 'code_pos',      template: null,         placeholder: '    code = ___' },
  { num: 6, id: 'new_code',      template: null,         placeholder: '    new_code = ___' },
  { num: 7, id: 'new_letter',    template: null,         placeholder: '    new_letter = ___' },
  { num: 8, id: 'append',        template: null,         placeholder: '    result = ___' },
  { num: 9, id: 'print',         template: 'print(result)', placeholder: null },
];

function buildEditor(terminal) {
  editorContainer = document.createElement('div');
  editorContainer.style.cssText = `
    margin: 12px 0;
    background: #0c0c1a;
    border: 1px solid #1a3a1a;
    border-radius: 6px;
    padding: 16px 12px;
    font-family: 'Fira Mono', monospace;
    font-size: 14px;
    position: relative;
    box-shadow: 0 0 20px rgba(0,255,65,0.05), inset 0 0 40px rgba(0,0,0,0.5);
  `;

  // Editor header bar
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #1a2a1a;
  `;
  // Fake window dots
  const dots = document.createElement('div');
  dots.style.cssText = 'display:flex;gap:6px;';
  ['#ff5f56','#ffbd2e','#27c93f'].forEach(c => {
    const dot = document.createElement('span');
    dot.style.cssText = `width:10px;height:10px;border-radius:50%;background:${c};opacity:0.8;`;
    dots.appendChild(dot);
  });
  header.appendChild(dots);
  const title = document.createElement('span');
  title.textContent = 'cipher.py';
  title.style.cssText = 'color:#666;font-size:12px;margin-left:12px;letter-spacing:1px;';
  header.appendChild(title);
  editorContainer.appendChild(header);

  // Lines area
  const linesArea = document.createElement('div');
  linesArea.style.cssText = 'display:flex;flex-direction:column;gap:2px;';

  PROGRAM_LINES.forEach(line => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;min-height:28px;';

    // Line number
    const numEl = document.createElement('span');
    numEl.textContent = String(line.num).padStart(2, ' ');
    numEl.style.cssText = 'color:#444;font-size:12px;width:28px;text-align:right;margin-right:12px;user-select:none;flex-shrink:0;';
    row.appendChild(numEl);

    // Code content area
    const codeEl = document.createElement('span');
    codeEl.style.cssText = 'flex:1;color:#555;font-size:14px;line-height:1.6;';

    if (line.template) {
      // Pre-filled line (like print)
      codeEl.textContent = line.template;
      codeEl.style.color = '#00cc88';
    } else if (line.placeholder) {
      codeEl.textContent = line.placeholder;
    }

    row.appendChild(codeEl);
    linesArea.appendChild(row);
    editorLineEls[line.id] = { row, codeEl, numEl };
  });

  editorContainer.appendChild(linesArea);

  // RUN button (hidden initially)
  runBtn = document.createElement('button');
  runBtn.textContent = '[ RUN ]';
  runBtn.style.cssText = `
    display: none;
    margin-top: 16px;
    padding: 8px 24px;
    background: #001a00;
    border: 1px solid var(--green);
    color: var(--green);
    font-family: 'Fira Mono', monospace;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    border-radius: 4px;
    letter-spacing: 2px;
    transition: background 0.3s, box-shadow 0.3s;
  `;
  runBtn.addEventListener('mouseenter', () => {
    runBtn.style.background = '#003300';
    runBtn.style.boxShadow = '0 0 15px rgba(0,255,65,0.3)';
  });
  runBtn.addEventListener('mouseleave', () => {
    runBtn.style.background = '#001a00';
    runBtn.style.boxShadow = 'none';
  });
  editorContainer.appendChild(runBtn);

  terminal.appendChild(editorContainer);
  terminal.scrollTop = terminal.scrollHeight;
}

function lockLine(lineId, code, indent = false) {
  const el = editorLineEls[lineId];
  if (!el) return;
  const prefix = indent ? '    ' : '';
  el.codeEl.textContent = prefix + code;
  el.codeEl.style.color = '#00ff41';
  el.codeEl.style.textShadow = '0 0 8px rgba(0,255,65,0.4)';
  // Brief flash animation
  el.row.style.background = 'rgba(0,255,65,0.08)';
  setTimeout(() => { el.row.style.background = 'none'; }, 800);
}

function highlightLine(lineId) {
  const el = editorLineEls[lineId];
  if (!el) return;
  el.numEl.style.color = '#00ffff';
  el.codeEl.style.color = '#00ffff';
  el.row.style.background = 'rgba(0,255,255,0.04)';
}

function dimLine(lineId) {
  const el = editorLineEls[lineId];
  if (!el) return;
  el.numEl.style.color = '#444';
  el.codeEl.style.color = '#555';
  el.row.style.background = 'none';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VALIDATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function normalize(s) {
  return s.replace(/\s+/g, '').replace(/['"]/g, '"').toLowerCase();
}

function validateVarMessage(input) {
  const n = normalize(input);
  // Accept: message = "HELLO", message="HELLO", message = 'HELLO', etc.
  return /message\s*=\s*["']HELLO["']/i.test(input.trim());
}

function validateVarShift(input) {
  const n = normalize(input);
  return /shift\s*=\s*3/i.test(input.trim());
}

function validateVarResult(input) {
  const n = normalize(input);
  // Accept: result = "", result = '', result=""
  return /result\s*=\s*["']["']/i.test(input.trim());
}

function validateLoop(input) {
  const n = normalize(input);
  // Accept: for letter in message, for char in message, for c in message, for l in message, for each letter in message
  return /for\s+(each\s+)?\w+\s+in\s+message/i.test(input.trim().replace(/:$/, ''));
}

function validateCodePos(input) {
  const t = input.trim();
  const n = normalize(t);
  // Accept many forms: code = ord(letter) - 65, code = position(letter), code = letter_to_number(letter), code = alphabet.index(letter), etc.
  if (/code\s*=\s*ord\s*\(\s*\w+\s*\)\s*-\s*65/i.test(t)) return true;
  if (/code\s*=\s*position\s*\(\s*\w+\s*\)/i.test(t)) return true;
  if (/code\s*=\s*letter_to_num(ber)?\s*\(\s*\w+\s*\)/i.test(t)) return true;
  if (/code\s*=\s*alphabet\s*\.\s*index\s*\(\s*\w+\s*\)/i.test(t)) return true;
  if (/code\s*=\s*char_to_num(ber)?\s*\(\s*\w+\s*\)/i.test(t)) return true;
  if (/code\s*=\s*\w+\s*-\s*["']?A["']?/i.test(t)) return true;
  if (/code\s*=\s*number\s*\(\s*\w+\s*\)/i.test(t)) return true;
  if (/code\s*=\s*index\s*\(\s*\w+\s*\)/i.test(t)) return true;
  return false;
}

function validateNewCode(input) {
  const t = input.trim();
  // Accept: new_code = (code + shift) % 26, newcode = (code+shift)%26, etc.
  return /new_?code\s*=\s*\(?\s*code\s*\+\s*shift\s*\)?\s*%\s*26/i.test(t);
}

function validateNewLetter(input) {
  const t = input.trim();
  // Accept: new_letter = chr(new_code + 65), new_letter = alphabet[new_code], new_letter = number_to_letter(new_code), etc.
  if (/new_?letter\s*=\s*chr\s*\(\s*new_?code\s*\+\s*65\s*\)/i.test(t)) return true;
  if (/new_?letter\s*=\s*alphabet\s*\[\s*new_?code\s*\]/i.test(t)) return true;
  if (/new_?letter\s*=\s*num(ber)?_to_letter\s*\(\s*new_?code\s*\)/i.test(t)) return true;
  if (/new_?letter\s*=\s*to_letter\s*\(\s*new_?code\s*\)/i.test(t)) return true;
  if (/new_?letter\s*=\s*char\s*\(\s*new_?code\s*\+\s*65\s*\)/i.test(t)) return true;
  if (/new_?letter\s*=\s*letter\s*\(\s*new_?code\s*\)/i.test(t)) return true;
  if (/new_?letter\s*=\s*num_to_char\s*\(\s*new_?code\s*\)/i.test(t)) return true;
  return false;
}

function validateAppend(input) {
  const t = input.trim();
  // Accept: result = result + new_letter, result += new_letter, result = result + newletter
  if (/result\s*=\s*result\s*\+\s*new_?letter/i.test(t)) return true;
  if (/result\s*\+=\s*new_?letter/i.test(t)) return true;
  return false;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HINT SYSTEM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const HINTS = {
  var_message: [
    'You need to store the word "HELLO" in a variable called message.',
    'The syntax is: variable_name = value. Strings go in quotes.',
    'Type exactly: message = "HELLO"',
  ],
  var_shift: [
    'The shift tells the cipher how many places to move each letter.',
    'We want to shift by 3, like the original Caesar cipher.',
    'Type exactly: shift = 3',
  ],
  var_result: [
    'You need an empty container to build the encrypted message letter by letter.',
    'An empty string is two quote marks with nothing between them: ""',
    'Type exactly: result = ""',
  ],
  loop: [
    'You need to go through each letter in the message, one at a time.',
    'In Python, a for loop iterates over something. "for ___ in ___"',
    'Type: for letter in message',
  ],
  code_pos: [
    'Each letter has a position: A=0, B=1, ... Z=25. You need to get that number.',
    'In Python, ord() gives a character\'s number. ord("A") is 65, so subtract 65 to get A=0.',
    'Type: code = ord(letter) - 65',
  ],
  new_code: [
    'Add the shift to the code, then wrap around so Z goes back to A.',
    'The % (modulo) operator wraps numbers around. 27 % 26 = 1.',
    'Type: new_code = (code + shift) % 26',
  ],
  new_letter: [
    'Now convert the number back to a letter. Reverse of what you just did.',
    'chr() converts a number to a character. Add 65 to get back to the A-Z range.',
    'Type: new_letter = chr(new_code + 65)',
  ],
  append: [
    'Add the new encrypted letter to the result string.',
    'String concatenation: you can combine strings with the + operator.',
    'Type: result = result + new_letter',
  ],
};

function getHint(lineId, attempt) {
  const hints = HINTS[lineId];
  if (!hints) return null;
  const idx = Math.min(attempt - 1, hints.length - 1);
  return hints[idx];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTRO SEQUENCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function introSequence() {
  const name = state.hackerName || 'HACKER';

  await typeLines([
    { text: '[AI CORE — PRIORITY CHANNEL]', cls: 'system' },
    { text: '', cls: '' },
    { text: `AI CORE: "${name}. Before you go... I have one more thing.`, cls: 'purple' },
    { text: '          Not a mission. A challenge. For YOU."', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'AI CORE: "In Season 1, you decoded your first Caesar cipher.', cls: 'purple' },
    { text: '          Someone else wrote it. You just cracked it."', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'AI CORE: "In Season 2, you traced code, debugged programs,', cls: 'purple' },
    { text: '          chained algorithms together. But always — someone', cls: 'purple' },
    { text: '          else\'s code."', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'AI CORE: "Now? You write your own."', cls: 'purple' },
    { text: '', cls: '' },
    { text: '   ▶ BONUS MISSION: BUILD YOUR OWN CIPHER', cls: 'success big' },
    { text: '', cls: '' },
    { text: 'AI CORE: "I\'m giving you a code editor. A blank file. You\'re', cls: 'purple' },
    { text: '          going to write a Caesar cipher ENCODER — a program', cls: 'purple' },
    { text: '          that takes a message and encrypts it."', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'AI CORE: "I\'ll guide you, line by line. But YOU type the', cls: 'purple' },
    { text: '          code. Not tracing. Not debugging. WRITING."', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'AI CORE: "Let\'s do this."', cls: 'purple' },
    { text: '', cls: '' },
  ]);

  const terminal = document.getElementById('terminal');
  buildEditor(terminal);
  await sleep(500);
  startPhase1();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHASE 1: VARIABLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function startPhase1() {
  state.missionState.phase = 1;
  state.missionState.p1step = 0;
  state.missionState.attempts = {};

  addLine('', '');
  addLine('╔══════════════════════════════════════════════╗', 'highlight');
  addLine('║   ▶ PHASE 1 of 4 — SET UP YOUR VARIABLES     ║', 'highlight');
  addLine('╚══════════════════════════════════════════════╝', 'highlight');
  addLine('', '');
  addLine('AI CORE: "Every program starts with its data. You need three', 'purple');
  addLine('          things: the message to encrypt, the shift amount,', 'purple');
  addLine('          and an empty string to build the result."', 'purple');
  addLine('', '');
  addLine('AI CORE: "Look at your editor. Lines 1, 2, and 3 are blank.', 'purple');
  addLine('          Fill them in one at a time."', 'purple');
  addLine('', '');

  highlightLine('var_message');
  addLine('   Line 1: Store the word "HELLO" in a variable called message.', 'warning');
  addLine('', '');

  setCurrentInputHandler((input) => handlePhase1(input));
}

function handlePhase1(input) {
  const s = state.missionState;
  const step = s.p1step;

  if (step === 0) {
    // Validate message = "HELLO"
    if (validateVarMessage(input)) {
      sound.success();
      lockLine('var_message', 'message = "HELLO"');
      dimLine('var_message');
      addLine('[LINE 1 LOCKED] message = "HELLO"', 'success');
      addLine('', '');
      s.p1step = 1;
      s.attempts = {};

      highlightLine('var_shift');
      addLine('AI CORE: "Good. Now line 2: the shift. Caesar used 3."', 'purple');
      addLine('', '');
      addLine('   Line 2: Set the shift to 3.', 'warning');
      addLine('', '');
    } else {
      s.attempts.var_message = (s.attempts.var_message || 0) + 1;
      sound.denied();
      const hint = getHint('var_message', s.attempts.var_message);
      addLine(`[NOT QUITE] ${hint}`, 'error');
    }
  } else if (step === 1) {
    if (validateVarShift(input)) {
      sound.success();
      lockLine('var_shift', 'shift = 3');
      dimLine('var_shift');
      addLine('[LINE 2 LOCKED] shift = 3', 'success');
      addLine('', '');
      s.p1step = 2;
      s.attempts = {};

      highlightLine('var_result');
      addLine('AI CORE: "One more. You need an empty container to collect', 'purple');
      addLine('          the encrypted letters as you go."', 'purple');
      addLine('', '');
      addLine('   Line 3: Create an empty string called result.', 'warning');
      addLine('', '');
    } else {
      s.attempts.var_shift = (s.attempts.var_shift || 0) + 1;
      sound.denied();
      const hint = getHint('var_shift', s.attempts.var_shift);
      addLine(`[NOT QUITE] ${hint}`, 'error');
    }
  } else if (step === 2) {
    if (validateVarResult(input)) {
      sound.success();
      lockLine('var_result', 'result = ""');
      dimLine('var_result');
      addLine('[LINE 3 LOCKED] result = ""', 'success');
      addLine('', '');
      addLine('AI CORE: "Variables set. Your data is ready. Phase 1 complete."', 'purple');
      addLine('', '');
      addLine('>>> PHASE 1 COMPLETE <<<', 'success big');
      sound.success();
      s.attempts = {};
      setTimeout(() => startPhase2(), 1500);
    } else {
      s.attempts.var_result = (s.attempts.var_result || 0) + 1;
      sound.denied();
      const hint = getHint('var_result', s.attempts.var_result);
      addLine(`[NOT QUITE] ${hint}`, 'error');
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHASE 2: THE LOOP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function startPhase2() {
  state.missionState.phase = 2;
  state.missionState.attempts = {};

  addLine('', '');
  addLine('╔══════════════════════════════════════════════╗', 'highlight');
  addLine('║   ▶ PHASE 2 of 4 — THE LOOP                  ║', 'highlight');
  addLine('╚══════════════════════════════════════════════╝', 'highlight');
  addLine('', '');
  addLine('AI CORE: "Now the engine. You need to go through each letter,', 'purple');
  addLine('          one at a time. That\'s what a LOOP does."', 'purple');
  addLine('', '');
  addLine('AI CORE: "In Python, it looks like: for something in something."', 'purple');
  addLine('          You want to look at each LETTER in the MESSAGE."', 'purple');
  addLine('', '');

  highlightLine('loop');
  addLine('   Line 4: Write a for-loop that goes through each letter in message.', 'warning');
  addLine('', '');

  setCurrentInputHandler((input) => handlePhase2(input));
}

function handlePhase2(input) {
  const s = state.missionState;

  if (validateLoop(input)) {
    sound.success();
    lockLine('loop', 'for letter in message:');
    dimLine('loop');
    addLine('[LINE 4 LOCKED] for letter in message:', 'success');
    addLine('', '');
    addLine('AI CORE: "The loop is set. It\'ll grab each letter — H, then', 'purple');
    addLine('          E, then L, L, O — one at a time. Phase 2 done."', 'purple');
    addLine('', '');
    addLine('>>> PHASE 2 COMPLETE <<<', 'success big');
    sound.success();
    s.attempts = {};
    setTimeout(() => startPhase3(), 1500);
  } else {
    s.attempts.loop = (s.attempts.loop || 0) + 1;
    sound.denied();
    const hint = getHint('loop', s.attempts.loop);
    addLine(`[NOT QUITE] ${hint}`, 'error');
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHASE 3: THE MATH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function startPhase3() {
  state.missionState.phase = 3;
  state.missionState.p3step = 0;
  state.missionState.attempts = {};

  addLine('', '');
  addLine('╔══════════════════════════════════════════════╗', 'highlight');
  addLine('║   ▶ PHASE 3 of 4 — THE MATH (HEART OF IT)    ║', 'highlight');
  addLine('╚══════════════════════════════════════════════╝', 'highlight');
  addLine('', '');
  addLine('AI CORE: "This is where your Season 1 knowledge pays off.', 'purple');
  addLine('          Remember? Each letter has a number: A=0, B=1, ...', 'purple');
  addLine('          Z=25. Add the shift. Wrap around with % 26."', 'purple');
  addLine('', '');
  addLine('AI CORE: "Four lines inside the loop. This is the hardest', 'purple');
  addLine('          part — but you\'ve already done this math before."', 'purple');
  addLine('', '');
  addPre('   REMINDER:  A=0  B=1  C=2 ... Z=25\n              ord("A") = 65, so ord(letter) - 65 gives position\n              chr(number + 65) converts back to a letter');
  addLine('', '');

  highlightLine('code_pos');
  addLine('   Line 5: Get the letter\'s position number (A=0, B=1, ... Z=25).', 'warning');
  addLine('           Store it in a variable called code.', 'info');
  addLine('', '');

  setCurrentInputHandler((input) => handlePhase3(input));
}

function handlePhase3(input) {
  const s = state.missionState;
  const step = s.p3step;

  if (step === 0) {
    if (validateCodePos(input)) {
      sound.success();
      lockLine('code_pos', 'code = ord(letter) - 65', true);
      dimLine('code_pos');
      addLine('[LINE 5 LOCKED] code = ord(letter) - 65', 'success');
      addLine('', '');
      s.p3step = 1;
      s.attempts = {};

      highlightLine('new_code');
      addLine('AI CORE: "Now the magic formula. Add the shift and wrap."', 'purple');
      addLine('', '');
      addLine('   Line 6: Calculate the new code. Add shift, mod 26 to wrap.', 'warning');
      addLine('           Store it in new_code.', 'info');
      addLine('', '');
    } else {
      s.attempts.code_pos = (s.attempts.code_pos || 0) + 1;
      sound.denied();
      const hint = getHint('code_pos', s.attempts.code_pos);
      addLine(`[NOT QUITE] ${hint}`, 'error');
    }
  } else if (step === 1) {
    if (validateNewCode(input)) {
      sound.success();
      lockLine('new_code', 'new_code = (code + shift) % 26', true);
      dimLine('new_code');
      addLine('[LINE 6 LOCKED] new_code = (code + shift) % 26', 'success');
      addLine('', '');
      s.p3step = 2;
      s.attempts = {};

      highlightLine('new_letter');
      addLine('AI CORE: "Almost there. Convert the number back to a letter."', 'purple');
      addLine('', '');
      addLine('   Line 7: Convert new_code back to a letter. Store in new_letter.', 'warning');
      addLine('', '');
    } else {
      s.attempts.new_code = (s.attempts.new_code || 0) + 1;
      sound.denied();
      const hint = getHint('new_code', s.attempts.new_code);
      addLine(`[NOT QUITE] ${hint}`, 'error');
    }
  } else if (step === 2) {
    if (validateNewLetter(input)) {
      sound.success();
      lockLine('new_letter', 'new_letter = chr(new_code + 65)', true);
      dimLine('new_letter');
      addLine('[LINE 7 LOCKED] new_letter = chr(new_code + 65)', 'success');
      addLine('', '');
      s.p3step = 3;
      s.attempts = {};

      highlightLine('append');
      addLine('AI CORE: "Last line in the loop. Add the encrypted letter', 'purple');
      addLine('          to your result string."', 'purple');
      addLine('', '');
      addLine('   Line 8: Add new_letter to the end of result.', 'warning');
      addLine('', '');
    } else {
      s.attempts.new_letter = (s.attempts.new_letter || 0) + 1;
      sound.denied();
      const hint = getHint('new_letter', s.attempts.new_letter);
      addLine(`[NOT QUITE] ${hint}`, 'error');
    }
  } else if (step === 3) {
    if (validateAppend(input)) {
      sound.success();
      lockLine('append', 'result = result + new_letter', true);
      dimLine('append');
      addLine('[LINE 8 LOCKED] result = result + new_letter', 'success');
      addLine('', '');
      addLine('AI CORE: "That\'s it. The math is done. The algorithm is', 'purple');
      addLine('          complete. Every line of your cipher — written', 'purple');
      addLine('          by YOU."', 'purple');
      addLine('', '');
      addLine('>>> PHASE 3 COMPLETE <<<', 'success big');
      sound.success();
      s.attempts = {};
      setTimeout(() => startPhase4(), 1500);
    } else {
      s.attempts.append = (s.attempts.append || 0) + 1;
      sound.denied();
      const hint = getHint('append', s.attempts.append);
      addLine(`[NOT QUITE] ${hint}`, 'error');
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHASE 4: RUN IT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function startPhase4() {
  state.missionState.phase = 4;
  state.missionState.p4step = 0;

  addLine('', '');
  addLine('╔══════════════════════════════════════════════╗', 'highlight');
  addLine('║   ▶ PHASE 4 of 4 — RUN IT                    ║', 'highlight');
  addLine('╚══════════════════════════════════════════════╝', 'highlight');
  addLine('', '');
  addLine('AI CORE: "Your program is complete. Every line is green.', 'purple');
  addLine('          Every line is YOURS."', 'purple');
  addLine('', '');
  addLine('AI CORE: "Type RUN to execute your cipher. Or click the button."', 'purple');
  addLine('', '');

  // Show the RUN button
  if (runBtn) {
    runBtn.style.display = 'block';
    runBtn.onclick = () => {
      runBtn.style.display = 'none';
      executeProgram();
    };
  }

  setCurrentInputHandler((input) => {
    if (/^run$/i.test(input.trim())) {
      if (runBtn) runBtn.style.display = 'none';
      executeProgram();
    } else {
      addLine('Type RUN to execute your program.', 'info');
    }
  });
}

async function executeProgram() {
  setCurrentInputHandler(null);

  addLine('', '');
  addLine('   ▶ EXECUTING cipher.py ...', 'system');
  addLine('', '');
  sound.missionStart();
  await sleep(800);

  // Step-by-step animation
  const message = 'HELLO';
  const shift = 3;
  const letters = message.split('');
  let result = '';

  const terminal = document.getElementById('terminal');

  // Create execution display
  const execBox = document.createElement('div');
  execBox.style.cssText = `
    margin: 8px 0;
    padding: 14px 18px;
    background: #0a0a1a;
    border: 1px solid #1a3a5a;
    border-radius: 4px;
    font-family: 'Fira Mono', monospace;
    font-size: 13px;
  `;

  const execTitle = document.createElement('div');
  execTitle.textContent = 'EXECUTION TRACE';
  execTitle.style.cssText = 'color:#00ffff;font-size:11px;letter-spacing:2px;margin-bottom:10px;font-weight:bold;';
  execBox.appendChild(execTitle);

  terminal.appendChild(execBox);
  terminal.scrollTop = terminal.scrollHeight;

  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i];
    const code = letter.charCodeAt(0) - 65;
    const newCode = (code + shift) % 26;
    const newLetter = String.fromCharCode(newCode + 65);
    result += newLetter;

    const stepEl = document.createElement('div');
    stepEl.style.cssText = 'margin: 4px 0; opacity: 0; transition: opacity 0.4s;';
    stepEl.innerHTML = `<span style="color:#888">letter = "${letter}"</span>  <span style="color:#666">\u2192</span>  <span style="color:#888">code = ${code}</span>  <span style="color:#666">\u2192</span>  <span style="color:#ffdd33">( ${code} + ${shift} ) % 26 = ${newCode}</span>  <span style="color:#666">\u2192</span>  <span style="color:#00ff41;font-weight:bold;font-size:16px">${letter} \u2192 ${newLetter}</span>`;
    execBox.appendChild(stepEl);
    terminal.scrollTop = terminal.scrollHeight;

    await sleep(200);
    stepEl.style.opacity = '1';
    sound.keyClick();
    await sleep(600);
  }

  await sleep(400);

  // Final output
  const outputEl = document.createElement('div');
  outputEl.style.cssText = `
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid #1a3a5a;
    font-size: 11px;
    color: #00ffff;
    letter-spacing: 1px;
  `;
  outputEl.textContent = 'OUTPUT:';
  execBox.appendChild(outputEl);

  await sleep(300);

  const resultEl = document.createElement('div');
  resultEl.style.cssText = `
    font-size: 28px;
    font-weight: bold;
    color: #00ff41;
    text-shadow: 0 0 15px rgba(0,255,65,0.6);
    letter-spacing: 6px;
    margin-top: 6px;
    margin-bottom: 4px;
  `;
  resultEl.textContent = result;
  execBox.appendChild(resultEl);
  terminal.scrollTop = terminal.scrollHeight;

  sound.accessGranted();
  await sleep(1500);

  addLine('', '');
  addLine('AI CORE: "KHOOR. Your program works."', 'purple');
  addLine('', '');
  addLine('AI CORE: "You just WROTE a working program. Not traced. Not', 'purple');
  addLine('          debugged. WROTE. From scratch. Line by line."', 'purple');
  addLine('', '');
  await sleep(1000);

  // Phase 2: encrypt their hacker name
  const hackerName = (state.hackerName || 'HACKER').toUpperCase().replace(/[^A-Z]/g, '');

  addLine('AI CORE: "Now the real test. Encrypt YOUR name."', 'purple');
  addLine('', '');
  addLine(`   Running cipher on "${hackerName}" with shift 7...`, 'warning');
  addLine('', '');
  await sleep(800);

  const encryptedName = caesarEncrypt(hackerName, 7);

  // Animate name encryption
  const nameBox = document.createElement('div');
  nameBox.style.cssText = `
    margin: 8px 0;
    padding: 14px 18px;
    background: #0a0a1a;
    border: 1px solid #5a1a5a;
    border-radius: 4px;
    font-family: 'Fira Mono', monospace;
    font-size: 13px;
  `;

  const nameTitle = document.createElement('div');
  nameTitle.textContent = `ENCRYPTING: ${hackerName} (shift 7)`;
  nameTitle.style.cssText = 'color:#cc66ff;font-size:11px;letter-spacing:2px;margin-bottom:10px;font-weight:bold;';
  nameBox.appendChild(nameTitle);

  terminal.appendChild(nameBox);
  terminal.scrollTop = terminal.scrollHeight;

  const nameLetters = hackerName.split('');
  for (let i = 0; i < nameLetters.length; i++) {
    const letter = nameLetters[i];
    const code = letter.charCodeAt(0) - 65;
    const newCode = (code + 7) % 26;
    const newLetter = String.fromCharCode(newCode + 65);

    const stepEl = document.createElement('div');
    stepEl.style.cssText = 'margin: 3px 0; opacity: 0; transition: opacity 0.3s;';
    stepEl.innerHTML = `<span style="color:#cc66ff;font-weight:bold;font-size:15px">${letter} \u2192 ${newLetter}</span>`;
    nameBox.appendChild(stepEl);
    terminal.scrollTop = terminal.scrollHeight;

    await sleep(150);
    stepEl.style.opacity = '1';
    sound.keyClick();
    await sleep(350);
  }

  await sleep(300);

  const nameOutput = document.createElement('div');
  nameOutput.style.cssText = `
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid #5a1a5a;
  `;
  nameOutput.innerHTML = `<span style="color:#cc66ff;font-size:11px;letter-spacing:2px;">YOUR ENCRYPTED NAME:</span>`;
  nameBox.appendChild(nameOutput);

  const nameResult = document.createElement('div');
  nameResult.style.cssText = `
    font-size: 28px;
    font-weight: bold;
    color: #cc66ff;
    text-shadow: 0 0 15px rgba(204,102,255,0.6);
    letter-spacing: 6px;
    margin-top: 6px;
  `;
  nameResult.textContent = encryptedName;
  nameBox.appendChild(nameResult);
  terminal.scrollTop = terminal.scrollHeight;

  sound.success();
  await sleep(2000);

  // Final emotional payoff
  addLine('', '');
  addLine('AI CORE: "...Do you remember Season 1? Mission 6?"', 'purple');
  addLine('', '');
  await sleep(800);
  addLine('AI CORE: "You stared at a scrambled message. Letters that', 'purple');
  addLine('          made no sense. You had to figure out the shift,', 'purple');
  addLine('          decode it letter by letter. You were nervous."', 'purple');
  addLine('', '');
  await sleep(800);
  addLine('AI CORE: "Now look at you. You just BUILT the machine.', 'purple');
  addLine('          The same algorithm. But this time, from the', 'purple');
  addLine('          OTHER side. Not cracking. Creating."', 'purple');
  addLine('', '');
  await sleep(800);
  addLine('AI CORE: "You started this journey decoding someone else\'s', 'purple');
  addLine('          messages. You\'re ending it by writing your own', 'purple');
  addLine('          encryption program."', 'purple');
  addLine('', '');
  await sleep(500);
  addLine('AI CORE: "Full circle."', 'purple');
  addLine('', '');
  await sleep(1000);

  addLine('╔══════════════════════════════════════════════════╗', 'success');
  addLine('║                                                    ║', 'success');
  addLine('║   YOU WROTE YOUR FIRST PROGRAM.                    ║', 'success');
  addLine('║                                                    ║', 'success');
  addLine('║   Not traced. Not debugged. Not someone else\'s.    ║', 'success');
  addLine('║   YOURS.                                           ║', 'success');
  addLine('║                                                    ║', 'success');
  addLine('╚══════════════════════════════════════════════════╝', 'success');
  addLine('', '');

  sound.accessGranted();
  setCurrentInputHandler(null);
  setTimeout(() => completeMission(16), 2500);
}
