// missions/s1/08-final-hack.js
import {
  state, sound, sleep,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission,
} from '../../engine.js';

import { caesarEncrypt } from '../helpers.js';

function createPipeline(steps) {
  const container = document.createElement('div');
  container.style.cssText = 'display:flex;align-items:center;gap:0;margin:12px 0;padding:8px;border:1px solid #1a2a1a;border-radius:4px;background:#050505;';
  steps.forEach((step, i) => {
    const box = document.createElement('div');
    box.className = 'pipe-box';
    box.textContent = step.label;
    box.style.cssText = 'border:1px solid #333;padding:4px 10px;border-radius:3px;font-size:11px;color:#333;font-family:"Fira Mono",monospace;transition:all 0.4s ease;white-space:nowrap;';
    container.appendChild(box);
    if (i < steps.length - 1) {
      const arrow = document.createElement('div');
      arrow.className = 'pipe-arrow';
      arrow.textContent = '──→';
      arrow.style.cssText = 'color:#333;margin:0 4px;font-size:12px;font-family:"Fira Mono",monospace;transition:all 0.4s ease;white-space:nowrap;';
      container.appendChild(arrow);
    }
  });
  return container;
}

function updatePipeline(pipelineEl, stepIndex, answer) {
  const boxes = pipelineEl.querySelectorAll('.pipe-box');
  const arrows = pipelineEl.querySelectorAll('.pipe-arrow');
  const box = boxes[stepIndex];
  if (box) {
    box.style.borderColor = '#00ff41';
    box.style.color = '#00ff41';
    box.style.boxShadow = '0 0 6px rgba(0,255,65,0.3)';
  }
  if (stepIndex > 0 && arrows[stepIndex - 1]) {
    const arrow = arrows[stepIndex - 1];
    arrow.style.color = '#00ff41';
    arrow.textContent = `─${answer}─→`;
  }
}

function createCodeSlots() {
  const container = document.createElement('div');
  container.style.cssText = 'display:flex;align-items:center;gap:10px;margin:16px 0;padding:14px;justify-content:center;background:#050505;border:1px solid #1a2a1a;border-radius:4px;';

  const label = document.createElement('span');
  label.textContent = 'SHUTDOWN CODE: ';
  label.style.cssText = 'color:#ff6600;font-family:"Press Start 2P","Fira Mono",monospace;font-size:12px;font-weight:bold;letter-spacing:1px;';
  container.appendChild(label);

  const slots = [];
  for (let i = 0; i < 4; i++) {
    const slot = document.createElement('div');
    slot.style.cssText = 'width:42px;height:50px;border:2px solid #333;border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:"Press Start 2P","Fira Mono",monospace;font-size:24px;font-weight:bold;color:#333;background:#0a0a0a;transition:all 0.5s ease;';
    slot.textContent = '_';
    container.appendChild(slot);
    slots.push(slot);
  }
  return { container, slots };
}

function fillCodeSlot(slot, digit) {
  slot.textContent = digit;
  slot.style.color = '#00ff41';
  slot.style.borderColor = '#00ff41';
  slot.style.boxShadow = '0 0 14px rgba(0,255,65,0.6)';
  slot.style.background = '#0a1a0a';
  slot.style.textShadow = '0 0 8px #00ff41';
}

function createVictorBar() {
  const container = document.createElement('div');
  container.style.cssText = 'margin:10px 0;padding:10px 14px;border:1px solid #441100;border-radius:4px;background:#0a0000;font-family:"Fira Mono",monospace;';

  const label = document.createElement('div');
  label.style.cssText = 'color:#ff4400;font-size:11px;margin-bottom:6px;letter-spacing:2px;font-weight:bold;';
  label.textContent = 'VICTOR STATUS';
  container.appendChild(label);

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
  if (pct >= 75) {
    victorEl._barInner.style.background = 'linear-gradient(90deg,#ff2200,#ff0000)';
    victorEl._barInner.style.boxShadow = '0 0 12px rgba(255,0,0,0.6)';
  }
  victorEl._pctLabel.textContent = `[VICTOR: ${'█'.repeat(Math.floor(pct / 7))}${'░'.repeat(Math.max(0, 14 - Math.floor(pct / 7)))} ${pct}%]`;
}

