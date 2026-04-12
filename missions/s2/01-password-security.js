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
    'For hash cracking: add up letter values (A=1, B=2...). For the collision question: what does the system actually check?',
    'For combinations: each new position MULTIPLIES the total, not adds. Think ×10, not +10.',
    'For constraints: positions 1 and 5 are locked. Where can 2 non-adjacent symbols fit in positions 2, 3, 4?',
  ],
  run: async function() {
    state.missionState = { phase: 0, hintIdx: 0 };

    await typeLines([
      { text: '[AI CORE — DEEP SCAN INITIATED]', cls: 'system' },
      { text: '[......................................................]', cls: 'system' },
      { text: '[BACKDOOR FOUND] Password security layer active.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'AI CORE: "There you are. I\'ve been waiting for you."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Remember when you freed me? I promised I\'d help', cls: 'purple' },
      { text: '          protect the village. Well — VICTOR left a', cls: 'purple' },
      { text: '          backdoor. Three layers of password security,', cls: 'purple' },
      { text: '          hidden deep. He thought nobody could touch it."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "But now there are two of us. I know how these', cls: 'purple' },
      { text: '          locks work from the inside, and you — you\'ve', cls: 'purple' },
      { text: '          already proven you can learn anything."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Three layers, three real computer science ideas.', cls: 'purple' },
      { text: '          No tricks. The real thing. Ready?"', cls: 'purple' },
      { text: '', cls: '' },
    ]);

    runS2M1Phase();
  },
};

