// missions/s2/03-loop-router.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission,
} from '../../engine.js';

export const mission = {
  id: 10,
  num: 'S2-03',
  title: 'FUNCTIONS',
  name: 'Functions',
  desc: 'Name a block of code, call it anywhere. The single biggest leap in programming: DRY, composition, and building software from tiny machines.',
  skill: 'SKILL: Functions + Abstraction + Composition',
  hints: [
    'A function is a machine: input goes in, output comes out. double(7) means "run double with x=7". What does x * 2 give you?',
    'double(double(3)) runs INSIDE-OUT. First solve the inner call, then feed the answer to the outer one.',
    'For is_hot(35): first convert 35°C to °F using the formula, then check if it is above 90.',
  ],
  run: async function() {
    state.missionState = { phase: 0 };

    await typeLines([
      { text: '[AI CORE — DEEPER LAYER]', cls: 'system' },
      { text: '[scanning] ████████████████████  100%', cls: 'system' },
      { text: '[BACKDOOR FOUND] Hidden in the function library.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Back in Season 1 you wrote programs line by line.', cls: 'purple' },
      { text: '          Every step, spelled out. That works... until your', cls: 'purple' },
      { text: '          program has a thousand steps. Then it is misery."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Today you learn the single biggest leap in all of', cls: 'purple' },
      { text: '          programming: the FUNCTION. A function is a block', cls: 'purple' },
      { text: '          of code you give a NAME. Once named, you can call', cls: 'purple' },
      { text: '          it anywhere, as many times as you want."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "VICTOR hid his backdoor inside a tangle of', cls: 'purple' },
      { text: '          copy-pasted code. If you can see why functions', cls: 'purple' },
      { text: '          beat copy-paste, you can untangle him. Ready?"', cls: 'purple' },
      { text: '', cls: '' },
    ]);

    runPhase();
  },
};

const TOTAL_PHASES = 4;

function runPhase() {
  const s = state.missionState;
  setPhaseProgress(s.phase + 1, TOTAL_PHASES);

  if (s.phase === 0) runPhase1();
  else if (s.phase === 1) runPhase2();
  else if (s.phase === 2) runPhase3();
  else if (s.phase === 3) runPhase4();
}

// ────────────────────────────────────────────────────────────
// PHASE 1: What is a function?
// ────────────────────────────────────────────────────────────
function runPhase1() {
  const s = state.missionState;

  addLine('╔══════════════════════════════════════════╗', 'highlight');
  addLine('║  ▶ PHASE 1 of 4 — WHAT IS A FUNCTION?    ║', 'highlight');
  addLine('╚══════════════════════════════════════════╝', 'highlight');
  addLine('', '');
  addLine('AI CORE: "Here is my first function. It is called DOUBLE."', 'purple');
  addLine('', '');
  addPre('   def double(x):\n       return x * 2');
  addLine('', '');
  addLine('AI CORE: "Read it like English. \'Define a function named', 'purple');
  addLine('          double. It takes one input, x. It returns x times 2.\'"', 'purple');
  addLine('', '');
  addLine('AI CORE: "Now I CALL the function by writing its name with a', 'purple');
  addLine('          value in parentheses."', 'purple');
  addLine('', '');
  addPre('     ┌──────────┐\n  7 ─▶│  double  │─▶ ?\n     └──────────┘\n         x * 2');
  addLine('', '');
  addLine('AI CORE: "What does double(7) return?"', 'purple');
  addLine('', '');
  addLine('Type the number:', 'warning');

  s.p1Step = 0;

  setCurrentInputHandler((input) => {
    const n = parseInt(input.trim());

    if (s.p1Step === 0) {
      if (n === 14) {
        sound.success();
        addLine('[YES] double(7) = 7 × 2 = 14. The machine ran. ✓', 'success');
        addLine('', '');
        addLine('AI CORE: "Good. Now here is the wild part. Functions can', 'purple');
        addLine('          be called INSIDE other function calls."', 'purple');
        addLine('', '');
        addPre('   double( double( 3 ) )\n     │        │\n     │        └─▶ runs first: double(3) = 6\n     │\n     └─▶ then runs: double(6) = ?');
        addLine('', '');
        addLine('AI CORE: "Solve it inside-out. What does double(double(3))', 'purple');
        addLine('          return?"', 'purple');
        addLine('', '');
        addLine('Type the number:', 'warning');
        s.p1Step = 1;
      } else {
        sound.denied();
        addLine('[NOT QUITE] The function says: return x * 2. When you call double(7), x becomes 7. So the output is 7 × 2. What\u2019s 7 × 2?', 'error');
      }
    } else if (s.p1Step === 1) {
      if (n === 12) {
        sound.success();
        addLine('[EXACTLY] double(3) = 6. Then double(6) = 12. ✓', 'success');
        addLine('', '');
        addLine('>>> PHASE 1 CLEARED <<<', 'success big');
        addLine('', '');
        addLine('AI CORE: "Remember those two ideas. A function is a', 'purple');
        addLine('          MACHINE — input in, output out. And the output of', 'purple');
        addLine('          one machine can become the input of another. You', 'purple');
        addLine('          just chained two machines together."', 'purple');
        s.phase = 1;
        setTimeout(runPhase, 1600);
      } else if (n === 6) {
        sound.denied();
        addLine('[HALF WAY] You solved the INNER call — double(3) = 6. But there\u2019s still an OUTER double wrapped around it. Now feed 6 into double again. What do you get?', 'error');
      } else {
        sound.denied();
        addLine('[WORK INSIDE-OUT] First: double(3) = ? Then: double of THAT answer. Two steps.', 'error');
      }
    }
  });
}

