// missions/s1/05-logic-gates.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setCurrentInputHandler,
  completeMission,
} from '../../engine.js';

const gatePuzzles = [
  {
    desc: 'Gate 1: Simple AND gate',
    explain: 'AND means BOTH inputs must be 1 to output 1.\n\n  A \u2500\u2500\u2510\n      \u251c\u2500[AND]\u2500\u2500 Output\n  B \u2500\u2500\u2518\n\nTruth table:\n  0 AND 0 = 0\n  0 AND 1 = 0\n  1 AND 0 = 0\n  1 AND 1 = 1',
    question: 'Set A and B so the output is 1. Type: A B (example: 1 0)',
    check: (a, b) => (a & b) === 1,
    answer: '1 1',
  },
  {
    desc: 'Gate 2: OR gate',
    explain: 'OR means AT LEAST ONE input must be 1.\n\n  A \u2500\u2500\u2510\n      \u251c\u2500[OR]\u2500\u2500 Output\n  B \u2500\u2500\u2518\n\nTruth table:\n  0 OR 0 = 0\n  0 OR 1 = 1\n  1 OR 0 = 1\n  1 OR 1 = 1',
    question: 'The firewall is checking: A OR B = 1. But A is stuck at 0!\nWhat should B be? Type: 0 B',
    check: (a, b) => a === 0 && (a | b) === 1,
    answer: '0 1',
  },
  {
    desc: 'Gate 3: NOT gate',
    explain: 'NOT flips the value: NOT 1 = 0, NOT 0 = 1\n\n  A \u2500\u2500[NOT]\u2500\u2500 Output',
    question: 'The lock needs: NOT A = 1. What should A be? Type just the value.',
    check: (a) => a === 0,
    answer: '0',
    single: true,
  },
  {
    desc: 'Gate 4: Combined - AND + NOT',
    explain: 'Now combine them!\n\n  A \u2500\u2500[NOT]\u2500\u2500\u2510\n             \u251c\u2500[AND]\u2500\u2500 Output\n  B \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n\nSo it\'s: (NOT A) AND B',
    question: 'Make the output 1. Type: A B',
    check: (a, b) => ((1-a) & b) === 1,
    answer: '0 1',
  },
  {
    desc: 'Gate 5: Final Lock - OR + AND',
    explain: 'The final firewall!\n\n  A \u2500\u2500\u2510\n      \u251c\u2500[OR]\u2500\u2500\u2510\n  B \u2500\u2500\u2518       \u251c\u2500[AND]\u2500\u2500 Output\n  C \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n\nSo it\'s: (A OR B) AND C',
    question: 'Make the output 1. Type: A B C',
    check: (a, b, c) => ((a | b) & c) === 1,
    answers: ['1 0 1', '0 1 1', '1 1 1'],
  },
];

