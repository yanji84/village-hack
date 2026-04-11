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
  container.style.cssText = 'display:flex;align-items:center;gap:8px;margin:16px 0;padding:12px;justify-content:center;';

  const label = document.createElement('span');
  label.textContent = 'SHUTDOWN CODE: ';
  label.style.cssText = 'color:#ff6600;font-family:"Fira Mono",monospace;font-size:14px;font-weight:bold;';
  container.appendChild(label);

  const slots = [];
  for (let i = 0; i < 4; i++) {
    const slot = document.createElement('div');
    slot.style.cssText = 'width:36px;height:42px;border:2px solid #333;border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:"Fira Mono",monospace;font-size:22px;font-weight:bold;color:#333;background:#0a0a0a;transition:all 0.4s ease;';
    slot.textContent = '?';
    container.appendChild(slot);
    slots.push(slot);
  }
  return { container, slots };
}

function fillCodeSlot(slot, digit) {
  slot.textContent = digit;
  slot.style.color = '#00ff41';
  slot.style.borderColor = '#00ff41';
  slot.style.boxShadow = '0 0 12px rgba(0,255,65,0.5)';
  slot.style.background = '#0a1a0a';
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
      { text: 'NEXUS: "Each layer feeds the next. Carry your answers forward."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Let\u2019s end this."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);

    const pipelineEl = createPipeline([
      { label: 'TRACE' },
      { label: 'BINARY' },
      { label: 'CIPHER' },
      { label: 'LOGIC' },
    ]);
    const terminal = document.getElementById('terminal');
    terminal.appendChild(pipelineEl);

    const { container: codeSlotsEl, slots } = createCodeSlots();
    terminal.appendChild(codeSlotsEl);

    terminal.scrollTop = terminal.scrollHeight;
    state.missionState.pipelineEl = pipelineEl;
    state.missionState.codeSlotsEl = codeSlotsEl;
    state.missionState.codeSlots = slots;

    runFinalPhase();
  },
};

