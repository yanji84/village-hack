// missions/s1/04-memory-recovery.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setCurrentInputHandler,
  completeMission,
  sleep,
} from '../../engine.js';

import { createBoxElement, updateBoxValue, flashBox } from '../helpers.js';

// ── Layout helpers (local to this mission) ──

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
    'Binary place values are 8, 4, 2, 1 (right to left). A 1 means "add this value." A 0 means "skip it."',
    'For tracing: work line by line. After each line, write down what EVERY variable equals. When one changes, cross out the old value.',
    'For reverse engineering: start from the output and undo each operation in REVERSE order. Multiplication undoes with division. Addition undoes with subtraction.',
  ],
  run: async function() {
    state.missionState = { phase: 0, hintIdx: 0 };

    await typeLines([
      { text: '[SYSTEM] Deeper memory fragments recovered from AI core.', cls: 'system' },
      { text: '[SYSTEM] Warning: fragments contain mixed encodings.', cls: 'system' },
      { text: '[SYSTEM] Warning: one fragment shows structural damage.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "We pulled three fragments from the AI\'s deeper', cls: 'highlight' },
      { text: '        memory. Binary data tangled with program logic.', cls: 'highlight' },
      { text: '        Whatever this AI was counting, these fragments', cls: 'highlight' },
      { text: '        might tell us why."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Here\'s the thing \u2014 this isn\'t just one skill', cls: 'highlight' },
      { text: '        anymore. You\'ll need to CHAIN skills together,', cls: 'highlight' },
      { text: '        like links in a chain. Decode binary, THEN trace', cls: 'highlight' },
      { text: '        the program. Read the output, THEN work backward', cls: 'highlight' },
      { text: '        to figure out what the input must have been."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Three fragments. Each one is harder than the', cls: 'highlight' },
      { text: '        last. Let\'s go."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);

    runRecoveryPhase();
  },
};

function runRecoveryPhase() {
  const s = state.missionState;

  if (s.phase === 0) {
    // Level 1: Decode binary values, run a simple computation
    addLine('\u2501\u2501\u2501 Memory Fragment 1 of 3 \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "First fragment. The values are stored in binary,', 'highlight');
    addLine('        but the program uses regular math. So you need', 'highlight');
    addLine('        to DECODE first, then COMPUTE."', 'highlight');
    addLine('', '');
    addPre('  Memory dump:\n    x = 0011     (binary)\n    y = 0101     (binary)\n\n  Program found:\n    z = x + y');
    addLine('', '');
    addLine('  Step 1: Decode each binary number using place values 8, 4, 2, 1', 'info');
    addLine('          Example: 0011 \u2192 0+0+2+1 = 3  (only the 2-place and 1-place are ON)', 'info');
    addLine('          Now decode 0101 the same way.', 'info');
    addLine('  Step 2: Once you know x and y as regular numbers, add them.', 'info');
    addLine('', '');
    addLine('What is z? (as a regular number)', 'warning');

    s.wrongCount = 0;
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
          const boxX = createBoxElement('x', 3);
          tracker.appendChild(boxX);
          scrollTerminal();
          await sleep(800);

          // Step 2: y appears
          const boxY = createBoxElement('y', 5);
          tracker.appendChild(boxY);
          scrollTerminal();
          await sleep(800);

          // Step 3: z appears
          const boxZ = createBoxElement('z', 8);
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
            await updateBoxValue(boxX, '?');
            await updateBoxValue(boxY, '?');
            await updateBoxValue(boxZ, '?');
            ann.style.opacity = '0';
            await sleep(300);
            await updateBoxValue(boxX, 3);
            await sleep(800);
            await updateBoxValue(boxY, 5);
            await sleep(800);
            await updateBoxValue(boxZ, 8);
            await sleep(800);
            ann.style.opacity = '1';
            scrollTerminal();
            await sleep(600);
          }
          addReplayButton(wrapper, replayLevel1);

          addLine('NEXUS: "See the pattern? The data was in one format,', 'highlight');
          addLine('        the program needed another. You TRANSLATED', 'highlight');
          addLine('        first, then computed. That\'s skill chaining \u2014', 'highlight');
          addLine('        and every fragment from here gets harder."', 'highlight');
          s.phase = 1;
          addLine('');
          setTimeout(runRecoveryPhase, 800);
        })();
      } else {
        sound.denied();
        s.wrongCount++;
        const guess = parseInt(input.trim(), 10);
        if (s.wrongCount === 1) {
          if (guess === 3 || guess === 5) {
            addLine(`[WRONG] ${guess} is one of the decoded values, but z = x + y. You need the SUM.`, 'error');
          } else {
            addLine('[WRONG] Two steps: first decode each binary number, then add them. Start with 0011 using places 8, 4, 2, 1.', 'error');
          }
        } else if (s.wrongCount === 2) {
          addLine('[WRONG] 0011: the 2-place and 1-place are ON \u2192 0+0+2+1 = 3. Now decode 0101 the same way: 0+4+0+1 = ?', 'error');
        } else {
          addLine('[WRONG] x = 0011 = 3. y = 0101 = 5. z = x + y = 3 + 5 = ?', 'error');
        }
      }
    });

  } else if (s.phase === 1) {
    // Level 2: Decode + trace multi-line program with overwriting
    addLine('\u2501\u2501\u2501 Memory Fragment 2 of 3 \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "This one is trickier. The program OVERWRITES', 'highlight');
    addLine('        a variable partway through. Think of it like', 'highlight');
    addLine('        erasing a number on a whiteboard and writing', 'highlight');
    addLine('        a new one. Same name, different value."', 'highlight');
    addLine('', '');
    addPre('  Memory dump:\n    a = 0100     (binary)\n    b = 0011     (binary)\n\n  Program found:\n    1  c = a + b\n    2  a = c - 1       \u2190 a gets overwritten here!\n    3  b = a + b');
    addLine('', '');
    addLine('  Trace each line in order, top to bottom.', 'info');
    addLine('  After line 2, a holds a NEW value. Line 3 uses that new value.', 'info');
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
          const boxA = createBoxElement('a', 4);
          const boxB = createBoxElement('b', 3);
          tracker.appendChild(boxA);
          tracker.appendChild(boxB);
          scrollTerminal();
          await sleep(800);

          // Step 2: c appears = 7
          const boxC = createBoxElement('c', 7);
          tracker.appendChild(boxC);
          const ann1 = makeAnnotation('c = a + b = 4 + 3 = 7');
          wrapper.appendChild(ann1);
          requestAnimationFrame(() => { ann1.style.opacity = '1'; });
          scrollTerminal();
          await sleep(800);

          // Step 3: a changes from 4 to 6 — flash to highlight the overwrite
          await updateBoxValue(boxA, 6);
          await flashBox(boxA, '#ffaa00');
          ann1.textContent = 'a = c - 1 = 7 - 1 = 6  (a changed!)';
          scrollTerminal();
          await sleep(800);

          // Step 4: b changes from 3 to 9
          await updateBoxValue(boxB, 9);
          await flashBox(boxB, '#ffaa00');
          ann1.textContent = 'b = a + b = 6 + 3 = 9  (uses the NEW a=6, not the old a=4)';
          scrollTerminal();
          await sleep(600);

          async function replayLevel2() {
            await updateBoxValue(boxA, '?');
            await updateBoxValue(boxB, '?');
            await updateBoxValue(boxC, '?');
            ann1.style.opacity = '0';
            await sleep(300);
            await updateBoxValue(boxA, 4);
            await updateBoxValue(boxB, 3);
            await sleep(800);
            await updateBoxValue(boxC, 7);
            ann1.textContent = 'c = a + b = 4 + 3 = 7';
            ann1.style.opacity = '1';
            scrollTerminal();
            await sleep(800);
            await updateBoxValue(boxA, 6);
            await flashBox(boxA, '#ffaa00');
            ann1.textContent = 'a = c - 1 = 7 - 1 = 6  (a changed!)';
            scrollTerminal();
            await sleep(800);
            await updateBoxValue(boxB, 9);
            await flashBox(boxB, '#ffaa00');
            ann1.textContent = 'b = a + b = 6 + 3 = 9  (uses the NEW a=6, not the old a=4)';
            scrollTerminal();
            await sleep(600);
          }
          addReplayButton(wrapper, replayLevel2);

          addLine('NEXUS: "Full trace:', 'highlight');
          addLine('  Start:  a=0100=4, b=0011=3', 'info');
          addLine('  Line 1: c = 4+3 = 7', 'info');
          addLine('  Line 2: a = 7-1 = 6       \u2190 a is overwritten!', 'info');
          addLine('  Line 3: b = 6+3 = 9       \u2190 uses the NEW a (6), not the old a (4)', 'info');
          addLine('', '');
          addLine('NEXUS: "This is why tracing matters. The SAME variable', 'highlight');
          addLine('        name can hold DIFFERENT values at different points.', 'highlight');
          addLine('        If you skip a line, everything after it is wrong.', 'highlight');
          addLine('        One more fragment \u2014 and this last one is damaged."', 'highlight');
          s.phase = 2;
          addLine('');
          setTimeout(runRecoveryPhase, 800);
        })();
      } else {
        sound.denied();
        s.wrongCount++;
        if (s.wrongCount === 1) {
          // Detect common mistakes
          if (parts.length === 2 && parts[0] === 4 && parts[1] === 7) {
            addLine('[WRONG] You used the ORIGINAL a=4 in line 3. But line 2 changed a! Re-trace from line 2.', 'error');
          } else if (parts.length === 2 && parts[0] === 6 && parts[1] === 3) {
            addLine('[WRONG] a=6 is right! But b also changes on line 3. b = a + b = 6 + 3 = ?', 'error');
          } else {
            addLine('[WRONG] Decode first: 0100 = 4, 0011 = 3. Then trace each line, top to bottom.', 'error');
          }
        } else if (s.wrongCount === 2) {
          addLine('[WRONG] a=4, b=3. Line 1: c = 4+3 = 7. Line 2: a = 7-1 = ? (a is now different!). Line 3: b = new_a + 3.', 'error');
        } else {
          addLine('[WRONG] After line 2, a = 7-1 = 6. Line 3 uses THIS a: b = 6+3 = ? Type both values: a b', 'error');
        }
      }
    });

  } else if (s.phase === 2) {
    // Level 3: Reverse engineering — work backward from output
    addLine('\u2501\u2501\u2501 Memory Fragment 3 of 3: CORRUPTED \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "Last fragment. It\'s damaged \u2014 one input is gone.', 'highlight');
    addLine('        But we recovered the OUTPUT and the PROGRAM."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "Normally you go input \u2192 program \u2192 output.', 'highlight');
    addLine('        But here, one input is MISSING and we only', 'highlight');
    addLine('        have the output. So we run the program BACKWARD.', 'highlight');
    addLine('        Undo each step in reverse. Programmers call this', 'highlight');
    addLine('        REVERSE ENGINEERING."', 'highlight');
    addLine('', '');
    addPre('  Memory dump:\n    a = 0110     (binary)\n    b = ????     (corrupted!)\n\n  Program found:\n    1  c = a + b\n    2  c = c * 2\n\n  Output recovered:\n    c = 11000    (binary)');
    addLine('', '');
    addLine('  Strategy: work backward from the output.', 'info');
    addLine('  1. Decode a: place values 8, 4, 2, 1', 'info');
    addLine('     Decode c: it has 5 digits, so place values are 16, 8, 4, 2, 1', 'info');
    addLine('     (each new digit on the left doubles: 1, 2, 4, 8, 16...)', 'info');
    addLine('  2. Undo line 2: the program did c * 2, so BEFORE that, c was c / 2', 'info');
    addLine('  3. Undo line 1: the program did c = a + b, so b = c - a', 'info');
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
          const boxA = createBoxElement('a', 6);
          const boxB = createBoxElement('b', '?');
          const boxC = createBoxElement('c', 24);
          tracker.appendChild(boxA);
          tracker.appendChild(boxB);
          tracker.appendChild(boxC);
          scrollTerminal();
          await sleep(800);

          // Step 2: c was 24, before x2 it was 12
          const ann = makeAnnotation('c was 24, before \u00d72 it was 12');
          wrapper.appendChild(ann);
          requestAnimationFrame(() => { ann.style.opacity = '1'; });
          await updateBoxValue(boxC, 12);
          scrollTerminal();
          await sleep(800);

          // Step 3: 12 = 6 + b, so b = 6
          ann.textContent = '12 = 6 + b, so b = 6';
          await updateBoxValue(boxB, 6);
          scrollTerminal();
          await sleep(600);

          async function replayLevel3() {
            await updateBoxValue(boxA, 6);
            await updateBoxValue(boxB, '?');
            await updateBoxValue(boxC, 24);
            ann.style.opacity = '0';
            scrollTerminal();
            await sleep(800);
            ann.textContent = 'c was 24, before \u00d72 it was 12';
            ann.style.opacity = '1';
            await updateBoxValue(boxC, 12);
            scrollTerminal();
            await sleep(800);
            ann.textContent = '12 = 6 + b, so b = 6';
            await updateBoxValue(boxB, 6);
            scrollTerminal();
            await sleep(600);
          }
          addReplayButton(wrapper, replayLevel3);

          addLine('NEXUS: "Full reverse trace:', 'highlight');
          addLine('  START:  a = 0110 = 6,  c = 11000 = 24', 'info');
          addLine('  Undo line 2:  c = c * 2  \u2192  before doubling, c was 24/2 = 12', 'info');
          addLine('  Undo line 1:  c = a + b  \u2192  12 = 6 + b  \u2192  b = 6', 'info');
          addLine('', '');
          addLine('NEXUS: "That was reverse engineering. You started with', 'highlight');
          addLine('        the answer and worked backward through the', 'highlight');
          addLine('        program to recover what was lost. Each operation', 'highlight');
          addLine('        has an opposite \u2014 multiply undoes with divide,', 'highlight');
          addLine('        add undoes with subtract."', 'highlight');
          addLine('', '');
          addLine('NEXUS: "Security analysts use this every day. When you', 'highlight');
          addLine('        find suspicious output but don\'t know the input,', 'highlight');
          addLine('        you reverse the program to figure out what', 'highlight');
          addLine(`        went in. Nice work, ${state.hackerName || 'operator'}."`, 'highlight');
          addLine('', '');

          await sleep(1200);

          addLine('[SYSTEM] Additional data found in recovered fragments...', 'system');
          addLine('[SYSTEM] Scanning...', 'system');
          await sleep(800);
          addLine('[SYSTEM] Name fragment detected in AI core memory.', 'system');
          addLine('', '');
          addLine('NEXUS: "Wait. There\'s something else buried in this', 'highlight');
          addLine('        fragment. A name. Partial, corrupted, but', 'highlight');
          addLine('        readable..."', 'highlight');
          addLine('', '');
          addPre('  ████ RECOVERED DATA ████\n  Name fragment: V . . . I . . . C . . .\n  Location:      AI core memory, protected sector\n  Access level:  RESTRICTED');
          addLine('', '');
          addLine('NEXUS: "Someone\'s name is hardcoded into the AI\'s', 'highlight');
          addLine('        deepest memory. Protected sector. Whoever VIC', 'highlight');
          addLine('        is, the AI was built to remember them."', 'highlight');
          addLine('', '');
          addLine('NEXUS: "...Why?"', 'highlight');
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
        const guess3 = parseInt(input.trim(), 10);
        if (s.wrongCount === 1) {
          if (guess3 === 24) {
            addLine('[WRONG] 24 is c (the output). You need b (the missing input). Work backward from 24.', 'error');
          } else if (guess3 === 12) {
            addLine('[WRONG] 12 is close \u2014 that\'s c before it was doubled. But b = c - a. Keep going!', 'error');
          } else {
            addLine('[WRONG] Start from the end. Decode both: a = 0110 = ?, c = 11000 = ? (use places 16,8,4,2,1).', 'error');
          }
        } else if (s.wrongCount === 2) {
          addLine('[WRONG] a=6, c=24. Undo line 2: the program doubled c, so BEFORE line 2, c was 24/2 = ?', 'error');
        } else if (s.wrongCount === 3) {
          addLine('[WRONG] Before line 2, c was 12. Line 1: c = a + b, so 12 = 6 + b. What is b?', 'error');
        } else {
          addLine('[WRONG] 12 = 6 + b. Subtract 6 from both sides: b = 12 - 6 = ?', 'error');
        }
      }
    });
  }
}
