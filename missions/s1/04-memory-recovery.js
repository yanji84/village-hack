// missions/s1/04-memory-recovery.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setCurrentInputHandler,
  completeMission,
  sleep,
} from '../../engine.js';

// ── Variable tracker helpers (local to this mission) ──

function createVarBox(name, value) {
  const box = document.createElement('div');
  box.style.cssText = 'display:inline-flex; flex-direction:column; align-items:center; border:1px solid #00aa2a; border-radius:4px; padding:8px 16px; min-width:60px; background:#0d1117;';

  const nameEl = document.createElement('div');
  nameEl.style.cssText = 'font-size:11px; color:#00aa2a; text-transform:uppercase;';
  nameEl.textContent = name;

  const valEl = document.createElement('div');
  valEl.style.cssText = 'font-size:20px; color:#00ff41; font-weight:bold; transition: all 0.3s;';
  valEl.textContent = value ?? '?';

  box.appendChild(nameEl);
  box.appendChild(valEl);
  box._valEl = valEl;
  return box;
}

function updateVarBox(box, newValue) {
  return new Promise(resolve => {
    const valEl = box._valEl;
    valEl.style.opacity = '0';
    valEl.style.transform = 'translateY(-8px)';
    setTimeout(() => {
      valEl.textContent = String(newValue);
      valEl.style.opacity = '1';
      valEl.style.transform = 'translateY(0)';
      setTimeout(resolve, 300);
    }, 300);
  });
}

function makeTracker() {
  const tracker = document.createElement('div');
  tracker.style.cssText = 'display:flex; gap:16px; margin:12px 0; padding:12px; border:1px solid #1a2a1a; border-radius:4px; background:#050505;';
  return tracker;
}

function makeAnnotation(text) {
  const el = document.createElement('div');
  el.style.cssText = 'color:#00aa2a; font-size:12px; margin-top:6px; font-family:"Fira Mono",monospace; opacity:0; transition: opacity 0.3s;';
  el.textContent = text;
  return el;
}

function scrollTerminal() {
  const t = document.getElementById('terminal');
  if (t) t.scrollTop = t.scrollHeight;
}

function addReplayButton(container, animationFn) {
  const btn = document.createElement('span');
  btn.textContent = '[ replay ]';
  btn.style.cssText = 'color: var(--cyan, #00ffff); cursor: pointer; font-size: 11px; opacity: 0.6; transition: opacity 0.2s; margin-top: 4px; display: inline-block;';
  btn.onmouseenter = () => btn.style.opacity = '1';
  btn.onmouseleave = () => btn.style.opacity = '0.6';
  btn.onclick = () => animationFn();
  container.appendChild(btn);
  scrollTerminal();
}

