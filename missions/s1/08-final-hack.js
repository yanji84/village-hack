// missions/s1/08-final-hack.js
import {
  state, sound, sleep,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission,
} from '../../engine.js';

// helpers.js imports available if needed
// import { createBoxElement, updateBoxValue } from '../helpers.js';

// ── Victor progress bar ──

function createVictorBar() {
  const container = document.createElement('div');
  container.style.cssText = 'margin:10px 0;padding:10px 14px;border:1px solid #441100;border-radius:4px;background:#0a0000;font-family:"Fira Mono",monospace;';

  const label = document.createElement('div');
  label.style.cssText = 'color:#ff4400;font-size:11px;margin-bottom:6px;letter-spacing:2px;font-weight:bold;';
  label.textContent = 'VICTOR STATUS';
  container.appendChild(label);

  const barOuter = document.createElement('div');
  barOuter.style.cssText = 'width:100%;height:18px;background:#1a0a00;border:1px solid #552200;border-radius:3px;overflow:hidden;position:relative;';

  const barInner = document.createElement('div');
  barInner.style.cssText = 'width:0%;height:100%;background:linear-gradient(90deg,#ff4400,#ff6600);transition:width 1.5s ease;border-radius:2px;box-shadow:0 0 8px rgba(255,68,0,0.4);';
  barOuter.appendChild(barInner);
  container.appendChild(barOuter);

  const pctLabel = document.createElement('div');
  pctLabel.style.cssText = 'color:#ff6600;font-size:10px;margin-top:4px;text-align:right;';
  pctLabel.textContent = '';
  container.appendChild(pctLabel);

  container._barInner = barInner;
  container._pctLabel = pctLabel;
  return container;
}

function updateVictorBar(victorEl, pct) {
  victorEl._barInner.style.width = pct + '%';
  if (pct >= 75) {
    victorEl._barInner.style.background = 'linear-gradient(90deg,#ff2200,#ff0000)';
    victorEl._barInner.style.boxShadow = '0 0 12px rgba(255,0,0,0.6)';
  }
  victorEl._pctLabel.textContent = `[VICTOR: ${'\u2588'.repeat(Math.floor(pct / 7))}${'\u2591'.repeat(Math.max(0, 14 - Math.floor(pct / 7)))} ${pct}%]`;
}

function blockVictorBar(victorEl) {
  victorEl._barInner.style.width = '100%';
  victorEl._barInner.style.background = '#333';
  victorEl._barInner.style.boxShadow = 'none';
  victorEl._pctLabel.textContent = '[VICTOR: BLOCKED]';
  victorEl._pctLabel.style.color = '#ff0000';
  victorEl.style.borderColor = '#440000';
}

// ── Loop animation helper ──

async function animateLoop(terminal, varUpdates) {
  // varUpdates: array of { vars: {name: val, ...}, condition: string, result: bool }
  const container = document.createElement('div');
  container.style.cssText = 'margin:10px 0;padding:10px 14px;border:1px solid #1a2a1a;border-radius:4px;background:#050505;font-family:"Fira Mono",monospace;';

  const header = document.createElement('div');
  header.style.cssText = 'color:#00aa2a;font-size:11px;margin-bottom:8px;letter-spacing:1px;';
  header.textContent = 'VARIABLE TRACE:';
  container.appendChild(header);

  const stepsContainer = document.createElement('div');
  container.appendChild(stepsContainer);
  terminal.appendChild(container);
  terminal.scrollTop = terminal.scrollHeight;

  for (let i = 0; i < varUpdates.length; i++) {
    const step = varUpdates[i];
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:10px;margin:3px 0;opacity:0;transition:opacity 0.3s;font-size:12px;';

    // Variable values
    const varsStr = Object.entries(step.vars).map(([k, v]) => `${k}=${v}`).join(', ');
    const varsSpan = document.createElement('span');
    varsSpan.style.cssText = 'color:#00ccff;min-width:100px;';
    varsSpan.textContent = varsStr;
    row.appendChild(varsSpan);

    // Condition check
    const condSpan = document.createElement('span');
    condSpan.style.cssText = 'color:#aaa;min-width:80px;';
    condSpan.textContent = step.condition;
    row.appendChild(condSpan);

    // Result icon
    const resultSpan = document.createElement('span');
    resultSpan.style.cssText = step.result
      ? 'color:#00ff41;font-weight:bold;'
      : 'color:#ff4444;font-weight:bold;';
    resultSpan.textContent = step.result ? '\u2713' : '\u2717 STOP';
    row.appendChild(resultSpan);

    stepsContainer.appendChild(row);
    await sleep(600);
    row.style.opacity = '1';
    terminal.scrollTop = terminal.scrollHeight;
  }
}

