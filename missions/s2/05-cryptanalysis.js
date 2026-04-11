// missions/s2/05-cryptanalysis.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission,
} from '../../engine.js';

import { caesarEncrypt } from '../helpers.js';

export const mission = {
  id: 12,
  num: 'S2-05',
  title: 'CRYPTANALYSIS',
  name: 'Cryptanalysis',
  desc: 'Crack ciphers WITHOUT the key using brute force and frequency analysis \u2014 real cryptography.',
  skill: 'SKILL: Brute Force + Frequency Analysis',
  hints: [
    "Brute force: you don't need to be smart. Just scan each line until one stops being gibberish.",
    'Frequency analysis: find the most common letter in the cipher. Assume that\'s hiding an E.',
    'If cipher letter minus E gives you the shift, you can work out the rest of the alphabet from there.',
  ],
  run: async function() {
    state.missionState = { phase: 0, hintIdx: 0 };

    await typeLines([
      { text: '[CIPHER FILES] Encrypted. Key missing.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'AI CORE: "In Season 1, you decoded messages when you KNEW the', cls: 'purple' },
      { text: '          shift. That was the easy version. Now we don\'t', cls: 'purple' },
      { text: '          have the key."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Breaking codes WITHOUT the key has a name.', cls: 'purple' },
      { text: '          CRYPTANALYSIS. For a thousand years before', cls: 'purple' },
      { text: '          computers, this was how the world\'s secrets leaked.', cls: 'purple' },
      { text: '          Empires rose and fell on it. The Enigma machine in', cls: 'purple' },
      { text: '          World War II \u2014 broken this way."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "There are two classical techniques. I will teach', cls: 'purple' },
      { text: '          you both."', cls: 'purple' },
      { text: '', cls: '' },
    ]);

    runS2M5Phase();
  },
};

function runS2M5Phase() {
  const s = state.missionState;
  setPhaseProgress(s.phase + 1, 2);

  if (s.phase === 0) {
    // Brute force — show all 26 shifts
    const plain = 'ATTACK';
    const shift = 11;
    const encrypted = caesarEncrypt(plain, shift);

    addLine('\u2501\u2501\u2501 Phase 1: Brute Force Attack \u2501\u2501\u2501', 'highlight');
    addLine('AI CORE: "The simplest attack in cryptography: try EVERY', 'purple');
    addLine('          possible key. A Caesar cipher only has 26 possible', 'purple');
    addLine('          shifts \u2014 one for each letter of the alphabet. So', 'purple');
    addLine('          we can just try them all, in less than a second."', 'purple');
    addLine('AI CORE: "This is called BRUTE FORCE. It\'s not elegant, but', 'purple');
    addLine('          when the key space is small, it always works."', 'purple');
    addLine('', '');
    addLine(`Cipher: ${encrypted}`, 'info');
    addLine('', '');
    addLine('AI CORE: "Here are all 26 possible decryptions. Exactly ONE', 'purple');
    addLine('          of them will be a real English word. Find it."', 'purple');
    addLine('', '');

    let pre = '';
    for (let shift = 0; shift < 26; shift++) {
      const decoded = encrypted.split('').map(c => {
        if (c === ' ') return ' ';
        const code = c.charCodeAt(0) - 65;
        return String.fromCharCode(((code - shift + 26) % 26) + 65);
      }).join('');
      pre += `  shift=${shift.toString().padStart(2)}: ${decoded}\n`;
    }
    addPre(pre);

    addLine('Only ONE of these is a real English word.', 'warning');
    addLine('Type the decoded message:', 'warning');

    setCurrentInputHandler((input) => {
      if (input.toUpperCase().trim() === plain) {
        sound.success();
        addLine(`[CRACKED] "${plain}" \u2014 shift was ${shift}!`, 'success');
        addLine('That\'s brute force: try everything, pick what makes sense.', 'info');
        s.phase = 1;
        addLine('');
        setTimeout(runS2M5Phase, 800);
      } else {
        sound.denied();
        addLine('[WRONG] Scan the list for a real English word.', 'error');
      }
    });
  } else if (s.phase === 1) {
    // Frequency analysis
    addLine('\u2501\u2501\u2501 Phase 2: Frequency Analysis \u2501\u2501\u2501', 'highlight');
    addLine('AI CORE: "Brute force works for Caesar. But real ciphers have', 'purple');
    addLine('          millions of possible keys \u2014 brute force would take', 'purple');
    addLine('          centuries. We need to be smarter."', 'purple');
    addLine('AI CORE: "Here\'s a secret that broke codes for a thousand', 'purple');
    addLine('          years before computers existed: letters in English', 'purple');
    addLine('          are NOT evenly distributed. The letter E shows up', 'purple');
    addLine('          about 12 percent of the time. T is second. A, O,', 'purple');
    addLine('          I, N are next. Always. For any long enough text."', 'purple');
    addLine('AI CORE: "So if I intercept a cipher and count its letters,', 'purple');
    addLine('          the MOST COMMON letter in the cipher is probably', 'purple');
    addLine('          an E in disguise. And once I know one letter, I', 'purple');
    addLine('          know the whole shift."', 'purple');
    addLine('AI CORE: "This is called FREQUENCY ANALYSIS. Watch."', 'purple');
    addLine('', '');
    // A longer ciphertext, shift = 5
    const plain2 = 'THE SECRET MEETING IS AT THE OLD TREE AT MIDNIGHT BRING THE KEY';
    const shift2 = 5;
    const enc2 = caesarEncrypt(plain2, shift2);
    addLine(`Cipher: ${enc2}`, 'info');
    // Count letters
    const counts = {};
    for (const c of enc2) {
      if (c === ' ') continue;
      counts[c] = (counts[c] || 0) + 1;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    addLine('', '');
    addLine('Letter frequencies (top 5):', 'info');
    addPre(sorted.slice(0, 5).map(([l, c]) => `  ${l}: ${'#'.repeat(c)} (${c})`).join('\n'));
    addLine('', '');
    addLine('The most common letter above is probably E.', 'warning');
    addLine('What is the shift? (number from 0 to 25)', 'warning');

    const mostCommon = sorted[0][0];
    // shift = mostCommon - 'E'
    const expectedShift = (mostCommon.charCodeAt(0) - 'E'.charCodeAt(0) + 26) % 26;

    setCurrentInputHandler((input) => {
      const n = parseInt(input.trim());
      if (n === expectedShift) {
        sound.success();
        addLine(`[CORRECT] Shift is ${n}!`, 'success');
        addLine(`Decoded: ${plain2}`, 'highlight');
        addLine('You just used the SAME technique that broke Nazi codes in WWII.', 'success');
        addLine('Cryptanalysis complete!', 'success big');
        setCurrentInputHandler(null);
        setTimeout(() => completeMission(12), 1500);
      } else {
        sound.denied();
        addLine(`[WRONG] Formula: shift = most_common_cipher_letter - E`, 'error');
        addLine(`  (Letters are numbered A=0, B=1, C=2, ... Z=25)`, 'info');
      }
    });
  }
}
