// missions/s1/07-encrypted-vault.js
import {
  state, sound, sleep,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission,
} from '../../engine.js';

import { caesarEncrypt } from '../helpers.js';

// ─── Evidence Board (Act 1) ───

function createEvidenceBoard() {
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
    card.style.cssText = 'border:1px solid #333;border-radius:4px;padding:10px;background:#0a0a0a;font-family:"Fira Mono",monospace;transition:all 0.4s ease;';

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
    status.textContent = '[ UNEXAMINED ]';
    card.appendChild(status);

    board.appendChild(card);
  });

  return board;
}

function updateEvidenceCard(board, fileNum, value) {
  const card = board.querySelector(`[data-file-num="${fileNum}"]`);
  if (!card) return;
  card.style.borderColor = '#00ff41';
  card.style.boxShadow = '0 0 8px rgba(0,255,65,0.2)';
  const status = card.querySelector('.evidence-status');
  status.style.color = '#00ff41';
  status.textContent = `DECODED: ${value}`;
}

function markDecoy(board, fileNum) {
  const card = board.querySelector(`[data-file-num="${fileNum}"]`);
  if (!card) return;
  card.style.borderColor = '#ff3333';
  card.style.boxShadow = '0 0 8px rgba(255,0,0,0.3)';
  card.style.opacity = '0.5';
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
  title.style.cssText = 'font-family:"Press Start 2P","Fira Mono",monospace;font-size:12px;color:#00ff41;margin-bottom:16px;letter-spacing:3px;';
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

  // Spin through digits
  const spinStart = Date.now();
  while (Date.now() - spinStart < 600) {
    tumbler.textContent = String(Math.floor(Math.random() * 10));
    tumbler.style.color = '#ffaa00';
    await sleep(40);
  }

  // Land on 5
  tumbler.textContent = '5';
  tumbler.style.color = '#00ff41';
  tumbler.style.borderColor = '#00ff41';
  tumbler.style.boxShadow = '0 0 12px rgba(0,255,65,0.5)';
  check.textContent = '\u2713';
  check.style.color = '#00ff41';
  sound.success();

  await sleep(400);
  barFill.style.width = '100%';
  await sleep(800);
  openText.style.opacity = '1';
  await sleep(600);
  terminal.scrollTop = terminal.scrollHeight;
}

// ─── Mission Export ───

export const mission = {
  id: 6,
  num: '07',
  title: 'THE ENCRYPTED VAULT',
  name: 'The Encrypted Vault',
  desc: 'Investigate Victor\'s evidence files, identify the decoy, and build a decryption machine to crack the vault.',
  skill: 'SKILL: Investigation + Machine Building (Binary, Cryptanalysis, Logic Gates, Variables)',
  hints: [
    'Each evidence file uses a different skill. Work through them one at a time.',
    'In the contradiction phase, think about which files Victor could have tampered with.',
    'When debugging the processor, think about what multiplying by zero does.',
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
      { text: '[SYSTEM] Encrypted vault detected \u2014 left by the saboteur.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Victor\'s vault. But this time we\'re not brute-forcing it.', cls: 'highlight' },
      { text: '        We investigate his evidence files, find the real clues,', cls: 'highlight' },
      { text: '        and build a machine to crack it open."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);

    // Show evidence board
    const boardEl = createEvidenceBoard();
    terminal.appendChild(boardEl);
    terminal.scrollTop = terminal.scrollHeight;
    state.missionState.boardEl = boardEl;

    addLine('', '');
    addLine('Four evidence files on the board. Examine them in any order.', 'warning');
    addLine('Type EXAMINE 1, EXAMINE 2, EXAMINE 3, or EXAMINE 4', 'warning');
    addLine('', '');

    state.missionState.phase = 'board';
    setPhaseProgress(1, 8);
    setBoardHandler();
  },
};

// ─── Act 1: Evidence Board Handler ───

function setBoardHandler() {
  setCurrentInputHandler((input) => {
    const s = state.missionState;
    const trimmed = input.trim().toUpperCase();

    if (trimmed.startsWith('EXAMINE')) {
      const num = parseInt(trimmed.replace(/^EXAMINE\s*/, ''), 10);
      if (num >= 1 && num <= 4) {
        // Already decoded? Show result again.
        if (s.decoded[num] !== null) {
          addLine(`File ${num} already decoded. Result: ${s.decoded[num]}`, 'success');
          return;
        }
        s.phase = `examine${num}`;
        startExamine(num);
      } else {
        addLine('Type EXAMINE 1, EXAMINE 2, EXAMINE 3, or EXAMINE 4.', 'error');
      }
    } else {
      addLine('Type EXAMINE 1, EXAMINE 2, EXAMINE 3, or EXAMINE 4.', 'error');
    }
  });
}

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
    addLine('', '');
    addLine(`${4 - s.decodedCount} file(s) remaining. Type EXAMINE 1/2/3/4.`, 'warning');
    setBoardHandler();
  }
}