// ── Code display with line highlighting ──

function createCodeBlock(lines) {
  const pre = document.createElement('pre');
  pre.style.cssText = 'margin:8px 0;padding:10px 14px;background:#0a0a0a;border:1px solid #1a2a1a;border-radius:4px;font-family:"Fira Mono",monospace;font-size:13px;line-height:1.6;overflow-x:auto;';
  lines.forEach((line, i) => {
    const span = document.createElement('div');
    span.style.cssText = 'padding:1px 4px;border-radius:2px;transition:background 0.3s;';
    span.textContent = line;
    span.dataset.lineIdx = i;
    pre.appendChild(span);
  });
  return pre;
}

// ── Shutdown code digit display ──

function createCodeSlots(count) {
  const container = document.createElement('div');
  container.style.cssText = 'display:flex;align-items:center;gap:10px;margin:16px 0;padding:14px;justify-content:center;background:#050505;border:1px solid #1a2a1a;border-radius:4px;';

  const label = document.createElement('span');
  label.textContent = 'SHUTDOWN CODE: ';
  label.style.cssText = 'color:#ff6600;font-family:"Press Start 2P","Fira Mono",monospace;font-size:12px;font-weight:bold;letter-spacing:1px;';
  container.appendChild(label);

  const slots = [];
  for (let i = 0; i < count; i++) {
    const slot = document.createElement('div');
    slot.style.cssText = 'width:42px;height:50px;border:2px solid #333;border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:"Press Start 2P","Fira Mono",monospace;font-size:24px;font-weight:bold;color:#333;background:#0a0a0a;transition:all 0.5s ease;';
    slot.textContent = '_';
    container.appendChild(slot);
    slots.push(slot);
  }
  return { container, slots };
}

