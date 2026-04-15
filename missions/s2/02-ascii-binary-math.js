// missions/s2/02-ascii-binary-math.js
import {
  state, sound, sleep,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission,
} from '../../engine.js';

export const mission = {
  id: 9,
  num: 'S2-02',
  title: 'ASCII & BINARY MATH',
  name: 'ASCII & Binary Math',
  desc: 'Learn how computers REALLY store text (ASCII), how they do all math with only addition, and why hex exists.',
  skill: 'SKILL: ASCII + Binary Arithmetic + Hex',
  hints: [
    'For the byte: add up the position values where there\'s a 1. Then look that number up in the ASCII table.',
    'For binary addition: work right-to-left. 1+1 = 10 (write 0, carry 1). 1+1+1 = 11 (write 1, carry 1).',
    'For hex: each hex digit = 4 bits. Two hex digits = 1 byte = 1 ASCII letter. Left digit × 16, right digit × 1.',
  ],
  run: async function() {
    state.missionState = { phase: 0, hintIdx: 0 };

    await typeLines([
      { text: '[AI CORE — FORENSIC RECOVERY]', cls: 'system' },
      { text: '[recovering] ███░░░░░░░░░░░░░░░░░  14%', cls: 'system' },
      { text: '[recovering] ██████████░░░░░░░░░░  53%', cls: 'system' },
      { text: '[recovering] ████████████████████  100%', cls: 'system' },
      { text: '[MEMORY DUMP RECOVERED] — 3 fragments from Victor\'s server.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Look what I pulled off Victor\'s server — three', cls: 'purple' },
      { text: '          fragments of memory from the exact moment he was', cls: 'purple' },
      { text: '          working on the attack. But memory doesn\'t store', cls: 'purple' },
      { text: '          English. It stores NUMBERS. If we want to read', cls: 'purple' },
      { text: '          what he was doing, we have to decode them."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "You already know binary from way back. Five bits,', cls: 'purple' },
      { text: '          A through Z. That was training wheels. Real computers', cls: 'purple' },
      { text: '          use a bigger system called ASCII."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "In the 1960s, engineers needed ONE agreement:', cls: 'purple' },
      { text: '          which number means which letter. So they built a', cls: 'purple' },
      { text: '          lookup table. Every computer on Earth has used it', cls: 'purple' },
      { text: '          since. A=65, B=66, C=67... all the way to Z=90."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Each letter gets 8 bits — one BYTE. That\'s why', cls: 'purple' },
      { text: '          people say \'1 byte = 1 letter.\' Now — three', cls: 'purple' },
      { text: '          fragments, three real ideas. Ready to read his mind?"', cls: 'purple' },
      { text: '', cls: '' },
    ]);

    runS2M2Phase();
  },
};

