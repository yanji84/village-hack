// missions/s1/07-encrypted-vault.js
import {
  state, sound,
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

export const mission = {
  id: 6,
  num: '07',
  title: 'THE ENCRYPTED VAULT',
  name: 'The Encrypted Vault',
  desc: 'Five layers deep. Binary, math, encryption, logic, and reverse engineering — all chained. Each answer IS the input to the next.',
  skill: 'SKILL: Chained Attack (Binary + Math + Encryption + Logic + Reverse Engineering)',
  hints: [
    'Each layer uses a skill from a previous mission. Which mission does this layer remind you of?',
    'The output of each layer feeds into the next one. Write down every answer.',
    'Work one step at a time. Don\u2019t try to see the whole chain at once.',
  ],
  run: async function() {
    state.missionState = { phase: 0, hintIdx: 0 };

    await typeLines([
      { text: '[SYSTEM] Encrypted vault detected — left by the saboteur.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Victor\'s vault. Five layers deep. Each answer', cls: 'highlight' },
      { text: '        unlocks the next. If you lose track of your', cls: 'highlight' },
      { text: '        answers, you lose the chain."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);

    const pipelineEl = createPipeline([
      { label: 'BINARY' },
      { label: 'CIPHER' },
      { label: 'LOGIC' },
      { label: 'REVERSE' },
      { label: 'CODE' },
    ]);
    const terminal = document.getElementById('terminal');
    terminal.appendChild(pipelineEl);
    terminal.scrollTop = terminal.scrollHeight;
    state.missionState.pipelineEl = pipelineEl;

    runVaultPhase();
  },
};

function runVaultPhase() {
  const s = state.missionState;

  if (s.phase === 0) {
    // ─── Layer 1: Binary decode + variable math ───
    // a = 1010 (binary) = 10, b = 0011 (binary) = 3, a - b = 7
    addLine('━━━ Layer 1: Binary Lock ━━━', 'highlight');
    addLine('NEXUS: "First layer. Two values stored in the vault\'s memory."', 'highlight');
    addLine('', '');
    addPre('  Two values in the vault\'s memory:\n\n    a = 1 0 1 0  (binary)\n    b = 0 0 1 1  (binary)\n\n  Places:  eights  fours  twos  ones\n\n  Compute:  a - b');
    addLine('', '');
    addLine('What is a - b?', 'warning');

    s.wrongCount = 0;
    setCurrentInputHandler((input) => {
      if (input.trim() === '7') {
        sound.success();
        updatePipeline(s.pipelineEl, 0, '7');
        addLine('[LAYER 1 CRACKED] 1010 = 10, 0011 = 3, 10 - 3 = 7.', 'success');
        addLine('NEXUS: "7. Remember that — it\'s the key to the next lock."', 'highlight');
        s.layer1Answer = 7;
        s.phase = 1;
        addLine('');
        setTimeout(runVaultPhase, 800);
      } else {
        sound.denied();
        s.wrongCount++;
        if (s.wrongCount >= 2) {
          addLine('[WRONG] 1010 = 8+0+2+0 = 10. 0011 = 0+0+2+1 = 3. Now subtract.', 'error');
        } else {
          addLine('[WRONG] Decode each binary number first. Places are eights, fours, twos, ones.', 'error');
        }
      }
    });

  } else if (s.phase === 1) {
    // ─── Layer 2: Caesar cipher using shift = 7 (from Layer 1) ───
    // Encrypt "CODE" with shift 7: C→J, O→V, D→K, E→L → "JVKL"
    const plainWord = 'CODE';
    const shift = s.layer1Answer; // 7
    const encrypted = caesarEncrypt(plainWord, shift); // "JVKL"

    addLine('━━━ Layer 2: Cipher Lock ━━━', 'highlight');
    addLine(`NEXUS: "Layer 2 is encrypted. Your answer from Layer 1 — ${shift} —`, 'highlight');
    addLine('        that\'s the Caesar shift."', 'highlight');
    addLine('', '');
    addLine(`  Encrypted text:  ${encrypted}`, 'info');
    addLine(`  Shift: ${shift}  (from Layer 1)`, 'info');
    addLine('', '');
    addLine('ALPHABET: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z', 'info');
    addLine('', '');
    addLine('Decrypt the word (shift each letter BACKWARD):', 'warning');

    s.wrongCount = 0;
    setCurrentInputHandler((input) => {
      if (input.toUpperCase().trim() === plainWord) {
        sound.success();
        updatePipeline(s.pipelineEl, 1, 'CODE');
        addLine(`[LAYER 2 CRACKED] "${plainWord}".`, 'success');
        addLine('NEXUS: "CODE. Now count its letters — you\'ll need that next."', 'highlight');
        s.layer2Answer = plainWord;
        s.phase = 2;
        addLine('');
        setTimeout(runVaultPhase, 800);
      } else {
        sound.denied();
        s.wrongCount++;
        if (s.wrongCount >= 2) {
          const firstEnc = encrypted[0];
          const firstDec = plainWord[0];
          addLine(`[WRONG] First letter: ${firstEnc} shifted back by ${shift} = ${firstDec}. Do the rest.`, 'error');
        } else {
          addLine(`[WRONG] Shift each letter BACKWARD by ${shift}. J back 7 = ?`, 'error');
        }
      }
    });

  } else if (s.phase === 2) {
    // ─── Layer 3: Logic gates from binary digits of letter count ───
    // "CODE" has 4 letters. 4 in binary = 0100.
    // A=0, B=1, C=0, D=0. Compute: B AND (NOT A)
    // → 1 AND (NOT 0) → 1 AND 1 → 1
    addLine('━━━ Layer 3: Logic Lock ━━━', 'highlight');
    addLine(`NEXUS: "The word ${s.layer2Answer} has 4 letters. Convert 4 to binary: 0100."`, 'highlight');
    addLine('', '');
    addPre('  The word CODE has 4 letters.\n  4 in binary = 0 1 0 0\n\n  Read those 4 binary digits as inputs:\n    A = 0    B = 1    C = 0    D = 0\n\n  Compute:  B AND (NOT A)');
    addLine('', '');
    addLine('What is the result? (0 or 1)', 'warning');

    s.wrongCount = 0;
    setCurrentInputHandler((input) => {
      if (input.trim() === '1') {
        sound.success();
        updatePipeline(s.pipelineEl, 2, '1');
        addLine('[LAYER 3 CRACKED] NOT A = NOT 0 = 1. B AND 1 = 1 AND 1 = 1.', 'success');
        addLine('NEXUS: "1. One more layer before the final code."', 'highlight');
        s.layer3Answer = 1;
        s.phase = 3;
        addLine('');
        setTimeout(runVaultPhase, 800);
      } else {
        sound.denied();
        s.wrongCount++;
        if (s.wrongCount >= 2) {
          addLine('[WRONG] Step 1: NOT A = NOT 0 = 1. Step 2: B AND 1 = 1 AND 1 = ?', 'error');
        } else {
          addLine('[WRONG] Start with NOT A. A is 0. What is NOT 0? Then AND that with B.', 'error');
        }
      }
    });

  } else if (s.phase === 3) {
    // ─── Layer 4: Reverse engineering ───
    // x = ?
    // x = x * 3
    // x = x - 2
    // Output: 13
    // Backward: 13 + 2 = 15, 15 / 3 = 5
    addLine('━━━ Layer 4: Reverse Lock ━━━', 'highlight');
    addLine('NEXUS: "The vault\'s final lock runs a program. Work backward."', 'highlight');
    addLine('', '');
    addPre('  The vault\'s final lock runs this program:\n\n    x = ?        ← find this\n    x = x * 3\n    x = x - 2\n    Output: 13\n\n  Work backward from the output to find the starting x.');
    addLine('', '');
    addLine('What is x?', 'warning');

    s.wrongCount = 0;
    setCurrentInputHandler((input) => {
      if (input.trim() === '5') {
        sound.success();
        updatePipeline(s.pipelineEl, 3, '5');
        addLine('[LAYER 4 CRACKED] 13 + 2 = 15. 15 / 3 = 5. x = 5.', 'success');
        addLine('NEXUS: "5. Now assemble all your answers into the vault code."', 'highlight');
        s.layer4Answer = 5;
        s.phase = 4;
        addLine('');
        setTimeout(runVaultPhase, 800);
      } else {
        sound.denied();
        s.wrongCount++;
        if (s.wrongCount >= 2) {
          addLine('[WRONG] Undo line 3: 13 + 2 = 15. Now undo line 2: 15 / 3 = ?', 'error');
        } else {
          addLine('[WRONG] Work backward. The last step was x = x - 2. Undo it: 13 + 2 = ?', 'error');
        }
      }
    });

  } else if (s.phase === 4) {
    // ─── Layer 5: Assemble the vault code ───
    // Answers: 7, CODE, 1, 5. Numbers only: 7-1-5 → 715
    addLine('━━━ Layer 5: Vault Code ━━━', 'highlight');
    addLine('NEXUS: "You have all the pieces. Time to assemble the vault code."', 'highlight');
    addLine('', '');
    addPre('  Your answers through the chain:\n\n    Layer 1:  7\n    Layer 2:  CODE\n    Layer 3:  1\n    Layer 4:  5\n\n  The vault code is the NUMBERS only, in order: 7-1-5');
    addLine('', '');
    addLine('Enter the vault code (numbers only, no dashes):', 'warning');

    s.wrongCount = 0;
    setCurrentInputHandler((input) => {
      if (input.trim() === '715') {
        sound.success();
        updatePipeline(s.pipelineEl, 4, '715');
        addLine('[VAULT CODE ACCEPTED] 7-1-5.', 'success');
        addLine('', '');
        addLine('[VAULT OPEN]', 'success big');
        addLine('', '');
        addLine('NEXUS: "Five layers. Binary, math, encryption, logic, reverse', 'highlight');
        addLine('        engineering — all chained. That\'s how real security', 'highlight');
        addLine('        systems work. And you just cracked one."', 'highlight');
        addLine('', '');
        addLine('NEXUS: "Inside the vault — it\'s Victor\'s backdoor code. We', 'highlight');
        addLine('        can use this to shut him out in the final hack."', 'highlight');
        addLine('', '');
        addLine('[ Type NEXT to continue ]', 'warning');
        setCurrentInputHandler(() => {
          setCurrentInputHandler(null);
          completeMission(6);
        });
      } else {
        sound.denied();
        s.wrongCount++;
        if (s.wrongCount >= 2) {
          addLine('[WRONG] Take only the numbers from your answers: 7, 1, 5. Combine them.', 'error');
        } else {
          addLine('[WRONG] Look at your four answers. Which ones are numbers? Put them together.', 'error');
        }
      }
    });
  }
}
