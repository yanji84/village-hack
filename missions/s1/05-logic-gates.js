// missions/s1/05-logic-gates.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setCurrentInputHandler,
  completeMission,
  sleep,
} from '../../engine.js';

/* ── Gate Widget helpers ─────────────────────────────────── */

function createGateWidget(gateType) {
  const w = document.createElement('div');
  w.className = 'gate-widget';
  Object.assign(w.style, {
    display: 'flex', alignItems: 'center', gap: '8px',
    margin: '10px 0', fontFamily: 'monospace',
  });

  const ioStyle = (label) => {
    const el = document.createElement('div');
    el.className = 'gate-io';
    el.dataset.label = label;
    el.textContent = '0';
    Object.assign(el.style, {
      width: '36px', height: '36px', borderRadius: '50%',
      border: '2px solid #333', background: '#111',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#00ff41', fontSize: '14px', fontWeight: 'bold',
      transition: 'all 0.3s', position: 'relative',
    });
    return el;
  };

  const arrow = () => {
    const a = document.createElement('div');
    a.className = 'gate-arrow';
    a.textContent = '→';
    a.style.color = '#005a15';
    a.style.fontSize = '18px';
    return a;
  };

  const inputs = document.createElement('div');
  inputs.className = 'gate-inputs';
  Object.assign(inputs.style, { display: 'flex', flexDirection: 'column', gap: '4px' });

  const isSingle = gateType === 'NOT';
  const inputA = ioStyle('A');
  inputs.appendChild(inputA);
  let inputB = null;
  if (!isSingle) {
    inputB = ioStyle('B');
    inputs.appendChild(inputB);
  }

  const box = document.createElement('div');
  box.className = 'gate-box';
  box.textContent = gateType;
  Object.assign(box.style, {
    border: '2px solid #00aa2a', padding: '8px 16px', borderRadius: '4px',
    fontWeight: 'bold', color: '#00ff41', transition: 'box-shadow 0.3s',
  });

  const output = ioStyle('OUT');
  output.className = 'gate-io gate-output';
  output.textContent = '?';

  w.appendChild(inputs);
  w.appendChild(arrow());
  w.appendChild(box);
  w.appendChild(arrow());
  w.appendChild(output);

  w._inputA = inputA;
  w._inputB = inputB;
  w._box = box;
  w._output = output;
  return w;
}

function setIoValue(el, val) {
  el.textContent = String(val);
  if (val === 1) {
    el.style.background = '#00ff41';
    el.style.borderColor = '#00ff41';
    el.style.boxShadow = '0 0 8px #00ff41';
    el.style.color = '#000';
  } else {
    el.style.background = '#111';
    el.style.borderColor = '#333';
    el.style.boxShadow = 'none';
    el.style.color = '#00ff41';
  }
}

function updateGateWidget(widget, a, b, output, animate) {
  setIoValue(widget._inputA, a);
  if (widget._inputB) setIoValue(widget._inputB, b);
  if (!animate) {
    if (output !== null && output !== undefined) setIoValue(widget._output, output);
    return;
  }
  // animation: pulse the gate box, then light output after delay
  widget._output.textContent = '?';
  widget._output.style.background = '#111';
  widget._output.style.borderColor = '#333';
  widget._output.style.boxShadow = 'none';
  widget._box.style.boxShadow = '0 0 12px #00ff41';
  setTimeout(() => {
    widget._box.style.boxShadow = 'none';
    setIoValue(widget._output, output);
  }, 350);
}

/* ── Half-Adder visual ──────────────────────────────────── */

function createHalfAdder() {
  const ha = document.createElement('div');
  ha.className = 'half-adder';
  Object.assign(ha.style, {
    display: 'grid', gridTemplateRows: 'auto auto', gap: '4px',
    margin: '12px 0', fontFamily: 'monospace',
  });

  const makeRow = (gateName, outputLabel) => {
    const row = document.createElement('div');
    Object.assign(row.style, { display: 'flex', alignItems: 'center', gap: '8px' });

    const inp = document.createElement('span');
    inp.className = 'ha-input';
    inp.textContent = gateName === 'XOR' ? 'A=?' : 'B=?';
    Object.assign(inp.style, { color: '#00ff41', minWidth: '36px' });

    const wire1 = document.createElement('span');
    wire1.className = 'ha-wire';
    wire1.textContent = '────';
    Object.assign(wire1.style, {
      color: '#333', transition: 'color 0.3s',
      backgroundClip: 'text', WebkitBackgroundClip: 'text',
    });

    const gate = document.createElement('span');
    gate.className = 'ha-gate';
    gate.textContent = gateName;
    Object.assign(gate.style, {
      border: '1px solid #00aa2a', padding: '2px 8px', borderRadius: '3px',
      color: '#00ff41', fontWeight: 'bold', transition: 'box-shadow 0.3s',
    });

    const wire2 = document.createElement('span');
    wire2.className = 'ha-wire';
    wire2.textContent = '────';
    Object.assign(wire2.style, { color: '#333', transition: 'color 0.3s' });

    const out = document.createElement('span');
    out.className = 'ha-output';
    out.textContent = `${outputLabel}=?`;
    Object.assign(out.style, { color: '#555', fontWeight: 'bold', transition: 'color 0.3s' });

    row.appendChild(inp);
    row.appendChild(wire1);
    row.appendChild(gate);
    row.appendChild(wire2);
    row.appendChild(out);

    return { row, inp, wire1, gate, wire2, out };
  };

  const xorRow = makeRow('XOR', 'SUM');
  const andRow = makeRow('AND', 'CARRY');

  ha.appendChild(xorRow.row);
  ha.appendChild(andRow.row);

  ha._xor = xorRow;
  ha._and = andRow;
  return ha;
}

