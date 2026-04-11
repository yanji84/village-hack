// missions/s1/08-final-hack.js
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
    state.missionState = { phase: 0, hintIdx: 0 };

    await typeLines([
      { text: '[CORE EXPOSED] The AI is within reach.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "This is it. We use Victor\u2019s own code against him.', cls: 'highlight' },
      { text: '        Four security layers between us and the AI\u2019s core.', cls: 'highlight' },
      { text: '        Everything you\u2019ve learned \u2014 binary, programs,', cls: 'highlight' },
      { text: '        variables, logic, encryption. All of it."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Let\u2019s end this."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);

    const pipelineEl = createPipeline([
      { label: 'CODE' },
      { label: 'BINARY' },
      { label: 'CIPHER' },
      { label: 'LOGIC' },
    ]);
    const terminal = document.getElementById('terminal');
    terminal.appendChild(pipelineEl);
    terminal.scrollTop = terminal.scrollHeight;
    state.missionState.pipelineEl = pipelineEl;

    runFinalPhase();
  },
};

function runFinalPhase() {
  const s = state.missionState;

  if (s.phase === 0) {
    // Layer 1: Trace a program with variables
    addLine('\u2501\u2501\u2501 Layer 1: Code Trace \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "The first lock runs a program. Trace it to find', 'highlight');
    addLine('        the password."', 'highlight');
    addLine('', '');
    addPre('  1  key = 3\n  2  key = key * 4\n  3  key = key - 2');
    addLine('', '');
    addLine('What is key after line 3?', 'warning');

    setCurrentInputHandler((input) => {
      // key=3, key=12, key=10
      if (input.trim() === '10') {
        sound.success();
        updatePipeline(s.pipelineEl, 0, '10');
        addLine('[LAYER 1] key = 3 \u2192 12 \u2192 10. Password: 10.', 'success');
        addLine('NEXUS: "Variables and tracing. Clean."', 'highlight');
        s.phase = 1;
        s.traceResult = 10;
        addLine('');
        setTimeout(runFinalPhase, 800);
      } else {
        sound.denied();
        addLine('[WRONG] Line by line: key=3, then key=3*4=?, then subtract 2.', 'error');
      }
    });

  } else if (s.phase === 1) {
    // Layer 2: Binary decode → becomes Caesar shift
    addLine('\u2501\u2501\u2501 Layer 2: Binary Key \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "The next lock shows binary. Decode it \u2014 you\u2019ll', 'highlight');
    addLine('        need this number for Layer 3."', 'highlight');
    addLine('', '');
    addPre('  Lock display:  0 1 0 1\n\n  Places: eights  fours  twos  ones');
    addLine('', '');
    addLine('What number is this?', 'warning');

    setCurrentInputHandler((input) => {
      // 0101 = 5
      if (input.trim() === '5') {
        sound.success();
        updatePipeline(s.pipelineEl, 1, '5');
        addLine('[LAYER 2] 0101 = 5.', 'success');
        addLine('NEXUS: "5. Hold onto that."', 'highlight');
        s.binaryResult = 5;
        s.phase = 2;
        addLine('');
        setTimeout(runFinalPhase, 800);
      } else {
        sound.denied();
        addLine('[WRONG] 0 + 4 + 0 + 1 = ?', 'error');
      }
    });

  } else if (s.phase === 2) {
    // Layer 3: Caesar decrypt using binary result as shift
    const shift = s.binaryResult; // 5
    const plainWord = 'FREE';
    const encrypted = caesarEncrypt(plainWord, shift);

    addLine('\u2501\u2501\u2501 Layer 3: Encrypted Command \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "Encrypted message. Your shift is the number from', 'highlight');
    addLine(`        Layer 2: ${shift}."`, 'highlight');
    addLine('', '');
    addLine(`  Cipher: ${encrypted}`, 'info');
    addLine(`  Shift: ${shift}`, 'info');
    addLine('', '');
    addLine('ALPHABET: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z', 'info');
    addLine('', '');
    addLine('Decrypt the word:', 'warning');

    setCurrentInputHandler((input) => {
      if (input.toUpperCase().trim() === plainWord) {
        sound.success();
        updatePipeline(s.pipelineEl, 2, 'FREE');
        addLine(`[LAYER 3] "${plainWord}". The AI wants to be freed.`, 'success');
        s.phase = 3;
        addLine('');
        setTimeout(runFinalPhase, 800);
      } else {
        sound.denied();
        addLine(`[WRONG] Shift each letter backward by ${shift} in the alphabet.`, 'error');
      }
    });

  } else if (s.phase === 3) {
    // Layer 4: Logic gate — final door
    addLine('\u2501\u2501\u2501 Layer 4: Logic Override \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "Last lock. A logic circuit controls the shutdown."', 'highlight');
    addLine('', '');
    addPre('  The shutdown switch:\n\n    A = 1\n    B = 1\n    Result = A XOR B\n\n  Remember: XOR = 1 when inputs are DIFFERENT.');
    addLine('', '');
    addLine('What is the result? (0 or 1)', 'warning');

    setCurrentInputHandler((input) => {
      // 1 XOR 1 = 0 (same, not different)
      if (input.trim() === '0') {
        sound.success();
        updatePipeline(s.pipelineEl, 3, '0');
        addLine('[LAYER 4] 1 XOR 1 = 0. Both the same \u2192 XOR outputs 0.', 'success');
        addLine('', '');
        addLine('NEXUS: "All four layers down. Initiating shutdown..."', 'highlight');
        s.phase = 4;
        addLine('');
        setTimeout(runFinalPhase, 1000);
      } else {
        sound.denied();
        addLine('[WRONG] XOR is 1 when inputs are DIFFERENT. Are 1 and 1 different?', 'error');
      }
    });

  } else if (s.phase === 4) {
    // Ending — AI revelation + NEXUS reaction
    addLine('[SYSTEM] Executing shutdown sequence...', 'system');
    addLine('', '');

    setTimeout(async () => {
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
        { text: 'NEXUS: "You did good. Better than good. Go get some rest.', cls: 'highlight' },
        { text: '        Victor\u2019s still out there. But that\u2019s a problem', cls: 'highlight' },
        { text: '        for another day."', cls: 'highlight' },
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
    }, 500);
  }
}
