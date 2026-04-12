// missions/s1/07-encrypted-vault.js
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

// ─── Vault Lockout Timer (cosmetic) ───
function createTimer(terminal) {
  const timerEl = document.createElement('div');
  timerEl.style.cssText = 'position:sticky;top:0;right:0;float:right;background:#0a0a0a;border:1px solid #aa0000;border-radius:4px;padding:4px 12px;font-family:"Press Start 2P","Fira Mono",monospace;font-size:13px;color:#ff3333;z-index:10;text-align:center;margin-bottom:8px;';
  timerEl.innerHTML = '<div style="font-size:8px;color:#aa0000;margin-bottom:2px;">VAULT LOCKOUT</div><div class="timer-digits">5:00</div>';
  terminal.appendChild(timerEl);

  let totalSeconds = 300; // 5 minutes
  const digitsEl = timerEl.querySelector('.timer-digits');

  const intervalId = setInterval(() => {
    totalSeconds--;
    if (totalSeconds <= 0) {
      totalSeconds = 0;
      clearInterval(intervalId);
      digitsEl.textContent = '0:00';
      addLine('NEXUS: "Close call — I bypassed the timer. But in real life you wouldn\'t get that luxury."', 'highlight');
    } else {
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      digitsEl.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
    }
    if (totalSeconds <= 60) {
      timerEl.style.borderColor = '#ff0000';
      digitsEl.style.color = '#ff0000';
      digitsEl.style.textShadow = '0 0 8px #ff0000';
    }
  }, 1000);

  return intervalId;
}

// ─── Vault Door Spectacle Animation ───
async function showVaultAnimation(terminal) {
  const vaultContainer = document.createElement('div');
  vaultContainer.style.cssText = 'border:2px solid #00ff41;background:#0a0a0a;border-radius:8px;padding:24px 32px;margin:16px auto;max-width:380px;text-align:center;box-shadow:0 0 20px rgba(0,255,65,0.2);';

  const title = document.createElement('div');
  title.textContent = 'VAULT DOOR';
  title.style.cssText = 'font-family:"Press Start 2P","Fira Mono",monospace;font-size:12px;color:#00ff41;margin-bottom:16px;letter-spacing:3px;';
  vaultContainer.appendChild(title);

  // Tumbler row
  const tumblerRow = document.createElement('div');
  tumblerRow.style.cssText = 'display:flex;justify-content:center;gap:20px;margin-bottom:12px;';

  const correctDigits = ['7', '1', '3'];
  const tumblers = [];

  for (let i = 0; i < 3; i++) {
    const tumbler = document.createElement('div');
    tumbler.style.cssText = 'width:52px;height:60px;border:2px solid #333;border-radius:6px;background:#111;display:flex;align-items:center;justify-content:center;font-family:"Press Start 2P","Fira Mono",monospace;font-size:28px;color:#666;transition:all 0.3s ease;';
    tumbler.textContent = '-';
    tumblerRow.appendChild(tumbler);
    tumblers.push(tumbler);
  }
  vaultContainer.appendChild(tumblerRow);

  // Check marks row
  const checkRow = document.createElement('div');
  checkRow.style.cssText = 'display:flex;justify-content:center;gap:20px;margin-bottom:16px;';
  const checks = [];
  for (let i = 0; i < 3; i++) {
    const check = document.createElement('div');
    check.style.cssText = 'width:52px;text-align:center;font-size:16px;color:#333;';
    check.textContent = ' ';
    checkRow.appendChild(check);
    checks.push(check);
  }
  vaultContainer.appendChild(checkRow);

  // Horizontal bar
  const barTrack = document.createElement('div');
  barTrack.style.cssText = 'width:100%;height:6px;background:#1a1a1a;border-radius:3px;margin-bottom:16px;overflow:hidden;';
  const barFill = document.createElement('div');
  barFill.style.cssText = 'width:0%;height:100%;background:#00ff41;border-radius:3px;transition:width 0.8s ease;';
  barTrack.appendChild(barFill);
  vaultContainer.appendChild(barTrack);

  // VAULT OPEN text
  const vaultOpenText = document.createElement('div');
  vaultOpenText.textContent = 'VAULT  OPEN';
  vaultOpenText.style.cssText = 'font-family:"Press Start 2P","Fira Mono",monospace;font-size:18px;color:#00ff41;letter-spacing:4px;opacity:0;transition:opacity 0.6s ease;text-shadow:0 0 10px #00ff41;';
  vaultContainer.appendChild(vaultOpenText);

  terminal.appendChild(vaultContainer);
  terminal.scrollTop = terminal.scrollHeight;

  // Animate each tumbler
  for (let i = 0; i < 3; i++) {
    const tumbler = tumblers[i];
    const target = correctDigits[i];

    // Spin through random digits for 500ms
    const spinStart = Date.now();
    while (Date.now() - spinStart < 500) {
      tumbler.textContent = String(Math.floor(Math.random() * 10));
      tumbler.style.color = '#ffaa00';
      await sleep(40);
    }

    // Land on correct digit
    tumbler.textContent = target;
    tumbler.style.color = '#00ff41';
    tumbler.style.borderColor = '#00ff41';
    tumbler.style.boxShadow = '0 0 12px rgba(0,255,65,0.5)';
    checks[i].textContent = '\u2713';
    checks[i].style.color = '#00ff41';
    sound.success();

    await sleep(300);
  }

  // Slide bar across
  await sleep(200);
  barFill.style.width = '100%';
  await sleep(800);

  // VAULT OPEN glow
  vaultOpenText.style.opacity = '1';
  await sleep(600);

  terminal.scrollTop = terminal.scrollHeight;
}

