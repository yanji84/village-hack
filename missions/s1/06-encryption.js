// missions/s1/06-encryption.js
import {
  state, sound,
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
  wrap.style.cssText = 'margin:12px 0; font-family:"Fira Mono",monospace; font-size:13px;';

  const cellStyle = 'width:24px;height:28px;display:flex;align-items:center;justify-content:center;'
    + 'border:1px solid #1a2a1a;border-radius:2px;color:#005a15;transition:all 0.2s;flex-shrink:0;';

  // Encrypted label
  const labelEnc = document.createElement('div');
  labelEnc.style.cssText = 'color:#666;font-size:10px;margin-bottom:2px;';
  labelEnc.textContent = 'ENCRYPTED:';
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
    cipherRow.appendChild(cell);
  }
  wrap.appendChild(cipherRow);

  // Plain label
  const labelPlain = document.createElement('div');
  labelPlain.style.cssText = 'color:#666;font-size:10px;margin:4px 0 2px;';
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
    cell.textContent = ALPHA[i];
    plainRow.appendChild(cell);
  }
  wrap.appendChild(plainRow);

  // Hint line
  const hint = document.createElement('div');
  hint.style.cssText = 'color:#666;font-size:10px;margin-top:4px;';
  hint.textContent = '\u2191 Find the encrypted letter on top \u2192 read the letter below it';
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

  // Remove old arrow if any
  const oldArrow = strip.querySelector('.cipher-arrow');
  if (oldArrow) oldArrow.remove();

  if (!encryptedLetter) return;

  const letter = encryptedLetter.toUpperCase();
  if (letter < 'A' || letter > 'Z') return;

  // Find and highlight the encrypted letter on the top row
  const encCell = strip.querySelector(`.cipher-enc[data-letter="${letter}"]`);
  if (encCell) {
    encCell.style.background = 'rgba(255,136,0,0.2)';
    encCell.style.color = '#ff8800';
    encCell.style.borderColor = '#ff8800';
    encCell.style.fontWeight = 'bold';

    // The plain cell at the same index is the decrypted letter
    const idx = encCell.dataset.idx;
    const plainCell = strip.querySelector(`.cipher-plain[data-idx="${idx}"]`);
    if (plainCell) {
      plainCell.style.background = 'rgba(0,255,65,0.2)';
      plainCell.style.color = '#00ff41';
      plainCell.style.borderColor = '#00ff41';
      plainCell.style.fontWeight = 'bold';

      // Add a connecting arrow between the rows
      const arrow = document.createElement('div');
      arrow.className = 'cipher-arrow';
      arrow.style.cssText = 'display:flex;gap:2px;pointer-events:none;';
      // Build spacer cells so the arrow aligns with the column
      for (let i = 0; i < 26; i++) {
        const spacer = document.createElement('div');
        spacer.style.cssText = 'width:24px;height:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;';
        if (String(i) === idx) {
          spacer.textContent = '\u2502';
          spacer.style.color = '#00ff41';
        }
        arrow.appendChild(spacer);
      }
      // Insert the arrow connector right before the plain row
      const plainRow = strip.querySelector('.plain-row');
      strip.insertBefore(arrow, plainRow);
    }
  }
}

