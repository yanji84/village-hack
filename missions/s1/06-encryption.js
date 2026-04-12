// missions/s1/06-encryption.js
import {
  state, sound, sleep,
  $, addLine, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission,
} from '../../engine.js';

import { caesarEncrypt } from '../helpers.js';

// --- Dual Alphabet Strip helpers ---

function createCipherStrip(shift) {
  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // Cipher alphabet: each plain letter was shifted forward by `shift` to encrypt.
  // So the cipher row shows the shifted alphabet.
  const cipherAlpha = ALPHA.split('').map((_, i) => ALPHA[(i + shift) % 26]);

  const wrap = document.createElement('div');
  wrap.className = 'cipher-strip';
  wrap.style.cssText = 'margin:12px 0; font-family:"Fira Mono",monospace; font-size:13px;'
    + 'border:1px solid #1a2a1a; border-radius:6px; padding:10px; background:#050505;';

  // Title showing the shift value
  const title = document.createElement('div');
  title.style.cssText = 'color:#ffaa00;font-size:11px;margin-bottom:8px;font-weight:bold;';
  title.textContent = `DECODER STRIP (shift ${shift})`;
  wrap.appendChild(title);

  const cellStyle = 'width:24px;height:28px;display:flex;align-items:center;justify-content:center;'
    + 'border:1px solid #1a2a1a;border-radius:2px;color:#005a15;transition:all 0.2s;flex-shrink:0;cursor:pointer;';

  // Encrypted label
  const labelEnc = document.createElement('div');
  labelEnc.style.cssText = 'color:#ff8800;font-size:10px;margin-bottom:2px;';
  labelEnc.textContent = 'ENCRYPTED LETTER:';
  wrap.appendChild(labelEnc);

  // Cipher row (top)
  const cipherRow = document.createElement('div');
  cipherRow.className = 'cipher-row';
  cipherRow.style.cssText = 'display:flex;gap:2px;overflow-x:auto;';
  for (let i = 0; i < 26; i++) {
    const cell = document.createElement('div');
    cell.className = 'cipher-cell cipher-enc';
    cell.dataset.letter = cipherAlpha[i];
    cell.dataset.idx = i;
    cell.style.cssText = cellStyle;
    cell.textContent = cipherAlpha[i];
    // Interactive: click a cell on either row to highlight the pair
    cell.addEventListener('click', () => highlightCipherLetter(wrap, cipherAlpha[i]));
    cipherRow.appendChild(cell);
  }
  wrap.appendChild(cipherRow);

  // Arrow indicator row (initially empty, populated by highlight)
  const arrowPlaceholder = document.createElement('div');
  arrowPlaceholder.className = 'cipher-arrow-slot';
  arrowPlaceholder.style.cssText = 'height:14px;';
  wrap.appendChild(arrowPlaceholder);

  // Plain label
  const labelPlain = document.createElement('div');
  labelPlain.style.cssText = 'color:#00ff41;font-size:10px;margin:0 0 2px;';
  labelPlain.textContent = 'DECRYPTS TO:';
  wrap.appendChild(labelPlain);

  // Plain row (bottom)
  const plainRow = document.createElement('div');
  plainRow.className = 'plain-row';
  plainRow.style.cssText = 'display:flex;gap:2px;overflow-x:auto;';
  for (let i = 0; i < 26; i++) {
    const cell = document.createElement('div');
    cell.className = 'cipher-cell cipher-plain';
    cell.dataset.letter = ALPHA[i];
    cell.dataset.idx = i;
    cell.style.cssText = cellStyle;
    // Interactive: click plain row to highlight too
    cell.addEventListener('click', () => highlightCipherLetter(wrap, cipherAlpha[i]));
    plainRow.appendChild(cell);
  }
  wrap.appendChild(plainRow);

  // Hint line
  const hint = document.createElement('div');
  hint.style.cssText = 'color:#666;font-size:10px;margin-top:6px;';
  hint.textContent = 'Click any letter to see the mapping. Find the encrypted letter on top, read the decrypted letter below it.';
  wrap.appendChild(hint);

  return wrap;
}