function startExamine(num) {
  const s = state.missionState;
  s.wrongCount = 0;

  if (num === 1) {
    // FILE 1: access_log.bin (Binary + Variable trace + Reverse engineering)
    addLine('', '');
    addLine('\u2501\u2501\u2501 FILE 1: access_log.bin \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "Victor\'s system log. Binary data processed by a', 'highlight');
    addLine('        short program. Decode the binary, then trace."', 'highlight');
    addLine('', '');
    addPre('  System log:\n    raw = 1100      (binary)\n\n  Processing program:\n    value = raw\n    value = value - 4\n    code_fragment = value');
    addLine('', '');
    addLine('What is code_fragment?', 'warning');

    setCurrentInputHandler((input) => {
      // 1100 = 8+4 = 12. value=12, value=12-4=8, code_fragment=8
      if (input.trim() === '8') {
        sound.success();
        s.decoded[1] = 'code_fragment = 8';
        s.decodedCount++;
        updateEvidenceCard(s.boardEl, 1, 'code_fragment = 8');
        setPhaseProgress(1 + s.decodedCount, 8);
        addLine('[FILE 1 DECODED] 1100 = 12, 12 - 4 = 8.', 'success');
        returnToBoard();
      } else {
        sound.denied();
        s.wrongCount++;
        if (s.wrongCount >= 3) {
          addLine('[WRONG] 1100 = 8+4 = 12. Then 12 - 4 = ?', 'error');
        } else if (s.wrongCount >= 2) {
          addLine('[WRONG] Decode 1100 first (eights + fours), then trace the program.', 'error');
        } else {
          addLine('[WRONG] Two steps: decode the binary, then trace the variable.', 'error');
        }
      }
    });

  } else if (num === 2) {
    // FILE 2: note.enc (Cryptanalysis)
    addLine('', '');
    addLine('\u2501\u2501\u2501 FILE 2: note.enc \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "An encrypted note. The shift is UNKNOWN \u2014 but Victor always', 'highlight');
    addLine('        signs his name. The last word decrypts to VICTOR."', 'highlight');
    addLine('', '');
    addPre('  Encrypted text:  SDVVFRGH  YLFWRU\n\n  The last word decrypts to VICTOR.\n  The first encrypted letter of that word is Y.\n  The first plain letter is V.\n\n  How many positions from V to Y?\n  V \u2192 W \u2192 X \u2192 Y  =  ? positions');
    addLine('', '');
    addLine('What is the shift? (a number)', 'warning');

    s.file2SubPhase = 'shift';
    setCurrentInputHandler((input) => {
      const answer = input.trim().toUpperCase();

      if (s.file2SubPhase === 'shift') {
        if (answer === '3') {
          sound.success();
          addLine('[SHIFT FOUND] V \u2192 W \u2192 X \u2192 Y = 3 positions. The shift is 3.', 'success');
          addLine('', '');
          addLine('NEXUS: "Now decrypt the first word with shift 3."', 'highlight');
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
            addLine('[WRONG] Count: V\u2192W is 1 step, W\u2192X is 2 steps, X\u2192Y is 3 steps.', 'error');
          } else if (s.wrongCount >= 2) {
            addLine('[WRONG] The plain letter is V. The encrypted letter is Y. Count the steps forward: V\u2192W\u2192X\u2192Y.', 'error');
          } else {
            addLine('[WRONG] Count the distance from V to Y in the alphabet.', 'error');
          }
        }
      } else if (s.file2SubPhase === 'decrypt') {
        if (answer === 'PASSCODE') {
          sound.success();
          s.decoded[2] = 'shift = 3, word = PASSCODE';
          s.decodedCount++;
          updateEvidenceCard(s.boardEl, 2, 'shift=3, word=PASSCODE');
          setPhaseProgress(1 + s.decodedCount, 8);
          addLine('[FILE 2 DECODED] SDVVFRGH with shift 3 = PASSCODE.', 'success');
          returnToBoard();
        } else {
          sound.denied();
          s.wrongCount++;
          if (s.wrongCount >= 3) {
            addLine('[WRONG] S back 3 = P. D back 3 = A. V back 3 = S. V back 3 = S. F back 3 = C. R back 3 = O. G back 3 = D. H back 3 = E. Put them together.', 'error');
          } else if (s.wrongCount >= 2) {
            addLine('[WRONG] First letter: S back 3 \u2192 S\u2192R\u2192Q\u2192P. So P. Do the same for each letter.', 'error');
          } else {
            addLine('[WRONG] Shift each letter BACKWARD by 3. S back 3 = ? D back 3 = ? Keep going.', 'error');
          }
        }
      }
    });

  } else if (num === 3) {
    // FILE 3: circuit.log (Logic Gates)
    addLine('', '');
    addLine('\u2501\u2501\u2501 FILE 3: circuit.log \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "A logic circuit from Victor\'s hardware. Three steps deep."', 'highlight');
    addLine('', '');
    addPre('  Wire P = 1,  Wire Q = 0,  Wire R = 1\n\n  Step 1:  X = P AND Q\n  Step 2:  Y = NOT X\n  Step 3:  Z = Y XOR R\n\n  Remember:\n    AND: both must be 1\n    NOT: flips the bit\n    XOR: exactly one must be 1');
    addLine('', '');
    addLine('What is Z? (0 or 1)', 'warning');

    setCurrentInputHandler((input) => {
      if (input.trim() === '0') {
        sound.success();
        s.decoded[3] = 'Z = 0';
        s.decodedCount++;
        updateEvidenceCard(s.boardEl, 3, 'Z = 0');
        setPhaseProgress(1 + s.decodedCount, 8);
        addLine('[FILE 3 DECODED] X = 1 AND 0 = 0. Y = NOT 0 = 1. Z = 1 XOR 1 = 0.', 'success');
        returnToBoard();
      } else {
        sound.denied();
        s.wrongCount++;
        if (s.wrongCount >= 3) {
          addLine('[WRONG] Step 1: 1 AND 0 = 0. Step 2: NOT 0 = 1. Step 3: 1 XOR 1 = ? (XOR = exactly one must be 1. Both are 1, so...)', 'error');
        } else if (s.wrongCount >= 2) {
          addLine('[WRONG] X = P AND Q = 1 AND 0 = 0. Y = NOT 0 = 1. Now Z = 1 XOR 1. With XOR, if both are the same, the result is 0.', 'error');
        } else {
          addLine('[WRONG] Work step by step. First: what is P AND Q? Then NOT that. Then XOR with R.', 'error');
        }
      }
    });

  } else if (num === 4) {
    // FILE 4: vault_key.prog (Variable tracing)
    addLine('', '');
    addLine('\u2501\u2501\u2501 FILE 4: vault_key.prog \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "A program Victor wrote. Trace the variable."', 'highlight');
    addLine('', '');
    addPre('  key = 5\n  key = key * 3\n  key = key - 7\n  result = key\n\n  What is result?');
    addLine('', '');
    addLine('What is result?', 'warning');

    setCurrentInputHandler((input) => {
      if (input.trim() === '8') {
        sound.success();
        s.decoded[4] = 'result = 8';
        s.decodedCount++;
        updateEvidenceCard(s.boardEl, 4, 'result = 8');
        setPhaseProgress(1 + s.decodedCount, 8);
        addLine('[FILE 4 DECODED] key=5, key=15, key=8, result=8.', 'success');
        returnToBoard();
      } else {
        sound.denied();
        s.wrongCount++;
        if (s.wrongCount >= 3) {
          addLine('[WRONG] key starts at 5. 5 * 3 = 15. 15 - 7 = ?', 'error');
        } else if (s.wrongCount >= 2) {
          addLine('[WRONG] Line by line: key=5, then key = 5*3 = 15, then key = 15-7 = ?', 'error');
        } else {
          addLine('[WRONG] Trace each line. key starts at 5, gets multiplied by 3, then 7 is subtracted.', 'error');
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
  addPre('  FILE 1: code_fragment = 8\n  FILE 2: shift = 3, word = PASSCODE\n  FILE 3: Z = 0\n  FILE 4: result = 8');
  addLine('', '');

  addLine('NEXUS: "Hold on. Look at those results carefully."', 'highlight');
  addLine('', '');
  addLine('NEXUS: "File 1 and File 4 both give 8. Two completely different', 'highlight');
  addLine('        types of evidence, same answer. That\'s suspicious.', 'highlight');
  addLine('        One of these is a DECOY Victor planted to mislead us."', 'highlight');
  addLine('', '');
  addLine('NEXUS: "File 1 is a SYSTEM log \u2014 Victor couldn\'t change it.', 'highlight');
  addLine('        File 4 is a PROGRAM he wrote himself \u2014 he could have', 'highlight');
  addLine('        made it output anything he wanted."', 'highlight');
  addLine('', '');
  addLine('Which file is the decoy? (type 1, 2, 3, or 4)', 'warning');

  setCurrentInputHandler((input) => {
    const answer = input.trim();
    if (answer === '4') {
      sound.success();
      markDecoy(s.boardEl, 4);
      addLine('', '');
      addLine('[DECOY IDENTIFIED] File 4 was the trap.', 'success');
      addLine('', '');
      addLine('NEXUS: "File 4 was bait. Victor wrote that program to output 8', 'highlight');
      addLine('        on purpose \u2014 to create confusion. Discard it."', 'highlight');
      addLine('', '');
      addLine('NEXUS: "Real evidence: 8 (File 1), 3 (File 2 shift), 0 (File 3)."', 'highlight');
      s.decoyIdentified = true;
      s.phase = 'build';
      setTimeout(startBuild, 800);
    } else {
      sound.denied();
      s.wrongCount++;
      if (s.wrongCount >= 3) {
        addLine('[WRONG] File 1 is a system log (can\'t be faked). File 4 is a program Victor wrote himself (he controls the output). Which one could he have tampered with?', 'error');
      } else if (s.wrongCount >= 2) {
        addLine('[WRONG] System logs are automatic \u2014 Victor couldn\'t edit them. But programs? He wrote that code. He chose those numbers.', 'error');
      } else {
        addLine('[WRONG] Think about which files Victor had control over. A system log vs. a program he authored...', 'error');
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
  addLine('NEXUS: "Three real values. Now BUILD the machine to crack the', 'highlight');
  addLine('        vault. Three modules \u2014 you configure each one."', 'highlight');
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
  addLine('NEXUS: "The raw key comes from File 1\'s code_fragment.', 'highlight');
  addLine('        What value feeds into the machine?"', 'highlight');
  addLine('', '');
  addLine('What is the input value from File 1?', 'warning');

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
        addLine('[WRONG] File 1 decoded to: code_fragment = 8. What number is that?', 'error');
      } else if (s.wrongCount >= 2) {
        addLine('[WRONG] Look at your evidence board. File 1\'s result was code_fragment = ?', 'error');
      } else {
        addLine('[WRONG] What did File 1 (access_log.bin) decode to?', 'error');
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
  addLine('NEXUS: "The processor runs a formula to compute the vault code.', 'highlight');
  addLine('        But look \u2014 Victor booby-trapped it."', 'highlight');
  addLine('', '');
  addPre('  Processor program:\n\n    Line 1:  vault = 8              \u2190 from Module 1\n    Line 2:  vault = vault - 3       \u2190 subtract File 2 shift\n    Line 3:  vault = vault * 0       \u2190 multiply by File 3 output\n\n  Trace it:\n    Line 1:  vault = 8\n    Line 2:  vault = 8 - 3 = 5\n    Line 3:  vault = 5 * 0 = 0    \u2190 BUG!');
  addLine('', '');
  addLine('NEXUS: "Line 3 multiplies by zero. That erases everything.', 'highlight');
  addLine('        Victor booby-trapped the formula. But the vault code', 'highlight');
  addLine('        should be 5 \u2014 we computed it correctly in Line 2."', 'highlight');
  addLine('', '');
  addLine('NEXUS: "Sometimes the fix is to REMOVE bad code. If you skip', 'highlight');
  addLine('        the buggy Line 3, what is the vault code?"', 'highlight');
  addLine('', '');
  addLine('What is the vault code if you skip Line 3?', 'warning');

  setCurrentInputHandler((input) => {
    if (input.trim() === '5') {
      sound.success();
      activateModule(s.workbenchEl, 1, 'vault=5');
      addLine('[MODULE 2 ONLINE] Booby trap removed. Vault code = 5.', 'success');
      addLine('', '');
      addLine('NEXUS: "That\'s the lesson \u2014 sometimes the best fix is deleting', 'highlight');
      addLine('        the bad line entirely."', 'highlight');
      addLine('', '');
      setTimeout(startModule3, 600);
    } else {
      sound.denied();
      s.wrongCount++;
      if (s.wrongCount >= 3) {
        addLine('[WRONG] Line 1: vault=8. Line 2: vault=8-3=5. Line 3 is the bug, so skip it. vault stays at 5.', 'error');
      } else if (s.wrongCount >= 2) {
        addLine('[WRONG] After Line 2, vault = 5. Line 3 is the booby trap. If you skip it, vault = ?', 'error');
      } else {
        addLine('[WRONG] Trace Lines 1 and 2 only. Ignore Line 3 completely. What does vault equal?', 'error');
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
  addLine('NEXUS: "Final module. The machine says vault code 5. Let\'s verify."', 'highlight');
  addLine('', '');
  addPre('  The vault has an encrypted verification message:\n\n    Encrypted message:  ' + encryptedVerify + '\n    Shift: 3 (from File 2)\n\n  Decrypt it to verify the vault code.\n\n  ALPHABET: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z');
  addLine('', '');
  addLine('What is the decrypted message?', 'warning');

  setCurrentInputHandler(async (input) => {
    const answer = input.trim().toUpperCase();
    if (answer === 'FIVE') {
      sound.success();
      activateModule(s.workbenchEl, 2, 'FIVE');
      addLine('', '');
      addLine(`[MODULE 3 ONLINE] ${encryptedVerify} with shift 3 = FIVE.`, 'success');
      addLine('', '');
      addLine('NEXUS: "The decrypted message says FIVE. The processor computed 5.', 'highlight');
      addLine('        They MATCH. The machine works."', 'highlight');
      addLine('', '');

      setPhaseProgress(8, 8);

      // ─── Vault Opens ───
      await showVaultAnimation(document.getElementById('terminal'));

      addLine('', '');
      addLine('NEXUS: "You didn\'t just crack a vault. You investigated evidence,', 'highlight');
      addLine('        identified a forgery, built a machine, found a booby trap,', 'highlight');
      addLine('        and verified the answer two different ways."', 'highlight');
      addLine('', '');
      addLine('NEXUS: "That\'s what real security engineers do."', 'highlight');
      addLine('', '');
      addLine('NEXUS: "Inside \u2014 Victor\'s backdoor code. We use this in the final hack."', 'highlight');
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
        addLine(`[WRONG] I back 3 = F. L back 3 = I. Y back 3 = V. H back 3 = E. Put them together.`, 'error');
      } else if (s.wrongCount >= 2) {
        addLine(`[WRONG] First letter: I back 3 \u2192 I\u2192H\u2192G\u2192F. So F. Do the same for L, Y, H.`, 'error');
      } else {
        addLine('[WRONG] Shift each letter of ' + encryptedVerify + ' BACKWARD by 3.', 'error');
      }
    }
  });
}
