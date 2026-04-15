// missions/s2/06-code-tracer.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission,
} from '../../engine.js';

export const mission = {
  id: 13,
  num: 'S2-06',
  title: 'CIRCUITS',
  name: 'Circuits',
  desc: 'Fill full truth tables. Discover the XOR gate. Build a half-adder from two gates.',
  skill: 'SKILL: Truth Tables + Half-Adders',
  hints: [
    'Phase 1: walk each row carefully. Compute (A AND B) first, then (NOT A), then OR them. Start with A=0,B=0 on paper.',
    'Phase 2: ignore gate names. Just look at WHEN the output is 1 — is it when inputs match, or when they disagree?',
    'Phase 3: compare the SUM column (0,1,1,0) and CARRY column (0,0,0,1) to AND, OR, XOR tables. One matches each.',
  ],
  run: async function() {
    state.missionState = { phase: 0, hintIdx: 0 };

    await typeLines([
      { text: '[ADVANCED FIREWALL] Multiple gates wired together.', cls: 'system' },
      { text: '[scanning] ████████░░░░░░░░░░░░  38%', cls: 'system' },
      { text: '[scanning] ██████████████████░░  91%', cls: 'system' },
      { text: '[scanning] ████████████████████  100%', cls: 'system' },
      { text: '[CIRCUIT MATRIX EXPOSED]', cls: 'system' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Back in Season 1, you cracked single gates —', cls: 'purple' },
      { text: '          one AND, one OR, one NOT. That was the warm up."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Victor\u2019s firewall wires DOZENS of gates together into', cls: 'purple' },
      { text: '          circuits. To crack one, engineers build a TRUTH', cls: 'purple' },
      { text: '          TABLE \u2014 every possible input combination on the', cls: 'purple' },
      { text: '          left, the circuit\'s output on the right."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Two inputs means four worlds: both off, first on,', cls: 'purple' },
      { text: '          second on, both on. Fill every row and the circuit', cls: 'purple' },
      { text: '          has no secrets left."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Three phases. Fill a table. Discover a gate I', cls: 'purple' },
      { text: '          haven\'t shown you yet. Then build something that', cls: 'purple' },
      { text: '          lives inside every computer on Earth."', cls: 'purple' },
      { text: '', cls: '' },
    ]);

    runPhase();
  },
};

function runPhase() {
  const s = state.missionState;
  setPhaseProgress(s.phase + 1, 3);

  if (s.phase === 0) {
    // Phase 1: Fill a truth table
    addLine('╔══════════════════════════════════════╗', 'highlight');
    addLine('║  ▶ PHASE 1 of 3 — FILL THE TABLE     ║', 'highlight');
    addLine('╚══════════════════════════════════════╝', 'highlight');
    addLine('', '');
    addLine('AI CORE: "Your first circuit. Two gates wired together —', 'purple');
    addLine('          an AND and a NOT, joined by an OR."', 'purple');
    addLine('', '');
    addPre('            ┌───────┐\n     A ────▶│  AND  │──┐\n            └───────┘  │   ┌──────┐\n     B ────────────┘   ├──▶│  OR  │──▶ OUTPUT\n                       │   └──────┘\n            ┌───────┐  │\n     A ────▶│  NOT  │──┘\n            └───────┘\n\n          Formula:  (A AND B) OR (NOT A)');
    addLine('', '');
    addLine('AI CORE: "Walk each row slowly. Compute (A AND B) first.', 'purple');
    addLine('          Then (NOT A). Then OR those two results together."', 'purple');
    addLine('', '');
    addPre('  A | B | A AND B | NOT A | Output\n  0 | 0 |    ?    |   ?   |   ?\n  0 | 1 |    ?    |   ?   |   ?\n  1 | 0 |    ?    |   ?   |   ?\n  1 | 1 |    ?    |   ?   |   ?');
    addLine('', '');
    addLine('Type the four outputs in order, top to bottom,', 'warning');
    addLine('separated by spaces. Example:  0 1 0 1', 'warning');

    s.hintIdx = 0;

    setCurrentInputHandler((input) => {
      const vals = input.trim().split(/\s+/).map(Number);
      // A=0,B=0: (0 AND 0) OR (NOT 0) = 0 OR 1 = 1
      // A=0,B=1: (0 AND 1) OR (NOT 0) = 0 OR 1 = 1
      // A=1,B=0: (1 AND 0) OR (NOT 1) = 0 OR 0 = 0
      // A=1,B=1: (1 AND 1) OR (NOT 1) = 1 OR 0 = 1
      const expected = [1, 1, 0, 1];
      if (vals.length === 4 && vals.every((v, i) => v === expected[i])) {
        sound.success();
        addLine('', '');
        addLine('>>> TRUTH TABLE COMPLETE <<<', 'success big');
        addLine('', '');
        addPre('  A | B | A AND B | NOT A | Output\n  0 | 0 |    0    |   1   |   1   ✓\n  0 | 1 |    0    |   1   |   1   ✓\n  1 | 0 |    0    |   0   |   0   ✓\n  1 | 1 |    1    |   0   |   1   ✓');
        addLine('', '');
        addLine('AI CORE: "See the pattern? NOT A is 1 whenever A is 0, so', 'purple');
        addLine('          the output is ALWAYS 1 — except the one row where', 'purple');
        addLine('          A is on and B is off. One tiny dark spot in a', 'purple');
        addLine('          field of light. That\'s what the circuit DOES."', 'purple');
        addLine('', '');
        addLine('AI CORE: "You didn\'t memorize that. You computed it. That\'s', 'purple');
        addLine('          how every chip designer on Earth verifies their', 'purple');
        addLine('          work before burning it into silicon. Truth tables', 'purple');
        addLine('          crack ANY circuit, no matter how complex."', 'purple');
        addLine('', '');
        addLine('[PHASE 1 CLEARED — loading phase 2...]', 'system');
        s.phase = 1;
        s.hintIdx = 0;
        addLine('');
        setTimeout(runPhase, 1800);
      } else {
        sound.denied();
        s.hintIdx = (s.hintIdx || 0) + 1;
        if (vals.length !== 4 || vals.some(v => v !== 0 && v !== 1)) {
          addLine('[FORMAT] I need exactly four numbers, each 0 or 1, separated by spaces. Like: 1 1 0 1', 'error');
        } else if (s.hintIdx === 1) {
          const wrongRows = vals.map((v, i) => v !== expected[i] ? i : -1).filter(i => i >= 0);
          const rowLabels = ['A=0,B=0', 'A=0,B=1', 'A=1,B=0', 'A=1,B=1'];
          addLine(`[CLOSE] Row(s) off: ${wrongRows.map(i => rowLabels[i]).join(', ')}. Recompute (A AND B) OR (NOT A) for that row.`, 'error');
        } else if (s.hintIdx === 2) {
          addLine('[HINT] Try row A=0, B=0: (0 AND 0) = 0. (NOT 0) = 1. 0 OR 1 = 1. So row 1 is 1. Do the same for the others.', 'error');
        } else {
          addLine('[WALKTHROUGH] Row by row: (0,0)→0 OR 1 = 1. (0,1)→0 OR 1 = 1. (1,0)→0 OR 0 = 0. (1,1)→1 OR 0 = 1. Answer: 1 1 0 1', 'error');
        }
      }
    });
  } else if (s.phase === 1) {
    // Phase 2: Discover XOR
    addLine('╔══════════════════════════════════════╗', 'highlight');
    addLine('║  ▶ PHASE 2 of 3 — THE MYSTERY GATE   ║', 'highlight');
    addLine('╚══════════════════════════════════════╝', 'highlight');
    addLine('', '');
    addLine('AI CORE: "Now the fun part. I haven\'t shown you this gate', 'purple');
    addLine('          yet. No name, no description. Just its behavior."', 'purple');
    addLine('', '');
    addLine('AI CORE: "See if you can figure out its rule just by looking', 'purple');
    addLine('          at the pattern."', 'purple');
    addLine('', '');
    addPre('  ┌──────────────────────┐\n  │  ???  MYSTERY GATE   │\n  ├──────────────────────┤\n  │   A | B | Output     │\n  │   0 | 0 |   0        │\n  │   0 | 1 |   1        │\n  │   1 | 0 |   1        │\n  │   1 | 1 |   0        │\n  └──────────────────────┘');
    addLine('', '');
    addLine('AI CORE: "Study the rows. When does a 1 appear? When does a', 'purple');
    addLine('          0 appear? There\'s a simple rule hiding in there."', 'purple');
    addLine('', '');
    addLine('  A) Output is 1 when BOTH inputs are 1', 'info');
    addLine('  B) Output is 1 when inputs are the SAME', 'info');
    addLine('  C) Output is 1 when inputs are DIFFERENT', 'info');
    addLine('  D) Output is 1 when AT LEAST ONE input is 1', 'info');
    addLine('', '');
    addLine('Type A, B, C, or D:', 'warning');

    s.hintIdx = 0;

    setCurrentInputHandler((input) => {
      const ans = input.toUpperCase().trim();
      if (ans === 'C') {
        sound.success();
        addLine('', '');
        addLine('>>> MYSTERY GATE IDENTIFIED <<<', 'success big');
        addLine('', '');
        addLine('AI CORE: "You found it. Output is 1 when the inputs', 'purple');
        addLine('          DISAGREE. Same inputs → 0. Different → 1."', 'purple');
        addLine('', '');
        addLine('[DECLASSIFIED] This gate has a name.', 'system');
        addLine('', '');
        addPre('   ╔═══════════════════════════════════════╗\n   ║                                       ║\n   ║       X O R    ( eXclusive OR )       ║\n   ║                                       ║\n   ║    "one or the other, but not both"   ║\n   ║                                       ║\n   ╚═══════════════════════════════════════╝');
        addLine('', '');
        addLine('AI CORE: "Most people go their whole lives without learning', 'purple');
        addLine('          this gate exists. It\'s not taught in school. It\'s', 'purple');
        addLine('          not in movies. But listen to where XOR lives:"', 'purple');
        addLine('', '');
        addLine('  ▸ ENCRYPTION — every message app, every HTTPS connection,', 'info');
        addLine('    every password you\'ve ever sent is scrambled with XOR.', 'info');
        addLine('  ▸ ERROR DETECTION — the "parity bit" in your RAM, your', 'info');
        addLine('    hard drive, your internet packets — XOR is how your', 'info');
        addLine('    computer notices when a bit got corrupted.', 'info');
        addLine('  ▸ COMPUTER ARITHMETIC — the math you are about to do', 'info');
        addLine('    in Phase 3. Every number a CPU adds uses XOR.', 'info');
        addLine('', '');
        addLine('AI CORE: "One tiny gate. Three industries. You just', 'purple');
        addLine('          discovered one of the most important ideas in', 'purple');
        addLine('          computing — and you did it from a table of four', 'purple');
        addLine('          rows. No one had to tell you."', 'purple');
        addLine('', '');
        addLine('[PHASE 2 CLEARED — accessing final phase...]', 'system');
        s.phase = 2;
        s.hintIdx = 0;
        addLine('');
        setTimeout(runPhase, 1800);
      } else if (ans === 'A') {
        sound.denied();
        addLine('[NOT QUITE] "Both inputs 1" is the AND gate. Check row A=1,B=1 — this gate outputs 0 there. That rules A out.', 'error');
      } else if (ans === 'B') {
        sound.denied();
        addLine('[FLIPPED] Look again — when A=0,B=0 (same), the output is 0. Same inputs give 0, not 1. You\'re describing the OPPOSITE of the pattern.', 'error');
      } else if (ans === 'D') {
        sound.denied();
        addLine('[CLOSE — but that\'s OR] "At least one input is 1" means A=1,B=1 would also give 1. This gate gives 0 there. Look at that last row.', 'error');
      } else {
        sound.denied();
        addLine('[TYPE A, B, C, or D] Which rule matches the table? Focus on when the output is 1.', 'error');
      }
    });
  } else if (s.phase === 2) {
    // Phase 3: Half-adder
    addLine('╔══════════════════════════════════════╗', 'highlight');
    addLine('║  ▶ PHASE 3 of 3 — BUILD A HALF-ADDER ║', 'highlight');
    addLine('╚══════════════════════════════════════╝', 'highlight');
    addLine('', '');
    addLine('AI CORE: "Watch closely. I\'m about to show you how every', 'purple');
    addLine('          computer in the world adds numbers. Using nothing', 'purple');
    addLine('          but the gates you already know."', 'purple');
    addLine('', '');
    addLine('AI CORE: "Add two bits. You get two outputs: a SUM (what you', 'purple');
    addLine('          write in this column) and a CARRY (what rolls over', 'purple');
    addLine('          to the next column). Like normal addition — 7+5=12,', 'purple');
    addLine('          you write 2, carry the 1."', 'purple');
    addLine('', '');
    addPre('   Binary addition — all four cases:\n\n     0 + 0 = 00    sum=0   carry=0\n     0 + 1 = 01    sum=1   carry=0\n     1 + 0 = 01    sum=1   carry=0\n     1 + 1 = 10    sum=0   carry=1   ← rolls over!');
    addLine('', '');
    addLine('AI CORE: "Now line up the SUM column and the CARRY column', 'purple');
    addLine('          across those four rows:"', 'purple');
    addLine('', '');
    addPre('   A | B | SUM | CARRY\n   0 | 0 |  0  |   0\n   0 | 1 |  1  |   0\n   1 | 0 |  1  |   0\n   1 | 1 |  0  |   1\n\n         ↑       ↑\n     Pattern:  Pattern:\n     0,1,1,0   0,0,0,1');
    addLine('', '');
    addLine('AI CORE: "Each of those patterns IS a gate you already know.', 'purple');
    addLine('          Which gate produces 0,1,1,0? Which produces 0,0,0,1?"', 'purple');
    addLine('', '');
    addLine('Options: AND, OR, XOR, NOT', 'info');
    addLine('Type: <sum_gate> <carry_gate>   (example:  OR AND)', 'warning');

    s.hintIdx = 0;

    setCurrentInputHandler((input) => {
      const parts = input.toUpperCase().trim().split(/\s+/);
      if (parts.length === 2 && parts[0] === 'XOR' && parts[1] === 'AND') {
        sound.success();
        addLine('', '');
        addLine('>>> HALF-ADDER CONSTRUCTED <<<', 'success big');
        addLine('', '');
        addLine('     SUM  = A XOR B    CARRY = A AND B', 'success');
        addLine('', '');
        addPre('       A ──┬────────┐\n            │        │\n            │    ┌───▼───┐\n            ├───▶│  XOR  │──────▶ SUM\n            │    └───────┘\n       B ──┼────────┐\n            │        │\n            │    ┌───▼───┐\n            └───▶│  AND  │──────▶ CARRY\n                 └───────┘\n\n              T H E   H A L F - A D D E R');
        addLine('', '');
        addLine('AI CORE: "That\'s it. That\'s the whole thing. Two gates, two', 'purple');
        addLine('          wires each. This circuit is inside every CPU ever', 'purple');
        addLine('          built."', 'purple');
        addLine('', '');
        addLine('AI CORE: "And here\'s the real magic — chain half-adders', 'purple');
        addLine('          together, feeding each CARRY into the next column,', 'purple');
        addLine('          and you can add numbers of ANY size. 32 bits.', 'purple');
        addLine('          64 bits. A billion bits. Same two gates, copied."', 'purple');
        addLine('', '');
        addPre('    column 3   column 2   column 1   column 0\n   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐\n   │ ADDER  │◀│ ADDER  │◀│ ADDER  │◀│ ADDER  │\n   └────────┘ └────────┘ └────────┘ └────────┘\n       ▲          ▲          ▲          ▲\n    carries ripple up the chain — that\'s a CPU');
        addLine('', '');
        addLine('AI CORE: "Two gates. That\'s all it takes to add. Every', 'purple');
        addLine('          calculator. Every computer. Every phone. Every', 'purple');
        addLine('          spreadsheet cell, every video game score, every', 'purple');
        addLine('          GPS route — this is how they all add numbers."', 'purple');
        addLine('', '');
        addLine('AI CORE: "You didn\'t copy it out of a textbook. You', 'purple');
        addLine('          DERIVED it. You looked at binary addition, spotted', 'purple');
        addLine('          two patterns, matched them to gates. That is', 'purple');
        addLine('          what computer science actually is."', 'purple');
        addLine('', '');
        addLine('╔══════════════════════════════════════╗', 'system');
        addLine('║     [ADVANCED FIREWALL DISARMED]     ║', 'system');
        addLine('║       CIRCUIT MATRIX BYPASSED        ║', 'system');
        addLine('╚══════════════════════════════════════╝', 'system');
        setCurrentInputHandler(null);
        setTimeout(() => completeMission(13), 2000);
      } else {
        sound.denied();
        s.hintIdx = (s.hintIdx || 0) + 1;
        if (parts.length !== 2) {
          addLine('[FORMAT] Two gate names, separated by a space. First the SUM gate, then the CARRY gate. Example: OR AND', 'error');
        } else if (parts[0] === 'AND' && parts[1] === 'XOR') {
          addLine('[FLIPPED] You have them backwards! You named the right two gates — just swap the order. SUM first, then CARRY.', 'error');
        } else if (s.hintIdx === 1) {
          addLine('[HINT] Start with CARRY: 0,0,0,1 — only a 1 when BOTH inputs are 1. Which gate does that?', 'error');
        } else if (s.hintIdx === 2) {
          addLine('[WALKTHROUGH] CARRY = 0,0,0,1 matches AND (only 1 when both are 1). SUM = 0,1,1,0 matches the gate you just discovered — outputs 1 when inputs DIFFER.', 'error');
        } else {
          addLine('[ANSWER] Type: XOR AND  — SUM is XOR (0,1,1,0), CARRY is AND (0,0,0,1).', 'error');
        }
      }
    });
  }
}