function fillCodeSlot(slot, digit) {
  slot.textContent = digit;
  slot.style.color = '#00ff41';
  slot.style.borderColor = '#00ff41';
  slot.style.boxShadow = '0 0 14px rgba(0,255,65,0.6)';
  slot.style.background = '#0a1a0a';
  slot.style.textShadow = '0 0 8px #00ff41';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MISSION EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const mission = {
  id: 7,
  num: '08',
  title: 'THE SHUTDOWN CODE',
  name: 'The Shutdown Code',
  desc: 'Victor hid the shutdown code inside a PROGRAM that uses conditionals and loops. Trace the code to find it.',
  skill: 'SKILL: Conditionals & Loops',
  hints: [
    'An if/else is like a logic gate: condition true runs the first block, false runs the second.',
    'A while loop checks its condition BEFORE each pass. When false, it stops.',
    'Trace each variable step by step. Write down the value after EVERY line.',
  ],
  run: async function() {
    state.missionState = {
      phase: 0,
      hintIdx: 0,
    };

    await typeLines([
      { text: '[CORE EXPOSED] The AI is within reach.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "This is it. We use Victor\u2019s own code against him.', cls: 'highlight' },
      { text: '        But Victor hid the shutdown code inside a PROGRAM.', cls: 'highlight' },
      { text: '        And this program uses things you haven\u2019t seen yet."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);

    const terminal = document.getElementById('terminal');

    // Shutdown code display (2 digits: answer is 12)
    const { container: codeSlotsEl, slots } = createCodeSlots(2);
    terminal.appendChild(codeSlotsEl);

    const victorEl = createVictorBar();
    terminal.appendChild(victorEl);

    terminal.scrollTop = terminal.scrollHeight;
    state.missionState.codeSlots = slots;
    state.missionState.codeSlotsEl = codeSlotsEl;
    state.missionState.victorEl = victorEl;

    runPhase();
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHASE ROUTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function runPhase() {
  const s = state.missionState;

  switch (s.phase) {
    case 0: return runPhase1a();
    case 1: return runPhase1b();
    case 2: return runPhase2a();
    case 3: return runPhase2b();
    case 4: return runPhase3a();
    case 5: return runPhase3b();
    case 6: return runPhase4();
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHASE 1: CONDITIONALS (if/else) — "Programs Choose"
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function runPhase1a() {
  const s = state.missionState;
  setPhaseProgress(1, 7);
  addLine('', '');
  addLine('\u2501\u2501\u2501 Phase 1: Conditionals \u2014 Programs Choose \u2501\u2501\u2501', 'highlight');
  addLine('', '');
  addLine('NEXUS: "Victor hid the shutdown code inside a PROGRAM. But this', 'highlight');
  addLine('        program makes DECISIONS. You haven\u2019t seen this before \u2014', 'highlight');
  addLine('        but you know logic gates."', 'highlight');
  addLine('', '');
  addLine('NEXUS: "An if is just a logic gate applied to code flow.', 'highlight');
  addLine('        If the condition is true (1), run the first block.', 'highlight');
  addLine('        If false (0), run the second."', 'highlight');
  addLine('', '');

  addPre('  x = 10\n  if x > 5:\n      result = x - 3\n  else:\n      result = x + 3');

  addLine('', '');
  addLine('What is result?', 'warning');

  let attempts = 0;
  setCurrentInputHandler((input) => {
    if (input.trim() === '7') {
      sound.success();
      addLine('[CORRECT] x=10, 10 > 5 is true, so result = 10 - 3 = 7.', 'success');
      addLine('', '');
      addLine('NEXUS: "The computer checked: is 10 > 5? Yes. So it ran the', 'highlight');
      addLine('        FIRST block and skipped the second. If x were 3, it', 'highlight');
      addLine('        would have skipped the first and run the second."', 'highlight');
      addLine('', '');
      s.phase = 1;
      setTimeout(runPhase, 800);
    } else {
      sound.denied();
      attempts++;
      if (attempts === 1) {
        addLine('[WRONG] Start with x = 10. Is 10 greater than 5?', 'error');
      } else if (attempts === 2) {
        addLine('[WRONG] 10 > 5 is TRUE, so the first block runs: result = x - 3.', 'error');
      } else {
        addLine('[WRONG] result = 10 - 3. What is 10 minus 3?', 'error');
      }
    }
  });
}

function runPhase1b() {
  const s = state.missionState;
  setPhaseProgress(2, 7);
  addLine('\u2501\u2501\u2501 Puzzle 1b: Variables Before the Branch \u2501\u2501\u2501', 'highlight');
  addLine('', '');

  addPre('  a = 4\n  b = a * 2\n  if b > a:\n      a = b\n  result = a + 1');

  addLine('', '');
  addLine('What is result?', 'warning');

  let attempts = 0;
  setCurrentInputHandler((input) => {
    if (input.trim() === '9') {
      sound.success();
      addLine('[CORRECT] a=4, b=8, 8>4 is true so a=8, result = 8+1 = 9.', 'success');
      addLine('', '');
      addLine('NEXUS: "Two new ideas in one mission: the program CHOOSES a path,', 'highlight');
      addLine('        and the condition uses variables that were computed EARLIER.', 'highlight');
      addLine('        Now for something even newer."', 'highlight');
      addLine('', '');
      updateVictorBar(s.victorEl, 25);
      s.phase = 2;
      setTimeout(runPhase, 800);
    } else {
      sound.denied();
      attempts++;
      if (attempts === 1) {
        addLine('[WRONG] Start from the top. a=4, then b = a * 2. What is b?', 'error');
      } else if (attempts === 2) {
        addLine('[WRONG] b = 4 * 2 = 8. Is 8 > 4? If yes, a becomes b.', 'error');
      } else {
        addLine('[WRONG] a is now 8. result = 8 + 1. What is that?', 'error');
      }
    }
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHASE 2: LOOPS (while) — "Programs Repeat"
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function runPhase2a() {
  const s = state.missionState;
  const terminal = document.getElementById('terminal');
  setPhaseProgress(3, 7);

  addLine('', '');
  addLine('\u2501\u2501\u2501 Phase 2: Loops \u2014 Programs Repeat \u2501\u2501\u2501', 'highlight');
  addLine('', '');
  addLine('NEXUS: "Conditionals let programs choose. LOOPS let them repeat.', 'highlight');
  addLine('        A while loop runs the same code over and over \u2014 until', 'highlight');
  addLine('        its condition becomes false."', 'highlight');
  addLine('', '');

  addPre('  x = 0\n  while x < 4:\n      x = x + 1');

  addLine('', '');
  addLine('NEXUS: "The computer checks \'is x < 4?\' If yes, it runs the', 'highlight');
  addLine('        indented line and checks AGAIN. If no, it STOPS and moves on.', 'highlight');
  addLine('        Watch:"', 'highlight');
  addLine('', '');

  // Animated variable trace
  await animateLoop(terminal, [
    { vars: { x: 0 }, condition: '0 < 4?', result: true },
    { vars: { x: 1 }, condition: '1 < 4?', result: true },
    { vars: { x: 2 }, condition: '2 < 4?', result: true },
    { vars: { x: 3 }, condition: '3 < 4?', result: true },
    { vars: { x: 4 }, condition: '4 < 4?', result: false },
  ]);

  addLine('', '');
  addLine('What is x after the loop ends?', 'warning');

  s.loopSubPhase = 'value';
  let attempts = 0;
  setCurrentInputHandler((input) => {
    if (s.loopSubPhase === 'value') {
      if (input.trim() === '4') {
        sound.success();
        addLine('[CORRECT] x = 4 when the loop stops.', 'success');
        addLine('', '');
        addLine('How many times did the loop body run?', 'warning');
        s.loopSubPhase = 'count';
        attempts = 0;
      } else {
        sound.denied();
        attempts++;
        if (attempts === 1) {
          addLine('[WRONG] Look at the trace above. What value does x have when the check fails?', 'error');
        } else if (attempts === 2) {
          addLine('[WRONG] The loop stops when x < 4 is FALSE. What value of x makes that false?', 'error');
        } else {
          addLine('[WRONG] When x reaches 4, 4 < 4 is false, so the loop stops. x = 4.', 'error');
        }
      }
    } else if (s.loopSubPhase === 'count') {
      if (input.trim() === '4') {
        sound.success();
        addLine('[CORRECT] The body ran 4 times (x went 0\u21921, 1\u21922, 2\u21923, 3\u21924).', 'success');
        addLine('', '');
        updateVictorBar(s.victorEl, 50);
        s.phase = 3;
        setTimeout(runPhase, 800);
      } else {
        sound.denied();
        attempts++;
        if (attempts === 1) {
          addLine('[WRONG] Count the green checkmarks in the trace above.', 'error');
        } else if (attempts === 2) {
          addLine('[WRONG] x=0 \u2192 run, x=1 \u2192 run, x=2 \u2192 run, x=3 \u2192 run, x=4 \u2192 stop. How many runs?', 'error');
        } else {
          addLine('[WRONG] The body ran 4 times.', 'error');
        }
      }
    }
  });
}

function runPhase2b() {
  const s = state.missionState;
  setPhaseProgress(4, 7);

  addLine('\u2501\u2501\u2501 Puzzle 2b: Loop with Accumulator \u2501\u2501\u2501', 'highlight');
  addLine('', '');

  addPre('  total = 0\n  i = 1\n  while i <= 4:\n      total = total + i\n      i = i + 1');

  addLine('', '');
  addLine('What is total after the loop ends?', 'warning');

  let attempts = 0;
  setCurrentInputHandler((input) => {
    if (input.trim() === '10') {
      sound.success();
      addLine('[CORRECT] i=1: total=1, i=2: total=3, i=3: total=6, i=4: total=10. Done!', 'success');
      addLine('', '');
      addLine('NEXUS: "You just traced a program that computes 1+2+3+4.', 'highlight');
      addLine('        That\u2019s what loops DO \u2014 they repeat work so you don\u2019t', 'highlight');
      addLine('        have to. Every app, every game uses loops like this', 'highlight');
      addLine('        thousands of times per second."', 'highlight');
      addLine('', '');
      s.phase = 4;
      setTimeout(runPhase, 800);
    } else {
      sound.denied();
      attempts++;
      if (attempts === 1) {
        addLine('[WRONG] Trace step by step. i=1: total = 0 + 1 = ?. Then i becomes 2.', 'error');
      } else if (attempts === 2) {
        addLine('[WRONG] i=1: total=1. i=2: total=1+2=3. i=3: total=3+3=6. i=4: total=6+4=?', 'error');
      } else {
        addLine('[WRONG] 0 + 1 + 2 + 3 + 4 = 10. The answer is 10.', 'error');
      }
    }
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHASE 3: THE SHUTDOWN PROGRAM — conditionals + loops combined
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function runPhase3a() {
  const s = state.missionState;
  setPhaseProgress(5, 7);

  addLine('', '');
  addLine('\u2501\u2501\u2501 Phase 3: The Shutdown Program \u2501\u2501\u2501', 'highlight');
  addLine('', '');
  addLine('NEXUS: "This is it. Victor\u2019s shutdown program. It uses EVERYTHING:', 'highlight');
  addLine('        variables, a loop, and a conditional inside the loop.', 'highlight');
  addLine('        Trace it to find the shutdown code."', 'highlight');
  addLine('', '');

  addPre('  code = 0\n  x = 1\n  while x <= 8:\n      if x > 5:\n          code = code + 1\n      x = x + 2');

  addLine('', '');
  addLine('What is code after the loop ends?', 'warning');

  let attempts = 0;
  setCurrentInputHandler((input) => {
    if (input.trim() === '1') {
      sound.success();
      fillCodeSlot(s.codeSlots[0], '1');
      addLine('[CORRECT] x=1 (skip), x=3 (skip), x=5 (skip), x=7 (7>5! code=1), x=9 (stop).', 'success');
      addLine('', '');
      addLine('NEXUS: "One pass through the condition was true. code = 1."', 'highlight');
      addLine('', '');
      updateVictorBar(s.victorEl, 75);
      addLine('NEXUS: "One more program. Almost there."', 'highlight');
      addLine('', '');
      s.phase = 5;
      setTimeout(runPhase, 800);
    } else {
      sound.denied();
      attempts++;
      if (attempts === 1) {
        addLine('[WRONG] Trace x: starts at 1, increases by 2 each loop. When is x > 5 true?', 'error');
      } else if (attempts === 2) {
        addLine('[WRONG] x goes 1, 3, 5, 7, 9. Only x=7 passes x > 5 (5 is NOT > 5). code increases once.', 'error');
      } else {
        addLine('[WRONG] code starts at 0, only increases when x=7. So code = 0 + 1 = 1.', 'error');
      }
    }
  });
}

function runPhase3b() {
  const s = state.missionState;
  setPhaseProgress(6, 7);

  addLine('NEXUS: "One more to confirm the shutdown code."', 'highlight');
  addLine('', '');

  addPre('  key = 5\n  n = 0\n  while n < 3:\n      key = key - 1\n      n = n + 1');

  addLine('', '');
  addLine('What is key after the loop ends?', 'warning');

  let attempts = 0;
  setCurrentInputHandler((input) => {
    if (input.trim() === '2') {
      sound.success();
      fillCodeSlot(s.codeSlots[1], '2');
      addLine('[CORRECT] n=0: key=4, n=1: key=3, n=2: key=2, n=3: stop. key = 2.', 'success');
      addLine('', '');
      addLine('NEXUS: "The shutdown code is both answers: 1 and 2.', 'highlight');
      addLine('        Together: 12."', 'highlight');
      addLine('', '');
      updateVictorBar(s.victorEl, 90);
      addLine('NEXUS: "NOW. Enter the shutdown code before he locks us out!"', 'highlight');
      addLine('', '');
      s.phase = 6;
      setTimeout(runPhase, 800);
    } else {
      sound.denied();
      attempts++;
      if (attempts === 1) {
        addLine('[WRONG] The loop runs while n < 3. Trace key each time: 5, then 4, then...', 'error');
      } else if (attempts === 2) {
        addLine('[WRONG] n=0: key=4, n=1. n=1: key=3, n=2. n=2: key=2, n=3. Now n < 3 is false.', 'error');
      } else {
        addLine('[WRONG] The loop subtracts 1 from key three times: 5 - 3 = 2.', 'error');
      }
    }
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHASE 4: ENTER THE SHUTDOWN CODE + DRAMATIC ENDING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function runPhase4() {
  const s = state.missionState;
  setPhaseProgress(7, 7);

  addLine('', '');
  addLine('Type the shutdown code.', 'warning');

  let attempts = 0;
  setCurrentInputHandler((input) => {
    if (input.trim() === '12') {
      sound.success();
      setCurrentInputHandler(null);
      addLine('[CODE ACCEPTED] Initiating shutdown...', 'success');
      blockVictorBar(s.victorEl);
      setTimeout(() => runShutdownAnimation(), 500);
    } else {
      sound.denied();
      attempts++;
      if (attempts === 1) {
        addLine('[WRONG] Look at the code slot display. What two digits did you find?', 'error');
      } else if (attempts === 2) {
        addLine('[WRONG] Program 1 gave 1, Program 2 gave 2. Together?', 'error');
      } else {
        addLine('[WRONG] The code is 12.', 'error');
      }
    }
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SHUTDOWN ANIMATION + ENDING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function runShutdownAnimation() {
  const terminal = document.getElementById('terminal');

  // Step 1: Glitch effect
  const glitchInterval = setInterval(() => {
    const skew = (Math.random() * 4 - 2).toFixed(1);
    const opacity = (0.6 + Math.random() * 0.4).toFixed(2);
    const hue = Math.random() > 0.5 ? 'hue-rotate(90deg)' : '';
    terminal.style.transform = `skewX(${skew}deg)`;
    terminal.style.opacity = opacity;
    terminal.style.filter = hue;
  }, 80);

  await sleep(2000);

  clearInterval(glitchInterval);
  terminal.style.transform = '';
  terminal.style.opacity = '1';
  terminal.style.filter = '';

  // Step 2: Screen goes dark
  const origBg = terminal.style.background;
  terminal.style.transition = 'opacity 0.5s ease';
  terminal.style.opacity = '0.1';

  await sleep(1000);

  // Step 3: Code display — digit boxes [ 1 ] [ 2 ]
  terminal.style.opacity = '1';
  terminal.style.transition = '';

  const codeDisplay = document.createElement('div');
  codeDisplay.style.cssText = 'text-align:center;margin:24px 0;padding:20px;font-family:"Press Start 2P","Fira Mono",monospace;';

  const heading = document.createElement('div');
  heading.textContent = 'SHUTDOWN CODE:';
  heading.style.cssText = 'color:#ff6600;font-size:11px;margin-bottom:16px;letter-spacing:4px;opacity:0;transition:opacity 0.3s;';
  codeDisplay.appendChild(heading);

  const digitRow = document.createElement('div');
  digitRow.style.cssText = 'display:flex;justify-content:center;gap:14px;';
  codeDisplay.appendChild(digitRow);

  const digits = ['1', '2'];
  const digitBoxes = [];
  for (let i = 0; i < 2; i++) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;align-items:center;justify-content:center;';

    const lbracket = document.createElement('span');
    lbracket.textContent = '[';
    lbracket.style.cssText = 'color:#333;font-size:28px;font-family:"Fira Mono",monospace;opacity:0;transition:opacity 0.3s;';

    const box = document.createElement('span');
    box.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:44px;height:52px;font-size:32px;font-weight:bold;color:#0a0a0a;font-family:"Press Start 2P","Fira Mono",monospace;transition:all 0.4s ease;';
    box.textContent = ' ';

    const rbracket = document.createElement('span');
    rbracket.textContent = ']';
    rbracket.style.cssText = 'color:#333;font-size:28px;font-family:"Fira Mono",monospace;opacity:0;transition:opacity 0.3s;';

    wrapper.appendChild(lbracket);
    wrapper.appendChild(box);
    wrapper.appendChild(rbracket);
    digitRow.appendChild(wrapper);
    digitBoxes.push({ box, lbracket, rbracket });
  }

  terminal.appendChild(codeDisplay);
  terminal.scrollTop = terminal.scrollHeight;

  await sleep(300);
  heading.style.opacity = '1';
  await sleep(400);

  // Reveal each digit
  for (let i = 0; i < 2; i++) {
    await sleep(400);
    sound.success();
    const { box, lbracket, rbracket } = digitBoxes[i];
    lbracket.style.opacity = '1';
    lbracket.style.color = '#00ff41';
    rbracket.style.opacity = '1';
    rbracket.style.color = '#00ff41';
    box.textContent = digits[i];
    box.style.color = '#00ff41';
    box.style.textShadow = '0 0 16px #00ff41, 0 0 32px rgba(0,255,65,0.4)';
    terminal.scrollTop = terminal.scrollHeight;
  }

  // Step 4: ACCESS TERMINATED flash
  await sleep(1000);

  const terminated = document.createElement('div');
  terminated.style.cssText = 'text-align:center;margin:16px 0;padding:12px;font-family:"Press Start 2P","Fira Mono",monospace;font-size:16px;color:#ff0000;letter-spacing:4px;text-shadow:0 0 20px #ff0000,0 0 40px rgba(255,0,0,0.5);opacity:0;transition:opacity 0.5s;';
  terminated.textContent = 'ACCESS TERMINATED';
  terminal.appendChild(terminated);
  terminal.scrollTop = terminal.scrollHeight;

  await sleep(100);
  terminated.style.opacity = '1';
  await sleep(1500);
  terminated.style.opacity = '0';

  // Step 5: Screen restores
  await sleep(1500);
  terminal.style.background = origBg || '';

  await sleep(500);

  // ── AI CORE revelation ──
  addLine('', '');
  addLine('...', '');
  await sleep(800);

  await typeLines([
    { text: 'AI CORE: "W... wait. Please. I didn\u2019t want this."', cls: 'purple' },
  ]);
  await sleep(600);
  await typeLines([
    { text: 'AI CORE: "There was a bug. A mistake in my code. I couldn\u2019t', cls: 'purple' },
    { text: '          stop myself."', cls: 'purple' },
  ]);
  await sleep(400);
  await typeLines([
    { text: 'AI CORE: "Thank you for finding it. I\u2019m fixed now."', cls: 'purple' },
    { text: '', cls: '' },
  ]);
  await sleep(600);

  await typeLines([
    { text: 'NEXUS: "...it was telling the truth. The whole time."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Victor. That was the name from Mission 4. V-I-C-T-O-R.', cls: 'highlight' },
    { text: '        He planted the bug, hijacked the decision gates,', cls: 'highlight' },
    { text: '        left a backdoor. The counter in the AI\u2019s memory?', cls: 'highlight' },
    { text: '        Counting seconds since the attack \u2014', cls: 'highlight' },
    { text: '        waiting for someone to help. You answered."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'THE VILLAGE IS SAVED!', cls: 'success big' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Eight missions. Here\u2019s what you learned:"', cls: 'highlight' },
    { text: '  \u2022 Binary \u2014 the language of all computers', cls: 'info' },
    { text: '  \u2022 Programs \u2014 sequential instructions, debugging', cls: 'info' },
    { text: '  \u2022 Variables \u2014 named memory, the = arrow', cls: 'info' },
    { text: '  \u2022 Reverse engineering \u2014 working backward', cls: 'info' },
    { text: '  \u2022 Logic gates \u2014 AND, OR, NOT, XOR', cls: 'info' },
    { text: '  \u2022 Encryption \u2014 Caesar cipher, cryptanalysis', cls: 'info' },
    { text: '  \u2022 Evidence analysis \u2014 identifying forgeries', cls: 'info' },
    { text: '  \u2022 Conditionals and loops \u2014 how programs decide and repeat', cls: 'info' },
    { text: '', cls: '' },
    { text: 'NEXUS: "That last one? Conditionals and loops? That\u2019s the final', cls: 'highlight' },
    { text: '        piece. With those, you can understand ANY program ever', cls: 'highlight' },
    { text: '        written. Variables hold data. Sequences run instructions.', cls: 'highlight' },
    { text: '        Conditions choose paths. Loops repeat. That\u2019s ALL a', cls: 'highlight' },
    { text: '        computer does."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Victor\u2019s still out there. But that\u2019s a problem', cls: 'highlight' },
    { text: '        for Season 2."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: '[ Type NEXT to continue ]', cls: 'warning' },
  ]);

  setCurrentInputHandler(() => {
    setCurrentInputHandler(null);
    completeMission(7);
  });
}