async function animateHalfAdder(ha, a, b, sum, carry) {
  const terminal = document.getElementById('terminal');
  // Set inputs
  ha._xor.inp.textContent = `A=${a}`;
  ha._and.inp.textContent = `B=${b}`;
  ha._xor.inp.style.color = a ? '#00ff41' : '#555';
  ha._and.inp.style.color = b ? '#00ff41' : '#555';

  // Animate wires (step 1: input wires light up)
  await sleep(200);
  ha._xor.wire1.style.color = '#00ff41';
  ha._and.wire1.style.color = '#00ff41';

  // Gates pulse
  await sleep(200);
  ha._xor.gate.style.boxShadow = '0 0 8px #00ff41';
  ha._and.gate.style.boxShadow = '0 0 8px #00ff41';

  // Output wires
  await sleep(200);
  ha._xor.gate.style.boxShadow = 'none';
  ha._and.gate.style.boxShadow = 'none';
  ha._xor.wire2.style.color = '#00ff41';
  ha._and.wire2.style.color = '#00ff41';

  // Outputs
  await sleep(200);
  ha._xor.out.textContent = `SUM=${sum}`;
  ha._xor.out.style.color = sum ? '#00ff41' : '#555';
  ha._and.out.textContent = `CARRY=${carry}`;
  ha._and.out.style.color = carry ? '#00ff41' : '#555';

  if (terminal) terminal.scrollTop = terminal.scrollHeight;
}

function addReplayButton(container, animationFn) {
  const btn = document.createElement('span');
  btn.textContent = '[ replay ]';
  btn.style.cssText = 'color: var(--cyan, #00ffff); cursor: pointer; font-size: 11px; opacity: 0.6; transition: opacity 0.2s; margin-top: 4px; display: inline-block;';
  btn.onmouseenter = () => btn.style.opacity = '1';
  btn.onmouseleave = () => btn.style.opacity = '0.6';
  btn.onclick = () => animationFn();
  container.appendChild(btn);
  const terminal = document.getElementById('terminal');
  if (terminal) terminal.scrollTop = terminal.scrollHeight;
}