export const mission = {
  id: 4,
  num: '05',
  title: 'LOGIC GATES',
  name: 'Logic Gates',
  desc: 'Learn how computers DECIDE things \u2014 using AND, OR, NOT. Then build a calculator from gates.',
  skill: 'SKILL: Boolean Logic + Building Hardware',
  hints: [
    'Work backward. The gate wants an output of 1. What inputs would make it happy?',
    'Read the definition of the gate one more time. The rule tells you the answer.',
    'For some gates there is more than one valid input. Any correct combo works.',
  ],
  run: async function() {
    state.missionState = { phase: 0, hintIdx: 0 };

    await typeLines([
      { text: '[TRAFFIC CONTROL OFFLINE] Firewall blocking access.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Computers don\'t just store data and follow steps.', cls: 'highlight' },
      { text: '        They make DECISIONS. And every decision a computer', cls: 'highlight' },
      { text: '        makes comes down to three simple rules. You already', cls: 'highlight' },
      { text: '        know them \u2014 you just don\'t know their names yet."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);

    runLogicPhase();
  },
};

function runLogicPhase() {
  const s = state.missionState;

  if (s.phase === 0) {
    // Phase 1: AND — discover via real-world scenario
    addLine('\u2501\u2501\u2501 Rule 1: AND \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "Your parent says: you can go outside IF you\'ve', 'highlight');
    addLine('        finished homework AND cleaned your room. BOTH', 'highlight');
    addLine('        must be done. Not one \u2014 both."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "Let\'s check every possibility. Use 1 for YES,', 'highlight');
    addLine('        0 for NO."', 'highlight');
    addLine('', '');

    const andScenarios = [
      { hw: 0, room: 0, answer: 0 },
      { hw: 0, room: 1, answer: 0 },
      { hw: 1, room: 0, answer: 0 },
      { hw: 1, room: 1, answer: 1 },
    ];
    s.andIdx = 0;
    s.andScenarios = andScenarios;
    showAndScenario();

  } else if (s.phase === 1) {
    // Phase 2: OR — discover
    addLine('\u2501\u2501\u2501 Rule 2: OR \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "Different rule. You can have dessert if you eat', 'highlight');
    addLine('        your vegetables OR your fruit. Either one is', 'highlight');
    addLine('        enough. Both is fine too."', 'highlight');
    addLine('', '');

    const orScenarios = [
      { veg: 0, fruit: 0, answer: 0 },
      { veg: 0, fruit: 1, answer: 1 },
      { veg: 1, fruit: 0, answer: 1 },
      { veg: 1, fruit: 1, answer: 1 },
    ];
    s.orIdx = 0;
    s.orScenarios = orScenarios;
    showOrScenario();

  } else if (s.phase === 2) {
    // Phase 3: NOT — simplest
    addLine('\u2501\u2501\u2501 Rule 3: NOT \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "Simplest one. NOT just flips the answer.', 'highlight');
    addLine('        Raining? Stay inside. NOT raining? Go outside."', 'highlight');
    addLine('', '');
    addLine('  If raining = 1, what is NOT raining?', 'warning');

    s.notStep = 0;
    setCurrentInputHandler((input) => {
      const n = parseInt(input.trim());
      if (s.notStep === 0) {
        if (n === 0) {
          sound.success();
          addLine('[CORRECT] NOT 1 = 0. Flip it.', 'success');
          addLine('', '');
          addLine('  If raining = 0, what is NOT raining?', 'warning');
          s.notStep = 1;
        } else {
          sound.denied();
          addLine('[WRONG] NOT flips. 1 becomes...?', 'error');
        }
      } else {
        if (n === 1) {
          sound.success();
          addLine('[CORRECT] NOT 0 = 1.', 'success');
          addLine('', '');
          addLine('NEXUS: "NOT just flips: 1\u21920, 0\u21921. That\'s the whole rule."', 'highlight');
          addLine('', '');
          addLine('NEXUS: "Three rules. AND, OR, NOT. Every decision every', 'highlight');
          addLine('        computer ever makes is built from these three.', 'highlight');
          addLine('        Let\'s use them together."', 'highlight');
          s.phase = 3;
          addLine('');
          setTimeout(runLogicPhase, 800);
        } else {
          sound.denied();
          addLine('[WRONG] NOT flips. 0 becomes...?', 'error');
        }
      }
    });

  } else if (s.phase === 3) {
    // Phase 4: Combined puzzle
    addLine('\u2501\u2501\u2501 Firewall Lock \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "The firewall has a combination lock. It opens when:"', 'highlight');
    addLine('', '');
    addPre('  (key AND badge) OR override = 1');
    addLine('', '');
    addLine('NEXUS: "You don\'t have the key (key = 0). You DO have a', 'highlight');
    addLine('        badge (badge = 1). Should you use the override?"', 'highlight');
    addLine('', '');
    addLine('What should override be? (0 or 1)', 'warning');

    setCurrentInputHandler((input) => {
      const n = parseInt(input.trim());
      if (n === 1) {
        sound.success();
        addLine('[CORRECT] key=0 AND badge=1 = 0. So you need override=1.', 'success');
        addLine('  0 OR 1 = 1. Firewall opens!', 'success');
        addLine('', '');
        addLine('NEXUS: "You combined AND and OR to solve a real problem.', 'highlight');
        addLine('        Now for the mind-blowing part."', 'highlight');
        s.phase = 4;
        addLine('');
        setTimeout(runLogicPhase, 800);
      } else {
        sound.denied();
        addLine('[WRONG] key AND badge = 0 AND 1 = 0. So (0) OR override must equal 1.', 'error');
        addLine('  What does override need to be for (0 OR override) = 1?', 'info');
      }
    });

  } else if (s.phase === 4) {
    // Phase 5: Build a binary adder from gates
    addLine('\u2501\u2501\u2501 Building a Calculator \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "Now I\'m going to show you something that connects', 'highlight');
    addLine('        everything. How does a computer actually ADD numbers?"', 'highlight');
    addLine('', '');
    addLine('NEXUS: "In binary, there are only 4 possible additions:"', 'highlight');
    addLine('', '');
    addPre('  0 + 0 = 0\n  0 + 1 = 1\n  1 + 0 = 1\n  1 + 1 = 10   \u2190 write 0, carry 1 to next column');
    addLine('', '');
    addLine('NEXUS: "That last one is like 5+5=10 in decimal. The column', 'highlight');
    addLine('        overflows, so you write 0 and CARRY 1 to the left."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "Now here\'s the trick. When you add two bits, you', 'highlight');
    addLine('        get TWO outputs: the SUM digit and the CARRY digit.', 'highlight');
    addLine('        Let me put them side by side:"', 'highlight');
    addLine('', '');
    addPre('  A  B  \u2502  SUM  CARRY\n  \u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  0  0  \u2502   0    0\n  0  1  \u2502   1    0\n  1  0  \u2502   1    0\n  1  1  \u2502   0    1');
    addLine('', '');
    addLine('NEXUS: "Look at the CARRY column. It\'s only 1 when BOTH', 'highlight');
    addLine('        A and B are 1. Sound familiar?"', 'highlight');
    addLine('', '');
    addLine('Which gate matches the CARRY column? (AND, OR, or NOT)', 'warning');

    s.adderStep = 0;
    setCurrentInputHandler((input) => {
      const guess = input.toUpperCase().trim();
      if (s.adderStep === 0) {
        if (guess === 'AND') {
          sound.success();
          addLine('[CORRECT] CARRY = A AND B.', 'success');
          addLine('', '');
          addLine('NEXUS: "Now the SUM column: 0, 1, 1, 0. Look at when', 'highlight');
          addLine('        SUM is 1 \u2014 it\'s 1 when A and B are DIFFERENT.', 'highlight');
          addLine('        When they\'re the same (both 0 or both 1), SUM is 0."', 'highlight');
          addLine('', '');
          addLine('NEXUS: "That pattern has a name: XOR. Exclusive OR.', 'highlight');
          addLine('        Regular OR says \'at least one.\' XOR says \'exactly', 'highlight');
          addLine('        one \u2014 not both.\'"', 'highlight');
          addLine('', '');
          addPre('  Compare:\n    OR:   0,1,1,1   \u2190 1 when at least one is 1\n    XOR:  0,1,1,0   \u2190 1 when EXACTLY one is 1');
          addLine('', '');
          addLine('NEXUS: "So SUM = A XOR B, CARRY = A AND B. Two gates,', 'highlight');
          addLine('        and you have a circuit that adds binary numbers.', 'highlight');
          addLine('        Here\'s what it looks like:"', 'highlight');
          addLine('', '');
          addPre('  THE HALF-ADDER CIRCUIT\n  \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\n        A \u2500\u2500\u252c\u2500\u2500 [XOR] \u2500\u2500\u25ba SUM\n            \u2502\n        B \u2500\u2500\u253c\u2500\u2500 [AND] \u2500\u2500\u25ba CARRY\n\n  Two inputs (A, B) \u2192 Two outputs (SUM, CARRY)\n  That\'s the complete circuit.');
          addLine('', '');
          addLine('NEXUS: "Let\'s test it. If A=1 and B=1, what does the', 'highlight');
          addLine('        circuit output?"', 'highlight');
          addLine('', '');
          addLine('  1 XOR 1 = ? (same or different? \u2192 same \u2192 0)', 'info');
          addLine('  1 AND 1 = ? (both 1? \u2192 yes \u2192 1)', 'info');
          addLine('', '');
          addLine('Type: SUM CARRY', 'warning');
          s.adderStep = 1;
        } else {
          sound.denied();
          addLine('[WRONG] CARRY is only 1 in the last row \u2014 when BOTH inputs are 1. Which gate does that?', 'error');
        }
      } else if (s.adderStep === 1) {
        const parts = input.trim().split(/[\s,]+/).map(Number);
        if (parts.length === 2 && parts[0] === 0 && parts[1] === 1) {
          sound.success();
          addLine('[CORRECT] SUM=0, CARRY=1. That\'s binary 10 = decimal 2.', 'success');
          addLine('  1 + 1 = 2. The circuit works!', 'success');
          addLine('', '');
          addLine('NEXUS: "Let\'s try one more. A=1, B=0:"', 'highlight');
          addLine('  1 XOR 0 = ? (different? \u2192 yes \u2192 1)', 'info');
          addLine('  1 AND 0 = ? (both 1? \u2192 no \u2192 0)', 'info');
          addLine('', '');
          addLine('Type: SUM CARRY', 'warning');
          s.adderStep = 2;
        } else {
          sound.denied();
          addLine('[WRONG] XOR: are 1 and 1 different? No \u2192 0. AND: are both 1? Yes \u2192 1.', 'error');
        }
      } else {
        const parts = input.trim().split(/[\s,]+/).map(Number);
        if (parts.length === 2 && parts[0] === 1 && parts[1] === 0) {
          sound.success();
          addLine('[CORRECT] SUM=1, CARRY=0. That\'s just 1. Because 1+0=1.', 'success');
          addLine('', '');
          addPre('  THE HALF-ADDER\n  \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n        A \u2500\u2500\u252c\u2500\u2500 [XOR] \u2500\u2500\u25ba SUM\n        B \u2500\u2500\u253c\u2500\u2500 [AND] \u2500\u2500\u25ba CARRY\n\n  This circuit adds any two binary digits.\n  Chain several together and you can add\n  numbers of ANY size.');
          addLine('', '');
          addLine('NEXUS: "This is called a HALF-ADDER. It\'s inside every', 'highlight');
          addLine('        computer ever made. Your phone has about 15', 'highlight');
          addLine('        BILLION of these, running 3 billion times per', 'highlight');
          addLine('        second. But each one is exactly what you just', 'highlight');
          addLine('        built \u2014 an XOR and an AND. Two gates."', 'highlight');
          addLine('', '');
          addLine('NEXUS: "AND, OR, NOT. Three rules. Enough to build XOR.', 'highlight');
          addLine('        Enough to build a calculator. Enough to build', 'highlight');
          addLine('        every computer on Earth. Not metaphorically.', 'highlight');
          addLine(`        Literally. And you, ${state.hackerName || 'kid'}, just proved it."`, 'highlight');
          addLine('', '');
          addLine('[ Type NEXT to continue ]', 'warning');
          setCurrentInputHandler(() => {
            setCurrentInputHandler(null);
            completeMission(4);
          });
        } else {
          sound.denied();
          addLine('[WRONG] XOR: are 1 and 0 different? Yes \u2192 1. AND: are both 1? No \u2192 0.', 'error');
        }
      }
    });
  }
}

function showAndScenario() {
  const s = state.missionState;
  const sc = s.andScenarios[s.andIdx];
  const hwLabel = sc.hw ? 'YES' : 'NO';
  const roomLabel = sc.room ? 'YES' : 'NO';

  addLine(`  Homework: ${hwLabel} (${sc.hw})   Room clean: ${roomLabel} (${sc.room})`, 'info');
  addLine('  Can you go outside? (1=yes, 0=no)', 'warning');

  setCurrentInputHandler((input) => {
    const n = parseInt(input.trim());
    if (n === sc.answer) {
      sound.success();
      addLine(`  [CORRECT] ${sc.hw} AND ${sc.room} = ${sc.answer}`, 'success');
      s.andIdx++;
      if (s.andIdx >= s.andScenarios.length) {
        addLine('', '');
        addLine('NEXUS: "You checked every possibility. AND means:', 'highlight');
        addLine('        BOTH must be 1 for the answer to be 1.', 'highlight');
        addLine('        One rule down, two to go."', 'highlight');
        s.phase = 1;
        addLine('');
        setTimeout(runLogicPhase, 800);
      } else {
        addLine('');
        showAndScenario();
      }
    } else {
      sound.denied();
      if (sc.hw === 0 || sc.room === 0) {
        addLine('  [WRONG] BOTH must be done. Is one of them still NO?', 'error');
      } else {
        addLine('  [WRONG] Both are done! Can you go?', 'error');
      }
    }
  });
}

function showOrScenario() {
  const s = state.missionState;
  const sc = s.orScenarios[s.orIdx];
  const vegLabel = sc.veg ? 'YES' : 'NO';
  const fruitLabel = sc.fruit ? 'YES' : 'NO';

  addLine(`  Veggies: ${vegLabel} (${sc.veg})   Fruit: ${fruitLabel} (${sc.fruit})`, 'info');
  addLine('  Dessert? (1=yes, 0=no)', 'warning');

  setCurrentInputHandler((input) => {
    const n = parseInt(input.trim());
    if (n === sc.answer) {
      sound.success();
      addLine(`  [CORRECT] ${sc.veg} OR ${sc.fruit} = ${sc.answer}`, 'success');
      s.orIdx++;
      if (s.orIdx >= s.orScenarios.length) {
        addLine('', '');
        addLine('NEXUS: "OR means: at least ONE must be 1. Both is fine', 'highlight');
        addLine('        too. Only fails when NEITHER is 1."', 'highlight');
        s.phase = 2;
        addLine('');
        setTimeout(runLogicPhase, 800);
      } else {
        addLine('');
        showOrScenario();
      }
    } else {
      sound.denied();
      if (sc.veg === 0 && sc.fruit === 0) {
        addLine('  [WRONG] Neither veggies nor fruit. No dessert.', 'error');
      } else {
        addLine('  [WRONG] At least one is done \u2014 that\'s enough for OR.', 'error');
      }
    }
  });
}