// ────────────────────────────────────────────────────────────
// PHASE 2: Why functions matter — DRY
// ────────────────────────────────────────────────────────────
function runPhase2() {
  const s = state.missionState;

  addLine('', '');
  addLine('╔══════════════════════════════════════════╗', 'highlight');
  addLine('║  ▶ PHASE 2 of 4 — WHY FUNCTIONS MATTER   ║', 'highlight');
  addLine('╚══════════════════════════════════════════╝', 'highlight');
  addLine('', '');
  addLine('AI CORE: "VICTOR\u2019s backdoor calculates tax on three prices.', 'purple');
  addLine('          Look how he wrote it WITHOUT functions:"', 'purple');
  addLine('', '');
  addPre('   # Price 1\n   subtotal = 10\n   tax = subtotal * 0.08\n   total = subtotal + tax\n   print(total)\n\n   # Price 2\n   subtotal = 25\n   tax = subtotal * 0.08\n   total = subtotal + tax\n   print(total)\n\n   # Price 3\n   subtotal = 50\n   tax = subtotal * 0.08\n   total = subtotal + tax\n   print(total)');
  addLine('', '');
  addLine('AI CORE: "Same four lines. Copied three times. Now the same', 'purple');
  addLine('          thing WITH a function:"', 'purple');
  addLine('', '');
  addPre('   def price_with_tax(subtotal):\n       tax = subtotal * 0.08\n       return subtotal + tax\n\n   print(price_with_tax(10))\n   print(price_with_tax(25))\n   print(price_with_tax(50))');
  addLine('', '');
  addLine('AI CORE: "Same result. But here is the test. Imagine the tax', 'purple');
  addLine('          rate just changed — it is now 0.09 instead of 0.08."', 'purple');
  addLine('', '');
  addLine('AI CORE: "In the WITHOUT-functions version, how many lines do', 'purple');
  addLine('          you have to change? In the WITH-function version?"', 'purple');
  addLine('', '');
  addLine('Type two numbers separated by a space (without with):', 'warning');
  addLine('(Example: if you think 9 and 2, type: 9 2)', 'info');

  setCurrentInputHandler((input) => {
    const parts = input.trim().split(/\s+/).map(n => parseInt(n));
    if (parts.length !== 2 || parts.some(isNaN)) {
      addLine('[FORMAT] Type two numbers with a space. Example: 3 1', 'error');
      return;
    }
    const [without, withFn] = parts;

    if (without === 3 && withFn === 1) {
      sound.success();
      addLine('', '');
      addLine('>>> 3 vs 1 <<<', 'success big');
      addLine('', '');
      addLine('AI CORE: "Three edits versus one. And that is a TINY', 'purple');
      addLine('          program. Real programs call functions thousands of', 'purple');
      addLine('          times. Fix once, fixed everywhere."', 'purple');
      addLine('', '');
      addLine('AI CORE: "This rule has a name: DRY — Don\u2019t Repeat Yourself.', 'purple');
      addLine('          Every time you catch yourself copy-pasting code,', 'purple');
      addLine('          a function wants to be born."', 'purple');
      addLine('', '');
      addLine('AI CORE: "Copy-paste is how bugs hide. You fix one copy and', 'purple');
      addLine('          forget the other two. Functions kill that whole', 'purple');
      addLine('          category of mistake."', 'purple');
      s.phase = 2;
      setTimeout(runPhase, 1800);
    } else if (without === 3 && withFn !== 1) {
      sound.denied();
      addLine('[HALF RIGHT] Yes — 3 copies without functions. But WITH a function, the tax rate appears in ONE place: inside the function definition. So how many lines to edit?', 'error');
    } else if (withFn === 1 && without !== 3) {
      sound.denied();
      addLine('[HALF RIGHT] Yes — one edit with the function. But WITHOUT it, how many copies of \u201csubtotal * 0.08\u201d are in VICTOR\u2019s code? Count them.', 'error');
    } else {
      sound.denied();
      addLine('[LOOK AGAIN] Count the lines containing \u201c* 0.08\u201d in each version. That is your answer.', 'error');
    }
  });
}

