// missions/s2/05-cryptanalysis.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission,
} from '../../engine.js';

export const mission = {
  id: 12,
  num: 'S2-05',
  title: 'SORTING',
  name: 'Sorting',
  desc: 'Meet bubble sort — your first real sorting algorithm. Trace it by hand and feel how the cost EXPLODES as the list grows.',
  skill: 'SKILL: Bubble Sort + Algorithmic Complexity',
  hints: [
    'Describe any reasonable strategy in a few words — "compare and swap", "find smallest first", anything that sorts works.',
    'For a bubble sort pass: compare each neighbor pair left-to-right, swap if out of order. The biggest number ends up at the far right.',
    'For the 200-item question: doubling input QUADRUPLES work. 5,000 × 4 = 20,000.',
  ],
  run: async function() {
    state.missionState = { phase: 0, hintIdx: 0 };

    await typeLines([
      { text: '[AI CORE — BACKDOOR LAYER 5 / SORT VAULT]', cls: 'system' },
      { text: '[loading] ███████░░░░░░░░░░░░░  35%', cls: 'system' },
      { text: '[loading] ███████████████░░░░░  78%', cls: 'system' },
      { text: '[loading] ████████████████████  100%', cls: 'system' },
      { text: '[VAULT OPEN] Scrambled data detected.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'AI CORE: "You just learned binary search. Remember the one', cls: 'purple' },
      { text: '          rule it MUST have to work?"', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "The list has to be SORTED. Without that, half-and-', cls: 'purple' },
      { text: '          half guessing is nonsense."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "So here\'s the question that built half of computer', cls: 'purple' },
      { text: '          science: how does a computer actually sort? It', cls: 'purple' },
      { text: '          can\'t glance at the list and \'just see\' the order."', cls: 'purple' },
      { text: '', cls: '' },
    ]);

    runS2M5Phase();
  },
};

function runS2M5Phase() {
  const s = state.missionState;
  setPhaseProgress(s.phase + 1, 4);

  if (s.phase === 0) {
    // Phase 1: Why sorting matters — free-form strategy
    addLine('╔══════════════════════════════════════════╗', 'highlight');
    addLine('║   ▶ PHASE 1 of 4 — WHY SORTING MATTERS   ║', 'highlight');
    addLine('╚══════════════════════════════════════════╝', 'highlight');
    addLine('', '');
    addLine('AI CORE: "Here\'s 5 scrambled numbers. Pretend you\'re', 'purple');
    addLine('          explaining to a friend — in your own words — how', 'purple');
    addLine('          YOU would put them in order, smallest to biggest."', 'purple');
    addLine('', '');
    addPre('   ┌─────┬─────┬─────┬─────┬─────┐\n   │  7  │  2  │  9  │  4  │  1  │\n   └─────┴─────┴─────┴─────┴─────┘');
    addLine('', '');
    addLine('AI CORE: "Just a few words. \'compare and swap\', \'find the', 'purple');
    addLine('          smallest first\', \'insert one at a time\' — any real', 'purple');
    addLine('          strategy counts. Give me something."', 'purple');
    addLine('', '');
    addLine('Describe your sorting strategy:', 'warning');

    setCurrentInputHandler((input) => {
      const cleaned = input.trim().toLowerCase();
      if (cleaned.length < 4) {
        sound.denied();
        addLine('[TOO SHORT] Give me a real sentence — what would you DO with the numbers? "compare them", "pick smallest", anything real.', 'error');
        return;
      }

      sound.success();
      addLine('', '');
      addLine(`[STRATEGY LOGGED] "${input.trim()}"`, 'success');
      addLine('', '');
      addLine('AI CORE: "That\'s a real strategy. And here\'s the wild part:', 'purple');
      addLine('          there are DOZENS of ways to sort. Bubble sort,', 'purple');
      addLine('          insertion sort, merge sort, quicksort, heap sort,', 'purple');
      addLine('          radix sort — computer scientists have been', 'purple');
      addLine('          inventing them for 70 years."', 'purple');
      addLine('', '');
      addLine('AI CORE: "Each one trades speed, memory, and simplicity', 'purple');
      addLine('          differently. Today we learn the SIMPLEST one —', 'purple');
      addLine('          the one you could teach a 5-year-old. It has a', 'purple');
      addLine('          cute name: BUBBLE SORT."', 'purple');
      addLine('', '');
      addLine('[PHASE 1 COMPLETE — advancing...]', 'system');
      s.phase = 1;
      setTimeout(runS2M5Phase, 1800);
    });

  } else if (s.phase === 1) {
    // Phase 2: One pass of bubble sort
    addLine('╔════════════════════════════════════════════╗', 'highlight');
    addLine('║  ▶ PHASE 2 of 4 — BUBBLE SORT: ONE PASS    ║', 'highlight');
    addLine('╚════════════════════════════════════════════╝', 'highlight');
    addLine('', '');
    addLine('AI CORE: "The rule is simple: walk left to right. Look at', 'purple');
    addLine('          each pair of neighbors. If they\'re out of order,', 'purple');
    addLine('          swap them. That\'s it. The whole algorithm."', 'purple');
    addLine('', '');
    addLine('Starting list:', 'info');
    addPre('   ┌─────┬─────┬─────┬─────┬─────┐\n   │  5  │  3  │  8  │  1  │  4  │\n   └─────┴─────┴─────┴─────┴─────┘');
    addLine('', '');
    addLine('AI CORE: "Watch one full pass:"', 'purple');
    addLine('', '');
    addPre('   Step 1:  [5, 3] → 5 > 3 → SWAP → [3, 5, 8, 1, 4]\n   Step 2:  [5, 8] → 5 < 8 → ok   → [3, 5, 8, 1, 4]\n   Step 3:  [8, 1] → 8 > 1 → SWAP → [3, 5, 1, 8, 4]\n   Step 4:  [8, 4] → 8 > 4 → SWAP → [3, 5, 1, 4, 8]');
    addLine('', '');
    addLine('AI CORE: "After that one pass, stare at the LAST element.', 'purple');
    addLine('          What can you guarantee about it?"', 'purple');
    addLine('', '');
    addPre('   A) It\'s the smallest number\n   B) It\'s the biggest number\n   C) Nothing is guaranteed');
    addLine('', '');
    addLine('Type A, B, or C:', 'warning');

    setCurrentInputHandler((input) => {
      const answer = input.trim().toUpperCase();
      if (answer === 'B') {
        sound.success();
        addLine('', '');
        addLine('[CORRECT] The last element is guaranteed to be the BIGGEST.', 'success');
        addLine('', '');
        addLine('AI CORE: "Exactly. That\'s WHY it\'s called bubble sort.', 'purple');
        addLine('          Each pass, the biggest remaining number', 'purple');
        addLine('          \'bubbles up\' to the end — like a bubble rising', 'purple');
        addLine('          through water. The 8 passed every smaller', 'purple');
        addLine('          neighbor it met."', 'purple');
        addLine('', '');
        addLine('AI CORE: "Once it\'s at the end, it STAYS. Next pass only', 'purple');
        addLine('          has to worry about the remaining unsorted part."', 'purple');
        addLine('', '');
        addLine('[PHASE 2 COMPLETE — advancing...]', 'system');
        s.phase = 2;
        setTimeout(runS2M5Phase, 1800);
      } else if (answer === 'A') {
        sound.denied();
        addLine('[THINK AGAIN] Big numbers WIN every comparison going right — they keep getting swapped forward. So where does the biggest end up?', 'error');
      } else if (answer === 'C') {
        sound.denied();
        addLine('[NOT QUITE] Something IS guaranteed. Every time a big number met a smaller neighbor, it won and moved right. It had to land somewhere specific...', 'error');
      } else {
        sound.denied();
        addLine('[TYPE A, B, or C] Pick one.', 'error');
      }
    });

  } else if (s.phase === 2) {
    // Phase 3: Full sort — trace each pass
    addLine('╔════════════════════════════════════════════╗', 'highlight');
    addLine('║    ▶ PHASE 3 of 4 — TRACE THE FULL SORT    ║', 'highlight');
    addLine('╚════════════════════════════════════════════╝', 'highlight');
    addLine('', '');
    addLine('AI CORE: "One pass buries the biggest. But the rest is still', 'purple');
    addLine('          scrambled. So you run another pass. And another.', 'purple');
    addLine('          Until nothing swaps."', 'purple');
    addLine('', '');
    addLine('AI CORE: "Your turn. Trace this one by hand. Starting list:"', 'purple');
    addLine('', '');
    addPre('   ┌─────┬─────┬─────┬─────┬─────┐\n   │  4  │  2  │  7  │  1  │  3  │\n   └─────┴─────┴─────┴─────┴─────┘');
    addLine('', '');
    addLine('AI CORE: "Give me the array AFTER pass 1. Type it as 5', 'purple');
    addLine('          numbers separated by spaces or commas. No brackets', 'purple');
    addLine('          needed — just the numbers."', 'purple');
    addLine('', '');
    addLine('Remember: one pass = walk left to right, swap any pair where left > right.', 'info');
    addLine('', '');
    addLine('Array after pass 1?', 'warning');

    s.passStep = 0;

    setCurrentInputHandler((input) => {
      const nums = (input.match(/\d+/g) || []).map(Number);
      const check = (expected) => JSON.stringify(nums) === JSON.stringify(expected);

      if (s.passStep === 0) {
        if (check([2, 4, 1, 3, 7])) {
          sound.success();
          addLine('[PASS 1 CORRECT] [2, 4, 1, 3, 7] — the 7 bubbled to the end.', 'success');
          addLine('', '');
          addLine('AI CORE: "Perfect. Now run pass 2 on that. What do you', 'purple');
          addLine('          get?"', 'purple');
          addLine('', '');
          addLine('Array after pass 2?', 'warning');
          s.passStep = 1;
        } else {
          sound.denied();
          addLine('[NOT QUITE] Walk it slowly on [4,2,7,1,3]:', 'error');
          addLine('  (4,2) → swap → [2,4,7,1,3]', 'error');
          addLine('  (4,7) → ok   → [2,4,7,1,3]', 'error');
          addLine('  (7,1) → swap → [2,4,1,7,3]', 'error');
          addLine('  (7,3) → swap → [2,4,1,3,7]', 'error');
          addLine('Try typing that result.', 'error');
        }
      } else if (s.passStep === 1) {
        if (check([2, 1, 3, 4, 7])) {
          sound.success();
          addLine('[PASS 2 CORRECT] [2, 1, 3, 4, 7] — the 4 bubbled up behind the 7.', 'success');
          addLine('', '');
          addLine('AI CORE: "Two sorted at the end. Pass 3 — go."', 'purple');
          addLine('', '');
          addLine('Array after pass 3?', 'warning');
          s.passStep = 2;
        } else {
          sound.denied();
          addLine('[CHECK AGAIN] Start from [2,4,1,3,7]. Pairs: (2,4)ok, (4,1)swap, (4,3)swap, (4,7)ok. Walk them one at a time.', 'error');
        }
      } else if (s.passStep === 2) {
        if (check([1, 2, 3, 4, 7])) {
          sound.success();
          addLine('[PASS 3 CORRECT] [1, 2, 3, 4, 7] — fully sorted!', 'success');
          addLine('', '');
          addLine('AI CORE: "Three passes. The 7 settled in pass 1, the 4', 'purple');
          addLine('          in pass 2, the rest fell into place in pass 3.', 'purple');
          addLine('          Each pass does about n comparisons, and you', 'purple');
          addLine('          need about n passes."', 'purple');
          addLine('', '');
          addLine('AI CORE: "n passes × n comparisons each = n × n. Hmm.', 'purple');
          addLine('          That number is going to bite us in a second."', 'purple');
          addLine('', '');
          addLine('[PHASE 3 COMPLETE — advancing...]', 'system');
          s.phase = 3;
          setTimeout(runS2M5Phase, 1800);
        } else {
          sound.denied();
          addLine('[ONE MORE PASS] From [2,1,3,4,7]: only (2,1) is out of order. Swap them, the rest stay.', 'error');
        }
      }
    });

  } else if (s.phase === 3) {
    // Phase 4: The cost — quadratic scaling
    addLine('╔══════════════════════════════════════════╗', 'highlight');
    addLine('║     ▶ PHASE 4 of 4 — THE COST OF IT      ║', 'highlight');
    addLine('╚══════════════════════════════════════════╝', 'highlight');
    addLine('', '');
    addLine('AI CORE: "Let\'s count the damage. Here\'s how many comparisons', 'purple');
    addLine('          bubble sort does as the list grows:"', 'purple');
    addLine('', '');
    addPre('   ┌──────────┬──────────────────┐\n   │  ITEMS   │   COMPARISONS    │\n   ├──────────┼──────────────────┤\n   │     5    │        ~10       │\n   │    10    │        ~45       │\n   │   100    │      ~4,950      │\n   │   200    │        ???       │\n   └──────────┴──────────────────┘');
    addLine('', '');
    addLine('AI CORE: "For 100 items, bubble sort needs about 5,000', 'purple');
    addLine('          comparisons. Now — if you DOUBLE the list to 200', 'purple');
    addLine('          items, roughly how many comparisons?"', 'purple');
    addLine('', '');
    addPre('   A)   ~10,000   (doubled — twice the work)\n   B)   ~20,000   (quadrupled — four times the work)\n   C)  ~500,000   (exploded)');
    addLine('', '');
    addLine('Type A, B, or C:', 'warning');

    s.costStep = 0;

    setCurrentInputHandler((input) => {
      const answer = input.trim().toUpperCase();

      if (s.costStep === 0) {
        if (answer === 'B') {
          sound.success();
          addLine('', '');
          addLine('[CORRECT] ~20,000 — the work QUADRUPLED, not doubled.', 'success');
          addLine('', '');
          addLine('AI CORE: "Here\'s why: bubble sort does roughly n × n work.', 'purple');
          addLine('          Double n, and n × n becomes (2n) × (2n) = 4 × n².', 'purple');
          addLine('          Four times the comparisons. Every. Single. Time.', 'purple');
          addLine('          you double the list."', 'purple');
          addLine('', '');
          addPre('      10 items → ~45\n     100 items → ~5,000     (×10 input = ×100 work)\n   1,000 items → ~500,000\n  10,000 items → ~50,000,000');
          addLine('', '');
          addLine('AI CORE: "This is called QUADRATIC time. Computer', 'purple');
          addLine('          scientists write it O(n²). The work grows like', 'purple');
          addLine('          the SQUARE of the input."', 'purple');
          addLine('', '');
          addLine('AI CORE: "One last question. You have a playlist of', 'purple');
          addLine('          10,000 songs and want to sort them by title.', 'purple');
          addLine('          Bubble sort needs ~50 MILLION comparisons. Do', 'purple');
          addLine('          you think Spotify uses bubble sort?"', 'purple');
          addLine('', '');
          addLine('Type YES or NO:', 'warning');
          s.costStep = 1;
        } else if (answer === 'A') {
          sound.denied();
          addLine('[THINK AGAIN] Bubble sort is n × n work. If n doubles, n × n becomes (2n)(2n) = 4 × n². Not 2×. Try again.', 'error');
        } else if (answer === 'C') {
          sound.denied();
          addLine('[TOO FAR] Going from 100 to 200 is doubling — not multiplying by 100. The work squares with the DOUBLING factor: 2² = 4×. So 5,000 × 4 = ?', 'error');
        } else {
          sound.denied();
          addLine('[TYPE A, B, or C] Pick one.', 'error');
        }
      } else if (s.costStep === 1) {
        if (answer === 'NO') {
          sound.success();
          addLine('', '');
          addLine('[RIGHT] No — 50 million comparisons for a playlist would be painfully slow.', 'success');
          addLine('', '');
          addLine('AI CORE: "Real systems use smarter sorts. Merge sort and', 'purple');
          addLine('          quicksort run in about n × log(n) time — for', 'purple');
          addLine('          10,000 items, that\'s closer to 130,000', 'purple');
          addLine('          comparisons. Not 50 million. About 400× faster."', 'purple');
          addLine('', '');
          addLine('AI CORE: "But here\'s the secret: those faster sorts are', 'purple');
          addLine('          built on the SAME idea you just used — compare,', 'purple');
          addLine('          swap, repeat. They\'re just cleverer about which', 'purple');
          addLine('          pairs to compare. Bubble sort is the foundation."', 'purple');
          addLine('', '');
          addLine('>>> SORT VAULT CLEARED <<<', 'success big');
          addLine('', '');
          addLine('╔══════════════════════════════════════╗', 'system');
          addLine('║   [BUBBLE SORT — UNDERSTOOD]         ║', 'system');
          addLine('║   [QUADRATIC COST — UNDERSTOOD]      ║', 'system');
          addLine('║   [BACKDOOR LAYER 5 — SEALED]        ║', 'system');
          addLine('╚══════════════════════════════════════╝', 'system');
          addLine('', '');
          addLine('AI CORE: "You traced a real algorithm by hand. You felt', 'purple');
          addLine('          how doubling the input quadruples the work.', 'purple');
          addLine('          That INTUITION is what separates a programmer', 'purple');
          addLine('          who writes code from one who knows why it\'s', 'purple');
          addLine('          slow. Next layer goes even deeper \u2014 below the', 'purple');
          addLine('          code, down to the GATES that make every', 'purple');
          addLine('          computation possible. Victor\u2019s firewall lives', 'purple');
          addLine('          there, and we\u2019re going to crack it open."', 'purple');
          setCurrentInputHandler(null);
          setTimeout(() => completeMission(12), 1500);
        } else if (answer === 'YES') {
          sound.denied();
          addLine('[THINK] 50 million comparisons to sort 10,000 songs? Your playlist would take seconds to load. Real engineers wouldn\'t tolerate that.', 'error');
        } else {
          sound.denied();
          addLine('[TYPE YES or NO] Would Spotify use bubble sort on 10,000 songs?', 'error');
        }
      }
    });
  }
}
