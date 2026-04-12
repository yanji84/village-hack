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
    display: 'flex', flexDirection: 'column', gap: '6px',
    margin: '12px 0', padding: '12px', fontFamily: "'Fira Mono',monospace",
    border: '1px solid #005a15', borderRadius: '4px', background: '#050505',
  });

  // Title
  const title = document.createElement('div');
  title.textContent = 'HALF-ADDER CIRCUIT';
  Object.assign(title.style, { color: '#00aa2a', fontSize: '10px', letterSpacing: '2px', marginBottom: '4px' });
  ha.appendChild(title);

  const makeRow = (gateName, outputLabel) => {
    const row = document.createElement('div');
    Object.assign(row.style, { display: 'flex', alignItems: 'center', gap: '8px' });

    const inp = document.createElement('span');
    inp.className = 'ha-input';
    inp.textContent = 'A=? B=?';
    Object.assign(inp.style, { color: '#00ff41', minWidth: '72px' });

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
  // Set inputs — both gates receive both A and B
  ha._xor.inp.textContent = `A=${a} B=${b}`;
  ha._and.inp.textContent = `A=${a} B=${b}`;
  ha._xor.inp.style.color = (a || b) ? '#00ff41' : '#555';
  ha._and.inp.style.color = (a || b) ? '#00ff41' : '#555';

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
  btn.className = 'replay-btn';
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
  ha._xor.inp.textContent = 'A=? B=?'; ha._xor.inp.style.color = '#00ff41';
  ha._and.inp.textContent = 'A=? B=?'; ha._and.inp.style.color = '#00ff41';
  [ha._xor, ha._and].forEach(r => {
    r.wire1.style.color = '#333';
    r.wire2.style.color = '#333';
    r.gate.style.boxShadow = 'none';
    r.out.style.color = '#555';
  });
  ha._xor.out.textContent = 'SUM=?';
  ha._and.out.textContent = 'CARRY=?';
}