// ────────────────────────────────────────────────────────────
// PHASE 3: Functions with multiple inputs
// ────────────────────────────────────────────────────────────
function runPhase3() {
  const s = state.missionState;

  addLine('', '');
  addLine('╔══════════════════════════════════════════╗', 'highlight');
  addLine('║  ▶ PHASE 3 of 4 — MULTIPLE INPUTS        ║', 'highlight');
  addLine('╚══════════════════════════════════════════╝', 'highlight');
  addLine('', '');
  addLine('AI CORE: "So far your functions took one input. But most', 'purple');
  addLine('          functions take several. Look at this one:"', 'purple');
  addLine('', '');
  addPre('   def area(width, height):\n       return width * height');
  addLine('', '');
  addLine('AI CORE: "Two inputs this time. When you call it, you pass', 'purple');
  addLine('          both values in order."', 'purple');
  addLine('', '');
  addPre('            ┌────────┐\n   5, 3  ─▶│  area  │─▶ ?\n            └────────┘\n         width * height');
  addLine('', '');
  addLine('AI CORE: "What is area(5, 3)?"', 'purple');
  addLine('', '');
  addLine('Type the number:', 'warning');

  s.p3Step = 0;

  setCurrentInputHandler((input) => {
    if (s.p3Step === 0) {
      const n = parseInt(input.trim());
      if (n === 15) {
        sound.success();
        addLine('[CORRECT] area(5, 3) = 5 × 3 = 15. ✓', 'success');
        addLine('', '');
        addLine('AI CORE: "Now — here is the real power. Functions are not', 'purple');
        addLine('          just math. A function can do ANYTHING: loops,', 'purple');
        addLine('          decisions, printing, whatever. Watch this:"', 'purple');
        addLine('', '');
        addPre('   def greet(name, times):\n       i = 0\n       while i < times:\n           print("Hello, " + name + "!")\n           i = i + 1');
        addLine('', '');
        addLine('AI CORE: "A loop, tucked inside a function. Two inputs:', 'purple');
        addLine('          a name and a number of times."', 'purple');
        addLine('', '');
        addLine('AI CORE: "If I call greet("Ada", 3), how many lines of', 'purple');
        addLine('          output appear?"', 'purple');
        addLine('', '');
        addLine('Type the number:', 'warning');
        s.p3Step = 1;
      } else {
        sound.denied();
        addLine('[CHECK THE FORMULA] The function returns width * height. You passed width=5 and height=3. What\u2019s 5 × 3?', 'error');
      }
    } else if (s.p3Step === 1) {
      const n = parseInt(input.trim());
      if (n === 3) {
        sound.success();
        addLine('[YES] Three "Hello, Ada!" lines. The loop runs once per count. ✓', 'success');
        addLine('', '');
        addLine('>>> PHASE 3 CLEARED <<<', 'success big');
        addLine('', '');
        addLine('AI CORE: "Functions are mini-programs. They can contain', 'purple');
        addLine('          loops, decisions, other function calls — anything', 'purple');
        addLine('          a normal program can do. Think of them as', 'purple');
        addLine('          programs you can REUSE by name."', 'purple');
        s.phase = 3;
        setTimeout(runPhase, 1600);
      } else {
        sound.denied();
        addLine('[WATCH THE LOOP] The \u201ctimes\u201d input is 3. The while loop runs while i < 3, so it runs when i = 0, 1, 2. That\u2019s how many prints?', 'error');
      }
    }
  });
}

