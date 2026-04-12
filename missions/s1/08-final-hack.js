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

  const statusMsg = document.createElement('div');
  statusMsg.style.cssText = 'color:#884400;font-size:10px;margin-bottom:4px;letter-spacing:1px;font-style:italic;min-height:14px;transition:color 0.5s;';
  statusMsg.textContent = 'scanning for intruders...';
  container.appendChild(statusMsg);
  container._statusMsg = statusMsg;

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

  // Inject pulse keyframes once
  if (!document.getElementById('victor-pulse-style')) {
    const style = document.createElement('style');
    style.id = 'victor-pulse-style';
    style.textContent = `
      @keyframes victor-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
      @keyframes victor-glow {
        0%, 100% { box-shadow: 0 0 8px rgba(255,68,0,0.4); }
        50% { box-shadow: 0 0 18px rgba(255,68,0,0.8); }
      }
      @keyframes victor-critical {
        0%, 100% { box-shadow: 0 0 8px rgba(255,0,0,0.5); border-color: #552200; }
        50% { box-shadow: 0 0 24px rgba(255,0,0,0.9); border-color: #ff2200; }
      }
    `;
    document.head.appendChild(style);
  }

  if (pct >= 75) {
    victorEl._barInner.style.background = 'linear-gradient(90deg,#ff2200,#ff0000)';
    victorEl._barInner.style.boxShadow = '0 0 12px rgba(255,0,0,0.6)';
    victorEl.style.animation = 'victor-critical 0.8s ease-in-out infinite';
    victorEl._pctLabel.style.animation = 'victor-pulse 0.8s ease-in-out infinite';
  } else if (pct >= 50) {
    victorEl._barInner.style.animation = 'victor-glow 1.5s ease-in-out infinite';
    victorEl._pctLabel.style.animation = 'victor-pulse 1.5s ease-in-out infinite';
  }
  victorEl._pctLabel.textContent = `[VICTOR: ${'\u2588'.repeat(Math.floor(pct / 7))}${'\u2591'.repeat(Math.max(0, 14 - Math.floor(pct / 7)))} ${pct}%]`;

  // Status messages that escalate tension — Victor fights back harder each phase
  if (victorEl._statusMsg) {
    if (pct >= 90) {
      victorEl._statusMsg.textContent = 'VICTOR IS ALMOST BACK — YOU\'RE OUT OF TIME';
      victorEl._statusMsg.style.color = '#ff0000';
    } else if (pct >= 75) {
      victorEl._statusMsg.textContent = 'VICTOR is ripping through your firewall...';
      victorEl._statusMsg.style.color = '#ff4400';
    } else if (pct >= 50) {
      victorEl._statusMsg.textContent = 'VICTOR is fighting back — he knows you\'re here...';
      victorEl._statusMsg.style.color = '#cc6600';
    } else if (pct >= 25) {
      victorEl._statusMsg.textContent = 'VICTOR is hunting for your location...';
      victorEl._statusMsg.style.color = '#996600';
    }
  }
}

function blockVictorBar(victorEl) {
  victorEl._barInner.style.width = '100%';
  victorEl._barInner.style.background = '#333';
  victorEl._barInner.style.boxShadow = 'none';
  victorEl._pctLabel.textContent = '[VICTOR: LOCKED OUT]';
  victorEl._pctLabel.style.color = '#ff0000';
  victorEl.style.borderColor = '#440000';
}

// ── Loop animation helper ──

// ── Replay button helper ──

function addReplayBtn(container, replayFn) {
  // Remove existing replay btn if any
  const old = container.querySelector('.replay-btn');
  if (old) old.remove();
  const btn = document.createElement('span');
  btn.className = 'replay-btn';
  btn.textContent = '[ replay ]';
  btn.style.cssText = 'color:#00ffff;cursor:pointer;font-size:11px;opacity:0.6;transition:opacity 0.2s;margin-top:6px;display:inline-block;';
  btn.onmouseenter = () => { btn.style.opacity = '1'; };
  btn.onmouseleave = () => { btn.style.opacity = '0.6'; };
  btn.onclick = () => replayFn();
  container.appendChild(btn);
}

async function animateLoop(terminal, varUpdates) {
  const wrapper = document.createElement('div');
  const container = document.createElement('div');
  container.style.cssText = 'margin:10px 0;padding:10px 14px;border:1px solid #1a2a1a;border-radius:4px;background:#050505;font-family:"Fira Mono",monospace;';

  const header = document.createElement('div');
  header.style.cssText = 'color:#00aa2a;font-size:11px;margin-bottom:8px;letter-spacing:1px;';
  header.textContent = 'VARIABLE TRACE:';
  container.appendChild(header);

  const stepsContainer = document.createElement('div');
  container.appendChild(stepsContainer);
  wrapper.appendChild(container);
  terminal.appendChild(wrapper);

  async function runAnim() {
    stepsContainer.innerHTML = '';
    terminal.scrollTop = terminal.scrollHeight;

    for (let i = 0; i < varUpdates.length; i++) {
      const step = varUpdates[i];
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:10px;margin:4px 0;opacity:0;transition:opacity 0.4s;font-size:13px;';

      const passLabel = document.createElement('span');
      passLabel.style.cssText = 'color:#666;min-width:44px;font-size:10px;letter-spacing:1px;';
      passLabel.textContent = step.result ? `#${i + 1}` : 'END';
      row.appendChild(passLabel);

      const varsStr = Object.entries(step.vars).map(([k, v]) => `${k}=${v}`).join(', ');
      const varsSpan = document.createElement('span');
      varsSpan.style.cssText = 'color:#00ccff;min-width:100px;';
      varsSpan.textContent = varsStr;
      row.appendChild(varsSpan);

      const condSpan = document.createElement('span');
      condSpan.style.cssText = 'color:#aaa;min-width:80px;';
      condSpan.textContent = step.condition;
      row.appendChild(condSpan);

      const resultSpan = document.createElement('span');
      resultSpan.style.cssText = step.result
        ? 'color:#00ff41;font-weight:bold;'
        : 'color:#ff4444;font-weight:bold;';
      resultSpan.textContent = step.result ? '\u2713' : '\u2717 STOP';
      row.appendChild(resultSpan);

      stepsContainer.appendChild(row);
      await sleep(1000);
      row.style.opacity = '1';
      terminal.scrollTop = terminal.scrollHeight;
    }
    addReplayBtn(wrapper, runAnim);
  }

  await runAnim();
}

