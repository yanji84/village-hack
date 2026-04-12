// missions/s2/01-password-security.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission,
} from '../../engine.js';

export const mission = {
  id: 8,
  num: 'S2-01',
  title: 'PASSWORD SECURITY',
  name: 'Password Security',
  desc: 'Learn how passwords are REALLY stored (hashing), why longer passwords are stronger (math), and constraint satisfaction.',
  skill: 'SKILL: Hashing + Combinatorics + Constraints',
  hints: [
    'For hash cracking: work through each candidate. Add the letter values one at a time.',
    'For combinations: multiply the number of options per position. Each position multiplies the total.',
    'For constraints: check each rule separately. Which rules does your guess fail?',
  ],
  run: async function() {
    state.missionState = { phase: 0, hintIdx: 0 };

    await typeLines([
      { text: '[SCANNING VILLAGE SYSTEMS...]', cls: 'system' },
      { text: '[BACKDOOR DETECTED] Password security layer active.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Found one. VICTOR hid a backdoor behind three', cls: 'purple' },
      { text: '          layers of password security. He thought no one', cls: 'purple' },
      { text: '          would understand how they work."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "He was wrong. I will teach you the real thing —', cls: 'purple' },
      { text: '          not tricks, not puzzles. The actual computer', cls: 'purple' },
      { text: '          science behind passwords. Three layers, three', cls: 'purple' },
      { text: '          breakthroughs. Let\'s seal this backdoor together."', cls: 'purple' },
      { text: '', cls: '' },
    ]);

    runS2M1Phase();
  },
};

