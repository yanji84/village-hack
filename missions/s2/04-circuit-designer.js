// missions/s2/04-circuit-designer.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission,
} from '../../engine.js';

export const mission = {
  id: 11,
  num: 'S2-04',
  title: 'SEARCHING',
  name: 'Searching',
  desc: 'Linear search vs binary search — how to find one item in a million, with 20 checks instead of a million.',
  skill: 'SKILL: Search Algorithms + Big-O Intuition',
  hints: [
    'Phase 1: "worst case" means the UNLUCKIEST order — the item you want is the very last one you check.',
    'Phase 2: every check throws away HALF. Start with 1000 → 500 → 250 → 125 → 63 → 32 → 16 → 8 → 4 → 2 → 1. Count the arrows.',
    'Phase 4: 2^20 is about a million. So twenty halvings shrink a million-item list down to one.',
  ],
  run: async function() {
    state.missionState = { phase: 0, hintIdx: 0 };

    await typeLines([
      { text: '[DATA VAULT DETECTED] 1,000,000 records. Target inside.', cls: 'system' },
      { text: '[scanning] █████░░░░░░░░░░░░░░░  24%', cls: 'system' },
      { text: '[scanning] █████████████░░░░░░░  66%', cls: 'system' },
      { text: '[scanning] ████████████████████  100%', cls: 'system' },
      { text: '[SEARCH INDEX EXPOSED]', cls: 'system' },
      { text: '', cls: '' },
      { text: 'AI CORE: "VICTOR hid one record inside a vault of a MILLION.', cls: 'purple' },
      { text: '          You have to find it. But HOW you look matters more', cls: 'purple' },
      { text: '          than how hard you look."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "This is the first real ALGORITHM I\'m going to show', cls: 'purple' },
      { text: '          you. Not a puzzle — a recipe for solving a whole', cls: 'purple' },
      { text: '          family of problems. The difference between a good', cls: 'purple' },
      { text: '          recipe and a bad one? Twenty checks versus a million."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Four phases. Two ways to search. One huge payoff."', cls: 'purple' },
      { text: '', cls: '' },
    ]);

    runS2M4Phase();
  },
};