// ────────────────────────────────────────────────────────────
// PHASE 4: Building blocks — composition
// ────────────────────────────────────────────────────────────
function runPhase4() {
  const s = state.missionState;

  addLine('', '');
  addLine('╔══════════════════════════════════════════╗', 'highlight');
  addLine('║  ▶ PHASE 4 of 4 — BUILDING BLOCKS        ║', 'highlight');
  addLine('╚══════════════════════════════════════════╝', 'highlight');
  addLine('', '');
  addLine('AI CORE: "Last phase. The real magic of functions is that', 'purple');
  addLine('          they STACK. Small functions call other small', 'purple');
  addLine('          functions. Like LEGO blocks."', 'purple');
  addLine('', '');
  addPre('   def celsius_to_fahrenheit(c):\n       return c * 9 / 5 + 32\n\n   def is_hot(temp_c):\n       return celsius_to_fahrenheit(temp_c) > 90');
  addLine('', '');
  addLine('AI CORE: "Read carefully. is_hot takes a celsius temperature,', 'purple');
  addLine('          converts it to fahrenheit by CALLING the other', 'purple');
  addLine('          function, and checks if the result is above 90."', 'purple');
  addLine('', '');
  addLine('AI CORE: "Trace through is_hot(35) step by step:"', 'purple');
  addLine('', '');
  addPre('   STEP 1 — inner call:\n     celsius_to_fahrenheit(35)\n     = 35 * 9 / 5 + 32\n     = 63 + 32\n     = 95\n\n   STEP 2 — outer check:\n     is 95 > 90 ?');
  addLine('', '');
  addLine('AI CORE: "What does is_hot(35) return — TRUE or FALSE?"', 'purple');
  addLine('', '');
  addLine('Type TRUE or FALSE:', 'warning');

  setCurrentInputHandler((input) => {
    const ans = input.trim().toUpperCase();
    if (ans === 'TRUE') {
      sound.success();
      addLine('', '');
      addLine('>>> ALL 4 PHASES CLEARED <<<', 'success big');
      addLine('35°C = 95°F, and 95 > 90, so is_hot returns TRUE. ✓', 'success');
      addLine('', '');
      addLine('AI CORE: "See what you just did? You used one function to', 'purple');
      addLine('          BUILD another. celsius_to_fahrenheit is a tiny', 'purple');
      addLine('          block. is_hot is a block built FROM that block."', 'purple');
      addLine('', '');
      addLine('AI CORE: "Real software is not one giant program. It is', 'purple');
      addLine('          THOUSANDS of tiny functions calling each other.', 'purple');
      addLine('          A web browser is millions of them. A game engine,', 'purple');
      addLine('          tens of millions."', 'purple');
      addLine('', '');
      addLine('AI CORE: "Every one of them is just: take some input, do a', 'purple');
      addLine('          small job, return an output. LEGO blocks, all the', 'purple');
      addLine('          way down."', 'purple');
      addLine('', '');
      addLine('╔══════════════════════════════════════╗', 'system');
      addLine('║    [FUNCTION LIBRARY SEALED]         ║', 'system');
      addLine('║   ABSTRACTION + DRY + COMPOSITION    ║', 'system');
      addLine('╚══════════════════════════════════════╝', 'system');
      addLine('', '');
      addLine('AI CORE: "Three ideas you will use every single day of', 'purple');
      addLine('          programming: name your code, don\u2019t repeat yourself,', 'purple');
      addLine('          and build big things from small things."', 'purple');
      setCurrentInputHandler(null);
      setTimeout(() => completeMission(10), 1800);
    } else if (ans === 'FALSE') {
      sound.denied();
      addLine('[CHECK STEP 2] You had the formula right if you got this far: 35 * 9 / 5 + 32 = 95. Now compare: is 95 greater than 90? If yes, is_hot returns TRUE.', 'error');
    } else {
      sound.denied();
      addLine('[TYPE TRUE OR FALSE] is_hot returns a comparison result. 95 > 90 is either TRUE or FALSE.', 'error');
    }
  });
}