export const mission = {
  id: 3,
  num: '04',
  title: 'MEMORY RECOVERY',
  name: 'Memory Recovery',
  desc: 'The AI\'s memory is corrupted. Decode binary, trace programs, and reverse-engineer missing values to recover it.',
  skill: 'SKILL: Binary + Variables + Reverse Engineering',
  hints: [
    'Start with the binary. Convert each one to a decimal number using place values.',
    'For tracing: work line by line. After each line, write down what EVERY variable is.',
    'For reverse engineering: start from the output and work BACKWARD through each line.',
  ],
  run: async function() {
    state.missionState = { phase: 0, hintIdx: 0 };

    await typeLines([
      { text: '[SYSTEM] Deeper memory fragments recovered from AI core.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "We pulled deeper fragments of the AI\'s memory.', cls: 'highlight' },
      { text: '        Binary data mixed with program traces. Whatever', cls: 'highlight' },
      { text: '        that counter is tracking, the answer might be', cls: 'highlight' },
      { text: '        in here."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "This is digital forensics. Everything you\'ve', cls: 'highlight' },
      { text: '        learned so far, working together."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);

    runRecoveryPhase();
  },
};

function runRecoveryPhase() {
  const s = state.missionState;

  if (s.phase === 0) {
    // Level 1: Decode binary values, run a simple computation
    addLine('\u2501\u2501\u2501 Memory Fragment 1 \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "First fragment. Two variables stored in binary.', 'highlight');
    addLine('        Decode them, then run the program to find the result."', 'highlight');
    addLine('', '');
    addPre('  Memory dump:\n    x = 0011     (binary)\n    y = 0101     (binary)\n\n  Program found:\n    z = x + y');
    addLine('', '');
    addLine('  (Remember: places are eights, fours, twos, ones)', 'info');
    addLine('', '');
    addLine('What is z? (as a regular number)', 'warning');

    setCurrentInputHandler((input) => {
      // 0011=3, 0101=5, z=3+5=8
      if (input.trim() === '8') {
        sound.success();
        addLine('[CORRECT] x=0011=3, y=0101=5, z=3+5=8.', 'success');

        // ── Animated variable tracker for Level 1 ──
        (async () => {
          const terminal = document.getElementById('terminal');
          const wrapper = document.createElement('div');
          const tracker = makeTracker();
          wrapper.appendChild(tracker);
          terminal.appendChild(wrapper);
          scrollTerminal();

          // Step 1: x appears
          const boxX = createVarBox('x', 3);
          tracker.appendChild(boxX);
          scrollTerminal();
          await sleep(800);

          // Step 2: y appears
          const boxY = createVarBox('y', 5);
          tracker.appendChild(boxY);
          scrollTerminal();
          await sleep(800);

          // Step 3: z appears
          const boxZ = createVarBox('z', 8);
          tracker.appendChild(boxZ);
          scrollTerminal();
          await sleep(800);

          // Step 4: annotation
          const ann = makeAnnotation('3 + 5 = 8');
          wrapper.appendChild(ann);
          requestAnimationFrame(() => { ann.style.opacity = '1'; });
          scrollTerminal();
          await sleep(600);

          async function replayLevel1() {
            await updateVarBox(boxX, '?');
            await updateVarBox(boxY, '?');
            await updateVarBox(boxZ, '?');
            ann.style.opacity = '0';
            await sleep(300);
            await updateVarBox(boxX, 3);
            await sleep(800);
            await updateVarBox(boxY, 5);
            await sleep(800);
            await updateVarBox(boxZ, 8);
            await sleep(800);
            ann.style.opacity = '1';
            scrollTerminal();
            await sleep(600);
          }
          addReplayButton(wrapper, replayLevel1);

          addLine('NEXUS: "Binary to decimal, then variable tracing. Two', 'highlight');
          addLine('        skills chained together."', 'highlight');
          s.phase = 1;
          addLine('');
          setTimeout(runRecoveryPhase, 800);
        })();
      } else {
        sound.denied();
        s.wrongCount = (s.wrongCount || 0) + 1;
        if (s.wrongCount === 1) {
          addLine('[WRONG] Two steps: decode the binary first, then add.', 'error');
        } else {
          addLine('[WRONG] 0011 = 0+0+2+1 = 3. 0101 = 0+4+0+1 = 5. Now add them.', 'error');
        }
      }
    });

  } else if (s.phase === 1) {
    // Level 2: Decode + trace multi-line program with overwriting
    addLine('\u2501\u2501\u2501 Memory Fragment 2 \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "Harder one. More variables, more lines. Trace', 'highlight');
    addLine('        carefully \u2014 values change."', 'highlight');
    addLine('', '');
    addPre('  Memory dump:\n    a = 0100     (binary)\n    b = 0011     (binary)\n\n  Program found:\n    1  c = a + b\n    2  a = c - 1\n    3  b = a + b');
    addLine('', '');
    addLine('What are a and b after line 3? Type: a b', 'warning');

    s.wrongCount = 0;
    setCurrentInputHandler((input) => {
      // a=0100=4, b=0011=3
      // c = 4+3 = 7
      // a = 7-1 = 6
      // b = 6+3 = 9
      const parts = input.trim().split(/[\s,]+/).map(Number);
      if (parts.length === 2 && parts[0] === 6 && parts[1] === 9) {
        sound.success();
        addLine('[CORRECT] a=6, b=9.', 'success');

        // ── Animated variable tracker for Level 2 ──
        (async () => {
          const terminal = document.getElementById('terminal');
          const wrapper = document.createElement('div');
          const tracker = makeTracker();
          wrapper.appendChild(tracker);
          terminal.appendChild(wrapper);
          scrollTerminal();

          // Step 1: a=4, b=3 (decoded from binary)
          const boxA = createVarBox('a', 4);
          const boxB = createVarBox('b', 3);
          tracker.appendChild(boxA);
          tracker.appendChild(boxB);
          scrollTerminal();
          await sleep(800);

          // Step 2: c appears = 7
          const boxC = createVarBox('c', 7);
          tracker.appendChild(boxC);
          const ann1 = makeAnnotation('c = a + b = 4 + 3 = 7');
          wrapper.appendChild(ann1);
          requestAnimationFrame(() => { ann1.style.opacity = '1'; });
          scrollTerminal();
          await sleep(800);

          // Step 3: a changes from 4 to 6
          await updateVarBox(boxA, 6);
          ann1.textContent = 'a = c - 1 = 7 - 1 = 6  (a changed!)';
          scrollTerminal();
          await sleep(800);

          // Step 4: b changes from 3 to 9
          await updateVarBox(boxB, 9);
          ann1.textContent = 'b = new a + old b = 6 + 3 = 9';
          scrollTerminal();
          await sleep(600);

          async function replayLevel2() {
            await updateVarBox(boxA, '?');
            await updateVarBox(boxB, '?');
            await updateVarBox(boxC, '?');
            ann1.style.opacity = '0';
            await sleep(300);
            await updateVarBox(boxA, 4);
            await updateVarBox(boxB, 3);
            await sleep(800);
            await updateVarBox(boxC, 7);
            ann1.textContent = 'c = a + b = 4 + 3 = 7';
            ann1.style.opacity = '1';
            scrollTerminal();
            await sleep(800);
            await updateVarBox(boxA, 6);
            ann1.textContent = 'a = c - 1 = 7 - 1 = 6  (a changed!)';
            scrollTerminal();
            await sleep(800);
            await updateVarBox(boxB, 9);
            ann1.textContent = 'b = new a + old b = 6 + 3 = 9';
            scrollTerminal();
            await sleep(600);
          }
          addReplayButton(wrapper, replayLevel2);

          addLine('NEXUS: "Let me trace it:', 'highlight');
          addLine('  a=0100=4, b=0011=3', 'info');
          addLine('  Line 1: c = 4+3 = 7', 'info');
          addLine('  Line 2: a = 7-1 = 6  (a changed!)', 'info');
          addLine('  Line 3: b = 6+3 = 9  (using NEW a)"', 'info');
          addLine('NEXUS: "Binary decoding, variable assignment, overwriting,', 'highlight');
          addLine('        and the copy rule \u2014 all in one problem."', 'highlight');
          s.phase = 2;
          addLine('');
          setTimeout(runRecoveryPhase, 800);
        })();
      } else {
        sound.denied();
        s.wrongCount++;
        if (s.wrongCount === 1) {
          addLine('[WRONG] Decode first: 0100 and 0011. Then trace line by line.', 'error');
        } else if (s.wrongCount === 2) {
          addLine('[WRONG] a=4, b=3. Line 1: c=7. Line 2: a=? (c minus 1). Line 3: b=? (new a plus old b).', 'error');
        } else {
          addLine('[WRONG] a=4, b=3, c=7. Then a = 7-1 = 6. Then b = 6+3 = ?', 'error');
        }
      }
    });

  } else if (s.phase === 2) {
    // Level 3: Reverse engineering — work backward from output
    addLine('\u2501\u2501\u2501 Memory Fragment 3: Corrupted \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "This fragment is damaged. One input is missing.', 'highlight');
    addLine('        But we have the OUTPUT and the PROGRAM. You have', 'highlight');
    addLine('        to work BACKWARD to find the missing value."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "This is called REVERSE ENGINEERING \u2014 figuring out', 'highlight');
    addLine('        the input from the output. Real hackers do this', 'highlight');
    addLine('        every day."', 'highlight');
    addLine('', '');
    addPre('  Memory dump:\n    a = 0110     (binary)\n    b = ????     (corrupted!)\n\n  Program found:\n    1  c = a + b\n    2  c = c * 2\n\n  Output recovered:\n    c = 11000    (binary)');
    addLine('', '');
    addLine('NEXUS: "You know a. You know c. Work backward through the', 'highlight');
    addLine('        program to find b."', 'highlight');
    addLine('', '');
    addLine('What is b? (as a regular number)', 'warning');

    s.wrongCount = 0;
    setCurrentInputHandler((input) => {
      // a = 0110 = 6
      // c = 11000 = 24
      // Reverse line 2: c was 24, before *2 it was 12
      // Reverse line 1: c=12 = a+b = 6+b, so b=6
      if (input.trim() === '6') {
        sound.success();
        addLine('[CORRECT] b = 6.', 'success');
        addLine('', '');

        // ── Animated backward trace for Level 3 ──
        (async () => {
          const terminal = document.getElementById('terminal');
          const wrapper = document.createElement('div');
          const tracker = makeTracker();
          wrapper.appendChild(tracker);
          terminal.appendChild(wrapper);
          scrollTerminal();

          // Step 1: Show starting state: a=6, b=?, c=24
          const boxA = createVarBox('a', 6);
          const boxB = createVarBox('b', '?');
          const boxC = createVarBox('c', 24);
          tracker.appendChild(boxA);
          tracker.appendChild(boxB);
          tracker.appendChild(boxC);
          scrollTerminal();
          await sleep(800);

          // Step 2: c was 24, before x2 it was 12
          const ann = makeAnnotation('c was 24, before \u00d72 it was 12');
          wrapper.appendChild(ann);
          requestAnimationFrame(() => { ann.style.opacity = '1'; });
          await updateVarBox(boxC, 12);
          scrollTerminal();
          await sleep(800);

          // Step 3: 12 = 6 + b, so b = 6
          ann.textContent = '12 = 6 + b, so b = 6';
          await updateVarBox(boxB, 6);
          scrollTerminal();
          await sleep(600);

          async function replayLevel3() {
            await updateVarBox(boxA, 6);
            await updateVarBox(boxB, '?');
            await updateVarBox(boxC, 24);
            ann.style.opacity = '0';
            scrollTerminal();
            await sleep(800);
            ann.textContent = 'c was 24, before \u00d72 it was 12';
            ann.style.opacity = '1';
            await updateVarBox(boxC, 12);
            scrollTerminal();
            await sleep(800);
            ann.textContent = '12 = 6 + b, so b = 6';
            await updateVarBox(boxB, 6);
            scrollTerminal();
            await sleep(600);
          }
          addReplayButton(wrapper, replayLevel3);

          addLine('NEXUS: "Here\'s the reverse trace:', 'highlight');
          addLine('  a = 0110 = 6', 'info');
          addLine('  c = 11000 = 24', 'info');
          addLine('  Reverse line 2: c = c * 2, so before that, c = 24 / 2 = 12', 'info');
          addLine('  Reverse line 1: c = a + b, so 12 = 6 + b, so b = 6', 'info');
          addLine('', '');
          addLine('NEXUS: "You just did reverse engineering. You took an', 'highlight');
          addLine('        output, a program, and worked BACKWARD to find', 'highlight');
          addLine('        a missing input. That\'s real forensic analysis."', 'highlight');
          addLine('', '');
          addLine('NEXUS: "Binary, variables, tracing, and now reverse', 'highlight');
          addLine('        engineering. Your toolkit is growing,', 'highlight');
          addLine(`        ${state.hackerName || 'kid'}."`, 'highlight');
          addLine('', '');
          addLine('NEXUS: "Wait \u2014 one of the recovered fragments had a', 'highlight');
          addLine('        name. Partial, corrupted. Three letters: V-I-C.', 'highlight');
          addLine('        Someone\'s name is in the AI\'s memory. Who is', 'highlight');
          addLine('        VIC?"', 'highlight');
          addLine('', '');
          addLine('[ Type NEXT to continue ]', 'warning');
          setCurrentInputHandler(() => {
            setCurrentInputHandler(null);
            completeMission(3);
          });
        })();
      } else {
        sound.denied();
        s.wrongCount++;
        if (s.wrongCount === 1) {
          addLine('[WRONG] Start from the end. c is 11000 in binary \u2014 what number is that?', 'error');
        } else if (s.wrongCount === 2) {
          addLine('[WRONG] c = 11000 = 24. Line 2 doubled it. So BEFORE line 2, c was 24 \u00f7 2 = ?', 'error');
        } else {
          addLine('[WRONG] Before line 2: c = 12. Line 1: c = a + b. a = 6. So 12 = 6 + b. b = ?', 'error');
        }
      }
    });
  }
}
