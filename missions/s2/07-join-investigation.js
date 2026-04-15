// missions/s2/07-join-investigation.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission,
} from '../../engine.js';

import { caesarEncrypt } from '../helpers.js';

export const mission = {
  id: 14,
  num: 'S2-07',
  title: 'CRYPTANALYSIS',
  name: 'Cryptanalysis',
  desc: 'Crack ciphers WITHOUT the key using brute force and frequency analysis \u2014 the real technique that broke Enigma.',
  skill: 'SKILL: Brute Force + Frequency Analysis',
  hints: [
    'Phase 1 (brute force): scan each of the 26 lines until one stops being gibberish. Only one will be a real English word.',
    'Phase 2 (frequency): count the letters in the cipher. The most common one is almost certainly an E in disguise. Shift = (cipher-letter index) - (E index), wrapped mod 26.',
    'Phase 3 (decrypt): once you know the shift, walk each cipher letter BACKWARD by that many positions. Wrap Z \u2192 A if you fall off the end.',
  ],
  run: async function() {
    state.missionState = { phase: 0, hintIdx: 0 };

    await typeLines([
      { text: '[CIPHER FILES INTERCEPTED] Encrypted. Key missing.', cls: 'system' },
      { text: '[scanning] \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588  100%', cls: 'system' },
      { text: '[status] NO KEY. NO SENDER. JUST CIPHERTEXT.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'AI CORE: "In Season 1, you decoded messages when you KNEW the', cls: 'purple' },
      { text: '          shift. That was the easy version. This time we have', cls: 'purple' },
      { text: '          NOTHING \u2014 just a wall of scrambled letters."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Breaking codes WITHOUT the key has a name.', cls: 'purple' },
      { text: '          CRYPTANALYSIS. In 1940, a mathematician named Alan', cls: 'purple' },
      { text: '          Turing sat in a hut in England doing exactly what', cls: 'purple' },
      { text: '          you\'re about to do. His target: the Nazi Enigma', cls: 'purple' },
      { text: '          machine. His tools: patterns in language."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Historians say his work shortened World War II by', cls: 'purple' },
      { text: '          two years and saved millions of lives. You are', cls: 'purple' },
      { text: '          about to learn the same technique."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Three phases. Brute force. Frequency analysis.', cls: 'purple' },
      { text: '          Then you apply the shift and read the message', cls: 'purple' },
      { text: '          yourself. Ready?"', cls: 'purple' },
      { text: '', cls: '' },
    ]);

    runS2M7Phase();
  },
};

function runS2M7Phase() {
  const s = state.missionState;
  setPhaseProgress(s.phase + 1, 3);

  if (s.phase === 0) {
    // ────────────────────────────────────────────
    // PHASE 1 — BRUTE FORCE
    // ────────────────────────────────────────────
    const plain = 'ATTACK';
    const shift = 11;
    const encrypted = caesarEncrypt(plain, shift);

    addLine('\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557', 'highlight');
    addLine('\u2551  \u25b6 PHASE 1 of 3 \u2014 BRUTE FORCE     \u2551', 'highlight');
    addLine('\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d', 'highlight');
    addLine('', '');
    addLine('AI CORE: "Simplest attack in the book: try EVERY possible', 'purple');
    addLine('          key. Caesar has only 26 shifts \u2014 one for each', 'purple');
    addLine('          letter. A computer scans all 26 in a blink."', 'purple');
    addLine('', '');
    addLine('AI CORE: "This is BRUTE FORCE. No cleverness, just volume.', 'purple');
    addLine('          It works when the key space is tiny."', 'purple');
    addLine('', '');
    addLine(`Intercepted cipher: ${encrypted}`, 'info');
    addLine('', '');
    addLine('AI CORE: "Below are all 26 possible decryptions \u2014 one per', 'purple');
    addLine('          shift. Exactly ONE will be a real English word.', 'purple');
    addLine('          Your eyes are the detector. Find it."', 'purple');
    addLine('', '');

    let pre = '';
    for (let sh = 0; sh < 26; sh++) {
      const decoded = encrypted.split('').map(c => {
        if (c === ' ') return ' ';
        const code = c.charCodeAt(0) - 65;
        return String.fromCharCode(((code - sh + 26) % 26) + 65);
      }).join('');
      pre += `  shift=${sh.toString().padStart(2)}: ${decoded}\n`;
    }
    addPre(pre);

    addLine('', '');
    addLine('Only ONE line is a real English word. Type the decoded message:', 'warning');

    s.bruteStep = 0;

    setCurrentInputHandler((input) => {
      if (s.bruteStep === 0) {
        if (input.toUpperCase().trim() === plain) {
          sound.success();
          addLine('', '');
          addLine(`[CRACKED] "${plain}" \u2014 shift was ${shift}!`, 'success');
          addLine('', '');
          addLine('AI CORE: "Exactly. Your brain filtered 25 lines of', 'purple');
          addLine('          gibberish and locked onto the one that made', 'purple');
          addLine('          sense. Language is the detector."', 'purple');
          addLine('', '');
          addLine('AI CORE: "But now the important question. Imagine a', 'purple');
          addLine('          cipher with ONE MILLION possible keys instead', 'purple');
          addLine('          of 26. Could you still brute force it by', 'purple');
          addLine('          reading lines with your eyes?"', 'purple');
          addLine('', '');
          addLine('Type YES or NO:', 'warning');
          s.bruteStep = 1;
        } else if (/^[A-Z\s]+$/i.test(input.trim())) {
          sound.denied();
          addLine('[NOT IT] That word isn\'t in the list above. Scan line-by-line \u2014 most are gibberish. Only ONE reads like real English.', 'error');
        } else {
          sound.denied();
          addLine('[NEED LETTERS] Type the decoded word itself (letters only, no numbers).', 'error');
        }
      } else if (s.bruteStep === 1) {
        const a = input.trim().toUpperCase();
        if (a === 'NO' || a === 'N') {
          sound.success();
          addLine('', '');
          addLine('[EXACTLY] At a million lines per second you\'d still be reading for 11 days straight.', 'success');
          addLine('', '');
          addLine('AI CORE: "That\'s the real insight. Brute force only', 'purple');
          addLine('          works when the key space is SMALL. Real', 'purple');
          addLine('          encryption has keys so large that trying them', 'purple');
          addLine('          all would take longer than the universe has', 'purple');
          addLine('          existed. More combinations than atoms in the', 'purple');
          addLine('          observable universe."', 'purple');
          addLine('', '');
          addLine('AI CORE: "So when brute force fails, we need to be', 'purple');
          addLine('          CLEVER. We need to use patterns in the', 'purple');
          addLine('          language itself. That\'s phase 2."', 'purple');
          addLine('', '');
          addLine('>>> PHASE 1 COMPLETE <<<', 'success big');
          s.phase = 1;
          addLine('');
          setTimeout(runS2M7Phase, 1500);
        } else if (a === 'YES' || a === 'Y') {
          sound.denied();
          addLine('[THINK AGAIN] Sure, a computer can generate a million decryptions. But YOU would still have to read each one to pick out the English. How long would reading a million lines take?', 'error');
        } else {
          sound.denied();
          addLine('[TYPE YES OR NO] Could you personally read a million lines and spot the English one?', 'error');
        }
      }
    });
  } else if (s.phase === 1) {
    // ────────────────────────────────────────────
    // PHASE 2 — FREQUENCY ANALYSIS
    // ────────────────────────────────────────────
    addLine('\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557', 'highlight');
    addLine('\u2551 \u25b6 PHASE 2 of 3 \u2014 FREQUENCY ANALYSIS \u2551', 'highlight');
    addLine('\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d', 'highlight');
    addLine('', '');
    addLine('AI CORE: "Here\'s the secret that broke codes for a thousand', 'purple');
    addLine('          years before computers. English letters are NOT', 'purple');
    addLine('          evenly distributed. E shows up about 12% of the', 'purple');
    addLine('          time. T is second. Then A, O, I, N. Always."', 'purple');
    addLine('', '');
    addLine('English letter frequency (from millions of words of text):', 'info');
    addPre('  E \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588 12.7%\n  T \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588    9.1%\n  A \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588      8.2%\n  O \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588      7.5%\n  I \u2588\u2588\u2588\u2588\u2588\u2588\u2588       7.0%\n  N \u2588\u2588\u2588\u2588\u2588\u2588\u2588       6.7%');
    addLine('', '');
    addLine('AI CORE: "Languages have FINGERPRINTS. English always shows', 'purple');
    addLine('          E, T, A at the top. Always."', 'purple');
    addLine('', '');
    addLine('AI CORE: "A Caesar shift just renames the letters \u2014 it', 'purple');
    addLine('          doesn\'t change how often each one appears. So the', 'purple');
    addLine('          most common letter in the CIPHER is almost', 'purple');
    addLine('          certainly E wearing a disguise."', 'purple');
    addLine('', '');

    const plain2 = 'THE SECRET MEETING IS AT THE OLD TREE AT MIDNIGHT BRING THE KEY';
    const shift2 = 5;
    const enc2 = caesarEncrypt(plain2, shift2);
    addLine('Intercepted cipher:', 'info');
    addPre(`  ${enc2}`);
    addLine('', '');

    const counts = {};
    for (const c of enc2) {
      if (c === ' ') continue;
      counts[c] = (counts[c] || 0) + 1;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const maxCount = sorted[0][1];

    addLine('Letter frequencies in the cipher (bar chart):', 'info');
    const barLines = sorted.map(([l, c]) => {
      const barWidth = Math.round((c / maxCount) * 20);
      const bar = '\u2588'.repeat(barWidth) + '\u2591'.repeat(20 - barWidth);
      return `  ${l}  ${bar}  (${c})`;
    });
    addPre(barLines.join('\n'));
    addLine('', '');

    const mostCommon = sorted[0][0];
    const expectedShift = (mostCommon.charCodeAt(0) - 'E'.charCodeAt(0) + 26) % 26;

    addLine('AI CORE: "Look at that bar chart. One letter towers over', 'purple');
    addLine('          the others. That\'s our disguised E."', 'purple');
    addLine('', '');
    addLine(`AI CORE: "The most common letter in the cipher is ${mostCommon}. In`, 'purple');
    addLine(`          English, the most common letter is E. So ${mostCommon} is`, 'purple');
    addLine('          probably E in disguise."', 'purple');
    addLine('', '');
    addLine(`AI CORE: "Now the detective question: what shift turns E into ${mostCommon}?`, 'purple');
    addLine(`          Count forward: E \u2192 F \u2192 G \u2192 ... \u2192 ${mostCommon}. How many steps?"`, 'purple');
    addLine('', '');
    addPre('  A=0  B=1  C=2  D=3  E=4  F=5  G=6\n  H=7  I=8  J=9  K=10 L=11 M=12 N=13\n  O=14 P=15 Q=16 R=17 S=18 T=19 U=20\n  V=21 W=22 X=23 Y=24 Z=25\n\n  shift = (cipher_letter_index) - (E_index)\n        = (cipher_letter_index) - 4   (wrap mod 26)');
    addLine('', '');
    addLine('What is the shift? (number from 0 to 25)', 'warning');

    setCurrentInputHandler((input) => {
      const n = parseInt(input.trim());
      if (Number.isNaN(n)) {
        sound.denied();
        addLine('[NEED A NUMBER] Type a single number between 0 and 25.', 'error');
        return;
      }
      if (n === expectedShift) {
        sound.success();
        addLine('', '');
        addLine(`[CORRECT] Shift = ${n}. E was hiding as ${mostCommon} all along.`, 'success');
        addLine('', '');
        addLine('AI CORE: "Languages have fingerprints. English always', 'purple');
        addLine('          shows E, T, A at the top \u2014 always. This broke', 'purple');
        addLine('          codes for a THOUSAND years before computers.', 'purple');
        addLine('          Arab scholars in the 9th century used it.', 'purple');
        addLine('          Turing\'s team at Bletchley Park used a more', 'purple');
        addLine('          advanced version of the same idea."', 'purple');
        addLine('', '');
        addLine('>>> PHASE 2 COMPLETE <<<', 'success big');
        s.phase2Shift = expectedShift;
        s.phase2Cipher = enc2;
        s.phase2Plain = plain2;
        s.phase = 2;
        addLine('');
        setTimeout(runS2M7Phase, 1500);
      } else if (n < 0 || n > 25) {
        sound.denied();
        addLine('[OUT OF RANGE] A Caesar shift is always 0 to 25. Try again.', 'error');
      } else {
        sound.denied();
        addLine(`[NOT QUITE] Count forward from E to ${mostCommon}. E=4, so shift = (${mostCommon}\'s index) - 4. If it goes negative, add 26.`, 'error');
      }
    });
  } else if (s.phase === 2) {
    // ────────────────────────────────────────────
    // PHASE 3 — APPLY THE SHIFT
    // ────────────────────────────────────────────
    addLine('\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557', 'highlight');
    addLine('\u2551  \u25b6 PHASE 3 of 3 \u2014 DECODE IT         \u2551', 'highlight');
    addLine('\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d', 'highlight');
    addLine('', '');
    addLine('AI CORE: "Knowing the shift isn\'t enough. A real', 'purple');
    addLine('          cryptanalyst has to READ the message. That means', 'purple');
    addLine('          taking every cipher letter and walking it', 'purple');
    addLine('          BACKWARD by the shift."', 'purple');
    addLine('', '');
    addLine(`Shift (from Phase 2): ${s.phase2Shift}`, 'info');
    addLine('Intercepted cipher:', 'info');
    addPre(`  ${s.phase2Cipher}`);
    addLine('', '');
    addLine('AI CORE: "Take each letter. Walk it BACK by the shift \u2014', 'purple');
    addLine('          that many positions earlier in the alphabet. If', 'purple');
    addLine('          you fall off the start, wrap around from Z."', 'purple');
    addLine('', '');
    addPre(`  Example: first cipher letter = ${s.phase2Cipher[0]}\n           walk back ${s.phase2Shift} positions\n           \u2192 that\'s the first plaintext letter\n\n  Spaces stay as spaces.`);
    addLine('', '');
    addLine('Type the full decoded message (letters and spaces):', 'warning');

    setCurrentInputHandler((input) => {
      const guess = input.toUpperCase().trim().replace(/\s+/g, ' ');
      const target = s.phase2Plain;

      if (guess === target) {
        sound.success();
        addLine('', '');
        addLine('>>> PHASE 3 COMPLETE <<<', 'success big');
        addLine(`Decoded: ${target}`, 'highlight');
        addLine('', '');
        addLine('\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557', 'system');
        addLine('\u2551     [CIPHER BROKEN \u2014 MESSAGE READ]   \u2551', 'system');
        addLine('\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d', 'system');
        addLine('', '');
        addLine('AI CORE: "You did it. Three phases \u2014 brute force,', 'purple');
        addLine('          frequency analysis, and applying the shift to', 'purple');
        addLine('          read the plaintext. The same three moves', 'purple');
        addLine('          cryptanalysts have made for a thousand years."', 'purple');
        addLine('', '');
        addLine('AI CORE: "1940. A cold hut in England. A mathematician', 'purple');
        addLine('          named Alan Turing and his team at Bletchley', 'purple');
        addLine('          Park used this exact kind of thinking \u2014 pattern', 'purple');
        addLine('          hunting in ciphertext \u2014 to break the Nazi', 'purple');
        addLine('          Enigma machine during World War II."', 'purple');
        addLine('', '');
        addLine('AI CORE: "Historians say their work shortened the war by', 'purple');
        addLine('          two years and saved millions of lives. You', 'purple');
        addLine('          just used the same method that changed the', 'purple');
        addLine('          course of a world war."', 'purple');
        addLine('', '');
        addLine('AI CORE: "Modern encryption is designed SPECIFICALLY to', 'purple');
        addLine('          defeat these two attacks. Huge key spaces to', 'purple');
        addLine('          kill brute force. Flat output distributions to', 'purple');
        addLine('          kill frequency analysis. Every security system', 'purple');
        addLine('          you use is built on top of what you just did."', 'purple');
        addLine('', '');
        addLine('Cryptanalysis complete!', 'success big');
        setCurrentInputHandler(null);
        setTimeout(() => completeMission(14), 1500);
        return;
      }

      sound.denied();
      if (guess.length === 0) {
        addLine('[EMPTY] Type the decoded message. Letters and spaces only.', 'error');
        return;
      }
      if (/[^A-Z\s]/.test(guess)) {
        addLine('[LETTERS ONLY] Use A-Z and spaces. No numbers or symbols.', 'error');
        return;
      }

      let correctLead = 0;
      for (let i = 0; i < Math.min(guess.length, target.length); i++) {
        if (guess[i] === target[i]) correctLead++;
        else break;
      }

      if (correctLead >= 3) {
        addLine(`[CLOSE] First ${correctLead} characters match \u2014 keep going. Walk each remaining cipher letter back ${s.phase2Shift} positions.`, 'error');
      } else if (guess.length !== target.length) {
        addLine(`[LENGTH OFF] Your answer is ${guess.length} chars; the cipher is ${target.length}. Decode letter-for-letter, keep the spaces where they are.`, 'error');
      } else {
        addLine(`[TRY AGAIN] Take the first cipher letter "${s.phase2Cipher[0]}", walk back ${s.phase2Shift} positions (wrap Z\u2192A if needed). That\'s the first letter of the message.`, 'error');
      }
    });
  }
}
