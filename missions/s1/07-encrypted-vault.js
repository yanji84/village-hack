// missions/s1/07-encrypted-vault.js
import {
  state, sound, sleep,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission,
} from '../../engine.js';

import { caesarEncrypt } from '../helpers.js';

// ─── Evidence Board (Act 1) ───

function createEvidenceBoard(onCardClick) {
  const board = document.createElement('div');
  board.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0;padding:12px;border:1px solid #1a2a1a;border-radius:6px;background:#050505;';

  const files = [
    { num: 1, name: 'access_log.bin', type: 'BINARY + MATH' },
    { num: 2, name: 'note.enc', type: 'CRYPTANALYSIS' },
    { num: 3, name: 'circuit.log', type: 'LOGIC GATES' },
    { num: 4, name: 'vault_key.prog', type: 'VARIABLE TRACE' },
  ];

  files.forEach(f => {
    const card = document.createElement('div');
    card.className = 'evidence-card';
    card.dataset.fileNum = f.num;
    card.style.cssText = 'border:1px solid #333;border-radius:4px;padding:10px;background:#0a0a0a;font-family:"Fira Mono",monospace;transition:all 0.3s;cursor:pointer;';

    card.onmouseenter = () => {
      if (!card.dataset.decoded) {
        card.style.borderColor = '#ffaa00';
        card.style.boxShadow = '0 0 8px rgba(255,170,0,0.3)';
      }
    };
    card.onmouseleave = () => {
      if (!card.dataset.decoded) {
        card.style.borderColor = '#333';
        card.style.boxShadow = 'none';
      }
    };
    card.onclick = () => {
      if (card.dataset.decoded) return;
      if (onCardClick) onCardClick(f.num);
    };

    const header = document.createElement('div');
    header.style.cssText = 'font-size:11px;color:#ffaa00;margin-bottom:4px;font-weight:bold;';
    header.textContent = `FILE ${f.num}: ${f.name}`;
    card.appendChild(header);

    const typeLine = document.createElement('div');
    typeLine.style.cssText = 'font-size:9px;color:#666;margin-bottom:6px;';
    typeLine.textContent = f.type;
    card.appendChild(typeLine);

    const status = document.createElement('div');
    status.className = 'evidence-status';
    status.style.cssText = 'font-size:10px;color:#555;';
    status.textContent = '[ CLICK TO EXAMINE ]';
    card.appendChild(status);

    board.appendChild(card);
  });

  return board;
}

function updateEvidenceCard(board, fileNum, value) {
  const card = board.querySelector(`[data-file-num="${fileNum}"]`);
  if (!card) return;
  card.dataset.decoded = '1';
  card.style.borderColor = '#00ff41';
  card.style.boxShadow = '0 0 8px rgba(0,255,65,0.2)';
  card.style.cursor = 'default';
  const status = card.querySelector('.evidence-status');
  status.style.color = '#00ff41';
  status.textContent = `DECODED: ${value}`;
}

function markDecoy(board, fileNum) {
  const card = board.querySelector(`[data-file-num="${fileNum}"]`);
  if (!card) return;
  card.dataset.decoded = '1'; // prevent further clicks
  card.style.borderColor = '#ff3333';
  card.style.boxShadow = '0 0 8px rgba(255,0,0,0.3)';
  card.style.opacity = '0.5';
  card.style.cursor = 'default';
  const status = card.querySelector('.evidence-status');
  status.style.color = '#ff3333';
  status.textContent = 'DECOY \u2718';
  // Strike-through the header
  const header = card.querySelector('div');
  if (header) header.style.textDecoration = 'line-through';
}

// ─── Workbench (Act 3) ───

function createWorkbench() {
  const bench = document.createElement('div');
  bench.style.cssText = 'display:flex;align-items:center;gap:0;margin:12px 0;padding:10px;border:1px solid #1a2a1a;border-radius:6px;background:#050505;';

  const modules = ['KEY GEN', 'PROCESSOR', 'DECRYPTOR'];
  modules.forEach((name, i) => {
    const box = document.createElement('div');
    box.className = 'module-box';
    box.style.cssText = 'border:1px solid #333;border-radius:4px;padding:8px 14px;background:#0a0a0a;font-family:"Fira Mono",monospace;font-size:11px;color:#555;transition:all 0.4s ease;text-align:center;min-width:80px;';

    const label = document.createElement('div');
    label.style.cssText = 'font-size:10px;color:#666;margin-bottom:4px;';
    label.textContent = name;
    box.appendChild(label);

    const statusEl = document.createElement('div');
    statusEl.className = 'module-status';
    statusEl.style.cssText = 'font-size:9px;color:#aa0000;';
    statusEl.textContent = 'OFFLINE';
    box.appendChild(statusEl);

    bench.appendChild(box);

    if (i < modules.length - 1) {
      const arrow = document.createElement('div');
      arrow.className = 'module-arrow';
      arrow.style.cssText = 'color:#333;margin:0 6px;font-size:12px;font-family:"Fira Mono",monospace;transition:all 0.4s ease;white-space:nowrap;';
      arrow.textContent = '\u2500\u2500\u25B6';
      bench.appendChild(arrow);
    }
  });

  return bench;
}