function resetHalfAdder(ha) {
  ha._xor.inp.textContent = 'A=?'; ha._xor.inp.style.color = '#00ff41';
  ha._and.inp.textContent = 'B=?'; ha._and.inp.style.color = '#00ff41';
  [ha._xor, ha._and].forEach(r => {
    r.wire1.style.color = '#333';
    r.wire2.style.color = '#333';
    r.gate.style.boxShadow = 'none';
    r.out.style.color = '#555';
  });
  ha._xor.out.textContent = 'SUM=?';
  ha._and.out.textContent = 'CARRY=?';
}

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
      { text: 'NEXUS: "The AI\'s decision system is exposed. If someone', cls: 'highlight' },
      { text: '        sabotaged it, the gates will show us HOW. But', cls: 'highlight' },
      { text: '        first you need to learn how computers decide."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Every decision a computer makes comes down to', cls: 'highlight' },
      { text: '        three simple rules. You already know them \u2014', cls: 'highlight' },
      { text: '        you just don\'t know their names yet."', cls: 'highlight' },
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
    // Create AND gate widget
    s.andWidget = createGateWidget('AND');
    const terminal = document.getElementById('terminal');
    terminal.appendChild(s.andWidget);
    terminal.scrollTop = terminal.scrollHeight;
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
    // Create OR gate widget
    s.orWidget = createGateWidget('OR');
    const terminal = document.getElementById('terminal');
    terminal.appendChild(s.orWidget);
    terminal.scrollTop = terminal.scrollHeight;
    showOrScenario();

  } else if (s.phase === 2) {
    // Phase 3: NOT — simplest
    addLine('\u2501\u2501\u2501 Rule 3: NOT \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "Simplest one. NOT just flips the answer.', 'highlight');
    addLine('        Raining? Stay inside. NOT raining? Go outside."', 'highlight');
    addLine('', '');
    // Create NOT gate widget
    s.notWidget = createGateWidget('NOT');
    const terminalNot = document.getElementById('terminal');
    terminalNot.appendChild(s.notWidget);
    terminalNot.scrollTop = terminalNot.scrollHeight;

    addLine('  If raining = 1, what is NOT raining?', 'warning');

    s.notStep = 0;
    setCurrentInputHandler((input) => {
      const n = parseInt(input.trim());
      if (s.notStep === 0) {
        if (n === 0) {
          sound.success();
          if (s.notWidget) updateGateWidget(s.notWidget, 1, 0, 0, true);
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
          if (s.notWidget) updateGateWidget(s.notWidget, 0, 0, 1, true);
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
          addLine('NEXUS: "Now the SUM column. Look at the pattern:"', 'highlight');
          addLine('', '');
          addPre('  A  B  \u2502  SUM\n  \u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\n  0  0  \u2502   0\n  0  1  \u2502   1\n  1  0  \u2502   1\n  1  1  \u2502   0');
          addLine('', '');
          addLine('NEXUS: "It\'s not AND (that would be 0,0,0,1). It\'s not', 'highlight');
          addLine('        OR (that would be 0,1,1,1). So what IS it?"', 'highlight');
          addLine('', '');
          addLine('When is SUM = 1? Pick one:', 'warning');
          addLine('  A) when both inputs are 1', 'info');
          addLine('  B) when at least one input is 1', 'info');
          addLine('  C) when the inputs are DIFFERENT', 'info');
          addLine('  D) when both inputs are 0', 'info');
          s.adderStep = 1;
        } else {
          sound.denied();
          addLine('[WRONG] CARRY is only 1 in the last row \u2014 when BOTH inputs are 1. Which gate does that?', 'error');
        }
      } else if (s.adderStep === 1) {
        // Kid discovers XOR
        if (guess === 'C') {
          sound.success();
          addLine('[CORRECT] SUM = 1 when the inputs are DIFFERENT.', 'success');
          addLine('', '');
          addLine('NEXUS: "That pattern has a name: XOR. Exclusive OR.', 'highlight');
          addLine('        Regular OR says \'at least one.\' XOR says', 'highlight');
          addLine('        \'exactly one \u2014 not both.\'"', 'highlight');
          addLine('', '');
          addPre('  Compare:\n    OR:   0,1,1,1   \u2190 at least one is 1\n    XOR:  0,1,1,0   \u2190 EXACTLY one is 1 (not both)');
          addLine('', '');
          addLine('NEXUS: "So: SUM = XOR, CARRY = AND. Two gates, and', 'highlight');
          addLine('        you have a circuit that adds binary numbers:"', 'highlight');
          addLine('', '');
          addPre('  THE HALF-ADDER CIRCUIT\n  \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\n        A \u2500\u2500\u252c\u2500\u2500 [XOR] \u2500\u2500\u25ba SUM\n            \u2502\n        B \u2500\u2500\u253c\u2500\u2500 [AND] \u2500\u2500\u25ba CARRY\n\n  Two inputs (A, B) \u2192 Two outputs (SUM, CARRY)');
          // Create half-adder visual
          s.halfAdder = createHalfAdder();
          s.halfAdderWrapper = document.createElement('div');
          s.halfAdderWrapper.appendChild(s.halfAdder);
          const haTerminal = document.getElementById('terminal');
          haTerminal.appendChild(s.halfAdderWrapper);
          haTerminal.scrollTop = haTerminal.scrollHeight;
          addLine('', '');
          addLine('NEXUS: "Let\'s test it. A=1, B=1:"', 'highlight');
          addLine('  XOR: are 1 and 1 different? \u2192 SUM = ?', 'info');
          addLine('  AND: are both 1? \u2192 CARRY = ?', 'info');
          addLine('', '');
          addLine('Type: SUM CARRY', 'warning');
          s.adderStep = 2;
        } else if (guess === 'A') {
          sound.denied();
          addLine('[WRONG] That\'s AND (0,0,0,1). SUM is 0,1,1,0 \u2014 look at which rows have 1.', 'error');
        } else if (guess === 'B') {
          sound.denied();
          addLine('[WRONG] That\'s OR (0,1,1,1). SUM is 0,1,1,0 \u2014 the last row is different.', 'error');
        } else {
          sound.denied();
          addLine('[WRONG] Look at rows 2 and 3: A and B are different, SUM is 1. Row 4: same, SUM is 0.', 'error');
        }
      } else if (s.adderStep === 2) {
        // Test: 1+1
        const parts = input.trim().split(/[\s,]+/).map(Number);
        if (parts.length === 2 && parts[0] === 0 && parts[1] === 1) {
          sound.success();
          // Animate half-adder: A=1, B=1 -> SUM=0, CARRY=1
          if (s.halfAdder) {
            animateHalfAdder(s.halfAdder, 1, 1, 0, 1);
            // Remove any previous replay button
            const oldBtn = s.halfAdderWrapper.querySelector('span');
            if (oldBtn && oldBtn.textContent === '[ replay ]') oldBtn.remove();
            addReplayButton(s.halfAdderWrapper, async () => {
              resetHalfAdder(s.halfAdder);
              await animateHalfAdder(s.halfAdder, 1, 1, 0, 1);
            });
          }
          addLine('[CORRECT] SUM=0, CARRY=1. Binary 10 = decimal 2.', 'success');
          addLine('  1 + 1 = 2. The circuit works!', 'success');
          addLine('', '');
          addLine('NEXUS: "One more. A=1, B=0:"', 'highlight');
          addLine('  XOR: different? \u2192 SUM = ?', 'info');
          addLine('  AND: both 1? \u2192 CARRY = ?', 'info');
          addLine('', '');
          addLine('Type: SUM CARRY', 'warning');
          s.adderStep = 3;
        } else {
          sound.denied();
          addLine('[WRONG] 1 and 1 are the SAME \u2192 XOR = 0. Both are 1 \u2192 AND = 1.', 'error');
        }
      } else {
        const parts = input.trim().split(/[\s,]+/).map(Number);
        if (parts.length === 2 && parts[0] === 1 && parts[1] === 0) {
          sound.success();
          // Animate half-adder: A=1, B=0 -> SUM=1, CARRY=0
          if (s.halfAdder) {
            resetHalfAdder(s.halfAdder);
            animateHalfAdder(s.halfAdder, 1, 0, 1, 0);
            // Remove any previous replay button
            const oldBtn = s.halfAdderWrapper.querySelector('span');
            if (oldBtn && oldBtn.textContent === '[ replay ]') oldBtn.remove();
            addReplayButton(s.halfAdderWrapper, async () => {
              resetHalfAdder(s.halfAdder);
              await animateHalfAdder(s.halfAdder, 1, 0, 1, 0);
            });
          }
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
          addLine('NEXUS: "Look at this \u2014 the AI\'s math circuits are FINE.', 'highlight');
          addLine('        Its adder works perfectly. But its DECISION gates', 'highlight');
          addLine('        were rewired. Someone changed the AI\'s logic from', 'highlight');
          addLine('        the outside. This wasn\'t a malfunction. It was', 'highlight');
          addLine('        sabotage."', 'highlight');
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

  // Update gate widget inputs (no animation yet)
  if (s.andWidget) updateGateWidget(s.andWidget, sc.hw, sc.room, null, false);
  if (s.andWidget) { s.andWidget._output.textContent = '?'; s.andWidget._output.style.background = '#111'; s.andWidget._output.style.borderColor = '#333'; s.andWidget._output.style.boxShadow = 'none'; }

  addLine(`  Homework: ${hwLabel} (${sc.hw})   Room clean: ${roomLabel} (${sc.room})`, 'info');
  addLine('  Can you go outside? (1=yes, 0=no)', 'warning');

  setCurrentInputHandler((input) => {
    const n = parseInt(input.trim());
    if (n === sc.answer) {
      sound.success();
      // Animate the gate widget on correct answer
      if (s.andWidget) updateGateWidget(s.andWidget, sc.hw, sc.room, sc.answer, true);
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

  // Update gate widget inputs
  if (s.orWidget) updateGateWidget(s.orWidget, sc.veg, sc.fruit, null, false);
  if (s.orWidget) { s.orWidget._output.textContent = '?'; s.orWidget._output.style.background = '#111'; s.orWidget._output.style.borderColor = '#333'; s.orWidget._output.style.boxShadow = 'none'; }

  addLine(`  Veggies: ${vegLabel} (${sc.veg})   Fruit: ${fruitLabel} (${sc.fruit})`, 'info');
  addLine('  Dessert? (1=yes, 0=no)', 'warning');

  setCurrentInputHandler((input) => {
    const n = parseInt(input.trim());
    if (n === sc.answer) {
      sound.success();
      // Animate the gate widget on correct answer
      if (s.orWidget) updateGateWidget(s.orWidget, sc.veg, sc.fruit, sc.answer, true);
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