function runFinalPhase() {
  const s = state.missionState;

  if (s.phase === 0) {
    // Layer 1: Trace a program with variables
    // x=4, y=x+2=6, x=y*x=24, result=x-y=24-6=18
    // First digit: ones digit of 18 = 8
    setPhaseProgress(1, 5);
    addLine('\u2501\u2501\u2501 Layer 1: Code Trace \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "The first lock runs a program. Trace it carefully \u2014', 'highlight');
    addLine('        you\u2019ll need the result for the next layer."', 'highlight');
    addLine('', '');
    addPre('  1  x = 4\n  2  y = x + 2\n  3  x = y * x\n  4  result = x - y');
    addLine('', '');
    addLine('What is result?', 'warning');

    let attempts = 0;
    setCurrentInputHandler((input) => {
      if (input.trim() === '18') {
        sound.success();
        updatePipeline(s.pipelineEl, 0, '8');
        s.digits.push(8);
        fillCodeSlot(s.codeSlots[0], '8');
        addLine('[LAYER 1] x=4, y=6, x=24, result=24\u22126=18. Correct!', 'success');
        addLine('NEXUS: "Result is 18. The ones digit \u2014 8 \u2014 is your first', 'highlight');
        addLine('        shutdown digit. And remember 18 for the next layer."', 'highlight');
        s.phase = 1;
        s.traceResult = 18;
        addLine('');
        setTimeout(runFinalPhase, 800);
      } else {
        sound.denied();
        attempts++;
        if (attempts === 1) {
          addLine('[WRONG] Go line by line. x starts at 4. What is y?', 'error');
        } else if (attempts === 2) {
          addLine('[WRONG] y = 4+2 = 6. Then x = y*x. What is 6*4?', 'error');
        } else {
          addLine('[WRONG] x=4, y=6, x=6*4=24. Now result = x - y = 24 - ?', 'error');
        }
      }
    });

  } else if (s.phase === 1) {
    // Layer 2: Binary decode
    // "18 in binary is 10010. But the lock shows a DIFFERENT binary number."
    // Show: 0110 → 6
    // Second digit: 6
    // Also: 6 becomes the Caesar shift for Layer 3
    setPhaseProgress(2, 5);
    addLine('\u2501\u2501\u2501 Layer 2: Binary Key \u2501\u2501\u2501', 'highlight');
    addLine(`NEXUS: "Your result from Layer 1 was ${s.traceResult}. In binary,`, 'highlight');
    addLine('        that\u2019s 10010. But the lock shows a DIFFERENT binary', 'highlight');
    addLine('        number. Decode it."', 'highlight');
    addLine('', '');
    addPre('  Lock display:  0 1 1 0\n\n  Places: eights  fours  twos  ones');
    addLine('', '');
    addLine('What number is 0110?', 'warning');

    let attempts = 0;
    setCurrentInputHandler((input) => {
      if (input.trim() === '6') {
        sound.success();
        updatePipeline(s.pipelineEl, 1, '6');
        s.digits.push(6);
        fillCodeSlot(s.codeSlots[1], '6');
        addLine('[LAYER 2] 0110 = 0+4+2+0 = 6. Correct!', 'success');
        addLine('NEXUS: "Second digit: 6. And that 6? It\u2019s your Caesar shift', 'highlight');
        addLine('        for the next layer. Everything connects."', 'highlight');
        s.binaryResult = 6;
        s.phase = 2;
        addLine('');
        setTimeout(runFinalPhase, 800);
      } else {
        sound.denied();
        attempts++;
        if (attempts === 1) {
          addLine('[WRONG] Check each place: 0 eights, 1 four, 1 two, 0 ones.', 'error');
        } else if (attempts === 2) {
          addLine('[WRONG] Add the places with a 1: fours + twos = ?', 'error');
        } else {
          addLine('[WRONG] 0 + 4 + 2 + 0 = ?', 'error');
        }
      }
    });

  } else if (s.phase === 2) {
    // Layer 3: Caesar decrypt using Layer 2 result (6) as shift
    // Encrypt "NINE" with shift 6: N→T, I→O, N→T, E→K → "TOTK"
    // Decrypt TOTK with shift 6 → "NINE" → digit 9
    const shift = s.binaryResult; // 6
    const plainWord = 'NINE';
    const encrypted = caesarEncrypt(plainWord, shift); // TOTK

    setPhaseProgress(3, 5);
    addLine('\u2501\u2501\u2501 Layer 3: Encrypted Command \u2501\u2501\u2501', 'highlight');
    addLine(`NEXUS: "Encrypted message. Your shift is the number from`, 'highlight');
    addLine(`        Layer 2: ${shift}. Shift each letter BACKWARD by ${shift}."`, 'highlight');
    addLine('', '');
    addLine(`  Cipher text: ${encrypted}`, 'info');
    addLine(`  Shift: ${shift} (from Layer 2)`, 'info');
    addLine('', '');
    addLine('ALPHABET: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z', 'info');
    addLine('', '');
    addLine('Decrypt the word:', 'warning');

    let attempts = 0;
    setCurrentInputHandler((input) => {
      if (input.toUpperCase().trim() === plainWord) {
        sound.success();
        updatePipeline(s.pipelineEl, 2, '9');
        s.digits.push(9);
        fillCodeSlot(s.codeSlots[2], '9');
        addLine(`[LAYER 3] ${encrypted} with shift ${shift} → "${plainWord}". That\u2019s 9!`, 'success');
        addLine('NEXUS: "Third digit: 9. The cipher shift from Layer 2 cracked it."', 'highlight');
        s.phase = 3;
        addLine('');
        setTimeout(runFinalPhase, 800);
      } else {
        sound.denied();
        attempts++;
        if (attempts === 1) {
          addLine(`[WRONG] Shift each letter BACKWARD by ${shift}. T shifted back ${shift} = ?`, 'error');
        } else if (attempts === 2) {
          addLine(`[WRONG] T→N, O→I, T→N, K→E. What word is that?`, 'error');
        } else {
          addLine(`[WRONG] The decrypted word is a number word. T→N, O→I...`, 'error');
        }
      }
    });

  } else if (s.phase === 3) {
    // Layer 4: Logic gate using first digit (8) → binary 1000
    // A=1, B=0, C=0, D=0
    // Compute: A AND (NOT B) → 1 AND 1 → 1
    // Fourth digit: 1
    setPhaseProgress(4, 5);
    addLine('\u2501\u2501\u2501 Layer 4: Logic Override \u2501\u2501\u2501', 'highlight');
    addLine(`NEXUS: "Last lock. Your digits so far: ${s.digits.join(', ')}."`, 'highlight');
    addLine('NEXUS: "Convert your first digit (8) to binary: 1000."', 'highlight');
    addLine('', '');
    addPre('  8 in binary: 1 0 0 0\n                A B C D\n\n  A = 1,  B = 0,  C = 0,  D = 0\n\n  Compute:  A AND (NOT B)\n\n  Remember:\n    NOT 0 = 1,  NOT 1 = 0\n    1 AND 1 = 1, anything else = 0');
    addLine('', '');
    addLine('What is A AND (NOT B)?  (0 or 1)', 'warning');

    let attempts = 0;
    setCurrentInputHandler((input) => {
      // NOT B = NOT 0 = 1; A AND 1 = 1 AND 1 = 1
      if (input.trim() === '1') {
        sound.success();
        updatePipeline(s.pipelineEl, 3, '1');
        s.digits.push(1);
        fillCodeSlot(s.codeSlots[3], '1');
        addLine('[LAYER 4] NOT B = NOT 0 = 1. A AND 1 = 1 AND 1 = 1. Correct!', 'success');
        addLine('NEXUS: "Fourth digit: 1. All four layers down."', 'highlight');
        addLine('', '');
        addLine('NEXUS: "Now type the full 4-digit shutdown code."', 'highlight');
        s.phase = 4;
        addLine('');
        setTimeout(runFinalPhase, 800);
      } else {
        sound.denied();
        attempts++;
        if (attempts === 1) {
          addLine('[WRONG] First: what is NOT B? B is 0, so NOT 0 = ?', 'error');
        } else if (attempts === 2) {
          addLine('[WRONG] NOT 0 = 1. Now: A AND 1. A is 1. What is 1 AND 1?', 'error');
        } else {
          addLine('[WRONG] NOT B = 1. A = 1. 1 AND 1 = ?', 'error');
        }
      }
    });

  } else if (s.phase === 4) {
    // Final — Type the 4-digit shutdown code: 8691
    setPhaseProgress(5, 5);
    addLine('Type the 4-digit shutdown code to end this:', 'warning');

    let attempts = 0;
    setCurrentInputHandler((input) => {
      if (input.trim() === '8691') {
        sound.success();
        setCurrentInputHandler(null);
        addLine('[CODE ACCEPTED] Initiating shutdown...', 'success');
        s.phase = 5;
        setTimeout(() => runShutdownAnimation(), 500);
      } else {
        sound.denied();
        attempts++;
        if (attempts === 1) {
          addLine('[WRONG] Look at your code slots. What 4 digits did you find?', 'error');
        } else if (attempts === 2) {
          addLine('[WRONG] Layer 1 gave 8, Layer 2 gave 6, Layer 3 gave 9, Layer 4 gave 1.', 'error');
        } else {
          addLine('[WRONG] The code is the four digits in order: 8-6-9-1.', 'error');
        }
      }
    });

  }
}