function activateModule(bench, moduleIdx, value) {
  const boxes = bench.querySelectorAll('.module-box');
  const arrows = bench.querySelectorAll('.module-arrow');
  const box = boxes[moduleIdx];
  if (!box) return;
  box.style.borderColor = '#00ff41';
  box.style.boxShadow = '0 0 8px rgba(0,255,65,0.3)';
  const status = box.querySelector('.module-status');
  status.style.color = '#00ff41';
  status.textContent = `ONLINE: ${value}`;

  if (moduleIdx > 0 && arrows[moduleIdx - 1]) {
    arrows[moduleIdx - 1].style.color = '#00ff41';
  }
}

// ─── Vault Animation ───

async function showVaultAnimation(terminal) {
  const container = document.createElement('div');
  container.style.cssText = 'border:2px solid #00ff41;background:#0a0a0a;border-radius:8px;padding:24px 32px;margin:16px auto;max-width:300px;text-align:center;box-shadow:0 0 20px rgba(0,255,65,0.2);';

  const title = document.createElement('div');
  title.textContent = 'VAULT DOOR';
  title.style.cssText = 'font-family:"Press Start 2P","Fira Mono",monospace;font-size:12px;color:#ffaa00;margin-bottom:16px;letter-spacing:3px;';
  container.appendChild(title);

  const tumbler = document.createElement('div');
  tumbler.style.cssText = 'width:60px;height:68px;border:2px solid #333;border-radius:6px;background:#111;display:flex;align-items:center;justify-content:center;font-family:"Press Start 2P","Fira Mono",monospace;font-size:32px;color:#666;transition:all 0.3s ease;margin:0 auto 12px auto;';
  tumbler.textContent = '-';
  container.appendChild(tumbler);

  const check = document.createElement('div');
  check.style.cssText = 'font-size:18px;color:#333;margin-bottom:16px;';
  check.textContent = ' ';
  container.appendChild(check);

  const barTrack = document.createElement('div');
  barTrack.style.cssText = 'width:100%;height:6px;background:#1a1a1a;border-radius:3px;margin-bottom:16px;overflow:hidden;';
  const barFill = document.createElement('div');
  barFill.style.cssText = 'width:0%;height:100%;background:#00ff41;border-radius:3px;transition:width 0.8s ease;';
  barTrack.appendChild(barFill);
  container.appendChild(barTrack);

  const openText = document.createElement('div');
  openText.textContent = 'VAULT  OPEN';
  openText.style.cssText = 'font-family:"Press Start 2P","Fira Mono",monospace;font-size:18px;color:#00ff41;letter-spacing:4px;opacity:0;transition:opacity 0.6s ease;text-shadow:0 0 10px #00ff41;';
  container.appendChild(openText);

  terminal.appendChild(container);
  terminal.scrollTop = terminal.scrollHeight;

  // Spin through digits — slow down gradually for tension
  const spinDuration = 900;
  const spinStart = Date.now();
  while (Date.now() - spinStart < spinDuration) {
    tumbler.textContent = String(Math.floor(Math.random() * 10));
    tumbler.style.color = '#ffaa00';
    // Slow down as we approach the end for a satisfying deceleration
    const elapsed = Date.now() - spinStart;
    const delay = 30 + Math.floor((elapsed / spinDuration) * 80);
    await sleep(delay);
  }

  // Land on 5
  tumbler.textContent = '5';
  tumbler.style.color = '#00ff41';
  tumbler.style.borderColor = '#00ff41';
  tumbler.style.boxShadow = '0 0 12px rgba(0,255,65,0.5)';
  await sleep(300);
  check.textContent = '\u2713';
  check.style.color = '#00ff41';
  sound.success();

  await sleep(500);
  barFill.style.width = '100%';
  await sleep(900);
  openText.style.opacity = '1';
  await sleep(700);
  terminal.scrollTop = terminal.scrollHeight;
}

// ─── Mission Export ───