function runS2M1Phase() {
  const s = state.missionState;
  setPhaseProgress(s.phase + 1, 3);

  if (s.phase === 0) {
    // Phase 1: Hash cracking
    addLine('━━━ LAYER 1 of 3: Hash Cracking ━━━', 'highlight');
    addLine('', '');
    addLine('AI CORE: "When you make a password on a website, they don\'t', 'purple');
    addLine('          save the actual word. They run it through a HASH', 'purple');
    addLine('          function — like a secret fingerprint machine."', 'purple');
    addLine('', '');
    addLine('AI CORE: "You put a word in, you get a number out. Same word', 'purple');
    addLine('          always gives the same number. But you can\'t go', 'purple');
    addLine('          backwards — the number won\'t tell you the word."', 'purple');
    addLine('', '');
    addLine('AI CORE: "VICTOR\'s hash function: add up each letter\'s', 'purple');
    addLine('          position in the alphabet. A=1, B=2, ... Z=26."', 'purple');
    addLine('', '');
    addLine('          Example: CAT = C(3) + A(1) + T(20) = <span class="highlight">24</span>', 'purple');
    addLine('', '');
    addLine('AI CORE: "The backdoor stores hash = <span class="highlight">40</span>. Which password', 'purple');
    addLine('          from this list has that hash?"', 'purple');
    addLine('', '');
    addPre('  ┌─────────────────────────────────────┐\n  │  Candidates:                         │\n  │                                       │\n  │    DOG    CAT    KIT    FOX    HEN    │\n  │                                       │\n  └─────────────────────────────────────┘\n\n   A=1  B=2  C=3  D=4  E=5  F=6  G=7\n   H=8  I=9  J=10 K=11 L=12 M=13 N=14\n   O=15 P=16 Q=17 R=18 S=19 T=20 U=21\n   V=22 W=23 X=24 Y=25 Z=26');
    addLine('', '');
    addLine('Which password has hash = 40? (Compute the sum for each)', 'warning');

    setCurrentInputHandler((input) => {
      // KIT = K(11) + I(9) + T(20) = 40
      if (input.toUpperCase().trim() === 'KIT') {
        sound.success();
        addLine('', '');
        addLine('>>> LAYER 1 CRACKED <<<', 'success big');
        addLine('K(11) + I(9) + T(20) = 40. Password is KIT.', 'success');
        addLine('', '');
        addLine('AI CORE: "That\'s exactly what a real hash cracker does —', 'purple');
        addLine('          try each candidate, compute its fingerprint,', 'purple');
        addLine('          and compare. Real hash functions are far more', 'purple');
        addLine('          complex, but the idea is the same."', 'purple');
        addLine('', '');
        addLine('AI CORE: "One layer down. But VICTOR\'s next lock is', 'purple');
        addLine('          about the MATH of why passwords are strong..."', 'purple');
        s.phase = 1;
        addLine('');
        setTimeout(runS2M1Phase, 1500);
      } else {
        sound.denied();
        addLine('[NOT QUITE] Try each word — add up the letters. Example: DOG = D(4) + O(15) + G(7) = 26. Which one makes 40?', 'error');
      }
    });
  } else if (s.phase === 1) {
    // Phase 2: Password strength / combinatorics
    addLine('━━━ LAYER 2 of 3: Password Strength ━━━', 'highlight');
    addLine('', '');
    addLine('AI CORE: "VICTOR chose a short, simple password for his', 'purple');
    addLine('          first lock. Sloppy. But his next layer is about', 'purple');
    addLine('          WHY longer passwords are harder to crack."', 'purple');
    addLine('', '');
    addLine('AI CORE: "The answer is math. Picture a combination lock', 'purple');
    addLine('          with 2 digit wheels, each going from 0-9.', 'purple');
    addLine('          How many possible combinations?"', 'purple');
    addLine('', '');
    addPre('  ┌──────────┐  ┌──────────┐\n  │ Wheel 1   │  │ Wheel 2   │\n  │ 10 options │  │ 10 options │\n  │  (0-9)    │  │  (0-9)    │\n  └──────────┘  └──────────┘\n\n  Total = 10 × 10 = ???');
    addLine('', '');
    addLine('Type the total number of combinations:', 'warning');

    s.comboStep = 0;

    setCurrentInputHandler((input) => {
      const n = parseInt(input.trim());

      if (s.comboStep === 0) {
        if (n === 100) {
          sound.success();
          addLine('[CORRECT] 10 \u00d7 10 = 100 combinations.', 'success');
          addLine('AI CORE: "Good. Now: what if each position can be a', 'purple');
          addLine('          lowercase letter (a-z, 26 options) instead?', 'purple');
          addLine('          Still 2 positions. How many combinations?"', 'purple');
          addLine('  26 \u00d7 26 = ???', 'info');
          s.comboStep = 1;
        } else {
          sound.denied();
          addLine('[ALMOST] Each wheel has 10 options. Multiply them: 10 × 10 = ?', 'error');
        }
      } else if (s.comboStep === 1) {
        if (n === 676) {
          sound.success();
          addLine('[CORRECT] 26 × 26 = 676 combinations.', 'success');
          addLine('', '');
          addLine('AI CORE: "See the jump? Just switching from digits to', 'purple');
          addLine('          letters took us from 100 to 676. That\'s nearly', 'purple');
          addLine('          7× harder to guess!"', 'purple');
          addLine('', '');
          addLine('AI CORE: "Now the big one. What if you use letters AND', 'purple');
          addLine('          digits (36 options) and make it 4 positions', 'purple');
          addLine('          long? How many combinations?"', 'purple');
          addLine('', '');
          addLine('  36 × 36 × 36 × 36 = ???', 'info');
          addLine('  (Hint: 36×36=1296. Then 1296×36=46656. Then ×36 again.)', 'info');
          s.comboStep = 2;
        } else {
          sound.denied();
          addLine('[ALMOST] Same idea — multiply the options. 26 × 26 = ?', 'error');
        }
      } else if (s.comboStep === 2) {
        if (n === 1679616) {
          sound.success();
          addLine('', '');
          addLine('>>> LAYER 2 CRACKED <<<', 'success big');
          addLine('36⁴ = 1,679,616 combinations!', 'success');
          addLine('', '');
          addLine('AI CORE: "Look at that. We went from 100 to over', 'purple');
          addLine('          1.6 MILLION — just by adding two more', 'purple');
          addLine('          characters and mixing in letters."', 'purple');
          addLine('', '');
          addLine('AI CORE: "Each extra character MULTIPLIES the total.', 'purple');
          addLine('          It\'s like adding another wheel to a lock —', 'purple');
          addLine('          not 10 more combinations, but 10 TIMES more."', 'purple');
          addLine('', '');
          addLine('AI CORE: "This is why a 4-character password can be', 'purple');
          addLine('          cracked in seconds, but a 12-character one', 'purple');
          addLine('          would take billions of years. Same idea,', 'purple');
          addLine('          bigger numbers."', 'purple');
          addLine('', '');
          addLine('AI CORE: "One layer left. This one is different — you', 'purple');
          addLine('          have to BUILD something, not crack it..."', 'purple');
          s.phase = 2;
          addLine('');
          setTimeout(runS2M1Phase, 1500);
        } else {
          sound.denied();
          addLine('[ALMOST] Go step by step: 36×36=1296, then 1296×36=46656, then ×36 one more time.', 'error');
        }
      }
    });
  } else if (s.phase === 2) {
    // Phase 3: Constraint construction
    addLine('\u2501\u2501\u2501 Backdoor #3: Constraint Construction \u2501\u2501\u2501', 'highlight');
    addLine('AI CORE: "The final backdoor uses a password POLICY. You have', 'purple');
    addLine('          to BUILD a password that satisfies every rule at', 'purple');
    addLine('          once. This is constraint satisfaction \u2014 the same', 'purple');
    addLine('          technique used in scheduling, puzzle-solving, and', 'purple');
    addLine('          AI planning."', 'purple');
    addPre('  1. Exactly 6 characters\n  2. Must start with a LETTER\n  3. Must contain the digit 7\n  4. Must end with "!"\n  5. Must contain the letter "z" somewhere');
    addLine('AI CORE: "Every rule eliminates most options. Your job: find', 'purple');
    addLine('          one that slips through ALL five filters."', 'purple');

    setCurrentInputHandler((input) => {
      const pw = input.trim();
      const checks = [
        { ok: pw.length === 6, msg: 'Must be exactly 6 characters' },
        { ok: /^[a-zA-Z]/.test(pw), msg: 'Must start with a letter' },
        { ok: pw.includes('7'), msg: 'Must contain the digit 7' },
        { ok: pw.endsWith('!'), msg: 'Must end with !' },
        { ok: /z/i.test(pw), msg: 'Must contain the letter z' },
      ];
      const failed = checks.filter(c => !c.ok);
      if (failed.length === 0) {
        sound.success();
        addLine(`[ACCEPTED] "${pw}" passes all 5 constraints.`, 'success');
        addLine('AI CORE: "Three real concepts mastered: hashing, password', 'purple');
        addLine('          strength math, and constraint satisfaction. These', 'purple');
        addLine('          are the foundations of real-world password', 'purple');
        addLine('          security."', 'purple');
        setCurrentInputHandler(null);
        setTimeout(() => completeMission(8), 1200);
      } else {
        sound.denied();
        addLine(`[REJECTED] Failed: ${failed.map(f => f.msg).join(', ')}`, 'error');
      }
    });
  }
}