function runS2M2Phase() {
  const s = state.missionState;
  setPhaseProgress(s.phase + 1, 3);

  if (s.phase === 0) {
    // ───── PHASE 1: DECODE A BYTE ─────
    addLine('╔════════════════════════════════════════╗', 'highlight');
    addLine('║  ▶ FRAGMENT 1 of 3 — A SINGLE BYTE    ║', 'highlight');
    addLine('╚════════════════════════════════════════╝', 'highlight');
    addLine('', '');
    addLine('AI CORE: "Fragment 1 is one byte. That\'s one letter of', 'purple');
    addLine('          something Victor was typing when I snapped this', 'purple');
    addLine('          memory shot. Figure out which letter."', 'purple');
    addLine('', '');
    addPre(
      '  ┌────────────────────────────────────────────┐\n' +
      '  │   THE BYTE:                                │\n' +
      '  │                                            │\n' +
      '  │        0   1   0   0   1   0   0   0       │\n' +
      '  │        │   │   │   │   │   │   │   │       │\n' +
      '  │       128  64  32  16   8   4   2   1      │\n' +
      '  │                                            │\n' +
      '  │   ADD every position where the bit is 1.   │\n' +
      '  └────────────────────────────────────────────┘'
    );
    addLine('', '');
    addLine('AI CORE: "The rule never changes. Each position is double', 'purple');
    addLine('          the one to its right. Bits with a 1 count, bits', 'purple');
    addLine('          with a 0 don\'t. Add them up, then look up that', 'purple');
    addLine('          number in the ASCII table below."', 'purple');
    addLine('', '');
    addPre(
      '  ASCII — CAPITAL LETTERS\n' +
      '  ─────────────────────────────────────────────\n' +
      '   A=65   B=66   C=67   D=68   E=69   F=70\n' +
      '   G=71   H=72   I=73   J=74   K=75   L=76\n' +
      '   M=77   N=78   O=79   P=80   Q=81   R=82\n' +
      '   S=83   T=84   U=85   V=86   W=87   X=88\n' +
      '   Y=89   Z=90'
    );
    addLine('', '');
    addLine('Which letter is this byte? (type the letter, or its number)', 'warning');

    s.byteTries = 0;

    setCurrentInputHandler((input) => {
      // 01001000 = 64 + 8 = 72 = H
      const guess = input.toUpperCase().trim();
      if (guess === 'H' || guess === '72') {
        sound.success();
        addLine('', '');
        addLine('[DECODED] 64 + 8 = 72 → ASCII 72 = H', 'success');
        addLine('', '');
        addPre(
          '   0   1   0   0   1   0   0   0\n' +
          '       ↓               ↓\n' +
          '      64       +       8     =  72   →  H'
        );
        addLine('', '');
        addLine('AI CORE: "There it is. Now here\'s the part that blew MY', 'purple');
        addLine('          circuits when I first figured it out:"', 'purple');
        addLine('', '');
        addLine('AI CORE: "Every letter you\'ve ever typed — every text', 'purple');
        addLine('          message, every word of every book on a computer,', 'purple');
        addLine('          every line of code — is secretly just NUMBERS.', 'purple');
        addLine('          Your computer doesn\'t know what the letter H', 'purple');
        addLine('          looks like. It only knows 72. The FONT draws the', 'purple');
        addLine('          shape on your screen later."', 'purple');
        addLine('', '');
        addLine('AI CORE: "Text is an illusion. Numbers are the truth."', 'purple');
        addLine('', '');
        addLine('[FRAGMENT 1 DECODED — moving to fragment 2...]', 'system');
        s.phase = 1;
        addLine('');
        setTimeout(runS2M2Phase, 1800);
      } else {
        sound.denied();
        s.byteTries++;
        if (s.byteTries === 1) {
          addLine('[NOT QUITE] Find every 1 in the byte. Write down its position value (128, 64, 32, 16, 8, 4, 2, or 1). Add those up. THEN look up the total in the ASCII table.', 'error');
        } else if (s.byteTries === 2) {
          addLine('[WALK-THROUGH] The byte is 0 1 0 0 1 0 0 0. Only two 1s. One is at the 64 column, one is at the 8 column. What\'s 64 + 8? Look THAT up in the table.', 'error');
        } else {
          addLine('[THE ANSWER] 64 + 8 = 72. In the ASCII table, 72 = H. Type H.', 'error');
        }
      }
    });
  } else if (s.phase === 1) {
    // ───── PHASE 2: BINARY ADDITION ─────
    addLine('╔════════════════════════════════════════╗', 'highlight');
    addLine('║  ▶ FRAGMENT 2 of 3 — BINARY ADDITION  ║', 'highlight');
    addLine('╚════════════════════════════════════════╝', 'highlight');
    addLine('', '');
    addLine('AI CORE: "Fragment 2 caught Victor\'s CPU mid-calculation.', 'purple');
    addLine('          But here\'s a secret most people don\'t know:"', 'purple');
    addLine('', '');
    addLine('AI CORE: "Your CPU does not know how to multiply. It does', 'purple');
    addLine('          not know how to subtract. It does not know how to', 'purple');
    addLine('          divide. It knows ONE operation — ADD — and every', 'purple');
    addLine('          other math operation is built from stacking adds."', 'purple');
    addLine('', '');
    addLine('AI CORE: "Subtraction? Add the negative. Multiplication? Add', 'purple');
    addLine('          over and over. So if you can add in binary, you', 'purple');
    addLine('          have seen ALL of computer arithmetic."', 'purple');
    addLine('', '');
    addLine('AI CORE: "Binary addition has one special rule. Only two', 'purple');
    addLine('          digits exist, so the second you reach 2, you CARRY."', 'purple');
    addLine('', '');
    addPre(
      '  ┌─ THE FOUR RULES ──────────────────────┐\n' +
      '  │                                       │\n' +
      '  │    0 + 0 =  0                         │\n' +
      '  │    0 + 1 =  1                         │\n' +
      '  │    1 + 0 =  1                         │\n' +
      '  │    1 + 1 = 10   ← write 0, CARRY 1    │\n' +
      '  │                                       │\n' +
      '  │    1 + 1 + 1 = 11 (carry + both)      │\n' +
      '  │             ← write 1, CARRY 1        │\n' +
      '  └───────────────────────────────────────┘'
    );
    addLine('', '');
    addLine('AI CORE: "Work right-to-left, just like on paper. Problem 1:"', 'purple');
    addLine('', '');
    addPre(
      '          col:  4  3  2  1\n' +
      '                ───────────\n' +
      '                0  1  0  1      (= 5)\n' +
      '             +  0  0  1  1      (= 3)\n' +
      '                ───────────\n' +
      '                ?  ?  ?  ?'
    );
    addLine('', '');
    addLine('Type the 4-bit binary answer (example: 1010):', 'warning');

    s.addStep = 0;
    s.addTries = 0;

    setCurrentInputHandler((input) => {
      const clean = input.replace(/\s/g, '').replace(/[^01]/g, '');

      if (s.addStep === 0) {
        // 0101 + 0011 = 1000
        if (clean === '1000') {
          sound.success();
          addLine('', '');
          addLine('[CORRECT] 0101 + 0011 = 1000   (5 + 3 = 8)', 'success');
          addLine('', '');
          addPre(
            '   watch the carry RIPPLE left:\n\n' +
            '      carry:  1  1  1  .\n' +
            '              0  1  0  1\n' +
            '           +  0  0  1  1\n' +
            '              ───────────\n' +
            '              1  0  0  0    ← three carries in a row!'
          );
          addLine('', '');
          addLine('AI CORE: "See that? One little carry at the right', 'purple');
          addLine('          end triggered another, triggered another.', 'purple');
          addLine('          Engineers call that a \'ripple carry.\' Real', 'purple');
          addLine('          CPUs have wires for this that stretch across', 'purple');
          addLine('          the chip."', 'purple');
          addLine('', '');
          addLine('AI CORE: "Now try a harder one. This one has carries', 'purple');
          addLine('          that stack on top of each other:"', 'purple');
          addLine('', '');
          addPre(
            '          col:  4  3  2  1\n' +
            '                ───────────\n' +
            '                0  1  1  0      (= 6)\n' +
            '             +  0  1  1  1      (= 7)\n' +
            '                ───────────\n' +
            '                ?  ?  ?  ?'
          );
          addLine('', '');
          addLine('Type the 4-bit binary answer:', 'warning');
          s.addStep = 1;
          s.addTries = 0;
        } else {
          sound.denied();
          s.addTries++;
          if (s.addTries === 1) {
            addLine('[STEP-BY-STEP] Start at the RIGHTMOST column. 1 + 1 = ? (remember the special rule — you get 10, so write 0 and carry 1).', 'error');
          } else if (s.addTries === 2) {
            addLine('[WALK-THROUGH] Col 1: 1+1=10 → write 0, carry 1. Col 2: 0+1+carry(1)=10 → write 0, carry 1. Col 3: 1+0+carry(1)=10 → write 0, carry 1. Col 4: 0+0+carry(1)=1. Read bottom-up: ?', 'error');
          } else {
            addLine('[THE ANSWER] 1000. Type 1000.', 'error');
          }
        }
      } else if (s.addStep === 1) {
        // 0110 + 0111 = 1101 (6+7=13)
        if (clean === '1101') {
          sound.success();
          addLine('', '');
          addLine('[CORRECT] 0110 + 0111 = 1101   (6 + 7 = 13)', 'success');
          addLine('', '');
          addPre(
            '      carry:  .  1  1  1\n' +
            '              0  1  1  0\n' +
            '           +  0  1  1  1\n' +
            '              ───────────\n' +
            '              1  1  0  1\n' +
            '\n' +
            '   col 1: 0+1   = 1      (no carry)\n' +
            '   col 2: 1+1   = 10     write 0, carry 1\n' +
            '   col 3: 1+1+1 = 11     write 1, carry 1\n' +
            '   col 4: 0+0+1 = 1      done.'
          );
          addLine('', '');
          addLine('AI CORE: "Beautiful. That\'s EXACTLY what a CPU does,', 'purple');
          addLine('          billions of times per second. Not magic — just', 'purple');
          addLine('          a huge wall of these little add-and-carry', 'purple');
          addLine('          circuits, all firing at once."', 'purple');
          addLine('', '');
          addLine('AI CORE: "When Netflix streams a movie to you, when a', 'purple');
          addLine('          game calculates where your character stands,', 'purple');
          addLine('          when an AI recognizes a cat in a photo — it is', 'purple');
          addLine('          ALL just binary addition, stacked."', 'purple');
          addLine('', '');
          addLine('[FRAGMENT 2 DECODED — opening final fragment...]', 'system');
          s.phase = 2;
          addLine('');
          setTimeout(runS2M2Phase, 1800);
        } else {
          sound.denied();
          s.addTries++;
          if (s.addTries === 1) {
            addLine('[STEP-BY-STEP] Rightmost column first: 0 + 1 = 1, no carry. Now middle-right: 1 + 1 = ? (what\'s the rule?)', 'error');
          } else if (s.addTries === 2) {
            addLine('[WALK-THROUGH] Col 1: 0+1=1. Col 2: 1+1=10 → 0, carry 1. Col 3: 1+1+carry(1)=11 → 1, carry 1. Col 4: 0+0+carry(1)=1. Read bottom-up.', 'error');
          } else {
            addLine('[THE ANSWER] 1101. Two carries, one after the other.', 'error');
          }
        }
      }
    });
  } else if (s.phase === 2) {
    // ───── PHASE 3: HEX ─────
    addLine('╔════════════════════════════════════════╗', 'highlight');
    addLine('║  ▶ FRAGMENT 3 of 3 — HEX DECODE       ║', 'highlight');
    addLine('╚════════════════════════════════════════╝', 'highlight');
    addLine('', '');
    addLine('AI CORE: "Last fragment — a short label Victor used to', 'purple');
    addLine('          name something. But it\'s stored in HEX, not binary.', 'purple');
    addLine('          Binary is exhausting for humans — 8 digits per', 'purple');
    addLine('          letter — so engineers invented a shortcut."', 'purple');
    addLine('', '');
    addLine('AI CORE: "Hex has SIXTEEN symbols: 0-9, then A, B, C, D, E, F', 'purple');
    addLine('          for the numbers 10-15. Why sixteen? Because 16 is', 'purple');
    addLine('          exactly 2 to the 4th power. So ONE hex digit packs', 'purple');
    addLine('          exactly 4 bits. TWO hex digits = 8 bits = 1 byte."', 'purple');
    addLine('', '');
    addPre(
      '  ┌─ HEX REFERENCE CARD ──────────────────────────┐\n' +
      '  │                                               │\n' +
      '  │   Hex:  0  1  2  3  4  5  6  7                │\n' +
      '  │   Dec:  0  1  2  3  4  5  6  7                │\n' +
      '  │                                               │\n' +
      '  │   Hex:  8  9  A  B  C  D  E  F                │\n' +
      '  │   Dec:  8  9  10 11 12 13 14 15               │\n' +
      '  │                                               │\n' +
      '  │   Two-digit hex → decimal:                    │\n' +
      '  │     0xLR  =  (L × 16) + (R × 1)               │\n' +
      '  │                                               │\n' +
      '  │   Example: 0x41 = (4×16) + (1×1) = 65 = \'A\'   │\n' +
      '  │                                               │\n' +
      '  └───────────────────────────────────────────────┘'
    );
    addLine('', '');
    addLine('AI CORE: "Here\'s the fragment. Two bytes — two letters.', 'purple');
    addLine('          Decode each one and tell me the two-letter word."', 'purple');
    addLine('', '');
    addPre(
      '  ┌──────────────────────────┐\n' +
      '  │   HEX:    0x48   0x49    │\n' +
      '  │                          │\n' +
      '  │   decimal → ASCII → ?    │\n' +
      '  └──────────────────────────┘'
    );
    addLine('', '');
    addLine('AI CORE: "Reminder: A=65, B=66, C=67 ... H=72, I=73, J=74 ...', 'purple');
    addLine('          the full table is in fragment 1 above."', 'purple');
    addLine('', '');
    addLine('Type the two-letter word:', 'warning');

    s.hexStep = 0;
    s.hexTries = 0;

    setCurrentInputHandler((input) => {
      if (s.hexStep === 0) {
        // 0x48 = 72 = H, 0x49 = 73 = I → "HI"
        const guess = input.toUpperCase().trim();
        if (guess === 'HI') {
          sound.success();
          addLine('', '');
          addLine('[DECODED] 0x48 → (4×16)+(8×1) = 72 = H', 'success');
          addLine('[DECODED] 0x49 → (4×16)+(9×1) = 73 = I', 'success');
          addLine('[MESSAGE] "HI"', 'success');
          addLine('', '');
          addLine('AI CORE: "He was literally saying hi to someone. But', 'purple');
          addLine('          forget that — look what YOU just did. You took', 'purple');
          addLine('          hex, turned it into decimal, turned it into', 'purple');
          addLine('          ASCII, turned it into English. That\'s FOUR', 'purple');
          addLine('          number systems in one step."', 'purple');
          addLine('', '');
          addLine('AI CORE: "One last question before I seal this mission.', 'purple');
          addLine('          Remember: each hex digit = 4 bits. If a number', 'purple');
          addLine('          uses 32 BITS (that\'s the size of an IP address,', 'purple');
          addLine('          or a color value, or a memory address on an old', 'purple');
          addLine('          computer)..."', 'purple');
          addLine('', '');
          addPre(
            '  ┌──────────────────────────────────────────────┐\n' +
            '  │   How many HEX digits do you need to write   │\n' +
            '  │   a 32-bit number?                           │\n' +
            '  │                                              │\n' +
            '  │   hint: 4 bits per hex digit. 32 bits total. │\n' +
            '  └──────────────────────────────────────────────┘'
          );
          addLine('', '');
          addLine('Type a number:', 'warning');
          s.hexStep = 1;
          s.hexTries = 0;
        } else {
          sound.denied();
          s.hexTries++;
          if (s.hexTries === 1) {
            addLine('[NUDGE] Convert ONE pair at a time. 0x48: left digit is 4, right digit is 8. So (4×16)+(8×1) = ? Then look THAT up in the ASCII table.', 'error');
          } else if (s.hexTries === 2) {
            addLine('[WALK-THROUGH] 0x48: (4×16)+(8×1)=64+8=72. ASCII 72 = H. Now do 0x49 the same way. 0x49: (4×16)+(9×1)=64+9=73. ASCII 73 = ?', 'error');
          } else {
            addLine('[THE ANSWER] 0x48=H, 0x49=I. The word is HI.', 'error');
          }
        }
      } else if (s.hexStep === 1) {
        // 32 bits / 4 bits per hex digit = 8
        const n = parseInt(input.trim());
        if (n === 8) {
          sound.success();
          addLine('', '');
          addLine('>>> ALL 3 FRAGMENTS DECODED <<<', 'success big');
          addLine('32 bits ÷ 4 bits per hex digit = 8 hex digits!', 'success');
          addLine('', '');
          addLine('AI CORE: "Exactly 8 digits. That\'s WHY hex is everywhere', 'purple');
          addLine('          in programming. An IP address like 11000000 10101000', 'purple');
          addLine('          00000001 00000001 — ugly, right? In hex that\'s', 'purple');
          addLine('          just C0A80101. Eight characters instead of 32."', 'purple');
          addLine('', '');
          addLine('AI CORE: "That\'s the deal hex makes with you: 4× shorter', 'purple');
          addLine('          than binary, and every single digit still lines', 'purple');
          addLine('          up perfectly with 4 bits. No information lost.', 'purple');
          addLine('          Pure compression, pure readability."', 'purple');
          addLine('', '');
          addLine('╔════════════════════════════════════════╗', 'system');
          addLine('║    [MEMORY DUMP FULLY DECODED]         ║', 'system');
          addLine('║   ASCII ✓   BINARY ADD ✓   HEX ✓       ║', 'system');
          addLine('╚════════════════════════════════════════╝', 'system');
          addLine('', '');
          addLine('AI CORE: "Three ideas. ASCII turns letters into numbers.', 'purple');
          addLine('          Binary addition is ALL your CPU actually knows.', 'purple');
          addLine('          Hex is how humans survive reading the numbers.', 'purple');
          addLine('          Put them together and you can read the raw', 'purple');
          addLine('          memory of any machine on Earth."', 'purple');
          addLine('', '');
          addLine('AI CORE: "Real reverse engineers do exactly this, every', 'purple');
          addLine('          day. Welcome to the profession."', 'purple');
          setCurrentInputHandler(null);
          setTimeout(() => completeMission(9), 1800);
        } else {
          sound.denied();
          s.hexTries++;
          if (s.hexTries === 1) {
            addLine('[NUDGE] Each hex digit holds 4 bits. You have 32 bits total. How many times does 4 go into 32?', 'error');
          } else if (s.hexTries === 2) {
            addLine('[WALK-THROUGH] 32 ÷ 4 = ?', 'error');
          } else {
            addLine('[THE ANSWER] 8 hex digits. 32 bits ÷ 4 bits per digit = 8.', 'error');
          }
        }
      }
    });
  }
}