function runS2M4Phase() {
  const s = state.missionState;
  setPhaseProgress(s.phase + 1, 4);

  if (s.phase === 0) {
    // Phase 1: Linear search
    addLine('╔══════════════════════════════════════╗', 'highlight');
    addLine('║  ▶ PHASE 1 of 4 — LINEAR SEARCH      ║', 'highlight');
    addLine('╚══════════════════════════════════════╝', 'highlight');
    addLine('', '');
    addLine('AI CORE: "Warm-up. Here are 10 names, in no particular order.', 'purple');
    addLine('          Your target: EVE. Find her."', 'purple');
    addLine('', '');
    addPre('   #1  MAYA    #2  JACK    #3  RAVI    #4  NINA\n   #5  OMAR    #6  LILA    #7  KAI     #8  ZARA\n   #9  EVE     #10 TOM');
    addLine('', '');
    addLine('AI CORE: "The simplest way: start at #1 and check each one', 'purple');
    addLine('          in order. #1 MAYA? No. #2 JACK? No. And so on."', 'purple');
    addLine('', '');
    addLine('AI CORE: "Here\'s the question. In the WORST case — meaning', 'purple');
    addLine('          the unluckiest possible arrangement — how many names', 'purple');
    addLine('          might you have to check before you find the one you', 'purple');
    addLine('          want?"', 'purple');
    addLine('', '');
    addLine('Type the number:', 'warning');

    s.step = 0;
    s.hintIdx = 0;

    setCurrentInputHandler((input) => {
      const n = parseInt(input.replace(/[, ]/g, '').trim());

      if (s.step === 0) {
        if (n === 10) {
          sound.success();
          addLine('[CORRECT] Worst case: 10 checks. She could be the very last one.', 'success');
          addLine('', '');
          addLine('AI CORE: "Right. In the worst case, your target is dead last.', 'purple');
          addLine('          You had to look at EVERY name to be sure."', 'purple');
          addLine('', '');
          addLine('AI CORE: "Now scale it up. Imagine the list isn\'t 10 names —', 'purple');
          addLine('          it\'s ONE MILLION names. Worst case, how many do', 'purple');
          addLine('          you have to check?"', 'purple');
          addLine('', '');
          addLine('Type the number (digits only, no commas needed):', 'warning');
          s.step = 1;
          s.hintIdx = 0;
        } else {
          sound.denied();
          s.hintIdx++;
          if (s.hintIdx === 1) {
            addLine('[THINK] "Worst case" means she could be anywhere — including the LAST slot. How many checks does that take?', 'error');
          } else if (s.hintIdx === 2) {
            addLine('[HINT] If EVE is in slot #10, you check #1, then #2, ... all the way to #10 before you find her. Count those checks.', 'error');
          } else {
            addLine('[ANSWER] The answer is 10. There are 10 names, and in the worst case she is the last one you check.', 'error');
          }
        }
      } else if (s.step === 1) {
        if (n === 1000000) {
          sound.success();
          addLine('', '');
          addLine('>>> PHASE 1 COMPLETE <<<', 'success big');
          addLine('A million names → a million checks, worst case.', 'success');
          addLine('', '');
          addLine('AI CORE: "That\'s LINEAR SEARCH. Simple, honest, and slow.', 'purple');
          addLine('          The work grows in a straight line with the list.', 'purple');
          addLine('          Double the list, double the work. Every time."', 'purple');
          addLine('', '');
          addLine('AI CORE: "A modern computer can chew through a million', 'purple');
          addLine('          comparisons in about a heartbeat. But what about a', 'purple');
          addLine('          BILLION? A trillion? Google\'s index? Linear falls', 'purple');
          addLine('          apart. We need a smarter recipe."', 'purple');
          addLine('', '');
          addLine('[PHASE 1 SEALED — loading phase 2...]', 'system');
          s.phase = 1;
          s.hintIdx = 0;
          addLine('');
          setTimeout(runS2M4Phase, 1800);
        } else {
          sound.denied();
          s.hintIdx++;
          if (s.hintIdx === 1) {
            addLine('[THINK] Same rule as before — worst case means the target is at the very end. If the list has a million items...', 'error');
          } else {
            addLine('[HINT] 10 names → 10 checks. 1,000,000 names → ? Just type 1000000.', 'error');
          }
        }
      }
    });

  } else if (s.phase === 1) {
    // Phase 2: Binary search
    addLine('╔══════════════════════════════════════╗', 'highlight');
    addLine('║  ▶ PHASE 2 of 4 — BINARY SEARCH      ║', 'highlight');
    addLine('╚══════════════════════════════════════╝', 'highlight');
    addLine('', '');
    addLine('AI CORE: "Now the magic trick. Same size list — but the', 'purple');
    addLine('          numbers are SORTED. Your target: 42."', 'purple');
    addLine('', '');
    addPre('   position:  1   2   3   4   5   6   7   8\n   value:     3   7  11  15  19  23  27  35\n\n   position:  9  10  11  12  13  14  15  16\n   value:    39  42  47  53  59  67  73  81');
    addLine('', '');
    addLine('AI CORE: "Watch what sorting unlocks. Don\'t start at the', 'purple');
    addLine('          front. Jump to the MIDDLE and ask one question:', 'purple');
    addLine('          is my target higher or lower than this?"', 'purple');
    addLine('', '');
    addPre('   CHECK 1 →  middle is position 8 = 35\n              42 > 35   →  throw away the BOTTOM half\n              (positions 1-8 eliminated in ONE check!)\n\n   CHECK 2 →  middle of 9-16 is position 12 = 53\n              42 < 53   →  throw away the TOP half\n\n   CHECK 3 →  middle of 9-11 is position 10 = 42\n              FOUND! ✓');
    addLine('', '');
    addLine('AI CORE: "Three checks. Not ten. Three."', 'purple');
    addLine('', '');
    addLine('AI CORE: "Every single check threw away HALF of what was', 'purple');
    addLine('          left. 16 → 8 → 4 → 1. That\'s the whole idea."', 'purple');
    addLine('', '');
    addLine('AI CORE: "Now YOU tell me. If the list had 1,000 sorted items,', 'purple');
    addLine('          and every check halves what\'s left — how many checks,', 'purple');
    addLine('          at most, to shrink it down to 1?"', 'purple');
    addLine('', '');
    addPre('   1000 → 500 → 250 → 125 → 63 → 32 → 16 → 8 → 4 → 2 → 1\n      (count the arrows!)');
    addLine('', '');
    addLine('Type the number of checks:', 'warning');

    s.hintIdx = 0;

    setCurrentInputHandler((input) => {
      const n = parseInt(input.trim());
      if (n === 10) {
        sound.success();
        addLine('', '');
        addLine('>>> PHASE 2 COMPLETE <<<', 'success big');
        addLine('10 checks to search 1,000 sorted items. That\'s BINARY SEARCH.', 'success');
        addLine('', '');
        addLine('AI CORE: "TEN checks for a thousand items. Linear search', 'purple');
        addLine('          would have taken a thousand. You just went a HUNDRED', 'purple');
        addLine('          TIMES faster — for free."', 'purple');
        addLine('', '');
        addLine('AI CORE: "The trick isn\'t speed. The trick is THROWING', 'purple');
        addLine('          AWAY. Linear search checks one and eliminates one.', 'purple');
        addLine('          Binary search checks one and eliminates HALF."', 'purple');
        addLine('', '');
        addLine('[PHASE 2 SEALED — loading phase 3...]', 'system');
        s.phase = 2;
        s.hintIdx = 0;
        addLine('');
        setTimeout(runS2M4Phase, 1800);
      } else {
        sound.denied();
        s.hintIdx++;
        if (s.hintIdx === 1) {
          addLine('[COUNT THE ARROWS] 1000 → 500 → 250 → 125 → 63 → 32 → 16 → 8 → 4 → 2 → 1. How many arrows between 1000 and 1?', 'error');
        } else if (s.hintIdx === 2) {
          addLine('[HINT] Each arrow is one check (one halving). Count them: 1000→500 is arrow 1, 500→250 is arrow 2... keep going to 1.', 'error');
        } else {
          addLine('[ANSWER] 10 checks. It takes 10 halvings to go from 1000 down to 1.', 'error');
        }
      }
    });

  } else if (s.phase === 2) {
    // Phase 3: The catch
    addLine('╔══════════════════════════════════════╗', 'highlight');
    addLine('║  ▶ PHASE 3 of 4 — THE CATCH          ║', 'highlight');
    addLine('╚══════════════════════════════════════╝', 'highlight');
    addLine('', '');
    addLine('AI CORE: "Binary search is incredible. But there\'s a catch —', 'purple');
    addLine('          and it\'s a big one. Look at this list:"', 'purple');
    addLine('', '');
    addPre('   position:  1   2   3   4   5   6   7   8\n   value:    47  12  83   3  29  91  55  18\n\n   position:  9  10  11  12  13  14  15  16\n   value:    71  34   7  62  26  99   8  41');
    addLine('', '');
    addLine('AI CORE: "Same 16 slots. Not sorted. Find 41."', 'purple');
    addLine('', '');
    addLine('AI CORE: "Try binary search: middle is position 8 = 18. Is', 'purple');
    addLine('          your target higher or lower? ...Well, 41 is higher', 'purple');
    addLine('          than 18, so throw away the bottom half, right?"', 'purple');
    addLine('', '');
    addLine('AI CORE: "But 41 is in position 16. And also, 3 is in position', 'purple');
    addLine('          4. Smaller things are scattered everywhere. Throwing', 'purple');
    addLine('          away the bottom half means nothing."', 'purple');
    addLine('', '');
    addLine('AI CORE: "Can binary search work on this unsorted list?"', 'purple');
    addLine('', '');
    addLine('Type YES or NO:', 'warning');

    s.step = 0;
    s.hintIdx = 0;

    setCurrentInputHandler((input) => {
      const ans = input.toUpperCase().trim();
      if (s.step === 0) {
        if (ans === 'NO') {
          sound.success();
          addLine('[EXACTLY] Binary search fails on unsorted data. The halving rule needs ORDER to work.', 'success');
          addLine('', '');
          addLine('AI CORE: "Right. "Throw away the lower half" only makes', 'purple');
          addLine('          sense if the values ARE sorted low-to-high. No', 'purple');
          addLine('          order → no halving → no speedup."', 'purple');
          addLine('', '');
          addLine('AI CORE: "So what do you HAVE to do first, before binary', 'purple');
          addLine('          search can save you? One word."', 'purple');
          addLine('', '');
          addLine('Type the word:', 'warning');
          s.step = 1;
          s.hintIdx = 0;
        } else if (ans === 'YES') {
          sound.denied();
          addLine('[NO] Look again. The numbers jump around — 47, 12, 83, 3. "Higher or lower than the middle" tells you nothing about where 41 hides.', 'error');
        } else {
          sound.denied();
          addLine('[TYPE YES or NO] Can binary search work on this unsorted list?', 'error');
        }
      } else if (s.step === 1) {
        if (ans === 'SORT' || ans === 'SORTING' || ans === 'SORT IT') {
          sound.success();
          addLine('', '');
          addLine('>>> PHASE 3 COMPLETE <<<', 'success big');
          addLine('SORT first. THEN binary search. That\'s the deal.', 'success');
          addLine('', '');
          addLine('AI CORE: "And now you know why sorting matters. It\'s not', 'purple');
          addLine('          about neatness. It\'s not so the list looks pretty', 'purple');
          addLine('          in a spreadsheet. Sorting is what UNLOCKS binary', 'purple');
          addLine('          search — and every other fast lookup technique."', 'purple');
          addLine('', '');
          addLine('AI CORE: "Every phone contacts app. Every dictionary. Every', 'purple');
          addLine('          database index. They\'re sorted so you can find', 'purple');
          addLine('          anything in a handful of checks instead of a', 'purple');
          addLine('          million. Sort once, search forever."', 'purple');
          addLine('', '');
          addLine('[PHASE 3 SEALED — loading final phase...]', 'system');
          s.phase = 3;
          s.hintIdx = 0;
          addLine('');
          setTimeout(runS2M4Phase, 1800);
        } else {
          sound.denied();
          s.hintIdx++;
          if (s.hintIdx === 1) {
            addLine('[ONE WORD] What do you do to a messy list to put it in order — smallest to largest?', 'error');
          } else {
            addLine('[HINT] The word starts with S. You "___ the list" from smallest to largest.', 'error');
          }
        }
      }
    });

  } else if (s.phase === 3) {
    // Phase 4: The power
    addLine('╔══════════════════════════════════════╗', 'highlight');
    addLine('║  ▶ PHASE 4 of 4 — THE POWER          ║', 'highlight');
    addLine('╚══════════════════════════════════════╝', 'highlight');
    addLine('', '');
    addLine('AI CORE: "Back to VICTOR\'s vault. One MILLION sorted records.', 'purple');
    addLine('          One target hidden somewhere inside."', 'purple');
    addLine('', '');
    addPre('   ╔════════════════════════════════════════╗\n   ║        VICTOR\'S VAULT                  ║\n   ║        1,000,000 sorted records        ║\n   ║        ONE target. Find it.            ║\n   ╚════════════════════════════════════════╝');
    addLine('', '');
    addLine('AI CORE: "First question: if you use LINEAR search, how many', 'purple');
    addLine('          records do you check in the worst case?"', 'purple');
    addLine('', '');
    addLine('Type the number:', 'warning');

    s.step = 0;
    s.hintIdx = 0;

    setCurrentInputHandler((input) => {
      const n = parseInt(input.replace(/[, ]/g, '').trim());

      if (s.step === 0) {
        if (n === 1000000) {
          sound.success();
          addLine('[RIGHT] Linear: 1,000,000 checks. Worst case, the target is dead last.', 'success');
          addLine('', '');
          addLine('AI CORE: "Now binary search. Every check halves what\'s', 'purple');
          addLine('          left. Start at a million, halve repeatedly:"', 'purple');
          addLine('', '');
          addPre('   1,000,000 → 500,000 → 250,000 → 125,000 → 62,500\n   → 31,250 → 15,625 → 7,813 → 3,907 → 1,954\n   → 977 → 489 → 245 → 123 → 62\n   → 31 → 16 → 8 → 4 → 2 → 1');
          addLine('', '');
          addLine('AI CORE: "Count those arrows. How many halvings does it', 'purple');
          addLine('          take to shrink a million down to 1?"', 'purple');
          addLine('', '');
          addLine('Hint: it\'s the power n where 2^n ≈ 1,000,000.', 'info');
          addLine('', '');
          addLine('Type the number of checks:', 'warning');
          s.step = 1;
          s.hintIdx = 0;
        } else {
          sound.denied();
          s.hintIdx++;
          if (s.hintIdx === 1) {
            addLine('[LINEAR = ONE BY ONE] A million items, checked one at a time, worst case is... a million. Type 1000000.', 'error');
          } else {
            addLine('[ANSWER] 1000000. Linear search on 1,000,000 items means up to 1,000,000 checks.', 'error');
          }
        }
      } else if (s.step === 1) {
        if (n === 20) {
          sound.success();
          addLine('', '');
          addLine('>>> ALL 4 PHASES SEALED <<<', 'success big');
          addLine('1,000,000 items → 20 checks. ONE MILLION vs TWENTY.', 'success');
          addLine('', '');
          addLine('AI CORE: "Say it out loud. Twenty. Twenty checks to find', 'purple');
          addLine('          one record in a MILLION. Because 2 × 2 × 2 ×', 'purple');
          addLine('          ... twenty times is about a million."', 'purple');
          addLine('', '');
          addPre('    2^10 =        1,024   (about a thousand)\n    2^20 =    1,048,576   (about a million)\n    2^30 = 1,073,741,824  (about a billion)\n\n   → A BILLION items? Only 30 checks.');
          addLine('', '');
          addLine('AI CORE: "That\'s the whole reason algorithms are a real', 'purple');
          addLine('          subject. Same problem, same computer, same data —', 'purple');
          addLine('          but a million steps versus twenty. That is the', 'purple');
          addLine('          difference between a good algorithm and a bad one."', 'purple');
          addLine('', '');
          addLine('AI CORE: "Every search bar you\'ve ever used. Every', 'purple');
          addLine('          autocomplete. Every database lookup. They don\'t', 'purple');
          addLine('          scan a billion rows — they HALVE. Over and over.', 'purple');
          addLine('          This is what computer science IS."', 'purple');
          addLine('', '');
          addLine('╔══════════════════════════════════════╗', 'system');
          addLine('║       [DATA VAULT CRACKED]           ║', 'system');
          addLine('║    TARGET RECORD — 20 CHECKS TO      ║', 'system');
          addLine('║    FIND ONE IN A MILLION             ║', 'system');
          addLine('╚══════════════════════════════════════╝', 'system');
          setCurrentInputHandler(null);
          setTimeout(() => completeMission(11), 2000);
        } else {
          sound.denied();
          s.hintIdx++;
          if (s.hintIdx === 1) {
            addLine('[COUNT THE ARROWS] Count each arrow in that chain from 1,000,000 all the way down to 1. Each one is one check.', 'error');
          } else if (s.hintIdx === 2) {
            addLine('[HINT] 2^10 ≈ 1,000. 2^20 ≈ 1,000,000. So how many halvings to go from a million to one?', 'error');
          } else {
            addLine('[ANSWER] 20. Twenty halvings shrinks 1,000,000 down to 1 — because 2^20 is about a million.', 'error');
          }
        }
      }
    });
  }
}