function runS2M1Phase() {
  const s = state.missionState;
  setPhaseProgress(s.phase + 1, 3);

  if (s.phase === 0) {
    // Phase 1: Hash cracking + collision insight
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
    addPre('  ┌─────────────────────────────────┐\n  │         ╔═══╗  ╔═══╗  ╔═══╗     │\n  │         ║DOG║  ║KIT║  ║FOX║     │\n  │         ╚═══╝  ╚═══╝  ╚═══╝     │\n  └─────────────────────────────────┘');
    addLine('', '');
    addPre('   A=1   B=2   C=3   D=4   E=5\n   F=6   G=7   H=8   I=9   J=10\n   K=11  L=12  M=13  N=14  O=15\n   P=16  Q=17  R=18  S=19  T=20\n   U=21  V=22  W=23  X=24  Y=25\n   Z=26');
    addLine('', '');
    addLine('Which password has hash = 40?', 'warning');

    s.hashStep = 0;

    setCurrentInputHandler((input) => {
      if (s.hashStep === 0) {
        // KIT = K(11) + I(9) + T(20) = 40
        if (input.toUpperCase().trim() === 'KIT') {
          sound.success();
          addLine('', '');
          addLine('[MATCH FOUND] K(11) + I(9) + T(20) = 40 ✓', 'success');
          addLine('', '');
          addLine('AI CORE: "Good. Now here\'s the twist. Look at this', 'purple');
          addLine('          other word: LINE."', 'purple');
          addLine('', '');
          addLine('          LINE = L(12) + I(9) + N(14) + E(5) = <span class="highlight">40</span>', 'info');
          addLine('', '');
          addLine('AI CORE: "Different word, different length — same hash!', 'purple');
          addLine('          The system only stores the number 40. If', 'purple');
          addLine('          someone types LINE instead of KIT, would the', 'purple');
          addLine('          system let them in?"', 'purple');
          addLine('', '');
          addLine('Type YES or NO:', 'warning');
          s.hashStep = 1;
        } else {
          sound.denied();
          addLine('[CLOSE] I\'ll help — DOG = D(4)+O(15)+G(7) = 26. FOX = F(6)+O(15)+X(24) = 45. Try the last one!', 'error');
        }
      } else if (s.hashStep === 1) {
        if (input.toUpperCase().trim() === 'YES') {
          sound.success();
          addLine('', '');
          addLine('>>> LAYER 1 CRACKED <<<', 'success big');
          addLine('', '');
          addLine('AI CORE: "Exactly. That\'s called a HASH COLLISION —', 'purple');
          addLine('          two different inputs that make the same hash.', 'purple');
          addLine('          The system can\'t tell them apart!"', 'purple');
          addLine('', '');
          addLine('AI CORE: "Imagine if two different keys opened your front', 'purple');
          addLine('          door. That\'s what a collision is. Real websites', 'purple');
          addLine('          use hash functions so complex that finding a', 'purple');
          addLine('          collision would take longer than the age of the', 'purple');
          addLine('          universe. VICTOR\'s addition hash? Child\'s play."', 'purple');
          addLine('', '');
          addLine('[LAYER 1 SEALED — accessing layer 2...]', 'system');
          addLine('', '');
          addLine('AI CORE: "Nice work. But cracking a weak hash was the easy', 'purple');
          addLine('          part. VICTOR\'s next layer asks a bigger question:', 'purple');
          addLine('          what makes a password STRONG in the first place?"', 'purple');
          s.phase = 1;
          addLine('');
          setTimeout(runS2M1Phase, 1800);
        } else {
          sound.denied();
          addLine('[ALMOST] Remember — the system only sees the number 40. Both KIT and LINE produce 40. So what happens if someone types LINE?', 'error');
        }
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
    addPre('   ╔════════╗   ╔════════╗\n   ║ Wheel 1 ║   ║ Wheel 2 ║\n   ║  0 - 9  ║   ║  0 - 9  ║\n   ║ (10 ea) ║   ║ (10 ea) ║\n   ╚════════╝   ╚════════╝\n\n   Total = 10 × 10 = ???');
    addLine('', '');
    addLine('Type the total number of combinations:', 'warning');

    s.comboStep = 0;

    setCurrentInputHandler((input) => {
      const n = parseInt(input.trim());

      if (s.comboStep === 0) {
        if (n === 100) {
          sound.success();
          addLine('[GOT IT] 10 × 10 = 100 combinations!', 'success');
          addLine('', '');
          addLine('AI CORE: "Good. Now you add just ONE more digit wheel.', 'purple');
          addLine('          Three wheels total, still 0-9 each."', 'purple');
          addLine('', '');
          addPre('   ╔════════╗   ╔════════╗   ╔════════╗\n   ║ Wheel 1 ║   ║ Wheel 2 ║   ║ Wheel 3 ║\n   ║  0 - 9  ║   ║  0 - 9  ║   ║  0 - 9  ║\n   ║ (10 ea) ║   ║ (10 ea) ║   ║ (10 ea) ║\n   ╚════════╝   ╚════════╝   ╚════════╝');
          addLine('', '');
          addLine('AI CORE: "Does the total go to 110 (added 10 more)', 'purple');
          addLine('          or 1000 (multiplied by 10)?"', 'purple');
          addLine('', '');
          addLine('Type 110 or 1000:', 'warning');
          s.comboStep = 1;
        } else {
          sound.denied();
          addLine('[KEEP GOING] Each wheel has 10 options. When you combine them, you multiply: 10 × 10 = ?', 'error');
        }
      } else if (s.comboStep === 1) {
        if (n === 1000) {
          sound.success();
          addLine('[YES] 10 × 10 × 10 = 1,000! One wheel → ten TIMES more.', 'success');
          addLine('', '');
          addLine('AI CORE: "Not 110 — one THOUSAND. Adding a wheel', 'purple');
          addLine('          doesn\'t add options, it MULTIPLIES them.', 'purple');
          addLine('          That\'s why every extra character makes a', 'purple');
          addLine('          password exponentially harder to crack."', 'purple');
          addLine('', '');
          addLine('AI CORE: "Now the big one. A password with 4', 'purple');
          addLine('          characters, each can be a letter or digit', 'purple');
          addLine('          (36 options). How many combinations?"', 'purple');
          addLine('', '');
          addLine('  36 × 36 × 36 × 36 = ???', 'info');
          addLine('  (Hint: 36×36=1296. Then 1296×36=46656. Then ×36 again.)', 'info');
          s.comboStep = 2;
        } else {
          sound.denied();
          addLine('[THINK ABOUT IT] You had 100 combos with 2 wheels. A 3rd wheel gives each of those 100 combos 10 new endings. Is that +10 or ×10?', 'error');
        }
      } else if (s.comboStep === 2) {
        if (n === 1679616) {
          sound.success();
          addLine('', '');
          addLine('>>> LAYER 2 CRACKED <<<', 'success big');
          addLine('36⁴ = 1,679,616 combinations!', 'success');
          addLine('', '');
          addLine('AI CORE: "From 100 to 1.6 MILLION. Just two more', 'purple');
          addLine('          characters and mixing in letters did that."', 'purple');
          addLine('', '');
          addLine('AI CORE: "Think about your name on a video game', 'purple');
          addLine('          scoreboard — 3 letters, just uppercase. That\'s', 'purple');
          addLine('          only 17,576 combos. But your real password', 'purple');
          addLine('          probably has 10+ characters with numbers and', 'purple');
          addLine('          symbols. TRILLIONS of combos. A computer trying', 'purple');
          addLine('          every one would be grinding for centuries."', 'purple');
          addLine('', '');
          addLine('[LAYER 2 SEALED — accessing final layer...]', 'system');
          addLine('', '');
          addLine('AI CORE: "Two down. But the last layer is different.', 'purple');
          addLine('          So far you\'ve been cracking things. Now you', 'purple');
          addLine('          have to BUILD something that follows rules."', 'purple');
          s.phase = 2;
          addLine('');
          setTimeout(runS2M1Phase, 1800);
        } else {
          sound.denied();
          addLine('[YOU\'RE CLOSE] Take it step by step: 36×36 = 1,296. Then 1,296 × 36 = 46,656. One more × 36...', 'error');
        }
      }
    });
  } else if (s.phase === 2) {
    // Phase 3: Constraint construction
    addLine('━━━ LAYER 3 of 3: Constraint Construction ━━━', 'highlight');
    addLine('', '');
    addLine('AI CORE: "Last layer. This one is different — VICTOR didn\'t', 'purple');
    addLine('          just lock it. He set up a PASSWORD POLICY with', 'purple');
    addLine('          five rules. You have to BUILD a password that', 'purple');
    addLine('          passes every single one."', 'purple');
    addLine('', '');
    addLine('AI CORE: "This is called constraint satisfaction — fitting', 'purple');
    addLine('          through all the filters at once. Same idea behind', 'purple');
    addLine('          how computers plan schedules and solve puzzles."', 'purple');
    addLine('', '');
    addLine('AI CORE: "Warning: these rules INTERACT. Satisfying one', 'purple');
    addLine('          affects where the others can go. You\'ll need to', 'purple');
    addLine('          think about the structure, not just guess."', 'purple');
    addLine('', '');
    addPre('  ╔═══════════════════════════════════════════╗\n  ║  PASSWORD POLICY                           ║\n  ║                                             ║\n  ║  1. Exactly 5 characters                    ║\n  ║  2. Must start with a CAPITAL letter        ║\n  ║  3. Must end with a digit (0-9)             ║\n  ║  4. Must contain exactly 2 of: ! @ #        ║\n  ║  5. The 2 symbols cannot be next             ║\n  ║     to each other                            ║\n  ║                                             ║\n  ║  Positions:  [ 1 ][ 2 ][ 3 ][ 4 ][ 5 ]     ║\n  ╚═══════════════════════════════════════════╝');
    addLine('', '');
    addLine('AI CORE: "Think about WHERE each piece can go. The rules', 'purple');
    addLine('          lock some positions — figure out the pattern."', 'purple');

    setCurrentInputHandler((input) => {
      const pw = input.trim();
      const symbolCount = (pw.match(/[!@#]/g) || []).length;
      const checks = [
        { ok: pw.length === 5, msg: 'Must be exactly 5 characters' },
        { ok: /^[A-Z]/.test(pw), msg: 'Must start with a capital letter' },
        { ok: /\d$/.test(pw), msg: 'Must end with a digit' },
        { ok: symbolCount === 2, msg: 'Must contain exactly 2 of: ! @ #' },
        { ok: !/[!@#][!@#]/.test(pw), msg: 'Symbols cannot be next to each other' },
      ];
      const failed = checks.filter(c => !c.ok);
      if (failed.length === 0) {
        sound.success();
        addLine('', '');
        addLine('>>> ALL 3 LAYERS SEALED <<<', 'success big');
        addLine(`Password "${pw}" — all 5 constraints satisfied.`, 'success');
        addLine('', '');
        addLine('AI CORE: "Did you see what just happened? Rules 2 and 3', 'purple');
        addLine('          locked positions 1 and 5. That left only 2, 3, 4', 'purple');
        addLine('          for the symbols — but they can\'t touch! So they', 'purple');
        addLine('          HAD to go at 2 and 4. The rules didn\'t just limit', 'purple');
        addLine('          you — they solved the puzzle FOR you."', 'purple');
        addLine('', '');
        addLine('AI CORE: "That\'s constraint satisfaction. Sudoku works', 'purple');
        addLine('          the same way — each clue eliminates options', 'purple');
        addLine('          until only one answer fits. Computers use this', 'purple');
        addLine('          to schedule flights, plan routes, and solve', 'purple');
        addLine('          problems with millions of moving pieces."', 'purple');
        addLine('', '');
        addLine('[BACKDOOR SEALED]', 'system');
        addLine('', '');
        addLine('AI CORE: "Three layers. Three real ideas — hashing,', 'purple');
        addLine('          combinatorics, constraint satisfaction. The same', 'purple');
        addLine('          ideas that protect every password you\'ll ever', 'purple');
        addLine('          make. VICTOR thought no one would understand', 'purple');
        addLine('          this. He keeps being wrong about us."', 'purple');
        setCurrentInputHandler(null);
        setTimeout(() => completeMission(8), 1500);
      } else {
        sound.denied();
        const passed = checks.filter(c => c.ok);
        if (passed.length > 0) {
          addLine(`[${passed.length}/5 RULES PASSED] ${failed.map(f => '✗ ' + f.msg).join(' | ')}`, 'error');
        } else {
          addLine(`[REJECTED] ${failed.map(f => '✗ ' + f.msg).join(' | ')}`, 'error');
        }
        addLine('AI CORE: "You\'re getting there. Start with what you know: position 1 must be a letter, position 5 must be a digit. Now — where can the symbols fit?"', 'purple');
      }
    });
  }
}