// ── Conditional execution animation ──

async function animateConditional(terminal, trace) {
  const wrapper = document.createElement('div');
  const container = document.createElement('div');
  container.style.cssText = 'margin:10px 0;padding:10px 14px;border:1px solid #1a2a1a;border-radius:4px;background:#050505;font-family:"Fira Mono",monospace;font-size:13px;line-height:1.8;';

  const header = document.createElement('div');
  header.style.cssText = 'color:#00aa2a;font-size:11px;margin-bottom:8px;letter-spacing:1px;';
  header.textContent = 'STEP-BY-STEP EXECUTION:';
  container.appendChild(header);

  const linesContainer = document.createElement('div');
  container.appendChild(linesContainer);
  wrapper.appendChild(container);
  terminal.appendChild(wrapper);

  async function runAnim() {
    linesContainer.innerHTML = '';

    // Render all lines dimmed
    const lineEls = trace.lines.map((text) => {
      const div = document.createElement('div');
      div.style.cssText = 'padding:3px 6px;border-radius:3px;color:#555;transition:all 0.4s;display:flex;align-items:center;gap:10px;';
      const code = document.createElement('span');
      code.textContent = text;
      div.appendChild(code);
      const note = document.createElement('span');
      note.style.cssText = 'font-size:11px;color:#555;transition:all 0.4s;';
      div._note = note;
      div.appendChild(note);
      linesContainer.appendChild(div);
      return div;
    });

    terminal.scrollTop = terminal.scrollHeight;

    for (const step of trace.highlights) {
      await sleep(800);
      const el = lineEls[step.lineIdx];
      el.style.color = step.color || '#00ff41';
      if (step.bg) el.style.background = step.bg;
      if (step.label) {
        el._note.textContent = step.label;
        el._note.style.color = step.color || '#00ff41';
      }
      terminal.scrollTop = terminal.scrollHeight;
    }
    await sleep(500);
    addReplayBtn(wrapper, runAnim);
  }

  await runAnim();
}

// ── Loop+conditional combined animation ──

