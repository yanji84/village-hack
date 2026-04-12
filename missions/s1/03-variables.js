// missions/s1/03-variables.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setCurrentInputHandler,
  completeMission,
  sleep,
} from '../../engine.js';

import { createBoxElement, updateBoxValue, flashBox } from '../helpers.js';

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

export const mission = {
  id: 2,
  num: '03',
  title: 'VARIABLES & MEMORY',
  name: 'Variables & Memory',
  desc: 'Computers remember things by giving them NAMES. Learn to track values as they change \u2014 the foundation of all code.',
  skill: 'SKILL: Variables + State + Mental Execution',
  hints: [
    'Read each line in order. When a variable changes, cross out the old value and write the new one.',
    'The RIGHT side of = is computed FIRST, using whatever value the variable has RIGHT NOW.',
    'x = x + 1 means: take the CURRENT value of x, add 1, then store the result back into x.',
  ],
  run: async function() {
    state.missionState = { phase: 0, hintIdx: 0 };

    await typeLines([
      { text: '[SYSTEM] Partial access to AI memory granted.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "I got partial access to the AI\'s memory. But to', cls: 'highlight' },
      { text: '        read it, you need to understand how computers', cls: 'highlight' },
      { text: '        remember things. They use VARIABLES."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);

    runVariablesPhase();
  },
};

function getTerminal() {
  return document.getElementById('terminal');
}

function runVariablesPhase() {
  const s = state.missionState;

  if (s.phase === 0) {
    // Phase 0: The box metaphor — visual + first interaction fast
    addLine('NEXUS: "A variable is like a scoreboard. The NAME stays', 'highlight');
    addLine('        the same, but the NUMBER on it can change."', 'highlight');
    addLine('', '');

    // Show animated box so the kid SEES the concept, not just reads it
    const term0 = getTerminal();
    const wrapper0intro = document.createElement('div');
    const scoreBoxIntro = createBoxElement('score');
    wrapper0intro.appendChild(scoreBoxIntro);
    term0.appendChild(wrapper0intro);
    term0.scrollTop = term0.scrollHeight;

    (async () => {
      await sleep(400);
      addLine('    score = 0', 'info');
      await updateBoxValue(scoreBoxIntro, '0');
      await sleep(700);
      addLine('    score = 10', 'info');
      await updateBoxValue(scoreBoxIntro, '10');
      await sleep(500);

      addLine('', '');
      addLine('NEXUS: "See? The 0 is GONE. A variable only holds ONE', 'highlight');
      addLine('        value at a time. New value in, old value erased."', 'highlight');
      addLine('', '');
      addLine('NEXUS: "Your turn. I run these two lines:"', 'highlight');
      addPre('  1  age = 7\n  2  age = 9');
      addLine('', '');
      addLine('What is age now?', 'warning');
      term0.scrollTop = term0.scrollHeight;
    })();

    setCurrentInputHandler((input) => {
      if (input.trim() === '9') {
        sound.success();
        addLine('[CORRECT] age was 7, then replaced with 9.', 'success');
        addLine('NEXUS: "Exactly. The 7 is gone. Only 9 remains."', 'highlight');
        addLine('', '');

        // Quick animated confirmation with an age box
        const term = getTerminal();
        const wrapper0 = document.createElement('div');
        const ageBox = createBoxElement('age');
        wrapper0.appendChild(ageBox);
        term.appendChild(wrapper0);
        term.scrollTop = term.scrollHeight;

        async function replayPhase0() {
          await updateBoxValue(ageBox, '?');
          await sleep(500);
          await updateBoxValue(ageBox, '7');
          await sleep(800);
          await updateBoxValue(ageBox, '9');
          await sleep(600);
        }

        (async () => {
          await sleep(400);
          await updateBoxValue(ageBox, '7');
          addLine('    age = 7', 'info');
          await sleep(700);
          addLine('    age = 9  \u2192  7 is gone, 9 takes its place', 'info');
          await updateBoxValue(ageBox, '9');
          await sleep(500);
          addReplayButton(wrapper0, replayPhase0);
          s.phase = 1;
          addLine('');
          setTimeout(runVariablesPhase, 800);
        })();
      } else if (input.trim() === '7') {
        sound.denied();
        addLine('[WRONG] Line 2 REPLACED the value. age was 7, then became 9.', 'error');
      } else {
        sound.denied();
        addLine('[WRONG] Line 1 puts 7 in. Line 2 replaces it with 9. What\'s left?', 'error');
      }
    });

  } else if (s.phase === 1) {
    // Phase 1: The = trap — arrow mental model
    addLine('\u2501\u2501\u2501 The = Trap \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "WARNING. This trips up everyone. In math class, =', 'highlight');
    addLine('        means \'is equal to.\' In code, = means something', 'highlight');
    addLine('        completely different."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "In code, = means: take the thing on the RIGHT,', 'highlight');
    addLine('        and PUT it INTO the box on the LEFT."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "Read it like an arrow:"', 'highlight');
    addLine('', '');
    addPre('  x = 5        means    5 \u2192 x      put 5 into x\n  x = x + 1    means    x+1 \u2192 x    take x, add 1, store it back');
    addLine('', '');
    addLine('NEXUS: "In math, x = x + 1 is impossible. Nothing equals', 'highlight');
    addLine('        itself plus one. But in code, it happens a MILLION', 'highlight');
    addLine('        times a day. It just means: take the current x,', 'highlight');
    addLine('        add 1, put the result back into x."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "Try it:"', 'highlight');
    addPre('  1  x = 3\n  2  x = x + 2');
    addLine('', '');
    addLine('What is x after line 2?', 'warning');

    setCurrentInputHandler((input) => {
      if (input.trim() === '5') {
        sound.success();
        addLine('[CORRECT] x starts at 3. Line 2: take 3, add 2, store 5 back.', 'success');
        addLine('NEXUS: "Read = as an arrow. Right side computed first,', 'highlight');
        addLine('        result goes into the left side. Every time."', 'highlight');
        addLine('', '');

        // Animated demo: show x changing from 3 to 5
        addLine('NEXUS: "Watch the value get replaced:"', 'highlight');
        const term = getTerminal();
        const wrapper1 = document.createElement('div');
        const xBox = createBoxElement('x');
        wrapper1.appendChild(xBox);
        term.appendChild(wrapper1);
        term.scrollTop = term.scrollHeight;

        async function replayPhase1() {
          await updateBoxValue(xBox, '?');
          await sleep(500);
          await updateBoxValue(xBox, '3');
          await sleep(800);
          await updateBoxValue(xBox, '5');
          await sleep(600);
        }

        (async () => {
          await sleep(500);
          await updateBoxValue(xBox, '3');
          addLine('    x = 3', 'info');
          await sleep(800);
          addLine('    x = x + 2  \u2192  3 + 2 = 5', 'info');
          await updateBoxValue(xBox, '5');
          await sleep(600);
          addReplayButton(wrapper1, replayPhase1);
          addLine('NEXUS: "3 is gone. 5 took its place."', 'highlight');
          s.phase = 2;
          addLine('');
          setTimeout(runVariablesPhase, 800);
        })();
      } else if (input.trim() === '3') {
        sound.denied();
        addLine('[WRONG] x doesn\'t stay at 3. Line 2 changes it.', 'error');
        addLine('  x = x + 2 means: take x (which is 3), add 2. What\'s 3 + 2?', 'info');
      } else if (input.trim() === '2') {
        sound.denied();
        addLine('[WRONG] x + 2 doesn\'t mean "just 2." The x has a value!', 'error');
        addLine('  x is 3 right now. So x + 2 = 3 + 2 = ?', 'info');
      } else {
        sound.denied();
        addLine('[WRONG] Go line by line. Line 1: x = 3. Now x is 3.', 'error');
        addLine('  Line 2: x = x + 2. Replace x with 3: 3 + 2 = ?', 'info');
      }
    });

  } else if (s.phase === 2) {
    // Phase 2: Copy, not link — teach then test
    addLine('\u2501\u2501\u2501 Tricky One \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "Here\'s something that tricks almost everyone.', 'highlight');
    addLine('        Remember: = COPIES the value. It doesn\'t create', 'highlight');
    addLine('        a connection between the variables."', 'highlight');
    addLine('', '');
    addPre('  1  a = 5\n  2  b = a\n  3  a = 99');
    addLine('', '');
    addLine('What is b after line 3?', 'warning');

    setCurrentInputHandler((input) => {
      if (input.trim() === '5') {
        sound.success();
        addLine('[CORRECT] b is 5.', 'success');
        addLine('', '');
        addLine('NEXUS: "You got it! Most people think b = a LINKS them', 'highlight');
        addLine('        together. It doesn\'t. It COPIES the value."', 'highlight');
        addLine('', '');
        addLine('NEXUS: "Think of it like a photo. b = a takes a SNAPSHOT', 'highlight');
        addLine('        of a\'s value right now. If a changes later, the', 'highlight');
        addLine('        photo doesn\'t update."', 'highlight');
        addLine('', '');

        // Animated demo: two boxes side by side showing copy behavior
        addLine('NEXUS: "Watch closely:"', 'highlight');
        const term = getTerminal();
        const wrapper2 = document.createElement('div');
        const flexRow = document.createElement('div');
        flexRow.style.cssText = 'display:flex;gap:16px;margin:12px 0;';
        const aBox = createBoxElement('a');
        const bBox = createBoxElement('b');
        flexRow.appendChild(aBox);
        flexRow.appendChild(bBox);
        wrapper2.appendChild(flexRow);
        term.appendChild(wrapper2);
        term.scrollTop = term.scrollHeight;

        async function replayPhase2() {
          await updateBoxValue(aBox, '?');
          await updateBoxValue(bBox, '?');
          await sleep(500);
          await updateBoxValue(aBox, '5');
          await sleep(800);
          await updateBoxValue(bBox, '5');
          await sleep(800);
          await updateBoxValue(aBox, '99');
          await sleep(400);
          await flashBox(bBox, '#ffaa00');
          await sleep(600);
        }

        (async () => {
          await sleep(500);
          addLine('    a = 5', 'info');
          await updateBoxValue(aBox, '5');
          await sleep(800);
          addLine('    b = a  \u2192  b gets a COPY of 5', 'info');
          await updateBoxValue(bBox, '5');
          await sleep(800);
          addLine('    a = 99', 'info');
          await updateBoxValue(aBox, '99');
          await sleep(400);
          // Pulse b to emphasize it didn't change
          await flashBox(bBox, '#ffaa00');
          addLine('    b is still 5 \u2014 it has its own copy!', 'success');
          await sleep(600);
          addReplayButton(wrapper2, replayPhase2);
          s.phase = 3;
          addLine('');
          setTimeout(runVariablesPhase, 800);
        })();
      } else if (input.trim() === '99') {
        sound.denied();
        addLine('', '');
        addLine('NEXUS: "That\'s the mistake almost everyone makes. You', 'highlight');
        addLine('        thought b = a LINKS them \u2014 like b always equals', 'highlight');
        addLine('        whatever a is. But it doesn\'t work that way."', 'highlight');
        addLine('', '');
        addLine('NEXUS: "b = a means: look at a RIGHT NOW (it\'s 5), COPY', 'highlight');
        addLine('        that value into b. Done. After that, b has its', 'highlight');
        addLine('        own 5. When a changes to 99 in line 3, b still', 'highlight');
        addLine('        has the 5 it got earlier."', 'highlight');
        addLine('', '');
        addLine('NEXUS: "Think of it like taking a photo. b = a takes a', 'highlight');
        addLine('        PHOTO of a\'s value. If a changes later, the', 'highlight');
        addLine('        photo doesn\'t update. It\'s a snapshot."', 'highlight');
        addLine('', '');
        addLine('So what is b?', 'warning');
      } else {
        sound.denied();
        addLine('[WRONG] After line 2, b got a value from a. After line 3, a changed. Did b change too?', 'error');
      }
    });

  } else if (s.phase === 3) {
    // Phase 3: Put it all together — numbers only
    addLine('\u2501\u2501\u2501 Put It All Together \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "Everything you learned in one problem. Trace it."', 'highlight');
    addLine('', '');
    addPre('  1  x = 10\n  2  y = x\n  3  x = x + 5\n  4  y = y - 2');
    addLine('', '');
    addLine('What are x and y after line 4? (Type two numbers, like: 15 8)', 'warning');

    // x=10, y=10 (copy), x=10+5=15, y=10-2=8
    setCurrentInputHandler((input) => {
      const parts = input.trim().split(/[\s,]+/).map(Number);
      if (parts.length === 2 && parts[0] === 15 && parts[1] === 8) {
        sound.success();
        addLine('[CORRECT] x=15, y=8.', 'success');
        addLine('', '');
        addLine('NEXUS: "Line by line:"', 'highlight');
        addLine('', '');

        // Animated trace with two boxes
        const term = getTerminal();
        const wrapper3 = document.createElement('div');
        const flexRow = document.createElement('div');
        flexRow.style.cssText = 'display:flex;gap:16px;margin:12px 0;';
        const xBox = createBoxElement('x');
        const yBox = createBoxElement('y');
        flexRow.appendChild(xBox);
        flexRow.appendChild(yBox);
        wrapper3.appendChild(flexRow);
        term.appendChild(wrapper3);
        term.scrollTop = term.scrollHeight;

        async function replayPhase3() {
          await updateBoxValue(xBox, '?');
          await updateBoxValue(yBox, '?');
          await sleep(500);
          await updateBoxValue(xBox, '10');
          await sleep(800);
          await updateBoxValue(yBox, '10');
          await sleep(800);
          await updateBoxValue(xBox, '15');
          await sleep(400);
          await flashBox(yBox, '#ffaa00');
          await sleep(800);
          await updateBoxValue(yBox, '8');
          await sleep(600);
        }

        (async () => {
          await sleep(500);
          addLine('  1: x = 10', 'info');
          await updateBoxValue(xBox, '10');
          await sleep(800);
          addLine('  2: y = x  \u2192  y gets a COPY: y = 10', 'info');
          await updateBoxValue(yBox, '10');
          await sleep(800);
          addLine('  3: x = x + 5  \u2192  10 + 5 = 15  (y still 10)', 'info');
          await updateBoxValue(xBox, '15');
          await sleep(400);
          await flashBox(yBox, '#ffaa00');
          await sleep(800);
          addLine('  4: y = y - 2  \u2192  10 - 2 = 8', 'info');
          await updateBoxValue(yBox, '8');
          await sleep(600);
          addReplayButton(wrapper3, replayPhase3);

          addLine('', '');
          addLine('NEXUS: "Assignment, overwriting, the arrow rule, and', 'highlight');
          addLine('        snapshots \u2014 all in four lines. You nailed it."', 'highlight');
          addLine('', '');
          addLine('NEXUS: "Three missions, three pillars:', 'highlight');
          addLine('        DATA (binary) \u2014 how computers store things.', 'highlight');
          addLine('        INSTRUCTIONS (programs) \u2014 how they do things.', 'highlight');
          addLine('        MEMORY (variables) \u2014 how they remember things.', 'highlight');
          addLine('        Everything in CS is built from these three."', 'highlight');
          addLine('', '');
          addLine('NEXUS: "I found something in the AI\'s memory. A variable', 'highlight');
          addLine('        called target_count. It keeps going up. The AI', 'highlight');
          addLine('        is counting something... or someone. I need to', 'highlight');
          addLine('        recover more of its memory to find out what."', 'highlight');
          addLine('', '');
          addLine('[ Type NEXT to continue ]', 'warning');
          setCurrentInputHandler(() => {
            setCurrentInputHandler(null);
            completeMission(2);
          });
        })();
      } else if (parts.length === 2 && parts[0] === 15 && parts[1] === 13) {
        // Common mistake: thinking y tracks x, so y = 15 - 2 = 13
        sound.denied();
        addLine('[WRONG] Close! x=15 is right, but y didn\'t follow x.', 'error');
        addLine('  Remember the snapshot rule: y got a COPY of 10 at line 2.', 'info');
        addLine('  x changed to 15, but y still has 10. Then line 4: 10 - 2 = ?', 'info');
      } else if (parts.length === 2 && parts[0] === 15) {
        // x is right, y is wrong (but not 13)
        sound.denied();
        addLine('[WRONG] x=15 is right! For y: it got a COPY of 10 at line 2.', 'error');
        addLine('  Then line 4 does y = y - 2. So: 10 - 2 = ?', 'info');
      } else if (parts.length === 1) {
        sound.denied();
        addLine('[WRONG] I need TWO numbers: the value of x and the value of y.', 'error');
        addLine('  Type them separated by a space, like: 15 8', 'info');
      } else {
        sound.denied();
        addLine('[WRONG] Trace it line by line. Use the snapshot rule from the last puzzle.', 'error');
        addLine('  Line 1: x = 10. Line 2: y gets a COPY of x (so y = 10).', 'info');
        addLine('  Line 3: x = x + 5. Line 4: y = y - 2. What are they now?', 'info');
      }
    });
  }
}