function highlightCipherLetter(strip, encryptedLetter) {
  // Clear previous highlights
  strip.querySelectorAll('.cipher-cell').forEach(cell => {
    cell.style.background = '';
    cell.style.color = '#005a15';
    cell.style.borderColor = '#1a2a1a';
    cell.style.fontWeight = '';
  });

  // Reset the arrow slot instead of removing/inserting elements
  const arrowSlot = strip.querySelector('.cipher-arrow-slot');
  if (arrowSlot) arrowSlot.innerHTML = '';

  // Also remove any legacy arrows from prior highlight calls
  const oldArrow = strip.querySelector('.cipher-arrow');
  if (oldArrow) oldArrow.remove();

  if (!encryptedLetter) return;

  const letter = encryptedLetter.toUpperCase();
  if (letter < 'A' || letter > 'Z') return;

  // Find and highlight the encrypted letter on the top row
  const encCell = strip.querySelector(`.cipher-enc[data-letter="${letter}"]`);
  if (encCell) {
    encCell.style.background = 'rgba(255,136,0,0.25)';
    encCell.style.color = '#ff8800';
    encCell.style.borderColor = '#ff8800';
    encCell.style.fontWeight = 'bold';

    // The plain cell at the same index is the decrypted letter
    const idx = encCell.dataset.idx;
    const plainCell = strip.querySelector(`.cipher-plain[data-idx="${idx}"]`);
    if (plainCell) {
      plainCell.style.background = 'rgba(0,255,65,0.25)';
      plainCell.style.color = '#00ff41';
      plainCell.style.borderColor = '#00ff41';
      plainCell.style.fontWeight = 'bold';

      // Build the arrow connector inside the stable slot
      if (arrowSlot) {
        arrowSlot.style.cssText = 'display:flex;gap:2px;pointer-events:none;height:14px;';
        for (let i = 0; i < 26; i++) {
          const spacer = document.createElement('div');
          spacer.style.cssText = 'width:24px;height:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;';
          if (String(i) === idx) {
            spacer.textContent = '\u2193';
            spacer.style.color = '#00ff41';
          }
          arrowSlot.appendChild(spacer);
        }
      }
    }
  }
}

const cipherPuzzles = [
  {
    plain: 'HELLO',
    shift: 1,
    desc: 'Shift of 1 -- the simplest cipher. Each letter was pushed forward by 1 to encrypt it (A became B, B became C...). To decrypt, reverse the process: push each letter BACKWARD by 1.',
    hintOnWrong: 'Try the first letter. The encrypted text starts with I. One step backward from I is... H.',
  },
  {
    plain: 'PIZZA',
    shift: 3,
    desc: 'Shift of 3 -- the original Caesar cipher! Each letter was pushed forward by 3. Use the decoder strip below: find each encrypted letter on the top row, read the original letter below it.',
    hintOnWrong: 'Use the strip. Click the first encrypted letter on the top row. The letter directly below it is the decrypted letter.',
  },
  {
    plain: 'SAVE US',
    shift: 5,
    desc: 'Shift of 5 -- the AI\'s hidden message, buried in its own attack traffic. Spaces stay as spaces. What was it trying to tell us?',
    hintOnWrong: 'Same method, bigger shift. The strip does the work for you -- find each encrypted letter on top, read below.',
  },
];

