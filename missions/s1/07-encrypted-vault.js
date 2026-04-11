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
  desc: 'Chain binary, encryption, and logic together to crack a multi-layered vault. Each layer\u2019s answer unlocks the next.',
  skill: 'SKILL: Chained Attack (Binary + Encryption + Logic)',
  hints: [
    'Each layer uses a skill from a previous mission. Which mission does this layer remind you of?',
    'The output of each layer feeds into the next one. Write down every answer.',
    'Work one step at a time. Don\u2019t try to see the whole chain at once.',
  ],
  run: async function() {
    state.missionState = { phase: 0, hintIdx: 0 };

    await typeLines([
      { text: '[SYSTEM] Encrypted vault detected \u2014 left by the saboteur.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Victor left a vault behind. If the backdoor code', cls: 'highlight' },
      { text: '        is anywhere, it\u2019s in here. Three layers of', cls: 'highlight' },
      { text: '        security. Each one uses a different trick you\u2019ve', cls: 'highlight' },
      { text: '        already learned."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "The answer from each layer is the KEY to the next.', cls: 'highlight' },
      { text: '        That\u2019s a CHAINED ATTACK. Real hackers do this all', cls: 'highlight' },
      { text: '        the time. Let\u2019s go layer by layer."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);

    const pipelineEl = createPipeline([
      { label: 'BINARY' },
      { label: 'CIPHER' },
      { label: 'LOGIC' },
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
    // Layer 1: Binary → number (becomes the cipher shift)
    addLine('\u2501\u2501\u2501 Layer 1: Binary Lock \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "First layer. A binary number on the lock."', 'highlight');
    addLine('', '');
    addPre('  Lock display:  0 1 1 0\n\n  Places: eights  fours  twos  ones');
    addLine('', '');
    addLine('What number is this?', 'warning');

    setCurrentInputHandler((input) => {
      // 0110 = 6
      if (input.trim() === '6') {
        sound.success();
        updatePipeline(s.pipelineEl, 0, '6');
        addLine('[LAYER 1 CRACKED] 0110 = 6.', 'success');
        addLine('NEXUS: "6. Remember that number \u2014 you\u2019ll need it."', 'highlight');
        s.shiftKey = 6;
        s.phase = 1;
        addLine('');
        setTimeout(runVaultPhase, 800);
      } else {
        sound.denied();
        s.wrongCount = (s.wrongCount || 0) + 1;
        if (s.wrongCount >= 2) {
          addLine('[WRONG] 0 + 4 + 2 + 0 = ?', 'error');
        } else {
          addLine('[WRONG] Places are eights, fours, twos, ones. Which have a 1?', 'error');
        }
      }
    });

  } else if (s.phase === 1) {
    // Layer 2: Use the number as a Caesar shift to decrypt a word
    const plainWord = 'OPEN';
    const shift = s.shiftKey; // 6
    const encrypted = caesarEncrypt(plainWord, shift);

    addLine('\u2501\u2501\u2501 Layer 2: Cipher Lock \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "Layer 2 is encrypted. But you just got the key \u2014', 'highlight');
    addLine(`        the number ${shift}. That\u2019s the Caesar shift."`, 'highlight');
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
        updatePipeline(s.pipelineEl, 1, 'OPEN');
        addLine(`[LAYER 2 CRACKED] "${plainWord}".`, 'success');
        addLine('NEXUS: "OPEN. That\u2019s the command for the last lock."', 'highlight');
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
          addLine('[WRONG] Shift each letter BACKWARD through the alphabet.', 'error');
        }
      }
    });

  } else if (s.phase === 2) {
    // Layer 3: Logic gate expression
    addLine('\u2501\u2501\u2501 Layer 3: Logic Lock \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "Final layer. The lock needs a logic computation."', 'highlight');
    addLine('', '');
    addPre('  The vault door runs this circuit:\n\n    A = 1\n    B = 0\n    C = (NOT B) AND A\n\n  What is C?');
    addLine('', '');
    addLine('NEXUS: "Work inside out. NOT B first, then AND with A."', 'highlight');
    addLine('', '');
    addLine('What is C? (0 or 1)', 'warning');

    s.wrongCount = 0;
    setCurrentInputHandler((input) => {
      // NOT 0 = 1, 1 AND 1 = 1
      if (input.trim() === '1') {
        sound.success();
        updatePipeline(s.pipelineEl, 2, '1');
        addLine('[LAYER 3 CRACKED] NOT 0 = 1. Then 1 AND 1 = 1. C = 1.', 'success');
        addLine('', '');
        addLine('[VAULT OPEN]', 'success big');
        addLine('', '');
        addLine('NEXUS: "Three layers. Binary gave you the key. The key', 'highlight');
        addLine('        cracked the cipher. The cipher told you the', 'highlight');
        addLine('        command. The command needed logic to execute."', 'highlight');
        addLine('', '');
        addLine('NEXUS: "That\u2019s a chained attack. Each skill is a link.', 'highlight');
        addLine('        Break one, use it to break the next. This is how', 'highlight');
        addLine('        real breaches work \u2014 not one big hack, but a', 'highlight');
        addLine('        chain of small ones."', 'highlight');
        addLine('', '');
        addLine('NEXUS: "Inside the vault \u2014 it\u2019s the BACKDOOR code.', 'highlight');
        addLine('        Victor\u2019s way back in. If we can use this in the', 'highlight');
        addLine('        final hack, we can shut him out permanently."', 'highlight');
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
          addLine('[WRONG] Step 1: NOT B = NOT 0 = 1. Step 2: 1 AND A = 1 AND 1 = ?', 'error');
        } else {
          addLine('[WRONG] Start with NOT B. B is 0. What is NOT 0?', 'error');
        }
      }
    });
  }
}