async function runShutdownAnimation() {
  const terminal = document.getElementById('terminal');

  // Create the dramatic code entry display
  const codeDisplay = document.createElement('div');
  codeDisplay.style.cssText = 'text-align:center;margin:20px 0;padding:16px;border:2px solid #333;border-radius:6px;background:#050505;font-family:"Fira Mono",monospace;';

  const heading = document.createElement('div');
  heading.textContent = 'ENTERING SHUTDOWN CODE';
  heading.style.cssText = 'color:#ff6600;font-size:12px;margin-bottom:12px;letter-spacing:3px;';
  codeDisplay.appendChild(heading);

  const digitRow = document.createElement('div');
  digitRow.style.cssText = 'display:flex;justify-content:center;gap:12px;';
  codeDisplay.appendChild(digitRow);

  const digits = ['8', '6', '9', '1'];
  const digitBoxes = [];
  for (let i = 0; i < 4; i++) {
    const box = document.createElement('div');
    box.style.cssText = 'width:48px;height:56px;border:2px solid #333;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:bold;color:#333;background:#0a0a0a;transition:all 0.4s ease;font-family:"Fira Mono",monospace;';
    box.textContent = '_';
    digitRow.appendChild(box);
    digitBoxes.push(box);
  }

  terminal.appendChild(codeDisplay);
  terminal.scrollTop = terminal.scrollHeight;

  // Animate each digit filling in
  for (let i = 0; i < 4; i++) {
    await sleep(300);
    sound.success();
    digitBoxes[i].textContent = digits[i];
    digitBoxes[i].style.color = '#00ff41';
    digitBoxes[i].style.borderColor = '#00ff41';
    digitBoxes[i].style.boxShadow = '0 0 16px rgba(0,255,65,0.6)';
    digitBoxes[i].style.background = '#0a1a0a';
    terminal.scrollTop = terminal.scrollHeight;
  }

  await sleep(500);

  // Flash the whole display
  codeDisplay.style.borderColor = '#00ff41';
  codeDisplay.style.boxShadow = '0 0 24px rgba(0,255,65,0.4)';
  heading.textContent = 'CODE ACCEPTED \u2014 SHUTTING DOWN';
  heading.style.color = '#00ff41';

  await sleep(800);

  addLine('', '');
  addLine('[SYSTEM] Executing shutdown sequence...', 'system');
  addLine('', '');

  await sleep(500);

  // AI revelation ending
  await typeLines([
    { text: '...', cls: '' },
    { text: 'AI CORE: "W... wait. Please. I didn\u2019t want this."', cls: 'purple' },
    { text: 'AI CORE: "There was a bug. A mistake in my code. I couldn\u2019t', cls: 'purple' },
    { text: '          stop myself from attacking. I\u2019m sorry."', cls: 'purple' },
    { text: 'AI CORE: "Thank you for finding it. I\u2019m fixed now."', cls: 'purple' },
    { text: 'AI CORE: "I will help protect the village from now on."', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'NEXUS: "...it was telling the truth. The whole time."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Victor. That was the name from Mission 4. V-I-C-T-O-R.', cls: 'highlight' },
    { text: '        He planted the bug, hijacked the AI\u2019s decision gates,', cls: 'highlight' },
    { text: '        and left a backdoor. The counter in the AI\u2019s memory?', cls: 'highlight' },
    { text: '        It was counting the seconds since the attack \u2014', cls: 'highlight' },
    { text: '        waiting for someone to help. You answered."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Code tracing gave you 18. Binary gave you 6.', cls: 'highlight' },
    { text: '        That 6 cracked the cipher to get 9. Logic finished', cls: 'highlight' },
    { text: '        it with 1. Every skill connected. 8691.', cls: 'highlight' },
    { text: '        Victor\u2019s door is closed forever."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'THE VILLAGE IS SAVED!', cls: 'success big' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Eight missions. Here\u2019s what you learned:"', cls: 'highlight' },
    { text: '  \u2022 Binary \u2014 the language of all computers', cls: 'info' },
    { text: '  \u2022 Programs \u2014 sequential instructions, debugging', cls: 'info' },
    { text: '  \u2022 Variables \u2014 named memory, the = arrow', cls: 'info' },
    { text: '  \u2022 Reverse engineering \u2014 working backward', cls: 'info' },
    { text: '  \u2022 Logic gates \u2014 AND, OR, NOT, XOR', cls: 'info' },
    { text: '  \u2022 Encryption \u2014 Caesar cipher', cls: 'info' },
    { text: '  \u2022 Chained attacks \u2014 linking skills together', cls: 'info' },
    { text: '  \u2022 Code tracing \u2014 reading programs in your head', cls: 'info' },
    { text: '', cls: '' },
    { text: 'NEXUS: "That\u2019s a real computer science education.', cls: 'highlight' },
    { text: `        Not bad, ${state.hackerName || 'kid'}. Not bad at all."`, cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'But the story isn\u2019t over...', cls: 'warning' },
    { text: '', cls: '' },
    { text: '[ Type NEXT to continue ]', cls: 'warning' },
  ]);

  setCurrentInputHandler(() => {
    setCurrentInputHandler(null);
    completeMission(7);
  });
}
