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
      { text: '[BACKDOOR LOCATED] Protected by advanced password security.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'AI CORE: "In Season 1, you cracked codes using deduction and', cls: 'purple' },
      { text: '          patterns. Those are important skills. But real', cls: 'purple' },
      { text: '          password security goes deeper."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Three concepts every hacker must understand:', cls: 'purple' },
      { text: '          HASHING (how passwords are really stored), PASSWORD', cls: 'purple' },
      { text: '          STRENGTH (why some are harder to crack than others),', cls: 'purple' },
      { text: '          and CONSTRAINT SATISFACTION (building to meet rules)."', cls: 'purple' },
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
    addLine('\u2501\u2501\u2501 Backdoor #1: Hash Cracking \u2501\u2501\u2501', 'highlight');
    addLine('AI CORE: "When you set a password on a website, they don\'t', 'purple');
    addLine('          store your actual password. They store a HASH of', 'purple');
    addLine('          it. A hash is a one-way mathematical fingerprint."', 'purple');
    addLine('AI CORE: "Same input always gives the same hash. But you', 'purple');
    addLine('          can\'t work backward from the hash to the input."', 'purple');
    addLine('AI CORE: "Here\'s a simple hash function: add up each letter\'s', 'purple');
    addLine('          position in the alphabet. A=1, B=2, ... Z=26."', 'purple');
    addLine('AI CORE: "Example: CAT = C(3) + A(1) + T(20) = 24"', 'purple');
    addLine('', '');
    addLine('AI CORE: "The backdoor stores hash = <span class="highlight">40</span>. Which password', 'purple');
    addLine('          from this list has that hash?"', 'purple');
    addLine('', '');
    addPre('  Candidates:  DOG  CAT  KIT  FOX  HEN  OWL\n\n  Letter values: A=1 B=2 C=3 D=4 E=5 F=6 G=7 H=8 I=9\n                 J=10 K=11 L=12 M=13 N=14 O=15 P=16 Q=17\n                 R=18 S=19 T=20 U=21 V=22 W=23 X=24 Y=25 Z=26');
    addLine('', '');
    addLine('Which password has hash = 40? (Compute the sum for each)', 'warning');

    setCurrentInputHandler((input) => {
      // KIT = K(11) + I(9) + T(20) = 40
      if (input.toUpperCase().trim() === 'KIT') {
        sound.success();
        addLine('[CRACKED] K(11) + I(9) + T(20) = 40. Password is KIT.', 'success');
        addLine('AI CORE: "You just did what a hash cracker does. Compute', 'purple');
        addLine('          the hash for each candidate, compare to the', 'purple');
        addLine('          target. Real hash functions are much more complex,', 'purple');
        addLine('          but the idea is identical."', 'purple');
        s.phase = 1;
        addLine('');
        setTimeout(runS2M1Phase, 1000);
      } else {
        sound.denied();
        addLine('[WRONG] Add up the letter values for each candidate. Which sum = 40?', 'error');
      }
    });
  } else if (s.phase === 1) {
    // Phase 2: Password strength / combinatorics
    addLine('\u2501\u2501\u2501 Backdoor #2: Password Strength \u2501\u2501\u2501', 'highlight');
    addLine('AI CORE: "Before we crack the next backdoor, I need you to', 'purple');
    addLine('          understand WHY some passwords are harder to crack', 'purple');
    addLine('          than others. The answer is MATH."', 'purple');
    addLine('', '');
    addLine('AI CORE: "Imagine a lock with 2 digit wheels, each 0-9.', 'purple');
    addLine('          How many possible combinations are there?"', 'purple');
    addLine('', '');
    addPre('  Digit 1: 10 options (0-9)\n  Digit 2: 10 options (0-9)\n\n  Total = 10 x 10 = ???');
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
          addLine('[WRONG] Multiply the options per position. 10 \u00d7 10 = ?', 'error');
        }
      } else if (s.comboStep === 1) {
        if (n === 676) {
          sound.success();
          addLine('[CORRECT] 26 \u00d7 26 = 676 combinations.', 'success');
          addLine('AI CORE: "See the jump? Just letters instead of digits', 'purple');
          addLine('          and it went from 100 to 676. Nearly 7 times', 'purple');
          addLine('          harder to brute-force."', 'purple');
          addLine('', '');
          addLine('AI CORE: "Now: what if you use letters AND digits (36', 'purple');
          addLine('          options per position) and make it 4 positions', 'purple');
          addLine('          long? How many combinations?"', 'purple');
          addLine('  36 \u00d7 36 \u00d7 36 \u00d7 36 = ???', 'info');
          addLine('(Hint: 36\u00d736=1296. Then 1296\u00d736=46656. Then \u00d736 again.)', 'info');
          s.comboStep = 2;
        } else {
          sound.denied();
          addLine('[WRONG] 26 \u00d7 26 = ?', 'error');
        }
      } else if (s.comboStep === 2) {
        if (n === 1679616) {
          sound.success();
          addLine('[CORRECT] 36\u2074 = 1,679,616 combinations!', 'success');
          addLine('AI CORE: "From 100 to over 1.6 MILLION, just by adding', 'purple');
          addLine('          two more characters and mixing in letters. This', 'purple');
          addLine('          is called COMBINATORIAL EXPLOSION."', 'purple');
          addLine('AI CORE: "This is why longer passwords with mixed', 'purple');
          addLine('          character types are so much harder to crack.', 'purple');
          addLine('          Each extra character MULTIPLIES the difficulty.', 'purple');
          addLine('          It doesn\'t just add to it."', 'purple');
          addLine('AI CORE: "This math is why a 12-character password takes', 'purple');
          addLine('          billions of years to brute-force, while a', 'purple');
          addLine('          4-character one takes seconds."', 'purple');
          s.phase = 2;
          addLine('');
          setTimeout(runS2M1Phase, 1000);
        } else {
          sound.denied();
          addLine('[WRONG] 36 \u00d7 36 \u00d7 36 \u00d7 36. Try step by step: 36\u00d736=1296, then \u00d736, then \u00d736.', 'error');
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
