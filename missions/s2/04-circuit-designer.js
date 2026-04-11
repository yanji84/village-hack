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
  title: 'CIRCUIT DESIGNER',
  name: 'Circuit Designer',
  desc: 'Fill entire truth tables. Discover the XOR gate. Build a half-adder from scratch.',
  skill: 'SKILL: Truth Tables + Circuit Design',
  hints: [
    "Don't try to describe what the gate DOES in words. Look at the pattern. When is the output 1?",
    'For the half-adder \u2014 compare the SUM column to AND, OR, and XOR outputs. Which one matches?',
    'There are only 4 rows in a 2-input truth table. You can check every row by hand.',
  ],
  run: async function() {
    state.missionState = { phase: 0, hintIdx: 0 };

    await typeLines([
      { text: '[ADVANCED FIREWALL] Multiple gates wired together.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'AI CORE: "In Season 1, you solved single gates \u2014 one AND,', cls: 'purple' },
      { text: '          one OR, one NOT. Real firewalls use many gates at', cls: 'purple' },
      { text: '          once, wired together into circuits."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "To crack a circuit, engineers use something called', cls: 'purple' },
      { text: '          a TRUTH TABLE. It lists EVERY possible combination', cls: 'purple' },
      { text: '          of inputs, and what the circuit outputs for each.', cls: 'purple' },
      { text: '          If you can fill in the whole table, you own the', cls: 'purple' },
      { text: '          circuit."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Two inputs means four possible worlds: both off,', cls: 'purple' },
      { text: '          first on, second on, both on. In each world, you', cls: 'purple' },
      { text: '          ask: what does the circuit do?"', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "There are three phases ahead. One: fill a truth', cls: 'purple' },
      { text: '          table. Two: discover a gate I haven\'t shown you', cls: 'purple' },
      { text: '          yet. Three: build something remarkable from what', cls: 'purple' },
      { text: '          you learn."', cls: 'purple' },
      { text: '', cls: '' },
    ]);

    runS2M4Phase();
  },
};

function runS2M4Phase() {
  const s = state.missionState;
  setPhaseProgress(s.phase + 1, 3);

  if (s.phase === 0) {
    // Fill a truth table
    addLine('\u2501\u2501\u2501 Phase 1: Fill the Truth Table \u2501\u2501\u2501', 'highlight');
    addLine('AI CORE: "Here is your first circuit. It combines two gates:"', 'purple');
    addLine('', '');
    addLine('            (A AND B) OR (NOT A)', 'info');
    addLine('', '');
    addLine('AI CORE: "Walk each row slowly. For each row, first compute', 'purple');
    addLine('          (A AND B). Then compute (NOT A). Then OR the two', 'purple');
    addLine('          results together. That\'s your output for that row."', 'purple');
    addPre('  A | B | Output\n  0 | 0 |   ?\n  0 | 1 |   ?\n  1 | 0 |   ?\n  1 | 1 |   ?');
    addLine('AI CORE: "Type the four outputs in order, top to bottom,', 'purple');
    addLine('          separated by spaces. Example: 0 1 0 1"', 'purple');

    setCurrentInputHandler((input) => {
      const vals = input.trim().split(/\s+/).map(Number);
      // A=0,B=0: (0 AND 0) OR (NOT 0) = 0 OR 1 = 1
      // A=0,B=1: (0 AND 1) OR (NOT 0) = 0 OR 1 = 1
      // A=1,B=0: (1 AND 0) OR (NOT 1) = 0 OR 0 = 0
      // A=1,B=1: (1 AND 1) OR (NOT 1) = 1 OR 0 = 1
      const expected = [1, 1, 0, 1];
      if (vals.length === 4 && vals.every((v, i) => v === expected[i])) {
        sound.success();
        addLine('[CORRECT] Perfect truth table!', 'success');
        addLine('A=0 makes NOT A = 1, so output is always 1 unless A=1 AND B=0.', 'info');
        s.phase = 1;
        addLine('');
        setTimeout(runS2M4Phase, 800);
      } else {
        sound.denied();
        addLine('[WRONG] Evaluate each row carefully. Remember NOT flips 0\u21941.', 'error');
      }
    });
  } else if (s.phase === 1) {
    // Discover XOR
    addLine('\u2501\u2501\u2501 Phase 2: Discover the Mystery Gate \u2501\u2501\u2501', 'highlight');
    addLine('AI CORE: "I\'m going to show you a gate without telling you', 'purple');
    addLine('          its name. See if you can spot the rule it follows."', 'purple');
    addLine('', '');
    addLine('AI CORE: "Here\'s the gate\'s truth table:"', 'purple');
    addPre('  A | B | Output\n  0 | 0 |   0\n  0 | 1 |   1\n  1 | 0 |   1\n  1 | 1 |   0');
    addLine('', '');
    addLine('AI CORE: "Look at the pattern. When is the output 1? When is', 'purple');
    addLine('          it 0? Is there a simple rule that describes it?"', 'purple');
    addLine('', '');
    addLine('AI CORE: "Here are four possible rules. Pick the one that', 'purple');
    addLine('          matches the table exactly."', 'purple');
    addLine('  A) Output is 1 when both inputs are 1', 'info');
    addLine('  B) Output is 1 when inputs are the SAME', 'info');
    addLine('  C) Output is 1 when inputs are DIFFERENT', 'info');
    addLine('  D) Output is 1 when at least one input is 1', 'info');
    addLine('(Type the letter A, B, C, or D)', 'info');

    setCurrentInputHandler((input) => {
      if (input.toUpperCase().trim() === 'C') {
        sound.success();
        addLine('[CORRECT] You found it.', 'success');
        addLine('AI CORE: "Output is 1 when inputs DISAGREE. This gate is', 'purple');
        addLine('          called XOR \u2014 short for \'eXclusive OR\'. Most', 'purple');
        addLine('          people never learn it exists. But XOR is the', 'purple');
        addLine('          secret heart of modern encryption AND computer', 'purple');
        addLine('          arithmetic. You just met a superstar."', 'purple');
        s.phase = 2;
        addLine('');
        setTimeout(runS2M4Phase, 900);
      } else {
        sound.denied();
        addLine('[WRONG] Look at each row of the table. When does a 1 appear?', 'error');
      }
    });
  } else if (s.phase === 2) {
    // Half-adder
    addLine('\u2501\u2501\u2501 Phase 3: Build a Half-Adder \u2501\u2501\u2501', 'highlight');
    addLine('AI CORE: "Now watch this. I\'m going to show you how every', 'purple');
    addLine('          computer on Earth adds numbers. From nothing but', 'purple');
    addLine('          the gates you already know."', 'purple');
    addLine('', '');
    addLine('AI CORE: "When you add two bits, you get two outputs: a SUM', 'purple');
    addLine('          (what you write down in the current column) and a', 'purple');
    addLine('          CARRY (what you pass to the next column). Here\'s', 'purple');
    addLine('          every possible case:"', 'purple');
    addPre('  0 + 0 = 00   (sum=0, carry=0)\n  0 + 1 = 01   (sum=1, carry=0)\n  1 + 0 = 01   (sum=1, carry=0)\n  1 + 1 = 10   (sum=0, carry=1)');
    addLine('', '');
    addLine('AI CORE: "Look at just the SUM column across those four', 'purple');
    addLine('          rows: 0, 1, 1, 0. Now look at just the CARRY', 'purple');
    addLine('          column: 0, 0, 0, 1. Each of those patterns matches', 'purple');
    addLine('          a gate you already know. Which gate gives you SUM?', 'purple');
    addLine('          Which gate gives you CARRY?"', 'purple');
    addLine('(Answer: <sum_gate> <carry_gate>  \u2014 options are AND, OR, XOR, NOT)', 'info');

    setCurrentInputHandler((input) => {
      const parts = input.toUpperCase().trim().split(/\s+/);
      if (parts.length === 2 && parts[0] === 'XOR' && parts[1] === 'AND') {
        sound.success();
        addLine('[CORRECT] SUM = A XOR B, CARRY = A AND B', 'success');
        addLine('AI CORE: "You did it. You just built a HALF-ADDER. This', 'purple');
        addLine('          exact circuit is inside every computer ever', 'purple');
        addLine('          made. Chain a few of these together and you', 'purple');
        addLine('          can add numbers of any size. A CPU with billions', 'purple');
        addLine('          of these is what lets you play video games."', 'purple');
        addLine('AI CORE: "From two gates. That is what computer science', 'purple');
        addLine('          really is."', 'purple');
        setCurrentInputHandler(null);
        setTimeout(() => completeMission(11), 1500);
      } else {
        sound.denied();
        addLine('[WRONG] Compare the SUM column to each gate\'s output. Which matches?', 'error');
      }
    });
  }
}