export const mission = {
  id: 6,
  num: '07',
  title: 'THE ENCRYPTED VAULT',
  name: 'The Encrypted Vault',
  desc: 'Five layers deep. Binary, variables, encryption, logic, and cryptanalysis — all chained. Each answer IS the input to the next.',
  skill: 'SKILL: Chained Attack (Binary + Variables + Encryption + Logic + Cryptanalysis)',
  hints: [
    'Each layer uses a skill from a previous mission. Which mission does this layer remind you of?',
    'The output of each layer feeds into the next one. Write down every answer.',
    'Work one step at a time. Don\'t try to see the whole chain at once.',
  ],
  run: async function() {
    state.missionState = { phase: 0, hintIdx: 0 };

    const terminal = document.getElementById('terminal');

    await typeLines([
      { text: '[SYSTEM] Encrypted vault detected — left by the saboteur.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Victor\'s vault. Five layers deep. Each answer', cls: 'highlight' },
      { text: '        unlocks the next. A timer is running — work fast', cls: 'highlight' },
      { text: '        but don\'t rush."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);

    // Start cosmetic timer
    state.missionState.timerId = createTimer(terminal);

    const pipelineEl = createPipeline([
      { label: 'BINARY' },
      { label: 'CIPHER' },
      { label: 'LOGIC' },
      { label: 'CRACK' },
      { label: 'CODE' },
    ]);
    terminal.appendChild(pipelineEl);
    terminal.scrollTop = terminal.scrollHeight;
    state.missionState.pipelineEl = pipelineEl;

    runVaultPhase();
  },
};

function runVaultPhase() {
  const s = state.missionState;
  const terminal = document.getElementById('terminal');

  if (s.phase === 0) {
    // ─── Layer 1: Binary decode + subtraction ───
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
        addLine('NEXUS: "7. Remember that — it feeds into the next lock."', 'highlight');
        s.layer1Answer = 7;
        s.phase = 1;
        addLine('');
        setTimeout(runVaultPhase, 800);
      } else {
        sound.denied();
        s.wrongCount++;
        if (s.wrongCount >= 3) {
          addLine('[WRONG] 1010: the 8-place is ON (8), the 2-place is ON (2). 8+2=10. 0011: 2+1=3. 10-3=?', 'error');
        } else if (s.wrongCount >= 2) {
          addLine('[WRONG] 1010 = 8+0+2+0 = 10. 0011 = 0+0+2+1 = 3. Now subtract.', 'error');
        } else {
          addLine('[WRONG] Decode each binary number first. Places are eights, fours, twos, ones.', 'error');
        }
      }
    });

  } else if (s.phase === 1) {
    // ─── Layer 2: Variables + Encryption BLENDED ───
    // Trace program to find shift (key=7), then decrypt "JVKL" with shift 7 → "CODE"
    const plainWord = 'CODE';
    const shift = 7;
    const encrypted = caesarEncrypt(plainWord, shift); // "JVKL"

    addLine('━━━ Layer 2: Cipher Lock ━━━', 'highlight');
    addLine('NEXUS: "Two skills in one. Trace the program to find the shift,', 'highlight');
    addLine('        then decrypt the message."', 'highlight');
    addLine('', '');
    addPre('  Step 1: Trace this program to find the cipher shift:\n\n    key = 2\n    key = key * 3\n    key = key + 1\n\n  Step 2: Use that shift to decrypt:\n\n    Encrypted text:  ' + encrypted + '\n\n  ALPHABET: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z\n\n  Shift each letter BACKWARD by the key value.');
    addLine('', '');
    addLine('What is the DECRYPTED word?', 'warning');

    s.wrongCount = 0;
    setCurrentInputHandler((input) => {
      const answer = input.toUpperCase().trim();
      if (answer === plainWord) {
        sound.success();
        updatePipeline(s.pipelineEl, 1, 'CODE');
        addLine(`[LAYER 2 CRACKED] key = 2, then 6, then 7. Shift 7: ${encrypted} → ${plainWord}.`, 'success');
        addLine('NEXUS: "CODE. Now count its letters — you\'ll need that next."', 'highlight');
        s.layer2Answer = plainWord;
        s.phase = 2;
        addLine('');
        setTimeout(runVaultPhase, 800);
      } else {
        sound.denied();
        s.wrongCount++;
        if (s.wrongCount >= 3) {
          addLine(`[WRONG] key starts at 2. 2*3=6. 6+1=7. Now shift ${encrypted[0]} back by 7: J→I→H→G→F→E→D→C. First letter is C.`, 'error');
        } else if (s.wrongCount >= 2) {
          addLine(`[WRONG] Trace: key=2, key=2*3=6, key=6+1=7. The shift is 7. Now decrypt ${encrypted}.`, 'error');
        } else {
          addLine('[WRONG] First trace the program: key starts at 2, gets multiplied by 3, then add 1. What is key?', 'error');
        }
      }
    });

  } else if (s.phase === 2) {
    // ─── Layer 3: Logic + Binary BLENDED ───
    // CODE has 4 letters. 4 = 0100 binary. A=0, B=1, C=0, D=0.
    // (B OR D) AND (NOT A) = (1 OR 0) AND (NOT 0) = 1 AND 1 = 1
    addLine('━━━ Layer 3: Logic Lock ━━━', 'highlight');
    addLine('NEXUS: "The word CODE has 4 letters. Convert that to binary — those bits are your gate inputs."', 'highlight');
    addLine('', '');
    addPre('  The word CODE has 4 letters.\n  4 in binary = 0 1 0 0\n\n  Read those 4 binary digits as inputs:\n    A = 0    B = 1    C = 0    D = 0\n\n  Compute:  (B OR D) AND (NOT A)');
    addLine('', '');
    addLine('What is the result? (0 or 1)', 'warning');

    s.wrongCount = 0;
    setCurrentInputHandler((input) => {
      if (input.trim() === '1') {
        sound.success();
        updatePipeline(s.pipelineEl, 2, '1');
        addLine('[LAYER 3 CRACKED] B OR D = 1 OR 0 = 1. NOT A = NOT 0 = 1. 1 AND 1 = 1.', 'success');
        addLine('NEXUS: "1. Now the hardest layer — cryptanalysis."', 'highlight');
        s.layer3Answer = 1;
        s.phase = 3;
        addLine('');
        setTimeout(runVaultPhase, 800);
      } else {
        sound.denied();
        s.wrongCount++;
        if (s.wrongCount >= 3) {
          addLine('[WRONG] Inside the parentheses first: B OR D = 1 OR 0 = 1. NOT A = NOT 0 = 1. Now: 1 AND 1 = ?', 'error');
        } else if (s.wrongCount >= 2) {
          addLine('[WRONG] Step 1: B OR D → 1 OR 0 = 1. Step 2: NOT A → NOT 0 = 1. Step 3: 1 AND 1 = ?', 'error');
        } else {
          addLine('[WRONG] Work inside the parentheses first. What is B OR D? What is NOT A? Then AND those results.', 'error');
        }
      }
    });

  } else if (s.phase === 3) {
    // ─── Layer 4: Cryptanalysis — deduce the shift ───
    // Plaintext "VIRUS" encrypted with shift 3 → "YLUXV"
    // First encrypted letter Y, known plain V. Y-V = 3. Shift = 3.
    // Then decrypt full message with shift 3 → VIRUS
    addLine('━━━ Layer 4: Cryptanalysis Lock ━━━', 'highlight');
    addLine('NEXUS: "We intercepted Victor\'s encrypted notes. The shift is UNKNOWN.', 'highlight');
    addLine('        But we know the plaintext starts with V — Victor\'s signature."', 'highlight');
    addLine('', '');
    addPre('  Intercepted encrypted text:  Y L U X V\n\n  Known: the first PLAIN letter is  V\n  The first ENCRYPTED letter is    Y\n\n  How many positions from V to Y?\n  V → W → X → Y  =  ? positions');
    addLine('', '');
    addLine('What is the shift? (a number)', 'warning');

    s.wrongCount = 0;
    s.subPhase = 'shift'; // two-part question
    setCurrentInputHandler((input) => {
      const answer = input.trim();

      if (s.subPhase === 'shift') {
        if (answer === '3') {
          sound.success();
          addLine('[SHIFT FOUND] V → W → X → Y = 3 positions. The shift is 3.', 'success');
          addLine('', '');
          addLine('NEXUS: "Good. Now use shift 3 to decrypt the FULL message."', 'highlight');
          addLine('', '');
          addPre('  Encrypted text:  Y L U X V\n  Shift: 3 (shift each letter BACKWARD by 3)\n\n  ALPHABET: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z');
          addLine('', '');
          addLine('What is the decrypted message?', 'warning');
          s.subPhase = 'decrypt';
          s.wrongCount = 0;
        } else {
          sound.denied();
          s.wrongCount++;
          if (s.wrongCount >= 3) {
            addLine('[WRONG] Count on your fingers: V is position 1, W is 2, X is 3... no wait. V→W is 1 step, W→X is 2 steps, X→Y is 3 steps.', 'error');
          } else if (s.wrongCount >= 2) {
            addLine('[WRONG] The plain letter is V. The encrypted letter is Y. Count: V→W(1), W→X(2), X→Y(3).', 'error');
          } else {
            addLine('[WRONG] Count the distance from V to Y in the alphabet. V→W→X→Y is how many steps?', 'error');
          }
        }
      } else if (s.subPhase === 'decrypt') {
        if (answer.toUpperCase() === 'VIRUS') {
          sound.success();
          updatePipeline(s.pipelineEl, 3, '3');
          addLine('[LAYER 4 CRACKED] YLUXV with shift 3: Y→V, L→I, U→R, X→U, V→S = VIRUS.', 'success');
          addLine('NEXUS: "VIRUS. That\'s what Victor planted. Now — assemble the vault code."', 'highlight');
          s.layer4Shift = 3;
          s.layer4Answer = 'VIRUS';
          s.phase = 4;
          addLine('');
          setTimeout(runVaultPhase, 800);
        } else {
          sound.denied();
          s.wrongCount++;
          if (s.wrongCount >= 3) {
            addLine('[WRONG] Y back 3 = V. L back 3 = I. U back 3 = R. X back 3 = U. V back 3 = S. Put them together.', 'error');
          } else if (s.wrongCount >= 2) {
            addLine('[WRONG] First letter: Y back 3 → Y→X→W→V. So V. Do the same for L, U, X, V.', 'error');
          } else {
            addLine('[WRONG] Shift each letter BACKWARD by 3. Y back 3 = ? L back 3 = ? Keep going.', 'error');
          }
        }
      }
    });

  } else if (s.phase === 4) {
    // ─── Layer 5: Assemble vault code ───
    // Numbers from layers: 7 (L1), 1 (L3), 3 (L4 shift) → 713
    addLine('━━━ Layer 5: Vault Code ━━━', 'highlight');
    addLine('NEXUS: "You have all the pieces. Time to assemble the vault code."', 'highlight');
    addLine('', '');
    addPre('  Your answers through the chain:\n\n    Layer 1 (Binary):        7\n    Layer 2 (Cipher):        CODE\n    Layer 3 (Logic):         1\n    Layer 4 (Cryptanalysis): shift = 3, message = VIRUS\n\n  The vault code uses the KEY NUMBERS, in order:\n    7  —  1  —  3');
    addLine('', '');
    addLine('Enter the vault code (numbers only, no dashes):', 'warning');

    s.wrongCount = 0;
    setCurrentInputHandler(async (input) => {
      if (input.trim() === '713') {
        // Clear the timer
        if (s.timerId) {
          clearInterval(s.timerId);
        }

        sound.success();
        updatePipeline(s.pipelineEl, 4, '713');
        addLine('[VAULT CODE ACCEPTED] 7-1-3.', 'success');
        addLine('', '');

        // ─── Vault Door Animation ───
        await showVaultAnimation(terminal);

        addLine('', '');
        addLine('NEXUS: "You just did something new — you DEDUCED the cipher key', 'highlight');
        addLine('        from partial knowledge. That\'s called cryptanalysis.', 'highlight');
        addLine('        That\'s how codes were broken in every war since Caesar."', 'highlight');
        addLine('', '');
        addLine('NEXUS: "Inside the vault — Victor\'s backdoor code. We use this', 'highlight');
        addLine('        in the final hack."', 'highlight');
        addLine('', '');
        addLine('[ Type NEXT to continue ]', 'warning');
        setCurrentInputHandler(() => {
          setCurrentInputHandler(null);
          completeMission(6);
        });
      } else {
        sound.denied();
        s.wrongCount++;
        if (s.wrongCount >= 3) {
          addLine('[WRONG] The three numbers are 7, 1, and 3. Just type them together: 713.', 'error');
        } else if (s.wrongCount >= 2) {
          addLine('[WRONG] Take only the numbers from your answers: 7 (Layer 1), 1 (Layer 3), 3 (the shift from Layer 4). Combine them.', 'error');
        } else {
          addLine('[WRONG] Look at your answers across all layers. Which ones are numbers? Put them together in order.', 'error');
        }
      }
    });
  }
}