export const mission = {
  id: 6,
  num: '07',
  title: 'THE ENCRYPTED VAULT',
  name: 'The Encrypted Vault',
  desc: 'Crack Victor\'s encrypted vault by decoding evidence files, exposing planted decoys, and building a decryption pipeline.',
  skill: 'SKILL: Full Investigation \u2014 Binary, Cryptanalysis, Logic Gates, Variable Tracing, Critical Thinking',
  hints: [
    'Each evidence file uses a different skill you\'ve learned: binary, ciphers, logic gates, and variables.',
    'In the contradiction phase, ask yourself: which files are automatic records vs. things Victor wrote?',
    'When debugging the processor, trace each line. What does multiplying anything by zero always give you?',
  ],
  run: async function() {
    state.missionState = {
      phase: 'intro',
      decoded: { 1: null, 2: null, 3: null, 4: null },
      decodedCount: 0,
      decoyIdentified: false,
      boardEl: null,
      workbenchEl: null,
      wrongCount: 0,
      file2SubPhase: null, // for two-part file 2
    };

    const terminal = document.getElementById('terminal');

    await typeLines([
      { text: '[SYSTEM] Encrypted vault detected on Victor\'s workstation.', cls: 'system' },
      { text: '[SYSTEM] 4 evidence files recovered. Integrity: UNKNOWN.', cls: 'system' },
      { text: '[SYSTEM] WARNING: Possible counter-forensics detected.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "This is it. Victor\'s vault \u2014 everything he\'s been', cls: 'highlight' },
      { text: '        hiding is locked behind this encryption."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Four evidence files. Each one uses a different skill', cls: 'highlight' },
      { text: '        you\'ve learned: binary, ciphers, logic gates, and', cls: 'highlight' },
      { text: '        variable tracing. Decode them all, then we chain', cls: 'highlight' },
      { text: '        the results together to crack the vault."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "But watch out \u2014 Victor knew someone might come looking.', cls: 'highlight' },
      { text: '        He planted fake evidence to throw us off. You\'ll need', cls: 'highlight' },
      { text: '        to figure out which clues are real and which are traps."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);

    // Show evidence board (clickable cards)
    const boardEl = createEvidenceBoard((fileNum) => {
      const s = state.missionState;
      if (s.phase !== 'board') return;
      if (s.decoded[fileNum] !== null) return;
      s.phase = `examine${fileNum}`;
      sound.click();
      startExamine(fileNum);
    });
    terminal.appendChild(boardEl);
    terminal.scrollTop = terminal.scrollHeight;
    state.missionState.boardEl = boardEl;

    addLine('', '');
    addLine('NEXUS: "Pick any file to start. Real investigators follow their instincts."', 'highlight');
    addLine('Click any evidence file to examine it.', 'info');
    addLine('', '');

    state.missionState.phase = 'board';
    setPhaseProgress(1, 8);
    setCurrentInputHandler(null); // no typing needed — click the cards
  },
};

// ─── Act 1: Return to Board ───

function returnToBoard() {
  const s = state.missionState;
  if (s.decodedCount >= 4) {
    // All files decoded -- auto-advance to Act 2
    s.phase = 'contradiction';
    addLine('', '');
    addLine('[ALL FILES DECODED]', 'success');
    setTimeout(startContradiction, 800);
  } else {
    s.phase = 'board';
    setCurrentInputHandler(null); // clicks handle it
    addLine('', '');
    const remaining = 4 - s.decodedCount;
    const encouragement = remaining === 3 ? 'Good start. Three more to crack.'
      : remaining === 2 ? 'Halfway there. Two files left.'
      : 'Almost done \u2014 one file remains.';
    addLine(`NEXUS: "${encouragement}"`, 'highlight');
    addLine(`Click a file to examine. (${remaining} remaining)`, 'info');
  }
}

function startExamine(num) {
  const s = state.missionState;
  s.wrongCount = 0;

  if (num === 1) {
    // FILE 1: access_log.bin (Binary + Variable trace + Reverse engineering)
    addLine('', '');
    addLine('\u2501\u2501\u2501 FILE 1: access_log.bin \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "This is a system-generated log \u2014 the machine wrote it,', 'highlight');
    addLine('        not Victor. That makes it trustworthy. But it\'s stored', 'highlight');
    addLine('        in binary, and there\'s a processing step after."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "Two skills needed here: binary decoding, then variable tracing."', 'highlight');
    addLine('', '');
    addPre('  System log:\n    raw = 1100      (binary)\n\n  Step 1 \u2014 Decode the binary:\n    Place values:  8  4  2  1\n    Binary digits: 1  1  0  0\n                   ^  ^  ^  ^\n                  ON ON off off\n    Add the ON values: 8 + 4 = ?\n\n  Step 2 \u2014 Trace the program:\n    value = raw          \u2190 plug in your decoded number\n    value = value - 4    \u2190 subtract 4\n    code_fragment = value\n\n  (Solve Step 1, then use that number in Step 2)');
    addLine('', '');
    addLine('What is code_fragment? (decode binary first, then trace the program)', 'warning');

    setCurrentInputHandler((input) => {
      // 1100 = 8+4 = 12. value=12, value=12-4=8, code_fragment=8
      if (input.trim() === '8') {
        sound.success();
        s.decoded[1] = 'code_fragment = 8';
        s.decodedCount++;
        updateEvidenceCard(s.boardEl, 1, 'code_fragment = 8');
        setPhaseProgress(1 + s.decodedCount, 8);
        addLine('[FILE 1 DECODED] Binary 1100 = 12. Then 12 - 4 = 8. Nice work.', 'success');
        returnToBoard();
      } else {
        sound.denied();
        s.wrongCount++;
        if (s.wrongCount >= 3) {
          addLine('NEXUS: "Almost there. 1100 in binary = 8 + 4 = 12. Then the program subtracts 4. So 12 - 4 = ?"', 'error');
        } else if (s.wrongCount >= 2) {
          addLine('NEXUS: "Take it in two steps. First: which place values are ON? The 8 and the 4. Add those. Then trace the subtraction."', 'error');
        } else {
          addLine('NEXUS: "Not quite. Remember, this is a two-step problem: decode the binary number first, then run it through the program."', 'error');
        }
      }
    });

  } else if (num === 2) {
    // FILE 2: note.enc (Cryptanalysis)
    addLine('', '');
    addLine('\u2501\u2501\u2501 FILE 2: note.enc \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "An encrypted note from Victor \u2014 Caesar cipher. The', 'highlight');
    addLine('        message is scrambled, but we have an advantage."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "In real cryptanalysis, you look for a known word \u2014', 'highlight');
    addLine('        something you EXPECT to find in the message. It\'s', 'highlight');
    addLine('        called a \'known-plaintext attack.\' Victor always', 'highlight');
    addLine('        signs his notes. The last word is VICTOR."', 'highlight');
    addLine('', '');
    addPre('  Encrypted text:  SDVVFRGH  YLFWRU\n\n  Known plaintext: the last word decrypts to VICTOR.\n\n  Compare the first letters:\n    Plain letter:     V\n    Encrypted letter: Y\n\n  How many positions forward from V to Y?\n  V \u2192 W \u2192 X \u2192 Y  =  ? positions');
    addLine('', '');
    addLine('What is the shift? (a number)', 'warning');

    s.file2SubPhase = 'shift';
    setCurrentInputHandler((input) => {
      const answer = input.trim().toUpperCase();

      if (s.file2SubPhase === 'shift') {
        if (answer === '3') {
          sound.success();
          addLine('[SHIFT FOUND] V \u2192 W \u2192 X \u2192 Y = 3 positions.', 'success');
          addLine('', '');
          addLine('NEXUS: "Shift of 3. Now we can reverse it \u2014 shift each letter', 'highlight');
          addLine('        BACKWARD by 3 to reveal the original message."', 'highlight');
          addLine('', '');
          addPre('  Encrypted word:  S D V V F R G H\n  Shift: 3 (shift each letter BACKWARD by 3)\n\n  ALPHABET: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z');
          addLine('', '');
          addLine('What is the decrypted first word?', 'warning');
          s.file2SubPhase = 'decrypt';
          s.wrongCount = 0;
        } else {
          sound.denied();
          s.wrongCount++;
          if (s.wrongCount >= 3) {
            addLine('NEXUS: "Count the hops: V to W is 1, W to X is 2, X to Y is 3. The shift is 3."', 'error');
          } else if (s.wrongCount >= 2) {
            addLine('NEXUS: "V is the real letter. Y is the encrypted version. Count how many steps forward in the alphabet: V\u2192W\u2192X\u2192Y."', 'error');
          } else {
            addLine('NEXUS: "Think of the alphabet as a number line. How far apart are V and Y?"', 'error');
          }
        }
      } else if (s.file2SubPhase === 'decrypt') {
        if (answer === 'PASSCODE') {
          sound.success();
          s.decoded[2] = 'shift = 3, word = PASSCODE';
          s.decodedCount++;
          updateEvidenceCard(s.boardEl, 2, 'shift=3, word=PASSCODE');
          setPhaseProgress(1 + s.decodedCount, 8);
          addLine('[FILE 2 DECODED] SDVVFRGH decrypts to PASSCODE. The shift key is 3.', 'success');
          returnToBoard();
        } else {
          sound.denied();
          s.wrongCount++;
          if (s.wrongCount >= 3) {
            addLine('NEXUS: "Letter by letter: S\u2192P, D\u2192A, V\u2192S, V\u2192S, F\u2192C, R\u2192O, G\u2192D, H\u2192E. Read them together."', 'error');
          } else if (s.wrongCount >= 2) {
            addLine('NEXUS: "Start with S. Count 3 backward: S\u2192R\u2192Q\u2192P. First letter is P. Now do the same for D, V, V, F, R, G, H."', 'error');
          } else {
            addLine('NEXUS: "To decrypt, reverse the shift: move each letter 3 positions BACKWARD in the alphabet."', 'error');
          }
        }
      }
    });

  } else if (num === 3) {
    // FILE 3: circuit.log (Logic Gates)
    addLine('', '');
    addLine('\u2501\u2501\u2501 FILE 3: circuit.log \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "Victor\'s hardware security module. Three logic gates', 'highlight');
    addLine('        wired in series \u2014 the output of each feeds into the', 'highlight');
    addLine('        next. Follow the signal through the circuit."', 'highlight');
    addLine('', '');
    addPre('  Input wires:  P = 1,  Q = 0,  R = 1\n\n  Circuit:\n    Step 1:  X = P AND Q     \u2190 are BOTH inputs 1?\n    Step 2:  Y = NOT X       \u2190 flip the bit\n    Step 3:  Z = Y XOR R     \u2190 are the inputs DIFFERENT?\n\n  Gate reference:\n    AND: like two switches in a row \u2014 BOTH must be ON (1)\n         to let power through. Otherwise output is 0.\n    NOT: flips the bit (0 becomes 1, 1 becomes 0)\n    XOR: \"eXclusive OR\" \u2014 outputs 1 only when the\n         inputs DISAGREE (one is 0, one is 1).\n         If both match (both 0 or both 1), output is 0.');
    addLine('', '');
    addLine('What is the final output Z? (0 or 1)', 'warning');

    setCurrentInputHandler((input) => {
      if (input.trim() === '0') {
        sound.success();
        s.decoded[3] = 'Z = 0';
        s.decodedCount++;
        updateEvidenceCard(s.boardEl, 3, 'Z = 0');
        setPhaseProgress(1 + s.decodedCount, 8);
        addLine('[FILE 3 DECODED] P AND Q = 0, NOT 0 = 1, 1 XOR 1 = 0. Signal traced.', 'success');
        returnToBoard();
      } else {
        sound.denied();
        s.wrongCount++;
        if (s.wrongCount >= 3) {
          addLine('NEXUS: "Let me walk you through it. 1 AND 0 = 0 (both must be 1). NOT 0 = 1 (flip it). 1 XOR 1 = ? Both are 1, so they\'re the SAME..."', 'error');
        } else if (s.wrongCount >= 2) {
          addLine('NEXUS: "Step 1 gives 0 (AND needs both to be 1). Step 2 flips it to 1. Now for XOR: are 1 and 1 different or the same?"', 'error');
        } else {
          addLine('NEXUS: "Trace it gate by gate. Start with Step 1: P is 1, Q is 0. What does AND give you when one input is 0?"', 'error');
        }
      }
    });

  } else if (num === 4) {
    // FILE 4: vault_key.prog (Variable tracing)
    addLine('', '');
    addLine('\u2501\u2501\u2501 FILE 4: vault_key.prog \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "This one is a program Victor wrote himself. Not a', 'highlight');
    addLine('        system log \u2014 he chose every value in here. Trace', 'highlight');
    addLine('        the variable through each line."', 'highlight');
    addLine('', '');
    addPre('  key = 5              \u2190 key starts at 5\n  key = key * 3         \u2190 multiply key by 3\n  key = key - 7         \u2190 subtract 7\n  result = key          \u2190 store the final value\n\n  Trace each line: update key\'s value step by step.');
    addLine('', '');
    addLine('What is result?', 'warning');

    setCurrentInputHandler((input) => {
      if (input.trim() === '8') {
        sound.success();
        s.decoded[4] = 'result = 8';
        s.decodedCount++;
        updateEvidenceCard(s.boardEl, 4, 'result = 8');
        setPhaseProgress(1 + s.decodedCount, 8);
        addLine('[FILE 4 DECODED] key = 5 \u2192 15 \u2192 8. Result is 8.', 'success');
        returnToBoard();
      } else {
        sound.denied();
        s.wrongCount++;
        if (s.wrongCount >= 3) {
          addLine('NEXUS: "key = 5. Then 5 times 3 = 15. Then 15 minus 7 = ? You\'re one step away."', 'error');
        } else if (s.wrongCount >= 2) {
          addLine('NEXUS: "Go line by line. key starts at 5. After multiplying by 3, key = 15. Now subtract 7 from 15."', 'error');
        } else {
          addLine('NEXUS: "Remember: each line UPDATES the variable. key changes value at every step. Start at 5 and work forward."', 'error');
        }
      }
    });
  }
}

// ─── Act 2: The Contradiction ───

function startContradiction() {
  const s = state.missionState;
  const terminal = document.getElementById('terminal');
  s.wrongCount = 0;

  setPhaseProgress(5, 8);

  addLine('', '');
  addLine('\u2501\u2501\u2501 EVIDENCE REVIEW \u2501\u2501\u2501', 'highlight');
  addLine('', '');
  addPre('  FILE 1: access_log.bin   \u2192  code_fragment = 8   (system log)\n  FILE 2: note.enc         \u2192  shift = 3, PASSCODE  (encrypted note)\n  FILE 3: circuit.log      \u2192  Z = 0                (hardware log)\n  FILE 4: vault_key.prog   \u2192  result = 8           (Victor\'s program)');
  addLine('', '');

  addLine('NEXUS: "Wait. Look at that."', 'highlight');
  addLine('', '');
  addLine('NEXUS: "File 1 and File 4 both output 8. Two completely different', 'highlight');
  addLine('        methods, same result? In forensics, that\'s a red flag.', 'highlight');
  addLine('        One of these is a DECOY \u2014 planted to mislead us."', 'highlight');
  addLine('', '');
  addLine('NEXUS: "This is critical thinking, not just coding. Think of it', 'highlight');
  addLine('        like this: some files are like security camera footage \u2014', 'highlight');
  addLine('        recorded automatically, so Victor can\'t change them.', 'highlight');
  addLine('        Others are like handwritten notes \u2014 Victor chose every', 'highlight');
  addLine('        word. Which type could he use to plant a fake clue?"', 'highlight');
  addLine('', '');
  addLine('NEXUS: "Which file did Victor fabricate?"', 'highlight');
  addLine('', '');
  addLine('Which file is the decoy? (type 1, 2, 3, or 4)', 'warning');

  setCurrentInputHandler((input) => {
    const answer = input.trim();
    if (answer === '4') {
      sound.success();
      markDecoy(s.boardEl, 4);
      addLine('', '');
      addLine('[DECOY IDENTIFIED] File 4: vault_key.prog is a fabrication.', 'success');
      addLine('', '');
      addLine('NEXUS: "Sharp thinking. File 1 is an automatic system log \u2014 the', 'highlight');
      addLine('        machine generated it, so Victor couldn\'t alter it."', 'highlight');
      addLine('', '');
      addLine('NEXUS: "But File 4? That\'s a program Victor AUTHORED. He picked', 'highlight');
      addLine('        key=5, *3, -7 specifically to produce 8 \u2014 a duplicate', 'highlight');
      addLine('        designed to create confusion. Classic misdirection."', 'highlight');
      addLine('', '');
      addLine('NEXUS: "Verified evidence: 8 from File 1, shift 3 from File 2,', 'highlight');
      addLine('        and 0 from File 3. Three real values. Let\'s use them."', 'highlight');
      s.decoyIdentified = true;
      s.phase = 'build';
      setTimeout(startBuild, 800);
    } else {
      sound.denied();
      s.wrongCount++;
      if (s.wrongCount >= 3) {
        addLine('NEXUS: "access_log.bin is a system log \u2014 automatic, tamper-proof. vault_key.prog is code Victor wrote himself. He chose every number. Which one could he fake?"', 'error');
      } else if (s.wrongCount >= 2) {
        addLine('NEXUS: "Two files both output 8. One is a machine-generated log. The other is a program Victor authored \u2014 where he controlled every value. Think about who benefits from the confusion."', 'error');
      } else {
        addLine('NEXUS: "Look at the file types. Which ones are automatic records vs. things Victor created? A saboteur can only plant evidence in files he controls."', 'error');
      }
    }
  });
}

// ─── Act 3: Build the Decryption Machine ───

function startBuild() {
  const s = state.missionState;
  const terminal = document.getElementById('terminal');

  setPhaseProgress(6, 8);

  addLine('', '');
  addLine('\u2501\u2501\u2501 BUILD THE DECRYPTION MACHINE \u2501\u2501\u2501', 'highlight');
  addLine('', '');
  addLine('NEXUS: "Now for the real work. We\'re going to chain our three', 'highlight');
  addLine('        verified values into a decryption pipeline \u2014 three', 'highlight');
  addLine('        modules, each one feeding into the next."', 'highlight');
  addLine('', '');
  addLine('NEXUS: "This is how real decryption works: data flows through', 'highlight');
  addLine('        a series of processing stages. You\'ll configure each', 'highlight');
  addLine('        module to crack the vault code."', 'highlight');
  addLine('', '');

  const workbench = createWorkbench();
  terminal.appendChild(workbench);
  terminal.scrollTop = terminal.scrollHeight;
  s.workbenchEl = workbench;

  addLine('', '');
  startModule1();
}

function startModule1() {
  const s = state.missionState;
  s.wrongCount = 0;
  s.phase = 'build1';

  addLine('\u2500\u2500 Module 1: Key Generator \u2500\u2500', 'highlight');
  addLine('NEXUS: "First module needs the raw key. This comes from our', 'highlight');
  addLine('        tamper-proof evidence \u2014 File 1\'s code_fragment."', 'highlight');
  addLine('', '');
  addLine('What value from File 1 feeds into the Key Generator?', 'warning');

  setCurrentInputHandler((input) => {
    if (input.trim() === '8') {
      sound.success();
      activateModule(s.workbenchEl, 0, '8');
      addLine('[MODULE 1 ONLINE] Key Generator loaded with value 8.', 'success');
      addLine('', '');
      setTimeout(startModule2, 600);
    } else {
      sound.denied();
      s.wrongCount++;
      if (s.wrongCount >= 3) {
        addLine('NEXUS: "File 1 decoded to code_fragment = 8. The number is 8."', 'error');
      } else if (s.wrongCount >= 2) {
        addLine('NEXUS: "Check the evidence board above. File 1 shows code_fragment = ?"', 'error');
      } else {
        addLine('NEXUS: "Recall what File 1 (access_log.bin) decoded to. The value is on the evidence board."', 'error');
      }
    }
  });
}

function startModule2() {
  const s = state.missionState;
  s.wrongCount = 0;
  s.phase = 'build2';

  setPhaseProgress(7, 8);

  addLine('\u2500\u2500 Module 2: Processor \u2500\u2500', 'highlight');
  addLine('NEXUS: "The processor combines our evidence values. But I\'m', 'highlight');
  addLine('        seeing something suspicious in the code. Trace it', 'highlight');
  addLine('        carefully \u2014 Victor may have left another trap."', 'highlight');
  addLine('', '');
  addPre('  Processor program:\n\n    Line 1:  vault = 8              \u2190 key from Module 1\n    Line 2:  vault = vault - 3       \u2190 subtract File 2\'s shift\n    Line 3:  vault = vault * 0       \u2190 multiply by File 3\'s output (Z = 0)');
  addLine('', '');
  addLine('NEXUS: "Trace it line by line. What is vault after ALL three lines?"', 'highlight');
  addLine('', '');
  addLine('What is vault after running all 3 lines? (trace it step by step)', 'warning');

  s.mod2SubPhase = 'trace';
  setCurrentInputHandler((input) => {
    const answer = input.trim();

    if (s.mod2SubPhase === 'trace') {
      // First ask them to trace all 3 lines (answer: 0)
      if (answer === '0') {
        sound.success();
        addLine('[TRACED] vault = 8, then 5, then 0. Correct!', 'success');
        addLine('', '');
        addLine('NEXUS: "Wait \u2014 vault equals ZERO? That can\'t be right.', 'highlight');
        addLine('        Multiplying by zero destroys everything! Any number', 'highlight');
        addLine('        times zero equals zero. Victor hid a booby trap', 'highlight');
        addLine('        right inside the math."', 'highlight');
        addLine('', '');
        addLine('NEXUS: "Here\'s a real debugging principle: sometimes the fix', 'highlight');
        addLine('        is to DELETE the bad code. Line 3 is the trap \u2014', 'highlight');
        addLine('        remove it entirely."', 'highlight');
        addLine('', '');
        addLine('What is the vault code if you skip the buggy Line 3?', 'warning');
        s.mod2SubPhase = 'fix';
        s.wrongCount = 0;
      } else {
        sound.denied();
        s.wrongCount++;
        if (s.wrongCount >= 3) {
          addLine('NEXUS: "Line 1: vault = 8. Line 2: vault = 8 - 3 = 5. Line 3: vault = 5 * 0 = ? What is anything times zero?"', 'error');
        } else if (s.wrongCount >= 2) {
          addLine('NEXUS: "After Line 1, vault = 8. After Line 2, vault = 8 - 3 = 5. Now Line 3 multiplies by 0..."', 'error');
        } else {
          addLine('NEXUS: "Go line by line. Start with vault = 8. Then subtract 3. Then multiply by 0. What do you get at the end?"', 'error');
        }
      }
    } else if (s.mod2SubPhase === 'fix') {
      // Now ask what vault is without Line 3 (answer: 5)
      if (answer === '5') {
        sound.success();
        activateModule(s.workbenchEl, 1, 'vault=5');
        addLine('[MODULE 2 ONLINE] Booby trap neutralized. Vault code = 5.', 'success');
        addLine('', '');
        addLine('NEXUS: "You spotted the bug AND fixed it. Bugs like this', 'highlight');
        addLine('        are the sneakiest kind \u2014 the code still RUNS, it', 'highlight');
        addLine('        just gives the wrong answer. Great debugging."', 'highlight');
        addLine('', '');
        setTimeout(startModule3, 600);
      } else {
        sound.denied();
        s.wrongCount++;
        if (s.wrongCount >= 3) {
          addLine('NEXUS: "Line 1: vault = 8. Line 2: vault = 8 - 3 = 5. We skip Line 3 (the trap). So vault stays at 5."', 'error');
        } else if (s.wrongCount >= 2) {
          addLine('NEXUS: "After Line 2, vault equals 5. Line 3 is the trap we\'re removing. What does vault stay at?"', 'error');
        } else {
          addLine('NEXUS: "Only run Lines 1 and 2. Line 3 is the booby trap \u2014 delete it entirely. What does vault equal after just those two lines?"', 'error');
        }
      }
    }
  });
}

function startModule3() {
  const s = state.missionState;
  s.wrongCount = 0;
  s.phase = 'build3';

  // ILYH = FIVE encrypted with shift 3 (F+3=I, I+3=L, V+3=Y, E+3=H)
  const encryptedVerify = caesarEncrypt('FIVE', 3); // should be ILYH

  addLine('\u2500\u2500 Module 3: Decryptor (Verification) \u2500\u2500', 'highlight');
  addLine('NEXUS: "Final module. Real engineers always verify before they', 'highlight');
  addLine('        execute. The vault has an encrypted confirmation code.', 'highlight');
  addLine('        If it matches our vault code, we know we got it right."', 'highlight');
  addLine('', '');
  addLine('NEXUS: "Use the shift from File 2 to decrypt this message."', 'highlight');
  addLine('', '');
  addPre('  Vault verification message:\n\n    Encrypted:  ' + encryptedVerify + '\n    Shift: 3 (from File 2 \u2014 shift BACKWARD to decrypt)\n\n  Decrypt each letter by moving 3 positions back in the alphabet.\n\n  ALPHABET: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z');
  addLine('', '');
  addLine('What is the decrypted message?', 'warning');

  setCurrentInputHandler(async (input) => {
    const answer = input.trim().toUpperCase();
    if (answer === 'FIVE') {
      sound.success();
      activateModule(s.workbenchEl, 2, 'FIVE');
      addLine('', '');
      addLine(`[MODULE 3 ONLINE] ${encryptedVerify} decrypts to FIVE. Verification confirmed.`, 'success');
      addLine('', '');
      addLine('NEXUS: "The verification says FIVE. The processor computed 5.', 'highlight');
      addLine('        They match \u2014 independent confirmation. The vault', 'highlight');
      addLine('        code is verified. Initiating unlock sequence..."', 'highlight');
      addLine('', '');

      setPhaseProgress(8, 8);

      // ─── Vault Opens ───
      await showVaultAnimation(document.getElementById('terminal'));

      addLine('', '');
      addLine('NEXUS: "Take a second to appreciate what you just did."', 'highlight');
      addLine('', '');
      addLine('NEXUS: "You decoded binary. Cracked a cipher. Traced logic', 'highlight');
      addLine('        gates through a circuit. Spotted fake evidence.', 'highlight');
      addLine('        Found a hidden zero-multiplication trap. And then', 'highlight');
      addLine('        verified your answer independently."', 'highlight');
      addLine('', '');
      addLine('NEXUS: "That\'s SIX different skills in one mission. Real', 'highlight');
      addLine('        security investigators do exactly this \u2014 no single', 'highlight');
      addLine('        skill is ever enough. You need ALL of them working', 'highlight');
      addLine('        together, like pieces of a puzzle."', 'highlight');
      addLine('', '');
      addLine('NEXUS: "And inside the vault? Victor\'s backdoor code \u2014 the', 'highlight');
      addLine('        proof we\'ve been hunting for. The final hack awaits."', 'highlight');
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
        addLine('NEXUS: "I back 3 = F. L back 3 = I. Y back 3 = V. H back 3 = E. Read them together."', 'error');
      } else if (s.wrongCount >= 2) {
        addLine('NEXUS: "First letter: I. Count back 3: I\u2192H\u2192G\u2192F. That gives F. Now do L, Y, and H the same way."', 'error');
      } else {
        addLine('NEXUS: "Same technique as File 2. Shift each letter of ' + encryptedVerify + ' backward by 3 positions in the alphabet."', 'error');
      }
    }
  });
}