export const mission = {
  id: 4,
  num: '05',
  title: 'LOGIC GATES',
  name: 'Logic Gates',
  desc: 'Learn how computers DECIDE things \u2014 using AND, OR, NOT. Then build a calculator from gates.',
  skill: 'SKILL: Boolean Logic + Building Hardware',
  hints: [
    'Think about the gate\'s rule. AND needs BOTH to be 1. OR needs at LEAST one. NOT flips.',
    'Try tracing through step by step: what does the first gate produce? Feed that into the next.',
    'For the half-adder: XOR outputs 1 when inputs are DIFFERENT. AND outputs 1 when BOTH are 1.',
  ],
  run: async function() {
    state.missionState = { phase: 0, hintIdx: 0 };

    await typeLines([
      { text: '[TRAFFIC CONTROL OFFLINE] Firewall blocking access.', cls: 'system' },
      { text: '[ANALYZING DECISION CIRCUITS...]', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "We\'re inside the AI\'s brain now. Every decision', cls: 'highlight' },
      { text: '        it makes \u2014 stop or go, allow or block, fire or', cls: 'highlight' },
      { text: '        hold \u2014 flows through tiny switches called logic', cls: 'highlight' },
      { text: '        gates. Something corrupted them. We need to', cls: 'highlight' },
      { text: '        understand how they work to find the damage."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Here\'s what\'s wild: every computer ever built', cls: 'highlight' },
      { text: '        runs on just THREE rules. You already use them', cls: 'highlight' },
      { text: '        every day \u2014 you just don\'t know their names yet."', cls: 'highlight' },
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
    addLine('NEXUS: "Imagine your parent says: you can go outside IF', 'highlight');
    addLine('        you\'ve finished homework AND cleaned your room.', 'highlight');
    addLine('        Not one or the other \u2014 BOTH. Skip either one', 'highlight');
    addLine('        and you\'re stuck inside."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "Let\'s test every combination. In computer logic,', 'highlight');
    addLine('        1 means YES/TRUE and 0 means NO/FALSE."', 'highlight');
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
    addLine('NEXUS: "New rule, different vibe. You can have dessert', 'highlight');
    addLine('        if you eat your vegetables OR your fruit.', 'highlight');
    addLine('        Eat one? Dessert. Eat both? Still dessert.', 'highlight');
    addLine('        OR is generous \u2014 it only says NO when you', 'highlight');
    addLine('        eat NOTHING."', 'highlight');
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
    addLine('NEXUS: "Last rule, and it\'s the simplest. AND and OR', 'highlight');
    addLine('        take two inputs. NOT only takes ONE \u2014 and', 'highlight');
    addLine('        flips it. ON becomes OFF. OFF becomes ON.', 'highlight');
    addLine('        Like pressing a light switch."', 'highlight');
    addLine('', '');
    // Create NOT gate widget
    s.notWidget = createGateWidget('NOT');
    const terminalNot = document.getElementById('terminal');
    terminalNot.appendChild(s.notWidget);
    terminalNot.scrollTop = terminalNot.scrollHeight;

    addLine('  It\'s raining (raining = 1). What is NOT raining?', 'warning');

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
          addLine('[WRONG] It\'s raining (1). NOT flips it \u2014 what\'s the opposite of 1?', 'error');
        }
      } else {
        if (n === 1) {
          sound.success();
          if (s.notWidget) updateGateWidget(s.notWidget, 0, 0, 1, true);
          addLine('[CORRECT] NOT 0 = 1. The switch flips.', 'success');
          addLine('', '');
          addLine('NEXUS: "NOT is the simplest gate: 1 goes in, 0 comes', 'highlight');
          addLine('        out. 0 goes in, 1 comes out. That\'s it."', 'highlight');
          addLine('', '');
          addLine('NEXUS: "So here\'s the full picture:', 'highlight');
          addLine('        AND \u2014 BOTH must be 1', 'highlight');
          addLine('        OR  \u2014 at least ONE must be 1', 'highlight');
          addLine('        NOT \u2014 flip the value', 'highlight');
          addLine('', '');
          addLine('        These three rules are the foundation of EVERY', 'highlight');
          addLine('        computer ever built. Now let\'s combine them."', 'highlight');
          s.phase = 3;
          setCurrentInputHandler(null);
          addLine('');
          setTimeout(runLogicPhase, 1200);
        } else {
          sound.denied();
          addLine('[WRONG] It\'s NOT raining (0). Flip that switch \u2014 what\'s the opposite of 0?', 'error');
        }
      }
    });

  } else if (s.phase === 3) {
    // Phase 4: Combined puzzle
    addLine('\u2501\u2501\u2501 Firewall Lock \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "Time to think like a hacker. The firewall has', 'highlight');
    addLine('        a lock built from the gates you just learned:"', 'highlight');
    addLine('', '');
    addPre('  key \u2500\u2500\u2510\n       \u251c\u2500[AND]\u2500\u2500\u2510\n  badge\u2500\u2518        \u251c\u2500[OR]\u2500\u2500 OPEN?\n  override\u2500\u2500\u2500\u2500\u2500\u2500\u2518');
    addLine('', '');
    addPre('  Formula: (key AND badge) OR override = 1');
    addLine('', '');
    addLine('NEXUS: "Read the circuit left to right. First, key and', 'highlight');
    addLine('        badge go into an AND gate. Then THAT result', 'highlight');
    addLine('        and override go into an OR gate."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "You don\'t have the key (key = 0). You DO have a', 'highlight');
    addLine('        badge (badge = 1). The override is your call."', 'highlight');
    addLine('', '');
    addLine('  Hint: First figure out what key AND badge equals.', 'info');
    addLine('  Then decide what override needs to be for the OR gate.', 'info');
    addLine('', '');
    addLine('What should override be? (0 or 1)', 'warning');

    setCurrentInputHandler((input) => {
      const n = parseInt(input.trim());
      if (n === 1) {
        sound.success();
        addLine('[CORRECT] key=0 AND badge=1 = 0. So you need override=1.', 'success');
        addLine('  (0 AND 1) OR 1 = 0 OR 1 = 1. Firewall opens!', 'success');
        addLine('', '');
        addLine('NEXUS: "You just traced a signal through TWO gates', 'highlight');
        addLine('        to find a backdoor. That\'s not just logic \u2014', 'highlight');
        addLine('        that\'s how real security systems get analyzed.', 'highlight');
        addLine('        Now let me show you the mind-blowing part."', 'highlight');
        s.phase = 4;
        addLine('');
        setTimeout(runLogicPhase, 1200);
      } else {
        sound.denied();
        addLine('[WRONG] Trace the circuit step by step:', 'error');
        addLine('  Step 1: key AND badge = 0 AND 1 = ? (AND needs BOTH to be 1)', 'info');
        addLine('  Step 2: That result is 0. Now: 0 OR override must = 1.', 'info');
        addLine('  Step 3: What does override need to be for OR to output 1?', 'info');
      }
    });

  } else if (s.phase === 4) {
    // Phase 5: Build a binary adder from gates
    addLine('\u2501\u2501\u2501 Building a Calculator \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "Now I\'m going to show you something that', 'highlight');
    addLine('        connects EVERYTHING you\'ve learned. We\'re going', 'highlight');
    addLine('        to build a calculator \u2014 out of nothing but the', 'highlight');
    addLine('        logic gates you just mastered."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "In binary, adding two single digits only has', 'highlight');
    addLine('        four possibilities:"', 'highlight');
    addLine('', '');
    addPre('  0 + 0 = 0\n  0 + 1 = 1\n  1 + 0 = 1\n  1 + 1 = 10   \u2190 write 0, carry 1 to next column');
    addLine('', '');
    addLine('NEXUS: "That last one is like 5+5 in decimal \u2014 the', 'highlight');
    addLine('        answer is 10, so you write 0 in this column and', 'highlight');
    addLine('        CARRY the 1 to the next column. Same idea."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "So when you add two bits, you actually get', 'highlight');
    addLine('        TWO outputs: the SUM digit (this column) and', 'highlight');
    addLine('        the CARRY digit (next column). Watch:"', 'highlight');
    addLine('', '');
    addPre('  A  B  \u2502  SUM  CARRY\n  \u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  0  0  \u2502   0    0\n  0  1  \u2502   1    0\n  1  0  \u2502   1    0\n  1  1  \u2502   0    1');
    addLine('', '');
    addLine('NEXUS: "Now look JUST at the CARRY column. When is it', 'highlight');
    addLine('        1? Only when BOTH A and B are 1. Does that', 'highlight');
    addLine('        pattern remind you of a gate you learned?"', 'highlight');
    addLine('', '');
    addLine('Which gate produces the same pattern as CARRY? (AND, OR, or NOT)', 'warning');

    s.adderStep = 0;
    setCurrentInputHandler(async (input) => {
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
          addLine('[WRONG] Look at the CARRY column: 0, 0, 0, 1. It\'s only', 'error');
          addLine('  1 when BOTH A and B are 1. Which gate has that rule?', 'error');
        }
      } else if (s.adderStep === 1) {
        // Kid discovers XOR
        if (guess === 'C') {
          sound.success();
          addLine('[CORRECT] SUM = 1 when the inputs are DIFFERENT.', 'success');
          addLine('', '');
          addLine('NEXUS: "You just discovered a new gate! It\'s called', 'highlight');
          addLine('        XOR \u2014 Exclusive OR. Here\'s the difference:"', 'highlight');
          addLine('', '');
          addPre('   OR says: "at least one"    \u2192  0, 1, 1, 1\n  XOR says: "exactly one"     \u2192  0, 1, 1, 0\n                                          \u2191\n                              both are 1, so XOR says NO');
          addLine('', '');
          addLine('NEXUS: "XOR is actually built FROM the basic gates \u2014', 'highlight');
          addLine('        it\'s AND, OR, and NOT wired together. You can', 'highlight');
          addLine('        build complex things from simple parts!"', 'highlight');
          addLine('', '');
          addLine('NEXUS: "The key insight: SUM = A XOR B, CARRY = A AND B.', 'highlight');
          addLine('        Just two gates, and you have a calculator."', 'highlight');
          addLine('', '');
          // Create half-adder visual (replaces ASCII art)
          s.halfAdder = createHalfAdder();
          s.halfAdderWrapper = document.createElement('div');
          s.halfAdderWrapper.appendChild(s.halfAdder);
          const haTerminal = document.getElementById('terminal');
          haTerminal.appendChild(s.halfAdderWrapper);
          haTerminal.scrollTop = haTerminal.scrollHeight;
          addLine('', '');
          addLine('NEXUS: "Let\'s run our calculator. Adding A=1, B=1:"', 'highlight');
          addLine('', '');
          addLine('  Think it through:', 'info');
          addLine('  XOR: are 1 and 1 DIFFERENT? \u2192 SUM = ?', 'info');
          addLine('  AND: are BOTH 1?             \u2192 CARRY = ?', 'info');
          addLine('', '');
          addLine('Type two numbers: SUM CARRY (e.g., "0 1")', 'warning');
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
            await animateHalfAdder(s.halfAdder, 1, 1, 0, 1);
            // Remove any previous replay button
            const oldBtn = s.halfAdderWrapper.querySelector('.replay-btn');
            if (oldBtn) oldBtn.remove();
            addReplayButton(s.halfAdderWrapper, async () => {
              resetHalfAdder(s.halfAdder);
              await animateHalfAdder(s.halfAdder, 1, 1, 0, 1);
            });
          }
          addLine('[CORRECT] SUM=0, CARRY=1. Binary 10 = decimal 2.', 'success');
          addLine('  1 + 1 = 2. The circuit works!', 'success');
          addLine('', '');
          addLine('NEXUS: "One more test. A=1, B=0:"', 'highlight');
          addLine('', '');
          addLine('  XOR: are 1 and 0 DIFFERENT? \u2192 SUM = ?', 'info');
          addLine('  AND: are BOTH 1?             \u2192 CARRY = ?', 'info');
          addLine('', '');
          addLine('Type two numbers: SUM CARRY', 'warning');
          s.adderStep = 3;
        } else {
          sound.denied();
          addLine('[WRONG] Think step by step:', 'error');
          addLine('  XOR: are 1 and 1 different? No, they\'re the same \u2192 SUM = 0', 'error');
          addLine('  AND: are both 1? Yes \u2192 CARRY = 1', 'error');
        }
      } else {
        const parts = input.trim().split(/[\s,]+/).map(Number);
        if (parts.length === 2 && parts[0] === 1 && parts[1] === 0) {
          sound.success();
          // Animate half-adder: A=1, B=0 -> SUM=1, CARRY=0
          if (s.halfAdder) {
            resetHalfAdder(s.halfAdder);
            await animateHalfAdder(s.halfAdder, 1, 0, 1, 0);
            // Remove any previous replay button
            const oldBtn = s.halfAdderWrapper.querySelector('.replay-btn');
            if (oldBtn) oldBtn.remove();
            addReplayButton(s.halfAdderWrapper, async () => {
              resetHalfAdder(s.halfAdder);
              await animateHalfAdder(s.halfAdder, 1, 0, 1, 0);
            });
          }
          addLine('[CORRECT] SUM=1, CARRY=0. That\'s just 1. Because 1+0=1.', 'success');
          addLine('', '');
          addLine('NEXUS: "What you just built is called a HALF-ADDER.', 'highlight');
          addLine('        It\'s real. It\'s inside every computer ever', 'highlight');
          addLine('        made. Your phone has about 15 BILLION of', 'highlight');
          addLine('        these, running 3 billion times per second.', 'highlight');
          addLine('        But each one is exactly what you just built \u2014', 'highlight');
          addLine('        an XOR and an AND. Just two gates."', 'highlight');
          addLine('', '');
          addLine('NEXUS: "Think about that. AND, OR, NOT \u2014 three', 'highlight');
          addLine('        simple rules. From them you built XOR. From', 'highlight');
          addLine('        XOR and AND you built a calculator. From', 'highlight');
          addLine('        calculators, you build computers. From', 'highlight');
          addLine(`        computers, you build everything. And YOU,`, 'highlight');
          addLine(`        ${state.hackerName || 'hacker'}, just traced it back to the start."`, 'highlight');
          addLine('', '');
          addLine('[SCANNING AI DECISION CIRCUITS...]', 'system');
          addLine('[COMPARING GATE CONFIGURATIONS...]', 'system');
          addLine('[ANOMALY DETECTED]', 'system');
          addLine('', '');
          addLine('NEXUS: "Hold on. The AI\'s math circuits are fine \u2014', 'highlight');
          addLine('        its adder works perfectly. But look at its', 'highlight');
          addLine('        DECISION gates..."', 'highlight');
          addLine('', '');
          addLine('NEXUS: "An AND gate was swapped to OR. Think about', 'highlight');
          addLine('        what that means. The safety check used to say:', 'highlight');
          addLine('        \'proceed only if BOTH conditions are safe.\'', 'highlight');
          addLine('        Now it says \'proceed if EITHER one is safe.\'', 'highlight');
          addLine('        One tiny gate swap \u2014 and the AI skips half', 'highlight');
          addLine('        its safety checks. This wasn\'t a bug.', 'highlight');
          addLine('        It was sabotage."', 'highlight');
          addLine('', '');
          addLine('[ Type NEXT to continue ]', 'warning');
          setCurrentInputHandler((input) => {
            if (input.trim().toUpperCase() === 'NEXT') {
              setCurrentInputHandler(null);
              completeMission(4);
            } else {
              addLine('Type NEXT to continue.', 'info');
            }
          });
        } else {
          sound.denied();
          addLine('[WRONG] Think step by step:', 'error');
          addLine('  XOR: are 1 and 0 different? Yes! \u2192 SUM = 1', 'error');
          addLine('  AND: are both 1? No, B is 0 \u2192 CARRY = 0', 'error');
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
        addLine('NEXUS: "You just mapped out every possibility. That\'s', 'highlight');
        addLine('        called a TRUTH TABLE \u2014 every combination of', 'highlight');
        addLine('        inputs and what comes out. AND\'s rule is simple:', 'highlight');
        addLine('        BOTH inputs must be 1, or the output is 0."', 'highlight');
        addLine('', '');
        addLine('        \u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581', 'info');
        addLine('        Rule 1 locked in. Two more to go.', 'info');
        addLine('        \u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594', 'info');
        s.phase = 1;
        addLine('');
        setTimeout(runLogicPhase, 1200);
      } else {
        addLine('');
        showAndScenario();
      }
    } else {
      sound.denied();
      if (sc.hw === 0 && sc.room === 0) {
        addLine('  [WRONG] Neither task is done. AND needs BOTH \u2014 can you go outside?', 'error');
      } else if (sc.hw === 0) {
        addLine('  [WRONG] Homework isn\'t done yet. AND means BOTH must be YES.', 'error');
      } else if (sc.room === 0) {
        addLine('  [WRONG] Room isn\'t clean yet. AND won\'t say YES until BOTH are done.', 'error');
      } else {
        addLine('  [WRONG] Both tasks are done! AND is happy \u2014 you CAN go.', 'error');
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
        addLine('NEXUS: "See the difference? AND is strict \u2014 it needs', 'highlight');
        addLine('        BOTH. OR is relaxed \u2014 just ONE is enough.', 'highlight');
        addLine('        The only time OR says 0 is when EVERYTHING', 'highlight');
        addLine('        is 0."', 'highlight');
        addLine('', '');
        addLine('        \u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581', 'info');
        addLine('        Two rules locked. One more.', 'info');
        addLine('        \u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594\u2594', 'info');
        s.phase = 2;
        addLine('');
        setTimeout(runLogicPhase, 1200);
      } else {
        addLine('');
        showOrScenario();
      }
    } else {
      sound.denied();
      if (sc.veg === 0 && sc.fruit === 0) {
        addLine('  [WRONG] No veggies, no fruit \u2014 you ate nothing. OR needs at least ONE.', 'error');
      } else if (sc.veg === 1 && sc.fruit === 1) {
        addLine('  [WRONG] You ate both! OR is happy with even one \u2014 both is definitely enough.', 'error');
      } else {
        addLine(`  [WRONG] You ate ${sc.veg ? 'veggies' : 'fruit'} \u2014 that\'s enough! OR only needs one.`, 'error');
      }
    }
  });
}