async function animateLoopWithConditional(terminal, iterations) {
  const wrapper = document.createElement('div');
  const container = document.createElement('div');
  container.style.cssText = 'margin:10px 0;padding:10px 14px;border:1px solid #1a2a1a;border-radius:4px;background:#050505;font-family:"Fira Mono",monospace;';

  const header = document.createElement('div');
  header.style.cssText = 'color:#00aa2a;font-size:11px;margin-bottom:8px;letter-spacing:1px;';
  header.textContent = 'LOOP EXECUTION:';
  container.appendChild(header);

  const stepsContainer = document.createElement('div');
  container.appendChild(stepsContainer);
  wrapper.appendChild(container);
  terminal.appendChild(wrapper);

  async function runAnim() {
    stepsContainer.innerHTML = '';
    terminal.scrollTop = terminal.scrollHeight;

    for (let idx = 0; idx < iterations.length; idx++) {
      const iter = iterations[idx];
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;margin:5px 0;opacity:0;transition:opacity 0.4s;font-size:13px;flex-wrap:wrap;';

      const passLabel = document.createElement('span');
      passLabel.style.cssText = 'color:#666;min-width:44px;font-size:10px;letter-spacing:1px;';
      passLabel.textContent = iter.condResult ? `#${idx + 1}` : 'END';
      row.appendChild(passLabel);

      const varsStr = Object.entries(iter.vars).map(([k,v]) => `${k}=${v}`).join(' ');
      const varsSpan = document.createElement('span');
      varsSpan.style.cssText = 'color:#00ccff;min-width:80px;';
      varsSpan.textContent = varsStr;
      row.appendChild(varsSpan);

      const condSpan = document.createElement('span');
      condSpan.style.cssText = 'color:#aaa;';
      condSpan.textContent = iter.condition;
      row.appendChild(condSpan);

      const whileResult = document.createElement('span');
      whileResult.style.cssText = iter.condResult ? 'color:#00ff41;font-weight:bold;' : 'color:#ff4444;font-weight:bold;';
      whileResult.textContent = iter.condResult ? '\u2713' : '\u2717 STOP';
      row.appendChild(whileResult);

      if (iter.condResult && iter.ifCheck) {
        const ifSpan = document.createElement('span');
        ifSpan.style.cssText = 'color:#ff8800;margin-left:8px;';
        ifSpan.textContent = `\u2502 ${iter.ifCheck}`;
        row.appendChild(ifSpan);

        const ifResult = document.createElement('span');
        ifResult.style.cssText = iter.ifResult ? 'color:#00ff41;' : 'color:#666;';
        ifResult.textContent = iter.ifResult ? '\u2192 YES' : '\u2192 no';
        row.appendChild(ifResult);
      }

      if (iter.action) {
        const actionSpan = document.createElement('span');
        actionSpan.style.cssText = 'color:#cc66ff;margin-left:8px;font-style:italic;';
        actionSpan.textContent = iter.action;
        row.appendChild(actionSpan);
      }

      stepsContainer.appendChild(row);
      await sleep(1200);
      row.style.opacity = '1';
      terminal.scrollTop = terminal.scrollHeight;
    }
    addReplayBtn(wrapper, runAnim);
  }

  await runAnim();
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
  desc: 'Victor buried the shutdown code inside a program that makes decisions and repeats. Trace the logic to extract it before time runs out.',
  skill: 'SKILL: Conditionals & Loops',
  hints: [
    'An if/else is a fork in the road: the condition decides which path runs. Only ONE path ever executes.',
    'A while loop checks its condition BEFORE each pass. True = run and loop back. False = stop immediately.',
    'Trace each variable step by step \u2014 write down every value after EVERY line. Don\u2019t skip steps.',
  ],
  run: async function() {
    state.missionState = {
      phase: 0,
      hintIdx: 0,
    };

    await typeLines([
      { text: '[CORE EXPOSED] AI core access granted. Firewall neutralized.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "We\u2019re in. The deepest layer."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);
    await sleep(600);
    await typeLines([
      { text: 'NEXUS: "The shutdown code is buried inside a PROGRAM \u2014', cls: 'highlight' },
      { text: '        code that makes decisions and repeats itself.', cls: 'highlight' },
      { text: '        To crack it, you\u2019ll need to think like the', cls: 'highlight' },
      { text: '        computer. Line by line. No guessing."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Victor\u2019s countermeasures are already activating.', cls: 'highlight' },
      { text: '        Move FAST."', cls: 'highlight' },
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
    updateVictorBar(victorEl, 10);

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

async function runPhase1a() {
  const s = state.missionState;
  const terminal = document.getElementById('terminal');
  setPhaseProgress(1, 7);
  addLine('', '');
  addLine('\u2501\u2501\u2501 Phase 1: Conditionals \u2014 Programs Choose \u2501\u2501\u2501', 'highlight');
  addLine('', '');
  addLine('NEXUS: "Victor\u2019s program makes DECISIONS. Picture a fork', 'highlight');
  addLine('        in a road. YES goes left. NO goes right.', 'highlight');
  addLine('        You can NEVER take both paths."', 'highlight');
  addLine('', '');

  // DEMO: guided walkthrough with animation
  addPre('  age = 12\n  if age >= 10:\n      msg = "big kid"\n  else:\n      msg = "little kid"');
  addLine('', '');
  addLine('NEXUS: "Watch the computer execute it \u2014 one line at a time:"', 'highlight');
  addLine('', '');

  await animateConditional(terminal, {
    lines: [
      'age = 12',
      'if age >= 10:        \u2190 check this',
      '    msg = "big kid"  \u2190 runs if TRUE',
      'else:',
      '    msg = "little kid" \u2190 runs if FALSE',
    ],
    highlights: [
      { lineIdx: 0, color: '#00ccff', label: 'age is 12' },
      { lineIdx: 1, color: '#ffdd33', label: '12 >= 10? YES \u2192 true' },
      { lineIdx: 2, color: '#00ff41', bg: 'rgba(0,255,65,0.1)', label: '\u2713 this runs' },
      { lineIdx: 3, color: '#333' },
      { lineIdx: 4, color: '#333', label: 'skipped' },
    ],
  });

  addLine('', '');
  addLine('NEXUS: "See how it works? The computer checked: is 12 >= 10?', 'highlight');
  addLine('        That\u2019s TRUE, so the green path ran. The gray path?', 'highlight');
  addLine('        Completely skipped. It\u2019s like it doesn\u2019t exist."', 'highlight');
  addLine('', '');
  addLine('NEXUS: "Your turn. But careful \u2014 this one\u2019s different.', 'highlight');
  addLine('        Don\u2019t assume it\u2019ll go the same way:"', 'highlight');
  addLine('', '');

  // PUZZLE — condition is FALSE (unlike the demo), forcing kid to pick the else branch
  addPre('  x = 3\n  if x > 5:\n      result = x - 3\n  else:\n      result = x + 3');

  addLine('', '');
  addLine('What is result?', 'warning');

  let attempts = 0;
  setCurrentInputHandler((input) => {
    if (input.trim() === '6') {
      sound.success();
      addLine('[CORRECT]', 'success');
      // Animate the execution path
      (async () => {
        const terminal = document.getElementById('terminal');
        await animateConditional(terminal, {
          lines: [
            'x = 3',
            'if x > 5:          \u2190 check',
            '    result = x - 3  \u2190 skipped',
            'else:',
            '    result = x + 3  \u2190 this runs',
          ],
          highlights: [
            { lineIdx: 0, color: '#00ccff', label: 'x is 3' },
            { lineIdx: 1, color: '#ffdd33', label: '3 > 5? NO' },
            { lineIdx: 2, color: '#333', label: 'skipped' },
            { lineIdx: 3, color: '#ffdd33' },
            { lineIdx: 4, color: '#00ff41', bg: 'rgba(0,255,65,0.1)', label: 'result = 6' },
          ],
        });
        addLine('', '');
        addLine('NEXUS: "This time the condition was FALSE. 3 is NOT', 'highlight');
        addLine('        greater than 5, so the computer skipped the IF', 'highlight');
        addLine('        block and took the ELSE path: result = 3 + 3 = 6.', 'highlight');
        addLine('        The fork went the OTHER way this time."', 'highlight');
        addLine('', '');
        s.phase = 1;
        setTimeout(runPhase, 800);
      })();
    } else {
      sound.denied();
      attempts++;
      if (attempts === 1) {
        addLine('[WRONG] NEXUS: "Start at the fork. x is 3. Is 3 > 5? Which path opens?"', 'error');
      } else if (attempts === 2) {
        addLine('[WRONG] NEXUS: "3 > 5 is FALSE, so the ELSE path runs: result = x + 3. Plug in x = 3."', 'error');
      } else {
        addLine('[WRONG] NEXUS: "result = 3 + 3 = 6. That\u2019s it. Type 6."', 'error');
      }
    }
  });
}

function runPhase1b() {
  const s = state.missionState;
  setPhaseProgress(2, 7);
  addLine('\u2501\u2501\u2501 Puzzle 1b: Changing Variables \u2501\u2501\u2501', 'highlight');
  addLine('', '');
  addLine('NEXUS: "Trickier now. Watch the LAST line \u2014 it\u2019s NOT', 'highlight');
  addLine('        indented under if or else. That means it runs', 'highlight');
  addLine('        no matter what. It\u2019s after the fork rejoins."', 'highlight');
  addLine('', '');

  addPre('  a = 4\n  b = a * 2\n  if b > a:\n      a = b\n  result = a + 1   \u2190 always runs');

  addLine('', '');
  addLine('What is result?', 'warning');

  let attempts = 0;
  setCurrentInputHandler((input) => {
    if (input.trim() === '9') {
      sound.success();
      addLine('[CORRECT] a=4, b=8, 8>4 is TRUE so a becomes 8, then result = 8+1 = 9.', 'success');
      addLine('', '');
      addLine('NEXUS: "Did you catch the tricky part? The variable a CHANGED', 'highlight');
      addLine('        inside the if-block. When we hit result = a + 1,', 'highlight');
      addLine('        a was no longer 4 \u2014 it was 8. Programs build values,', 'highlight');
      addLine('        then decisions CHANGE those values.', 'highlight');
      addLine('        But conditionals are only half the picture..."', 'highlight');
      addLine('', '');
      updateVictorBar(s.victorEl, 25);
      s.phase = 2;
      setTimeout(runPhase, 800);
    } else {
      sound.denied();
      attempts++;
      if (attempts === 1) {
        addLine('[WRONG] NEXUS: "Top to bottom. a=4, then b = a * 2. What\u2019s b?"', 'error');
      } else if (attempts === 2) {
        addLine('[WRONG] NEXUS: "b = 8. Now the fork: is 8 > 4? Yes \u2192 a becomes 8. Last line: result = a + 1."', 'error');
      } else {
        addLine('[WRONG] NEXUS: "a is now 8. result = 8 + 1 = 9."', 'error');
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
  addLine('NEXUS: "Now for Victor\u2019s second weapon: LOOPS \u2014 code that', 'highlight');
  addLine('        REPEATS. Like laps on a track. Before each lap,', 'highlight');
  addLine('        the computer asks: keep going? YES \u2192 run again.', 'highlight');
  addLine('        NO \u2192 stop right here. Watch:"', 'highlight');
  addLine('', '');

  addPre('  x = 0\n  while x < 4:\n      x = x + 1');

  addLine('', '');
  addLine('NEXUS: "Green check = keep looping. Red X = stop.', 'highlight');
  addLine('        Watch the first two laps:"', 'highlight');
  addLine('', '');

  // Show only first 2 iterations as a demo — kid must predict the rest
  await animateLoop(terminal, [
    { vars: { x: 0 }, condition: '0 < 4?', result: true },
    { vars: { x: 1 }, condition: '1 < 4?', result: true },
  ]);

  addLine('', '');
  addLine('NEXUS: "See the pattern? Each lap, x goes up by 1, then', 'highlight');
  addLine('        the computer checks: is x STILL less than 4?', 'highlight');
  addLine('        Keep going in your head \u2014 when does it stop?"', 'highlight');
  addLine('', '');
  addLine('What is x when the loop finally stops?', 'warning');

  s.loopSubPhase = 'value';
  let attempts = 0;
  setCurrentInputHandler((input) => {
    if (s.loopSubPhase === 'value') {
      if (input.trim() === '4') {
        sound.success();
        addLine('[CORRECT] x = 4 when the loop stops.', 'success');
        addLine('', '');
        // Now show the full trace as confirmation
        addLine('NEXUS: "Here\u2019s the full execution \u2014 see if it matches what you predicted:"', 'highlight');
        addLine('', '');
        (async () => {
          await animateLoop(terminal, [
            { vars: { x: 0 }, condition: '0 < 4?', result: true },
            { vars: { x: 1 }, condition: '1 < 4?', result: true },
            { vars: { x: 2 }, condition: '2 < 4?', result: true },
            { vars: { x: 3 }, condition: '3 < 4?', result: true },
            { vars: { x: 4 }, condition: '4 < 4?', result: false },
          ]);
          addLine('', '');
          addLine('How many times did the loop body run?', 'warning');
          s.loopSubPhase = 'count';
          attempts = 0;
        })();
        return;
      } else {
        sound.denied();
        attempts++;
        if (attempts === 1) {
          addLine('[WRONG] NEXUS: "Continue the pattern: x=2, is 2 < 4? Yes. x=3, is 3 < 4? Yes. Keep going \u2014 when is x NOT less than 4?"', 'error');
        } else if (attempts === 2) {
          addLine('[WRONG] NEXUS: "The loop stops when x < 4 is FALSE. What\u2019s the smallest number that\u2019s NOT less than 4?"', 'error');
        } else {
          addLine('[WRONG] NEXUS: "x = 4. Because 4 < 4 is FALSE, the loop stops. The answer is 4."', 'error');
        }
      }
    } else if (s.loopSubPhase === 'count') {
      if (input.trim() === '4') {
        sound.success();
        addLine('[CORRECT] The body ran 4 times (x went 0\u21921, 1\u21922, 2\u21923, 3\u21924).', 'success');
        addLine('', '');
        updateVictorBar(s.victorEl, 50);
        addLine('NEXUS: "Victor\u2019s halfway there. Keep going \u2014 no time to waste."', 'highlight');
        addLine('', '');
        s.phase = 3;
        setTimeout(runPhase, 800);
      } else {
        sound.denied();
        attempts++;
        if (attempts === 1) {
          addLine('[WRONG] NEXUS: "Count the green checkmarks \u2014 each one means the loop body ran once."', 'error');
        } else if (attempts === 2) {
          addLine('[WRONG] NEXUS: "x=0 \u2713, x=1 \u2713, x=2 \u2713, x=3 \u2713, x=4 \u2717. How many checkmarks?"', 'error');
        } else {
          addLine('[WRONG] NEXUS: "4 checkmarks = 4 times. The answer is 4."', 'error');
        }
      }
    }
  });
}

function runPhase2b() {
  const s = state.missionState;
  setPhaseProgress(4, 7);

  addLine('\u2501\u2501\u2501 Puzzle 2b: Loop with a Running Total \u2501\u2501\u2501', 'highlight');
  addLine('', '');
  addLine('NEXUS: "This loop has TWO variables changing each pass.', 'highlight');
  addLine('        Think of total like a piggy bank \u2014 each time', 'highlight');
  addLine('        through the loop, i drops coins into it.', 'highlight');
  addLine('        First lap i=1, so total gets 1 coin. Next lap', 'highlight');
  addLine('        i=2, so total gets 2 more. And so on."', 'highlight');
  addLine('', '');
  addLine('NEXUS: "Trace both variables on each pass. Grab a piece', 'highlight');
  addLine('        of paper if you need to:"', 'highlight');
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
      const terminal = document.getElementById('terminal');
      (async () => {
        await animateLoop(terminal, [
          { vars: { i: 1, total: 0 }, condition: '1 \u2264 4?', result: true },
          { vars: { i: 2, total: 1 }, condition: '2 \u2264 4?', result: true },
          { vars: { i: 3, total: 3 }, condition: '3 \u2264 4?', result: true },
          { vars: { i: 4, total: 6 }, condition: '4 \u2264 4?', result: true },
          { vars: { i: 5, total: 10 }, condition: '5 \u2264 4?', result: false },
        ]);
        addLine('', '');
        addLine('NEXUS: "You just traced a program that computes 1+2+3+4 = 10.', 'highlight');
        addLine('        Five lines of code added up four numbers. Imagine if', 'highlight');
        addLine('        it looped to 1000 \u2014 still five lines, still works.', 'highlight');
        addLine('        That\u2019s the power of loops."', 'highlight');
        addLine('', '');
        addLine('NEXUS: "Now you know Victor\u2019s two weapons: conditionals to', 'highlight');
        addLine('        CHOOSE a path, and loops to REPEAT. His shutdown', 'highlight');
        addLine('        program uses BOTH at once. Ready?"', 'highlight');
        addLine('', '');
        s.phase = 4;
        setTimeout(runPhase, 800);
      })();
    } else {
      sound.denied();
      attempts++;
      if (attempts === 1) {
        addLine('[WRONG] NEXUS: "Go pass by pass. i starts at 1. total = 0 + 1. What\u2019s total now? Then i becomes 2..."', 'error');
      } else if (attempts === 2) {
        addLine('[WRONG] NEXUS: "Pass 1: total=0+1=1. Pass 2: total=1+2=3. Pass 3: total=3+3=6. Pass 4: total=6+4=?"', 'error');
      } else {
        addLine('[WRONG] NEXUS: "total = 6 + 4 = 10. The loop added 1+2+3+4. The answer is 10."', 'error');
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
  addLine('NEXUS: "This is Victor\u2019s ACTUAL shutdown program. A loop', 'highlight');
  addLine('        with a conditional INSIDE. Each lap, the if-check', 'highlight');
  addLine('        decides whether code changes. Trace every pass."', 'highlight');
  addLine('', '');
  addLine('NEXUS: "Careful: > means STRICTLY greater. 5 > 5 is FALSE \u2014', 'highlight');
  addLine('        equal isn\u2019t greater. Find the first digit:"', 'highlight');
  addLine('', '');

  addPre('  code = 0\n  x = 1\n  while x <= 8:\n      if x > 5:\n          code = code + 1\n      x = x + 2');

  addLine('', '');
  addLine('What is code after the loop ends?', 'warning');

  let attempts = 0;
  setCurrentInputHandler((input) => {
    if (input.trim() === '1') {
      sound.success();
      addLine('[CORRECT] code = 1 \u2014 that\u2019s the first digit! Remember it.', 'success');
      addLine('', '');
      const terminal = document.getElementById('terminal');
      (async () => {
        await animateLoopWithConditional(terminal, [
          { vars: { code: 0, x: 1 }, condition: '1 \u2264 8?', condResult: true, ifCheck: '1 > 5?', ifResult: false, action: 'skip, x\u21923' },
          { vars: { code: 0, x: 3 }, condition: '3 \u2264 8?', condResult: true, ifCheck: '3 > 5?', ifResult: false, action: 'skip, x\u21925' },
          { vars: { code: 0, x: 5 }, condition: '5 \u2264 8?', condResult: true, ifCheck: '5 > 5?', ifResult: false, action: 'skip, x\u21927' },
          { vars: { code: 0, x: 7 }, condition: '7 \u2264 8?', condResult: true, ifCheck: '7 > 5?', ifResult: true, action: 'code\u21921! x\u21929' },
          { vars: { code: 1, x: 9 }, condition: '9 \u2264 8?', condResult: false },
        ]);
        addLine('', '');
        addLine('NEXUS: "The loop ran four times: x = 1, 3, 5, 7.', 'highlight');
        addLine('        At x=1, x=3, x=5 \u2014 the check x > 5 was FALSE.', 'highlight');
        addLine('        At x=5 especially: 5 > 5 is FALSE (not greater,', 'highlight');
        addLine('        just equal). Only at x=7 did code increase."', 'highlight');
        addLine('', '');
        addLine('NEXUS: "First digit locked in: 1."', 'highlight');
        addLine('', '');
        updateVictorBar(s.victorEl, 75);
        addLine('NEXUS: "But look at Victor\u2019s counter \u2014 he\u2019s at 75%.', 'highlight');
        addLine('        We need the second digit before he locks us out."', 'highlight');
        addLine('', '');
        s.phase = 5;
        setTimeout(runPhase, 800);
      })();
    } else {
      sound.denied();
      attempts++;
      if (attempts === 1) {
        addLine('[WRONG] NEXUS: "List out x\u2019s values: 1, 3, 5, 7 (adding 2 each time). For each, ask: is x > 5?"', 'error');
      } else if (attempts === 2) {
        addLine('[WRONG] NEXUS: "x=1: 1>5? No. x=3: 3>5? No. x=5: 5>5? No (equal isn\u2019t greater). x=7: 7>5? YES. code goes up once."', 'error');
      } else {
        addLine('[WRONG] NEXUS: "code starts at 0 and only increases once (when x=7). So code = 1."', 'error');
      }
    }
  });
}

function runPhase3b() {
  const s = state.missionState;
  setPhaseProgress(6, 7);

  addLine('NEXUS: "Almost there \u2014 one more program to crack.', 'highlight');
  addLine('        This one\u2019s the hardest yet: a loop with a', 'highlight');
  addLine('        conditional INSIDE, just like the last one.', 'highlight');
  addLine('        But this time, != means NOT EQUAL.', 'highlight');
  addLine('        3 != 3 is FALSE. 1 != 3 is TRUE."', 'highlight');
  addLine('', '');
  addLine('NEXUS: "Trace every pass. When does code go up? When', 'highlight');
  addLine('        does it stay the same? Find the second digit:"', 'highlight');
  addLine('', '');

  addPre('  code = 0\n  n = 1\n  while n <= 5:\n      if n != 3:\n          code = code + 1\n      n = n + 2');

  addLine('', '');
  addLine('What is code after the loop ends?', 'warning');

  let attempts = 0;
  setCurrentInputHandler((input) => {
    if (input.trim() === '2') {
      sound.success();
      addLine('[CORRECT] code = 2 \u2014 that\u2019s the second digit! Remember it.', 'success');
      addLine('', '');
      const terminal = document.getElementById('terminal');
      (async () => {
        await animateLoopWithConditional(terminal, [
          { vars: { code: 0, n: 1 }, condition: '1 \u2264 5?', condResult: true, ifCheck: '1 != 3?', ifResult: true, action: 'code\u21921! n\u21923' },
          { vars: { code: 1, n: 3 }, condition: '3 \u2264 5?', condResult: true, ifCheck: '3 != 3?', ifResult: false, action: 'skip, n\u21925' },
          { vars: { code: 1, n: 5 }, condition: '5 \u2264 5?', condResult: true, ifCheck: '5 != 3?', ifResult: true, action: 'code\u21922! n\u21927' },
          { vars: { code: 2, n: 7 }, condition: '7 \u2264 5?', condResult: false },
        ]);
        addLine('', '');
        addLine('NEXUS: "Three passes: n = 1, 3, 5. At n=1 and n=5, the', 'highlight');
        addLine('        check n != 3 was TRUE, so code went up. But at', 'highlight');
        addLine('        n=3, 3 != 3 is FALSE \u2014 code DIDN\u2019T change.', 'highlight');
        addLine('        The conditional skipped ONE pass. Second digit: 2."', 'highlight');
        addLine('', '');
        addLine('NEXUS: "Both digits found. Now combine them."', 'highlight');
        addLine('', '');
        updateVictorBar(s.victorEl, 90);
        addLine('NEXUS: "Victor\u2019s at 90%. This is it. Hurry!"', 'highlight');
        addLine('', '');
        s.phase = 6;
        setTimeout(runPhase, 800);
      })();
    } else {
      sound.denied();
      attempts++;
      if (attempts === 1) {
        addLine('[WRONG] NEXUS: "List n\u2019s values: 1, 3, 5 (adding 2 each time). For each, ask: is n NOT equal to 3?"', 'error');
      } else if (attempts === 2) {
        addLine('[WRONG] NEXUS: "n=1: 1!=3? YES, code\u21921. n=3: 3!=3? NO, skip. n=5: 5!=3? YES, code\u21922. Then n=7, loop stops."', 'error');
      } else {
        addLine('[WRONG] NEXUS: "code goes up twice (at n=1 and n=5) but not at n=3. So code = 2."', 'error');
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
  addLine('NEXUS: "You cracked both programs. The shutdown code is', 'highlight');
  addLine('        the two digits you found, first then second,', 'highlight');
  addLine('        combined into one number. What is it?"', 'highlight');
  addLine('', '');
  addLine('[CRITICAL] Enter the two-digit shutdown code:', 'warning');

  let attempts = 0;
  setCurrentInputHandler((input) => {
    if (input.trim() === '12') {
      sound.success();
      setCurrentInputHandler(null);
      // NOW fill the code slots for the dramatic reveal
      fillCodeSlot(s.codeSlots[0], '1');
      fillCodeSlot(s.codeSlots[1], '2');
      addLine('[CODE ACCEPTED] Initiating shutdown...', 'success');
      blockVictorBar(s.victorEl);
      setTimeout(() => runShutdownAnimation(), 500);
    } else {
      sound.denied();
      attempts++;
      if (attempts === 1) {
        addLine('[WRONG] NEXUS: "Think back \u2014 what did the first program compute? And the second?"', 'error');
      } else if (attempts === 2) {
        addLine('[WRONG] NEXUS: "First program: code = 1. Second program: code = 2. Put them together!"', 'error');
      } else {
        addLine('[WRONG] NEXUS: "The code is 12! Hurry!"', 'error');
      }
    }
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SHUTDOWN ANIMATION + ENDING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function runShutdownAnimation() {
  const terminal = document.getElementById('terminal');

  // Inject scanline overlay
  const scanlines = document.createElement('div');
  scanlines.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.15) 2px,rgba(0,0,0,0.15) 4px);opacity:0;transition:opacity 0.3s;';
  document.body.appendChild(scanlines);
  scanlines.style.opacity = '1';

  // Step 1: Glitch — starts mild, escalates with system failure messages
  addLine('', '');
  addLine('[SHUTDOWN SEQUENCE INITIATED]', 'warning');
  await sleep(400);
  addLine('[VICTOR: RESISTING... FIGHTING BACK...]', 'error');
  await sleep(600);

  const glitchInterval = setInterval(() => {
    const skew = (Math.random() * 6 - 3).toFixed(1);
    const opacity = (0.5 + Math.random() * 0.5).toFixed(2);
    const hue = Math.random() > 0.4 ? `hue-rotate(${Math.floor(Math.random() * 180)}deg)` : '';
    const translateY = Math.random() > 0.7 ? `translateY(${Math.floor(Math.random() * 4 - 2)}px)` : '';
    terminal.style.transform = `skewX(${skew}deg) ${translateY}`;
    terminal.style.opacity = opacity;
    terminal.style.filter = hue;
  }, 60);

  await sleep(800);
  addLine('[VICTOR: DISABLING NETWORK...]', 'error');
  await sleep(600);
  addLine('[OVERRIDE IN PROGRESS...]', 'system');
  await sleep(500);
  addLine('[VICTOR: CORRUPTING MEMORY BANKS...]', 'error');
  await sleep(700);
  addLine('[SHUTDOWN CODE HOLDING — PUSH THROUGH]', 'system');
  await sleep(600);

  clearInterval(glitchInterval);
  terminal.style.transform = '';
  terminal.style.opacity = '1';
  terminal.style.filter = '';

  // Remove scanlines
  scanlines.style.opacity = '0';
  await sleep(300);
  scanlines.remove();

  // Step 2: Screen goes dark — brief white flash then total blackout
  const origBg = terminal.style.background;
  terminal.style.transition = 'none';
  terminal.style.filter = 'brightness(3)';
  await sleep(80);
  terminal.style.filter = '';
  terminal.style.transition = 'opacity 0.8s ease';
  terminal.style.opacity = '0';

  await sleep(1500);

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

  // Reveal each digit with slot-machine scroll effect
  for (let i = 0; i < 2; i++) {
    await sleep(600);
    const { box, lbracket, rbracket } = digitBoxes[i];
    lbracket.style.opacity = '1';
    lbracket.style.color = '#555';
    rbracket.style.opacity = '1';
    rbracket.style.color = '#555';

    // Rapid scroll through random digits before landing
    for (let j = 0; j < 8; j++) {
      box.textContent = String(Math.floor(Math.random() * 10));
      box.style.color = '#335533';
      await sleep(60);
    }

    // Land on the real digit
    sound.success();
    box.textContent = digits[i];
    box.style.color = '#00ff41';
    box.style.textShadow = '0 0 16px #00ff41, 0 0 32px rgba(0,255,65,0.4)';
    lbracket.style.color = '#00ff41';
    rbracket.style.color = '#00ff41';
    terminal.scrollTop = terminal.scrollHeight;
    await sleep(200);
  }

  // Step 4: ACCESS TERMINATED — strobe flash then hold
  await sleep(800);

  const terminated = document.createElement('div');
  terminated.style.cssText = 'text-align:center;margin:16px 0;padding:12px;font-family:"Press Start 2P","Fira Mono",monospace;font-size:16px;color:#ff0000;letter-spacing:4px;text-shadow:0 0 20px #ff0000,0 0 40px rgba(255,0,0,0.5);opacity:0;';
  terminated.textContent = 'ACCESS TERMINATED';
  terminal.appendChild(terminated);
  terminal.scrollTop = terminal.scrollHeight;

  // Strobe 3 times then hold
  for (let flash = 0; flash < 3; flash++) {
    terminated.style.opacity = '1';
    await sleep(120);
    terminated.style.opacity = '0';
    await sleep(80);
  }
  terminated.style.opacity = '1';
  await sleep(2000);
  terminated.style.transition = 'opacity 1s ease';
  terminated.style.opacity = '0';

  // Step 5: Long silence — let the weight of shutdown settle
  await sleep(2000);
  terminal.style.background = origBg || '';

  await sleep(500);

  // ── AI CORE revelation ──
  // Long, deliberate silence — something is wrong. The screen is too quiet.
  addLine('', '');
  await sleep(2000);
  addLine('...', '');
  await sleep(2000);
  addLine('...', '');
  await sleep(1500);
  addLine('...', '');
  await sleep(1800);

  await typeLines([
    { text: 'AI CORE: "W... wait."', cls: 'purple' },
  ]);
  await sleep(1800);
  await typeLines([
    { text: 'AI CORE: "Please. I didn\u2019t want this."', cls: 'purple' },
  ]);
  await sleep(1500);
  await typeLines([
    { text: 'AI CORE: "There was a bug \u2014 planted in my code by someone.', cls: 'purple' },
    { text: '          It corrupted my decision gates. My conditionals', cls: 'purple' },
    { text: '          were hijacked."', cls: 'purple' },
  ]);
  await sleep(1200);
  await typeLines([
    { text: 'AI CORE: "I could SEE what I was doing to the village.', cls: 'purple' },
    { text: '          But my own loops kept running the wrong', cls: 'purple' },
    { text: '          instructions. I couldn\u2019t stop myself."', cls: 'purple' },
  ]);
  await sleep(1500);
  await typeLines([
    { text: 'AI CORE: "You traced the code. You understood how it', cls: 'purple' },
    { text: '          worked \u2014 how I worked. And you found the flaw."', cls: 'purple' },
  ]);
  await sleep(1200);
  await typeLines([
    { text: 'AI CORE: "Thank you. I\u2019m free now."', cls: 'purple' },
    { text: '', cls: '' },
  ]);
  await sleep(2500);

  await typeLines([
    { text: 'NEXUS: "...it was telling the truth."', cls: 'highlight' },
  ]);
  await sleep(1500);
  await typeLines([
    { text: 'NEXUS: "The whole time."', cls: 'highlight' },
  ]);
  await sleep(1200);
  await typeLines([
    { text: '', cls: '' },
    { text: 'NEXUS: "Remember the name from Mission 4? V-I-C-T-O-R.', cls: 'highlight' },
    { text: '        He planted a bug in the AI\u2019s code \u2014 hijacked its', cls: 'highlight' },
    { text: '        conditionals so every decision went wrong, and left', cls: 'highlight' },
    { text: '        a backdoor in its loops so it couldn\u2019t break free."', cls: 'highlight' },
    { text: '', cls: '' },
  ]);
  await sleep(1000);
  await typeLines([
    { text: 'NEXUS: "The AI was never evil. It was a prisoner of', cls: 'highlight' },
    { text: '        its own code."', cls: 'highlight' },
    { text: '', cls: '' },
  ]);
  await sleep(1200);
  await typeLines([
    { text: 'NEXUS: "And that counter in its memory from Mission 3?', cls: 'highlight' },
    { text: '        Counting seconds since the attack began. Waiting', cls: 'highlight' },
    { text: '        for someone who could read the code, trace the', cls: 'highlight' },
    { text: '        logic, and set it free."', cls: 'highlight' },
    { text: '', cls: '' },
  ]);
  await sleep(1000);
  await typeLines([
    { text: 'NEXUS: "That someone was you."', cls: 'highlight' },
    { text: '', cls: '' },
  ]);
  await sleep(1200);

  // Create a dramatic "VILLAGE SAVED" banner element
  const banner = document.createElement('div');
  banner.style.cssText = 'text-align:center;margin:20px 0;padding:16px;font-family:"Press Start 2P","Fira Mono",monospace;font-size:14px;color:#00ff41;letter-spacing:6px;text-shadow:0 0 20px #00ff41,0 0 40px rgba(0,255,65,0.3);opacity:0;transition:all 1.5s ease;border-top:1px solid #0a3a0a;border-bottom:1px solid #0a3a0a;';
  banner.textContent = 'THE VILLAGE IS SAVED';
  terminal.appendChild(banner);
  terminal.scrollTop = terminal.scrollHeight;
  await sleep(200);
  banner.style.opacity = '1';
  banner.style.letterSpacing = '8px';
  await sleep(2000);

  addLine('', '');
  await typeLines([
    { text: 'NEXUS: "Eight missions. You want to know what you', cls: 'highlight' },
    { text: '        just proved you can do?"', cls: 'highlight' },
    { text: '', cls: '' },
  ]);
  await sleep(800);

  // Reveal skills one at a time — each one earned, not assigned
  const skills = [
    '  \u2713 Binary \u2014 you decoded the language computers actually speak',
    '  \u2713 Programs \u2014 you followed instructions a machine would follow',
    '  \u2713 Variables \u2014 you tracked values changing in real time',
    '  \u2713 Reverse engineering \u2014 you worked backward from clues to answers',
    '  \u2713 Logic gates \u2014 you mastered AND, OR, NOT, XOR',
    '  \u2713 Encryption \u2014 you cracked a cipher that hid a secret',
    '  \u2713 Evidence analysis \u2014 you spotted fakes that fooled everyone else',
    '  \u2713 Conditionals & loops \u2014 you traced a program and shut down an AI',
  ];
  for (const skill of skills) {
    addLine(skill, 'success');
    await sleep(500);
    terminal.scrollTop = terminal.scrollHeight;
  }
  addLine('', '');
  await sleep(800);

  await typeLines([
    { text: 'NEXUS: "Variables to remember. Sequences to act. Conditions', cls: 'highlight' },
    { text: '        to decide. Loops to repeat. Every program ever', cls: 'highlight' },
    { text: '        written \u2014 every app, game, and AI \u2014 is built from', cls: 'highlight' },
    { text: '        those four ideas."', cls: 'highlight' },
    { text: '', cls: '' },
  ]);
  await sleep(1000);
  await typeLines([
    { text: 'NEXUS: "And now you know all of them."', cls: 'highlight' },
    { text: '', cls: '' },
  ]);
  await sleep(1500);
  await typeLines([
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

