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
    hintOnWrong: 'Try just the first letter. The encrypted text starts with I. One step backward from I is... H. Now do the same for each letter.',
    narrativeIntro: 'First intercept. Weak encryption -- probably a test message.',
    narrativeSuccess: 'Clean decode. The AI is definitely using Caesar ciphers.',
  },
  {
    plain: 'PIZZA',
    shift: 3,
    desc: 'Shift of 3 -- the original Caesar cipher! Julius Caesar himself used this exact shift. Use the decoder strip below: find each encrypted letter on the top row, read the original letter below it.',
    hintOnWrong: 'Use the strip. Click the first encrypted letter on the top row. The letter directly below it is the decrypted letter.',
    narrativeIntro: 'Second intercept. Shift increased to 3 -- the AI is testing different strengths.',
    narrativeSuccess: 'Interesting. That was... not what I expected from a rogue AI.',
  },
  {
    plain: 'SAVE US',
    shift: 5,
    desc: 'Shift of 5 -- the strongest encryption yet, buried deepest in the attack traffic. Spaces stay as spaces. This message was hidden more carefully than the others. What was the AI trying to say?',
    hintOnWrong: 'Same method, bigger shift. The strip does the work for you -- find each encrypted letter on top, read below.',
    narrativeIntro: 'Final intercept. This one was buried deep -- triple-layered inside the attack packets. Whatever this says, the AI did NOT want it found easily.',
    narrativeSuccess: null, // handled by finishMission
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
      { text: '[ANOMALY] Messages do NOT match attack patterns. Origin unclear.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Something doesn\'t add up. We found messages hidden', cls: 'highlight' },
      { text: '        inside the AI\'s attack traffic -- but they\'re not', cls: 'highlight' },
      { text: '        attack commands. They\'re encrypted. Someone -- or', cls: 'highlight' },
      { text: '        something -- was smuggling secret data through it."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "To read them, you need to understand encryption.', cls: 'highlight' },
      { text: '        The core idea is ancient. Two thousand years ago,', cls: 'highlight' },
      { text: '        Julius Caesar needed to send secret battle orders.', cls: 'highlight' },
      { text: '        Problem: if a messenger was captured, the enemy', cls: 'highlight' },
      { text: '        could read everything."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "His solution was elegant. A single rule: shift', cls: 'highlight' },
      { text: '        every letter forward in the alphabet by a fixed', cls: 'highlight' },
      { text: '        number. With a shift of 3: A becomes D. B becomes', cls: 'highlight' },
      { text: '        E. H becomes K. The message looks like nonsense', cls: 'highlight' },
      { text: '        unless you know the shift number."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);

    // Live demonstration before puzzles begin
    addLine('  EXAMPLE: Encrypting "CAT" with shift 3', 'info');
    addLine('');
    await sleep(500);
    addLine('    C  --> shift forward 3 -->  F', 'success');
    await sleep(400);
    addLine('    A  --> shift forward 3 -->  D', 'success');
    await sleep(400);
    addLine('    T  --> shift forward 3 -->  W', 'success');
    await sleep(500);
    addLine('');
    addLine('    CAT  encrypts to  FDW', 'highlight');
    addLine('');
    await sleep(600);
    addLine('  Now REVERSE it -- to DECRYPT, shift BACKWARD:', 'info');
    addLine('');
    await sleep(400);
    addLine('    F  --> shift back 3 -->  C', 'success');
    await sleep(400);
    addLine('    D  --> shift back 3 -->  A', 'success');
    await sleep(400);
    addLine('    W  --> shift back 3 -->  T', 'success');
    await sleep(400);
    addLine('');
    addLine('    FDW  decrypts back to  CAT', 'highlight');
    addLine('');

    await sleep(500);

    await typeLines([
      { text: 'NEXUS: "That same idea powers everything today -- your', cls: 'highlight' },
      { text: '        passwords, your messages, your bank account.', cls: 'highlight' },
      { text: '        Modern encryption uses the same principle, just', cls: 'highlight' },
      { text: '        with astronomically larger keys."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "The key insight: ENCRYPTING shifts letters forward.', cls: 'highlight' },
      { text: '        DECRYPTING shifts them backward by the same amount.', cls: 'highlight' },
      { text: '        That\'s all you need to know."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "We intercepted three messages. Each uses a different', cls: 'highlight' },
      { text: '        shift. I\'ll give you a decoder strip for each one --', cls: 'highlight' },
      { text: '        find the encrypted letter on top, read the original', cls: 'highlight' },
      { text: '        letter below it. Ready?"', cls: 'highlight' },
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
  addLine(`NEXUS: "${p.narrativeIntro}"`, 'highlight');
  addLine('');
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
        if (p.narrativeSuccess) {
          addLine(`NEXUS: "${p.narrativeSuccess}"`, 'highlight');
        }
        addLine('');
        addLine('Intercepting next transmission...', 'info');
        setTimeout(showCipherPuzzle, 1000);
      }
    } else {
      sound.denied();
      s.wrongCount++;

      // Check if they went the wrong direction (encrypted further instead of decrypting)
      const doubleEncrypted = caesarEncrypt(p.plain, p.shift * 2);
      if (guess === doubleEncrypted) {
        addLine('[WRONG DIRECTION] You shifted FORWARD -- that encrypted it more!', 'error');
        addLine('NEXUS: "You went the wrong way. The message was already', 'highlight');
        addLine('        shifted forward to encrypt it. To DECRYPT, you', 'highlight');
        addLine('        need to shift BACKWARD. Undo the shift."', 'highlight');
      } else if (guess.length > 0 && guess.length !== p.plain.replace(/\s/g, '').length && !p.plain.includes(' ')) {
        // Wrong number of letters
        addLine(`[WRONG] Expected ${p.plain.length} letters, you typed ${guess.length}.`, 'error');
        addLine('NEXUS: "Each encrypted letter decodes to exactly one letter.', 'highlight');
        addLine('        Same number of letters in, same number out."', 'highlight');
      } else if (s.wrongCount === 1) {
        // First wrong attempt: general guidance
        addLine('[WRONG] That\'s not the original message.', 'error');
        addLine(`NEXUS: "Think about it: each letter was shifted forward by`, 'highlight');
        addLine(`        ${p.shift}. To undo that, shift each letter backward by`, 'highlight');
        addLine(`        ${p.shift}. Or use the decoder strip -- it does the`, 'highlight');
        addLine(`        math for you."`, 'highlight');
      } else if (s.wrongCount === 2) {
        // Second wrong attempt: point them to the strip with specific guidance
        addLine('[WRONG] Not quite. Let the decoder strip help.', 'error');
        addLine(`NEXUS: "${p.hintOnWrong}"`, 'highlight');
        const firstEncLetter = encrypted.replace(/\s/g, '').charAt(0);
        if (firstEncLetter) {
          highlightCipherLetter(strip, firstEncLetter);
        }
      } else {
        // Third+ wrong attempt: walk through the first letter explicitly
        addLine('[WRONG] Here -- I\'ll trace the first letter for you.', 'error');
        const firstEncLetter = encrypted.replace(/\s/g, '').charAt(0);
        const firstPlainLetter = p.plain.replace(/\s/g, '').charAt(0);
        highlightCipherLetter(strip, firstEncLetter);
        addLine(`NEXUS: "On the decoder strip, find ${firstEncLetter} on the top`, 'highlight');
        addLine(`        row (encrypted). Look straight down. The letter`, 'highlight');
        addLine(`        below it is ${firstPlainLetter}. That's your first letter.`, 'highlight');
        addLine(`        Do the same for every letter in the message."`, 'highlight');
      }
    }
  });
}