const cipherPuzzles = [
  {
    plain: 'HELLO',
    shift: 1,
    desc: 'Shift of 1 \u2014 each letter moves forward by 1 in the alphabet. So A\u2192B, B\u2192C, H\u2192I...',
  },
  {
    plain: 'PIZZA',
    shift: 3,
    desc: 'Shift of 3 \u2014 each letter moved forward by 3. To DECODE, go backward by 3.',
  },
  {
    plain: 'SAVE US',
    shift: 5,
    desc: 'Shift of 5 \u2014 the AI\'s final encrypted message! Spaces stay as spaces.',
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
    state.missionState = { cipherIdx: 0, hintIdx: 0 };

    await typeLines([
      { text: '[COMMS INTERCEPT] Encrypted messages found in attack traffic.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "We found encrypted messages hidden in the AI\'s', cls: 'highlight' },
      { text: '        attack traffic. Someone was communicating through', cls: 'highlight' },
      { text: '        it. To read them, you need to crack the cipher."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Two thousand years ago, Julius Caesar had a problem.', cls: 'highlight' },
      { text: '        He had to send battle orders across enemy territory.', cls: 'highlight' },
      { text: '        If a messenger got caught, the message was in enemy', cls: 'highlight' },
      { text: '        hands."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "So he made up a rule. Shift every letter three places', cls: 'highlight' },
      { text: '        forward in the alphabet. A becomes D. B becomes E.', cls: 'highlight' },
      { text: '        Garbage to anyone without the rule. Intact to anyone', cls: 'highlight' },
      { text: '        with it. The CAESAR CIPHER."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Two thousand years later, the same idea is still how', cls: 'highlight' },
      { text: '        encryption works \u2014 just with way more complicated', cls: 'highlight' },
      { text: '        rules. Every secure website, every chat app, every', cls: 'highlight' },
      { text: '        bank transfer: a descendant of what Caesar did."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "The AI\'s using it on the town comms. If the cipher', cls: 'highlight' },
      { text: '        shifted letters one way, you need to walk them BACK', cls: 'highlight' },
      { text: '        the same distance to read the original. Three', cls: 'highlight' },
      { text: '        messages to decode. Go."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);

    showCipherPuzzle();
  },
};

function showCipherPuzzle() {
  const s = state.missionState;
  const p = cipherPuzzles[s.cipherIdx];
  const encrypted = caesarEncrypt(p.plain, p.shift);
  setPhaseProgress(s.cipherIdx + 1, cipherPuzzles.length);

  addLine(`\u2501\u2501\u2501 Encrypted Message ${s.cipherIdx + 1} \u2501\u2501\u2501`, 'highlight');
  addLine(p.desc, 'info');
  addLine('');
  addLine(`Encrypted: <span class="highlight">${encrypted}</span>`);
  addLine(`Shift: <span class="highlight">${p.shift}</span>`);
  addLine('');

  // Create and append the dual cipher strip
  const strip = createCipherStrip(p.shift);
  const term = $('terminal');
  term.appendChild(strip);
  term.scrollTop = term.scrollHeight;

  addLine('');
  addLine('Type the decoded message:', 'warning');

  setCurrentInputHandler((input) => {
    if (input.toUpperCase().trim() === p.plain) {
      sound.success();
      addLine(`[DECODED] "${p.plain}" \u2014 correct!`, 'success');
      s.cipherIdx++;
      if (s.cipherIdx >= cipherPuzzles.length) {
        addLine('');
        addLine('All messages decoded! The final message: "SAVE US"', 'success');
        addLine('', '');
        addLine('NEXUS: "SAVE US... that\'s not the AI attacking. That\'s', 'highlight');
        addLine('        the AI BEGGING for help. Through the only channel', 'highlight');
        addLine('        it could still use \u2014 encrypted messages hidden', 'highlight');
        addLine('        in its own attack traffic. It was crying for', 'highlight');
        addLine('        help this whole time."', 'highlight');
        addLine('', '');
        addLine('[ Type NEXT to continue ]', 'warning');
        setCurrentInputHandler(() => {
          setCurrentInputHandler(null);
          completeMission(5);
        });
        return;
      } else {
        addLine('\nDecrypted! Next message incoming...', 'info');
        setTimeout(showCipherPuzzle, 600);
      }
    } else {
      sound.denied();
      addLine('[WRONG] Check the direction you\'re moving through the alphabet.', 'error');
      addLine('NEXUS: "The cipher walked the letters FORWARD. You need to', 'highlight');
      addLine('        walk them the other way. Same number of steps."', 'highlight');
      // Highlight the first encrypted letter on the strip as a hint
      const firstEncLetter = encrypted.replace(/\s/g, '').charAt(0);
      if (firstEncLetter) {
        highlightCipherLetter(strip, firstEncLetter);
        addLine(`NEXUS: "Look at the strip \u2014 find <span class="highlight">${firstEncLetter}</span> on top, read the letter below it."`, 'highlight');
      }
    }
  });
}