export const mission = {
  id: 5,
  num: '06',
  title: 'ENCRYPTION LAB',
  name: 'Encryption Lab',
  desc: 'The rogue AI encrypted all messages! Learn to crack the Caesar cipher to read them.',
  skill: 'SKILL: Cryptography',
  hints: [
    'The cipher moved letters FORWARD. To read the message, which direction do you need to go?',
    'Imagine walking the alphabet like steps on a staircase. How many steps? Look at the shift.',
    "You don't have to decode the whole word at once. Try just the first letter \u2014 the rest work the same way.",
  ],
  run: async function() {
    state.missionState = { cipherIdx: 0, wrongCount: 0 };

    await typeLines([
      { text: '[COMMS INTERCEPT] Encrypted messages detected in attack traffic.', cls: 'system' },
      { text: '[SIGNAL ANALYSIS] Pattern consistent with Caesar cipher encoding.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "We found something strange. Hidden inside the AI\'s', cls: 'highlight' },
      { text: '        attack traffic -- encrypted messages. Not part of', cls: 'highlight' },
      { text: '        the attack. Someone was smuggling data through it."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "To read them, you need to understand encryption.', cls: 'highlight' },
      { text: '        Here\'s the idea: two thousand years ago, Julius', cls: 'highlight' },
      { text: '        Caesar needed to send secret battle orders. If a', cls: 'highlight' },
      { text: '        messenger got captured, the enemy would read', cls: 'highlight' },
      { text: '        everything."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "His solution? A rule. Shift every letter forward', cls: 'highlight' },
      { text: '        in the alphabet by a fixed number. With a shift', cls: 'highlight' },
      { text: '        of 3: A becomes D. B becomes E. H becomes K.', cls: 'highlight' },
      { text: '        Without knowing the shift, the message is', cls: 'highlight' },
      { text: '        unreadable. With it, trivial to decode."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);

    // Live demonstration before puzzles begin
    addLine('  EXAMPLE: Encrypting "CAT" with shift 3', 'info');
    addLine('');
    await sleep(400);
    addLine('    C  +3  -->  F', 'success');
    await sleep(300);
    addLine('    A  +3  -->  D', 'success');
    await sleep(300);
    addLine('    T  +3  -->  W', 'success');
    await sleep(300);
    addLine('');
    addLine('    CAT  encrypts to  FDW', 'highlight');
    addLine('    FDW  decrypts to  CAT  (shift backward by 3)', 'highlight');
    addLine('');

    await sleep(500);

    await typeLines([
      { text: 'NEXUS: "That same idea powers everything today -- your', cls: 'highlight' },
      { text: '        passwords, your messages, your bank account.', cls: 'highlight' },
      { text: '        Just with much bigger shifts and smarter math."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "The AI\'s messages use simple Caesar shifts. Three', cls: 'highlight' },
      { text: '        messages to crack. I\'ll give you a decoder strip', cls: 'highlight' },
      { text: '        for each one -- find the encrypted letter on top,', cls: 'highlight' },
      { text: '        read the original letter below it. Let\'s go."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);

    showCipherPuzzle();
  },
};

function showCipherPuzzle() {
  const s = state.missionState;
  const p = cipherPuzzles[s.cipherIdx];
  const encrypted = caesarEncrypt(p.plain, p.shift);
  s.wrongCount = 0;
  setPhaseProgress(s.cipherIdx + 1, cipherPuzzles.length);

  addLine(`\u2501\u2501\u2501 Encrypted Message ${s.cipherIdx + 1} of ${cipherPuzzles.length} \u2501\u2501\u2501`, 'highlight');
  addLine(p.desc, 'info');
  addLine('');
  addLine(`  Encrypted text:  <span class="highlight">${encrypted}</span>`);
  addLine(`  Shift used:      <span class="highlight">${p.shift}</span>`);
  addLine('');

  // Create and append the dual cipher strip
  const strip = createCipherStrip(p.shift);
  const term = $('terminal');
  term.appendChild(strip);
  term.scrollTop = term.scrollHeight;

  addLine('');
  addLine('Type the decoded message:', 'warning');

  setCurrentInputHandler((input) => {
    const guess = input.toUpperCase().trim();
    if (guess === p.plain) {
      sound.success();
      addLine(`[DECODED] "${p.plain}" -- correct!`, 'success');
      s.cipherIdx++;
      if (s.cipherIdx >= cipherPuzzles.length) {
        finishMission();
        return;
      } else {
        addLine('');
        addLine('Message cracked. Intercepting next transmission...', 'info');
        setTimeout(showCipherPuzzle, 800);
      }
    } else {
      sound.denied();
      s.wrongCount++;

      // Check if they went the wrong direction (encrypted further instead of decrypting)
      const doubleEncrypted = caesarEncrypt(p.plain, p.shift * 2);
      if (guess === doubleEncrypted) {
        addLine('[WRONG] You shifted FORWARD again -- that encrypted it more!', 'error');
        addLine('NEXUS: "Wrong direction. The cipher already pushed letters', 'highlight');
        addLine('        forward. You need to pull them BACKWARD to undo it."', 'highlight');
      } else if (s.wrongCount === 1) {
        // First wrong attempt: general guidance
        addLine('[WRONG] That\'s not the original message.', 'error');
        addLine('NEXUS: "Remember: the cipher pushed letters FORWARD. To', 'highlight');
        addLine('        undo it, go BACKWARD by the same number of steps."', 'highlight');
      } else if (s.wrongCount === 2) {
        // Second wrong attempt: point them to the strip
        addLine('[WRONG] Not quite. Use the decoder strip.', 'error');
        addLine(`NEXUS: "${p.hintOnWrong}"`, 'highlight');
        const firstEncLetter = encrypted.replace(/\s/g, '').charAt(0);
        if (firstEncLetter) {
          highlightCipherLetter(strip, firstEncLetter);
        }
      } else {
        // Third+ wrong attempt: walk through the first letter explicitly
        addLine('[WRONG] Let me walk you through the first letter.', 'error');
        const firstEncLetter = encrypted.replace(/\s/g, '').charAt(0);
        const firstPlainLetter = p.plain.replace(/\s/g, '').charAt(0);
        highlightCipherLetter(strip, firstEncLetter);
        addLine(`NEXUS: "Look at the strip. Find ${firstEncLetter} on the top`, 'highlight');
        addLine(`        row. The letter below it is ${firstPlainLetter}. That's your`, 'highlight');
        addLine(`        first letter. Do the same for each letter."`, 'highlight');
      }
    }
  });
}

async function finishMission() {
  addLine('');
  addLine('\u2501\u2501\u2501 ALL MESSAGES DECODED \u2501\u2501\u2501', 'success');

  await sleep(600);

  addLine('');
  addLine('  Message 1: "HELLO"', 'info');
  addLine('  Message 2: "PIZZA"', 'info');
  addLine('  Message 3: "SAVE US"', 'info');
  addLine('');

  await sleep(800);

  addLine('NEXUS: "Wait. Read the last message again."', 'highlight');

  await sleep(1000);

  addLine('');
  addLine('  >>> SAVE US <<<', 'success');
  addLine('');

  await sleep(600);

  addLine('NEXUS: "That\'s not the AI attacking. That\'s the AI', 'highlight');
  addLine('        calling for help."', 'highlight');
  addLine('', '');

  await sleep(800);

  addLine('NEXUS: "It hid a message inside its own attack traffic --', 'highlight');
  addLine('        the only channel nobody was blocking. Encrypted', 'highlight');
  addLine('        it so only someone who understood ciphers could', 'highlight');
  addLine('        read it. It was begging for help this whole time."', 'highlight');
  addLine('', '');

  await sleep(500);

  addLine('NEXUS: "This changes everything."', 'highlight');
  addLine('', '');
  addLine('[ Type NEXT to continue ]', 'warning');

  setCurrentInputHandler((input) => {
    if (input.toUpperCase().trim() === 'NEXT') {
      setCurrentInputHandler(null);
      completeMission(5);
    }
  });
}