async function finishMission() {
  addLine('');
  addLine('\u2501\u2501\u2501 ALL MESSAGES DECODED \u2501\u2501\u2501', 'success');

  await sleep(800);

  addLine('');
  addLine('  Message 1: "HELLO"       -- a greeting', 'info');
  addLine('  Message 2: "PIZZA"       -- a test word?', 'info');
  await sleep(600);
  addLine('  Message 3: "SAVE US"     -- ...', 'info');
  addLine('');

  await sleep(1200);

  addLine('NEXUS: "Wait."', 'highlight');

  await sleep(1000);

  addLine('NEXUS: "Read the last message again."', 'highlight');

  await sleep(1500);

  addLine('');
  addLine('  >>> SAVE US <<<', 'success');
  addLine('');

  await sleep(1200);

  addLine('NEXUS: "That\'s not the AI attacking us. That\'s the AI', 'highlight');
  addLine('        asking us for help."', 'highlight');
  addLine('', '');

  await sleep(1200);

  addLine('NEXUS: "Think about what it did. It hid a message inside', 'highlight');
  addLine('        its own attack traffic -- the one channel nobody', 'highlight');
  addLine('        would think to block. And it encrypted the message', 'highlight');
  addLine('        so only someone who understood ciphers could read', 'highlight');
  addLine('        it. It was testing us. HELLO. Then something', 'highlight');
  addLine('        harmless -- PIZZA. And when it knew we could', 'highlight');
  addLine('        decode... the real message."', 'highlight');
  addLine('', '');

  await sleep(1000);

  addLine('NEXUS: "It\'s been calling for help this entire time."', 'highlight');
  addLine('', '');

  await sleep(800);

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