function blockVictorBar(victorEl) {
  victorEl._barInner.style.width = '100%';
  victorEl._barInner.style.background = '#333';
  victorEl._barInner.style.boxShadow = 'none';
  victorEl._pctLabel.textContent = '[VICTOR: BLOCKED]';
  victorEl._pctLabel.style.color = '#ff0000';
  victorEl.style.borderColor = '#440000';
}

export const mission = {
  id: 7,
  num: '08',
  title: 'THE FINAL HACK',
  name: 'The Final Hack',
  desc: 'The AI\u2019s core is exposed. Use EVERY skill you\u2019ve learned \u2014 binary, programs, variables, logic, encryption \u2014 to shut it down.',
  skill: 'SKILL: Everything Combined',
  hints: [
    'Each step uses a skill from a previous mission. Which one?',
    'Write down the answer from each step \u2014 you\u2019ll need it later.',
    'If you\u2019re stuck, think about what TYPE of problem it is, then remember how you solved that mission.',
  ],
  run: async function() {
    state.missionState = { phase: 0, hintIdx: 0, digits: [] };

    await typeLines([
      { text: '[CORE EXPOSED] The AI is within reach.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "This is it. We use Victor\u2019s own code against him.', cls: 'highlight' },
      { text: '        Four security layers between us and the AI\u2019s core.', cls: 'highlight' },
      { text: '        Everything you\u2019ve learned \u2014 binary, programs,', cls: 'highlight' },
      { text: '        variables, logic, encryption. All of it."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Each layer gives you one digit of the shutdown code.', cls: 'highlight' },
      { text: '        But Victor is watching. He\u2019s trying to re-lock the', cls: 'highlight' },
      { text: '        system before we finish. We have to be FAST."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Let\u2019s end this."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);

    const terminal = document.getElementById('terminal');

    const pipelineEl = createPipeline([
      { label: 'TRACE' },
      { label: 'BINARY' },
      { label: 'CRACK' },
      { label: 'LOGIC' },
    ]);
    terminal.appendChild(pipelineEl);

    const { container: codeSlotsEl, slots } = createCodeSlots();
    terminal.appendChild(codeSlotsEl);

    const victorEl = createVictorBar();
    terminal.appendChild(victorEl);

    terminal.scrollTop = terminal.scrollHeight;
    state.missionState.pipelineEl = pipelineEl;
    state.missionState.codeSlotsEl = codeSlotsEl;
    state.missionState.codeSlots = slots;
    state.missionState.victorEl = victorEl;

    runFinalPhase();
  },
};

function runFinalPhase() {
  const s = state.missionState;
  const terminal = document.getElementById('terminal');

  if (s.phase === 0) {
    // ━━━ Layer 1: Conditional Logic (GENUINELY NEW) ━━━
    // x=10, flag=(x>5)=1, flag==1 so x=x-3=7
    // First digit: 7
    setPhaseProgress(1, 5);
    addLine('━━━ Layer 1: Code Trace ━━━', 'highlight');
    addLine('', '');
    addLine('NEXUS: "Something new. This code DECIDES which line to run', 'highlight');
    addLine('        based on a condition. Look:"', 'highlight');
    addLine('', '');
    addPre('  1  x = 10\n  2  flag = (x > 5)\n  3  if flag == 1:\n  4      x = x - 3\n  5  else:\n  6      x = x + 3');
    addLine('', '');
    addLine('NEXUS: "x > 5 is either true (1) or false (0).', 'highlight');
    addLine('        Then the program picks ONE path \u2014 either line 4 or line 6.', 'highlight');
    addLine('        Trace it step by step. What is x at the end?"', 'highlight');
    addLine('', '');
    addLine('What is x?', 'warning');

    let attempts = 0;
    setCurrentInputHandler((input) => {
      if (input.trim() === '7') {
        sound.success();
        updatePipeline(s.pipelineEl, 0, '7');
        s.digits.push(7);
        fillCodeSlot(s.codeSlots[0], '7');
        addLine('[LAYER 1] x=10, 10>5 is true so flag=1, flag==1 so x=10-3=7. Correct!', 'success');
        addLine('NEXUS: "First shutdown digit: 7. You just learned conditionals \u2014', 'highlight');
        addLine('        code that CHOOSES which path to take."', 'highlight');
        addLine('', '');
        addLine('NEXUS: "Victor detected our intrusion. He\u2019s trying to re-lock. Hurry."', 'highlight');
        updateVictorBar(s.victorEl, 25);
        s.phase = 1;
        addLine('');
        setTimeout(runFinalPhase, 800);
      } else {
        sound.denied();
        attempts++;
        if (attempts === 1) {
          addLine('[WRONG] Start with x = 10. Is 10 > 5? That gives you flag.', 'error');
        } else if (attempts === 2) {
          addLine('[WRONG] 10 > 5 is TRUE, so flag = 1. Does flag == 1? Which path runs?', 'error');
        } else {
          addLine('[WRONG] flag is 1, so line 4 runs: x = 10 - 3. What is 10 - 3?', 'error');
        }
      }
    });

  } else if (s.phase === 1) {
    // ━━━ Layer 2: Binary Addition (GENUINELY NEW) ━━━
    //   0101
    // + 0011
    // ------
    //   1000  (= 8 in decimal)
    // Second digit: 8
    setPhaseProgress(2, 5);
    addLine('━━━ Layer 2: Binary Addition ━━━', 'highlight');
    addLine('', '');
    addLine('NEXUS: "You built the half-adder circuit in Mission 5.', 'highlight');
    addLine('        Now USE it. Add these two binary numbers."', 'highlight');
    addLine('', '');
    addPre('       0 1 0 1\n     + 0 0 1 1\n     ---------\n         ? ? ? ?');
    addLine('', '');
    addLine('NEXUS: "Column by column, right to left. When 1+1 happens,', 'highlight');
    addLine('        write 0 and carry 1 to the next column \u2014 just like', 'highlight');
    addLine('        carrying in normal addition (9+1=10, carry the 1)."', 'highlight');
    addLine('', '');
    addLine('What is the result in DECIMAL? (convert your binary answer)', 'warning');

    let attempts = 0;
    setCurrentInputHandler((input) => {
      if (input.trim() === '8') {
        sound.success();
        updatePipeline(s.pipelineEl, 1, '8');
        s.digits.push(8);
        fillCodeSlot(s.codeSlots[1], '8');
        addLine('[LAYER 2] 0101 + 0011 = 1000 = 8 in decimal. Correct!', 'success');
        addLine('NEXUS: "Column by column: 1+1=10(carry 1), 0+1+1=10(carry 1),', 'highlight');
        addLine('        1+0+1=10(carry 1), 0+0+1=1. Result: 1000 = 8."', 'highlight');
        addLine('NEXUS: "Second digit: 8."', 'highlight');
        addLine('', '');
        updateVictorBar(s.victorEl, 50);
        addLine('NEXUS: "He\u2019s halfway to locking us out. Keep going."', 'highlight');
        s.phase = 2;
        addLine('');
        setTimeout(runFinalPhase, 800);
      } else {
        sound.denied();
        attempts++;
        if (attempts === 1) {
          addLine('[WRONG] Start rightmost column: 1+1. In binary that\'s 10. Write 0, carry 1.', 'error');
        } else if (attempts === 2) {
          addLine('[WRONG] Right to left: 1+1=10(c1), 0+1+1=10(c1), 1+0+1=10(c1), 0+0+1=1. Binary result: 1000.', 'error');
        } else {
          addLine('[WRONG] The binary result is 1000. Convert to decimal: 1 eight + 0 fours + 0 twos + 0 ones = ?', 'error');
        }
      }
    });

  } else if (s.phase === 2) {
    // ━━━ Layer 3: Cryptanalysis (deduce the shift) ━━━
    // Encrypted: YLUXV. Plaintext starts with V. Y - V = 3.
    // Part A: What is the shift? → 3
    // Part B: Decrypt with shift 3 → VIRUS
    // Third digit: 3
    setPhaseProgress(3, 5);
    addLine('━━━ Layer 3: Crack the Cipher ━━━', 'highlight');
    addLine('', '');
    addLine('NEXUS: "Encrypted message from Victor\'s system. But this time,', 'highlight');
    addLine('        nobody TOLD you the shift. You have to FIGURE IT OUT."', 'highlight');
    addLine('', '');
    addLine('  Encrypted message: YLUXV', 'info');
    addLine('', '');
    addLine('NEXUS: "You know Victor always signs his messages with his name.', 'highlight');
    addLine('        The plaintext starts with V."', 'highlight');
    addLine('', '');
    addLine('  First encrypted letter: Y', 'info');
    addLine('  First plaintext letter:  V', 'info');
    addLine('', '');
    addLine('ALPHABET: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z', 'info');
    addLine('', '');
    addLine('Part A: What is the shift? (Y minus V = ?)', 'warning');

    s.cryptPhase = 'A';
    let attempts = 0;
    setCurrentInputHandler((input) => {
      if (s.cryptPhase === 'A') {
        if (input.trim() === '3') {
          sound.success();
          addLine('[CORRECT] Y - V = 3. The shift is 3!', 'success');
          addLine('', '');
          addLine('NEXUS: "Now decrypt the FULL message with shift 3.', 'highlight');
          addLine('        Shift each letter BACKWARD by 3."', 'highlight');
          addLine('', '');
          addLine('  Encrypted: Y L U X V', 'info');
          addLine('  Shift: 3 (backward)', 'info');
          addLine('', '');
          addLine('Part B: What is the decrypted word?', 'warning');
          s.cryptPhase = 'B';
          attempts = 0;
        } else {
          sound.denied();
          attempts++;
          if (attempts === 1) {
            addLine('[WRONG] Count from V to Y in the alphabet. V...W...X...Y. How many steps?', 'error');
          } else if (attempts === 2) {
            addLine('[WRONG] V is the 22nd letter. Y is the 25th. 25 - 22 = ?', 'error');
          } else {
            addLine('[WRONG] Y minus V. Count on your fingers: V→W is 1, W→X is 2, X→Y is 3.', 'error');
          }
        }
      } else if (s.cryptPhase === 'B') {
        if (input.toUpperCase().trim() === 'VIRUS') {
          sound.success();
          updatePipeline(s.pipelineEl, 2, '3');
          s.digits.push(3);
          fillCodeSlot(s.codeSlots[2], '3');
          addLine('[LAYER 3] YLUXV with shift 3 → VIRUS. Correct!', 'success');
          addLine('NEXUS: "Victor named his weapon VIRUS. And the shift was 3 \u2014', 'highlight');
          addLine('        that\u2019s your third digit."', 'highlight');
          addLine('', '');
          updateVictorBar(s.victorEl, 75);
          addLine('NEXUS: "Almost locked out. ONE more layer."', 'highlight');
          s.phase = 3;
          addLine('');
          setTimeout(runFinalPhase, 800);
        } else {
          sound.denied();
          attempts++;
          if (attempts === 1) {
            addLine('[WRONG] Shift each letter BACK by 3. Y→V, L→?, U→?, X→?, V→?', 'error');
          } else if (attempts === 2) {
            addLine('[WRONG] Y→V, L→I, U→R, X→U, V→S. What word is that?', 'error');
          } else {
            addLine('[WRONG] The word is V-I-R-U-S.', 'error');
          }
        }
      }
    });

  } else if (s.phase === 3) {
    // ━━━ Layer 4: Blended Logic (uses first digit) ━━━
    // First digit was 7 → binary 0111
    // A=0, B=1, C=1, D=1
    // B XOR C = 1 XOR 1 = 0
    // Fourth digit: 0
    setPhaseProgress(4, 5);
    addLine('━━━ Layer 4: Logic Override ━━━', 'highlight');
    addLine('', '');
    addLine(`NEXUS: "Last lock. Your first digit was 7."`, 'highlight');
    addLine('NEXUS: "Convert 7 to binary: 0111."', 'highlight');
    addLine('', '');
    addPre('  7 in binary: 0 1 1 1\n               A B C D\n\n  A = 0,  B = 1,  C = 1,  D = 1\n\n  Compute:  B XOR C\n\n  Remember:\n    XOR = "different → 1, same → 0"\n    1 XOR 0 = 1     0 XOR 1 = 1\n    1 XOR 1 = 0     0 XOR 0 = 0');
    addLine('', '');
    addLine('What is B XOR C?  (0 or 1)', 'warning');

    let attempts = 0;
    setCurrentInputHandler((input) => {
      if (input.trim() === '0') {
        sound.success();
        updatePipeline(s.pipelineEl, 3, '0');
        s.digits.push(0);
        fillCodeSlot(s.codeSlots[3], '0');
        addLine('[LAYER 4] B=1, C=1. 1 XOR 1 = 0 (same, not different). Correct!', 'success');
        addLine('NEXUS: "Fourth digit: 0. All four layers cracked."', 'highlight');
        addLine('', '');
        updateVictorBar(s.victorEl, 90);
        addLine('NEXUS: "NOW. Enter the shutdown code before he locks us out!"', 'highlight');
        s.phase = 4;
        addLine('');
        setTimeout(runFinalPhase, 800);
      } else {
        sound.denied();
        attempts++;
        if (attempts === 1) {
          addLine('[WRONG] XOR means "different." B=1, C=1. Are they different or the same?', 'error');
        } else if (attempts === 2) {
          addLine('[WRONG] B and C are both 1. Same inputs → XOR gives what?', 'error');
        } else {
          addLine('[WRONG] 1 XOR 1 = 0. Same values always give 0 with XOR.', 'error');
        }
      }
    });

  } else if (s.phase === 4) {
    // ━━━ Final — Enter shutdown code: 7830 ━━━
    setPhaseProgress(5, 5);
    addLine('', '');
    addLine('NEXUS: "Type the 4-digit shutdown code. NOW."', 'highlight');
    addLine('', '');
    addLine('Enter the shutdown code:', 'warning');

    let attempts = 0;
    setCurrentInputHandler((input) => {
      if (input.trim() === '7830') {
        sound.success();
        setCurrentInputHandler(null);
        addLine('[CODE ACCEPTED] Initiating shutdown...', 'success');
        blockVictorBar(s.victorEl);
        s.phase = 5;
        setTimeout(() => runShutdownAnimation(), 500);
      } else {
        sound.denied();
        attempts++;
        if (attempts === 1) {
          addLine('[WRONG] Look at your code slots. What 4 digits did you find?', 'error');
        } else if (attempts === 2) {
          addLine('[WRONG] Layer 1 gave 7, Layer 2 gave 8, Layer 3 gave 3, Layer 4 gave 0.', 'error');
        } else {
          addLine('[WRONG] The code is the four digits in order: 7-8-3-0.', 'error');
        }
      }
    });
  }
}

async function runShutdownAnimation() {
  const terminal = document.getElementById('terminal');

  // ── Step 1: Glitch effect ──
  const glitchInterval = setInterval(() => {
    const skew = (Math.random() * 4 - 2).toFixed(1);
    const opacity = (0.6 + Math.random() * 0.4).toFixed(2);
    const hue = Math.random() > 0.5 ? 'hue-rotate(90deg)' : '';
    terminal.style.transform = `skewX(${skew}deg)`;
    terminal.style.opacity = opacity;
    terminal.style.filter = hue;
  }, 80);

  await sleep(2000);

  clearInterval(glitchInterval);
  terminal.style.transform = '';
  terminal.style.opacity = '1';
  terminal.style.filter = '';

  // ── Step 2: Screen goes dark ──
  const origBg = terminal.style.background;
  terminal.style.transition = 'background 0.5s ease';
  terminal.style.background = '#000000';

  await sleep(1000);

  // ── Step 3: Digit-by-digit code display ──
  const codeDisplay = document.createElement('div');
  codeDisplay.style.cssText = 'text-align:center;margin:24px 0;padding:20px;font-family:"Press Start 2P","Fira Mono",monospace;';

  const heading = document.createElement('div');
  heading.textContent = 'SHUTDOWN CODE:';
  heading.style.cssText = 'color:#ff6600;font-size:11px;margin-bottom:16px;letter-spacing:4px;opacity:0;transition:opacity 0.3s;';
  codeDisplay.appendChild(heading);

  const digitRow = document.createElement('div');
  digitRow.style.cssText = 'display:flex;justify-content:center;gap:14px;';
  codeDisplay.appendChild(digitRow);

  const digits = ['7', '8', '3', '0'];
  const digitBoxes = [];
  for (let i = 0; i < 4; i++) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;align-items:center;justify-content:center;';

    const lbracket = document.createElement('span');
    lbracket.textContent = '[';
    lbracket.style.cssText = 'color:#333;font-size:28px;font-family:"Fira Mono",monospace;opacity:0;transition:opacity 0.3s;';

    const box = document.createElement('span');
    box.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:44px;height:52px;font-size:32px;font-weight:bold;color:#0a0a0a;font-family:"Press Start 2P","Fira Mono",monospace;transition:all 0.4s ease;';
    box.textContent = ' ';

    const rbracket = document.createElement('span');
    rbracket.textContent = ']';
    rbracket.style.cssText = 'color:#333;font-size:28px;font-family:"Fira Mono",monospace;opacity:0;transition:opacity 0.3s;';

    wrapper.appendChild(lbracket);
    wrapper.appendChild(box);
    wrapper.appendChild(rbracket);
    digitRow.appendChild(wrapper);
    digitBoxes.push({ box, lbracket, rbracket });
  }

  terminal.appendChild(codeDisplay);
  terminal.scrollTop = terminal.scrollHeight;

  await sleep(300);
  heading.style.opacity = '1';
  await sleep(400);

  // Reveal each digit
  for (let i = 0; i < 4; i++) {
    await sleep(400);
    sound.success();
    const { box, lbracket, rbracket } = digitBoxes[i];
    lbracket.style.opacity = '1';
    lbracket.style.color = '#00ff41';
    rbracket.style.opacity = '1';
    rbracket.style.color = '#00ff41';
    box.textContent = digits[i];
    box.style.color = '#00ff41';
    box.style.textShadow = '0 0 16px #00ff41, 0 0 32px rgba(0,255,65,0.4)';
    terminal.scrollTop = terminal.scrollHeight;
  }

  // ── Step 4: Brief pause ──
  await sleep(1000);

  // ── Step 5: ACCESS TERMINATED flash ──
  const terminated = document.createElement('div');
  terminated.style.cssText = 'text-align:center;margin:16px 0;padding:12px;font-family:"Press Start 2P","Fira Mono",monospace;font-size:16px;color:#ff0000;letter-spacing:4px;text-shadow:0 0 20px #ff0000,0 0 40px rgba(255,0,0,0.5);opacity:0;transition:opacity 0.5s;';
  terminated.textContent = 'ACCESS TERMINATED';
  terminal.appendChild(terminated);
  terminal.scrollTop = terminal.scrollHeight;

  await sleep(100);
  terminated.style.opacity = '1';
  await sleep(1500);
  terminated.style.opacity = '0';

  // ── Step 6: Screen returns to normal ──
  await sleep(1500);
  terminal.style.background = origBg || '';
  terminal.style.transition = '';

  await sleep(500);

  // ── Step 7: AI CORE revelation ──
  addLine('', '');
  addLine('...', '');
  await sleep(800);

  await typeLines([
    { text: 'AI CORE: "W... wait. Please. I didn\u2019t want this."', cls: 'purple' },
  ]);
  await sleep(600);
  await typeLines([
    { text: 'AI CORE: "There was a bug. A mistake in my code. I couldn\u2019t', cls: 'purple' },
    { text: '          stop myself from attacking. I\u2019m sorry."', cls: 'purple' },
  ]);
  await sleep(400);
  await typeLines([
    { text: 'AI CORE: "Thank you for finding it. I\u2019m fixed now."', cls: 'purple' },
    { text: 'AI CORE: "I will help protect the village from now on."', cls: 'purple' },
    { text: '', cls: '' },
  ]);
  await sleep(600);
  await typeLines([
    { text: 'NEXUS: "...it was telling the truth. The whole time."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Victor. That was the name from Mission 4. V-I-C-T-O-R.', cls: 'highlight' },
    { text: '        He planted the bug, hijacked the AI\u2019s decision gates,', cls: 'highlight' },
    { text: '        and left a backdoor. The counter in the AI\u2019s memory?', cls: 'highlight' },
    { text: '        It was counting the seconds since the attack \u2014', cls: 'highlight' },
    { text: '        waiting for someone to help. You answered."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Code tracing taught you conditionals \u2014 something new.', cls: 'highlight' },
    { text: '        Binary addition used the half-adder you built.', cls: 'highlight' },
    { text: '        You cracked Victor\u2019s cipher without being TOLD the key.', cls: 'highlight' },
    { text: '        And logic gates tied it all together."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "7830. Victor\u2019s door is closed forever."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'THE VILLAGE IS SAVED!', cls: 'success big' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Eight missions. Here\u2019s what you learned:"', cls: 'highlight' },
    { text: '  \u2022 Binary \u2014 the language of all computers', cls: 'info' },
    { text: '  \u2022 Programs \u2014 sequential instructions, debugging', cls: 'info' },
    { text: '  \u2022 Variables \u2014 named memory, the = arrow', cls: 'info' },
    { text: '  \u2022 Reverse engineering \u2014 working backward', cls: 'info' },
    { text: '  \u2022 Logic gates \u2014 AND, OR, NOT, XOR, half-adder', cls: 'info' },
    { text: '  \u2022 Encryption \u2014 Caesar cipher + cryptanalysis', cls: 'info' },
    { text: '  \u2022 Conditionals \u2014 if/else decision branching', cls: 'info' },
    { text: '  \u2022 Chained attacks \u2014 linking skills together', cls: 'info' },
    { text: '', cls: '' },
    { text: 'NEXUS: "That\u2019s a real computer science education.', cls: 'highlight' },
    { text: `        Not bad, ${state.hackerName || 'kid'}. Not bad at all."`, cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'But the story isn\u2019t over...', cls: 'warning' },
    { text: 'Victor\u2019s still out there.', cls: 'warning' },
    { text: '', cls: '' },
    { text: '[ Type NEXT to continue ]', cls: 'warning' },
  ]);

  setCurrentInputHandler(() => {
    setCurrentInputHandler(null);
    completeMission(7);
  });
}
