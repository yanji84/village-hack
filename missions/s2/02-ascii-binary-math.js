// missions/s2/02-ascii-binary-math.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission,
} from '../../engine.js';

export const mission = {
  id: 10,
  num: 'S2-02',
  title: 'ASCII & BINARY MATH',
  name: 'ASCII & Binary Math',
  desc: 'Learn how computers REALLY store text (ASCII), add binary numbers, and read hex like a pro.',
  skill: 'SKILL: ASCII + Binary Arithmetic + Hex',
  hints: [
    'Binary to decimal: you already know how. 8 digits instead of 5. Same idea.',
    "For addition \u2014 look at the rightmost column FIRST. What's 1 plus 1 in binary?",
    'Hex is just binary grouped by 4 bits. If you can read binary, you can read hex.',
  ],
  run: async function() {
    state.missionState = { phase: 0, hintIdx: 0 };

    await typeLines([
      { text: '[MEMORY DUMP RECOVERED] From Victor\'s server.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'AI CORE: "You already know binary. Five bits for a letter, A', cls: 'purple' },
      { text: '          through Z. But that was a simplification I made to', cls: 'purple' },
      { text: '          teach you the idea."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Real computers use a different system. It is called', cls: 'purple' },
      { text: '          ASCII. Back in the 1960s, engineers needed one', cls: 'purple' },
      { text: '          universal way for every computer to agree on which', cls: 'purple' },
      { text: '          number meant which letter. They built a big lookup', cls: 'purple' },
      { text: '          table, and every computer has used it since."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "In ASCII, A is 65. B is 66. C is 67. The capital', cls: 'purple' },
      { text: '          letters go all the way to Z at 90. Numbers, spaces,', cls: 'purple' },
      { text: '          punctuation \u2014 all have their own codes."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "And those ASCII numbers themselves are stored in', cls: 'purple' },
      { text: '          binary. 8 bits \u2014 a BYTE \u2014 for each letter. That\'s', cls: 'purple' },
      { text: '          why 1 byte = 1 letter in most languages."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Here is the full lookup table for capital letters:"', cls: 'purple' },
      { text: '  A=65, B=66, C=67, D=68, E=69, F=70, G=71, H=72,', cls: 'info' },
      { text: '  I=73, J=74, K=75, L=76, M=77, N=78, O=79, P=80,', cls: 'info' },
      { text: '  Q=81, R=82, S=83, T=84, U=85, V=86, W=87, X=88,', cls: 'info' },
      { text: '  Y=89, Z=90', cls: 'info' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Eight bits means eight positions, right to left:', cls: 'purple' },
      { text: '          1, 2, 4, 8, 16, 32, 64, 128. Every position is', cls: 'purple' },
      { text: '          double the previous one \u2014 same rule as before."', cls: 'purple' },
      { text: '', cls: '' },
    ]);

    runS2M2Phase();
  },
};

function runS2M2Phase() {
  const s = state.missionState;
  setPhaseProgress(s.phase + 1, 3);

  if (s.phase === 0) {
    addLine('\u2501\u2501\u2501 Phase 1: Read a Real Byte \u2501\u2501\u2501', 'highlight');
    addLine('AI CORE: "Here is one byte from Victor\'s memory dump. One', 'purple');
    addLine('          letter of something he was typing. Figure out', 'purple');
    addLine('          which letter it was."', 'purple');
    addPre('        01001000\n\nPositions: 128 64 32 16 8 4 2 1');
    addLine('AI CORE: "The method is always the same. Add the positions', 'purple');
    addLine('          that have a 1. Look up that number in the ASCII', 'purple');
    addLine('          table above. That\'s your letter."', 'purple');

    setCurrentInputHandler((input) => {
      // 01001000 = 64 + 8 = 72 = H
      const guess = input.toUpperCase().trim();
      if (guess === 'H' || guess === '72') {
        sound.success();
        addLine('[CORRECT] 64 + 8 = 72 = H', 'success');
        s.phase = 1;
        addLine('');
        setTimeout(runS2M2Phase, 800);
      } else {
        sound.denied();
        addLine('[WRONG] Add the positions with a 1, then look up the ASCII code.', 'error');
      }
    });
  } else if (s.phase === 1) {
    addLine('\u2501\u2501\u2501 Phase 2: Binary Addition \u2501\u2501\u2501', 'highlight');
    addLine('AI CORE: "Now the fun part. Computers don\'t really know how', 'purple');
    addLine('          to multiply. They don\'t know how to subtract. They', 'purple');
    addLine('          know ONE operation: addition. Everything else is', 'purple');
    addLine('          built from that. Learn how they add, and you know', 'purple');
    addLine('          how they do arithmetic."', 'purple');
    addLine('AI CORE: "Binary addition works like regular addition, with', 'purple');
    addLine('          one special rule. Since there are only two digits,', 'purple');
    addLine('          the moment you hit 2, you CARRY to the next column."', 'purple');
    addPre('    0 + 0 = 0\n    0 + 1 = 1\n    1 + 0 = 1\n    1 + 1 = 10  <- carry!');
    addLine('AI CORE: "Try this one. Work right to left, just like decimal.', 'purple');
    addLine('          When you get a carry, remember it for the next column."', 'purple');
    addPre('    0 1 0 1\n  + 0 0 1 1\n  \u2500\u2500\u2500\u2500\u2500\u2500\u2500');
    addLine('(Type the 4-digit binary answer)', 'info');

    setCurrentInputHandler((input) => {
      // 0101 (5) + 0011 (3) = 1000 (8)
      const clean = input.replace(/\s/g, '');
      if (clean === '1000') {
        sound.success();
        addLine('[CORRECT] 0101 (5) + 0011 (3) = 1000 (8)', 'success');
        addLine('Notice how carries ripple left. That\'s how your CPU adds!', 'info');
        s.phase = 2;
        addLine('');
        setTimeout(runS2M2Phase, 800);
      } else {
        sound.denied();
        addLine('[WRONG] Remember 1+1 = 10 (carry). Add right-to-left.', 'error');
      }
    });
  } else if (s.phase === 2) {
    addLine('\u2501\u2501\u2501 Phase 3: Reading Hex \u2501\u2501\u2501', 'highlight');
    addLine('AI CORE: "Binary is tiring for human eyes. Eight digits per', 'purple');
    addLine('          letter. So engineers invented a shortcut: HEX."', 'purple');
    addLine('AI CORE: "Hex uses sixteen symbols instead of ten. After 9', 'purple');
    addLine('          comes A, B, C, D, E, F. Then it carries. It looks', 'purple');
    addLine('          strange at first, but it\'s just numbers with new', 'purple');
    addLine('          names."', 'purple');
    addPre('Hex:  0 1 2 3 4 5 6 7 8 9 A  B  C  D  E  F\nDec:  0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15');
    addLine('AI CORE: "Why do engineers love hex? Because each hex digit', 'purple');
    addLine('          is exactly 4 binary bits. So ONE byte \u2014 8 bits \u2014', 'purple');
    addLine('          fits in TWO hex digits. Much shorter to read."', 'purple');
    addLine('AI CORE: "Math: two hex digits work like this \u2014 the LEFT', 'purple');
    addLine('          digit is worth 16 each, the RIGHT digit is worth 1', 'purple');
    addLine('          each. So 0x41 means (4 \u00d7 16) + (1 \u00d7 1) = 65,', 'purple');
    addLine('          which is ASCII for \'A\'."', 'purple');
    addLine('', '');
    addLine('AI CORE: "Victor left this hex string in memory. Decode each', 'purple');
    addLine('          pair \u2014 hex to decimal to letter \u2014 and tell me the', 'purple');
    addLine('          word he was typing."', 'purple');
    addPre('        0x48 0x41 0x43 0x4B');

    setCurrentInputHandler((input) => {
      // 48=72=H, 41=65=A, 43=67=C, 4B=75=K → HACK
      if (input.toUpperCase().trim() === 'HACK') {
        sound.success();
        addLine('[DECODED] 0x48=72=H, 0x41=65=A, 0x43=67=C, 0x4B=75=K \u2192 HACK', 'success');
        addLine('AI CORE: "You can now read memory dumps. Real reverse', 'purple');
        addLine('          engineers do exactly this, every day. Welcome', 'purple');
        addLine('          to the profession."', 'purple');
        setCurrentInputHandler(null);
        setTimeout(() => completeMission(10), 1200);
      } else {
        sound.denied();
        addLine('[WRONG] Convert each hex pair \u2192 decimal \u2192 ASCII letter.', 'error');
      }
    });
  }
}
