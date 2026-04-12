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
  desc: 'The AI stores secrets in named memory slots. Learn how variables work so you can read them.',
  skill: 'SKILL: Variables + State + Mental Execution',
  hints: [
    'Read each line top to bottom. When a variable gets a new value, the old one is DESTROYED.',
    'The RIGHT side of = is computed FIRST, using whatever value the variable holds RIGHT NOW.',
    'x = x + 1 means: take the CURRENT value of x, add 1, then store the result back into x.',
  ],
  run: async function() {
    state.missionState = { phase: 0, hintIdx: 0 };

    await typeLines([
      { text: '[SYSTEM] Partial access to AI memory granted.', cls: 'system' },
      { text: '[SYSTEM] WARNING: Memory contents are volatile.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "I cracked open part of the AI\'s memory. It stores', cls: 'highlight' },
      { text: '        everything in named slots \u2014 programmers call them', cls: 'highlight' },
      { text: '        VARIABLES. Think of them like labeled boxes that', cls: 'highlight' },
      { text: '        can each hold one thing. If you want to read the', cls: 'highlight' },
      { text: '        AI\'s secrets, you need to understand how these', cls: 'highlight' },
      { text: '        boxes work."', cls: 'highlight' },
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
    // Phase 0: The slot metaphor — visual + first interaction fast
    addLine('NEXUS: "A variable is a named slot that holds ONE value.', 'highlight');
    addLine('        The name stays the same, but what\'s inside can', 'highlight');
    addLine('        change. Watch \u2014 this is the AI\'s score slot:"', 'highlight');
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
      addLine('NEXUS: "The 0 got destroyed. A variable can only hold ONE', 'highlight');
      addLine('        value at a time. When a new value goes in, the', 'highlight');
      addLine('        old one is gone forever."', 'highlight');
      addLine('', '');
      addLine('NEXUS: "Let me test you. What happens here?"', 'highlight');
      addPre('  1  age = 7\n  2  age = 9');
      addLine('', '');
      addLine('What is age after both lines run?', 'warning');
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
        addLine('[NOT QUITE] 7 was there first, but line 2 overwrites it.', 'error');
        addLine('  The slot can only hold one value. Line 2 puts in 9. What survives?', 'info');
      } else {
        sound.denied();
        addLine('[WRONG] Run it in your head: line 1 stores 7. Line 2 replaces it.', 'error');
        addLine('  What did line 2 put in?', 'info');
      }
    });

  } else if (s.phase === 1) {
    // Phase 1: The = trap — arrow mental model
    addLine('\u2501\u2501\u2501 The = Sign Is a Lie \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "This next part trips up EVERYONE. Even adults who', 'highlight');
    addLine('        should know better. Ready?"', 'highlight');
    addLine('', '');
    addLine('NEXUS: "In math class, = means \'is equal to.\'', 'highlight');
    addLine('        In code, = means something totally different.', 'highlight');
    addLine('        It means: COMPUTE the right side, then STORE', 'highlight');
    addLine('        the result in the left side."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "Think of = as an arrow pointing LEFT:"', 'highlight');
    addLine('', '');
    addPre('  x = 5        means    5 \u2192 x      store 5 into x\n  x = x + 1    means    x+1 \u2192 x    compute x+1, store it back');
    addLine('', '');
    addLine('NEXUS: "x = x + 1 looks impossible in math. Nothing can', 'highlight');
    addLine('        equal itself plus one! But in code it just means:', 'highlight');
    addLine('        grab the current x, add 1, put the answer back.', 'highlight');
    addLine('        The AI does this thousands of times a second."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "Your turn. Trace this:"', 'highlight');
    addPre('  1  x = 3\n  2  x = x + 2');
    addLine('', '');
    addLine('What is x after line 2?', 'warning');

    setCurrentInputHandler((input) => {
      if (input.trim() === '5') {
        sound.success();
        addLine('[CORRECT] x starts at 3. Then x + 2 = 3 + 2 = 5, stored back into x.', 'success');
        addLine('', '');
        addLine('NEXUS: "You\'re reading code like a real hacker now.', 'highlight');
        addLine('        Right side first, result into the left side."', 'highlight');
        addLine('', '');

        // Animated demo: show x changing from 3 to 5
        addLine('NEXUS: "Watch it happen in the AI\'s memory:"', 'highlight');
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
          addLine('NEXUS: "3 is gone. Destroyed. 5 took its place."', 'highlight');
          s.phase = 2;
          addLine('');
          setTimeout(runVariablesPhase, 800);
        })();
      } else if (input.trim() === '3') {
        sound.denied();
        addLine('[NOT QUITE] x starts at 3, but line 2 changes it.', 'error');
        addLine('  Read it as an arrow: x + 2 \u2192 x. That\'s 3 + 2 \u2192 x. What goes in?', 'info');
      } else if (input.trim() === '2') {
        sound.denied();
        addLine('[WRONG] Don\'t ignore the x! It already holds 3.', 'error');
        addLine('  x = x + 2 means: take what\'s IN x (3), add 2. What\'s 3 + 2?', 'info');
      } else if (input.trim() === '6' || input.trim() === '8') {
        sound.denied();
        addLine('[WRONG] Careful \u2014 there\'s only ONE variable here, not two.', 'error');
        addLine('  Line 1: x = 3. Line 2: x = x + 2.', 'info');
        addLine('  Replace x on the right with 3: x = 3 + 2. What\'s 3 + 2?', 'info');
      } else {
        sound.denied();
        addLine('[WRONG] Use the arrow trick. Line 1: x = 3.', 'error');
        addLine('  Line 2: x = x + 2. Replace x with its current value:', 'info');
        addLine('  x = 3 + 2. What\'s 3 + 2?', 'info');
      }
    });

  } else if (s.phase === 2) {
    // Phase 2: Copy, not link — teach then test
    addLine('\u2501\u2501\u2501 The Snapshot Rule \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "This next one is the trap I fell into when I was', 'highlight');
    addLine('        learning. It catches almost everyone."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "When you write b = a, the computer looks inside', 'highlight');
    addLine('        the a box RIGHT NOW, takes a PHOTO of the number,', 'highlight');
    addLine('        and puts a copy in the b box. After that, a and b', 'highlight');
    addLine('        are completely separate. No invisible wire between', 'highlight');
    addLine('        them. Got it? Let\'s see if you really do."', 'highlight');
    addLine('', '');
    addPre('  1  a = 5\n  2  b = a\n  3  a = 99');
    addLine('', '');
    addLine('What is b after line 3?', 'warning');

    setCurrentInputHandler((input) => {
      if (input.trim() === '5') {
        sound.success();
        addLine('[CORRECT] b is still 5!', 'success');
        addLine('', '');
        addLine('NEXUS: "Most people get that wrong. They think b = a', 'highlight');
        addLine('        creates a LINK \u2014 that b will always match a.', 'highlight');
        addLine('        But it doesn\'t. It takes a SNAPSHOT."', 'highlight');
        addLine('', '');
        addLine('NEXUS: "Like taking a photo. b = a photographs a\'s value', 'highlight');
        addLine('        RIGHT NOW. If a changes later, the photo stays', 'highlight');
        addLine('        the same. b has its own separate copy."', 'highlight');
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
        addLine('NEXUS: "That\'s exactly the trap! You assumed b = a LINKS', 'highlight');
        addLine('        them together. Almost everyone thinks that."', 'highlight');
        addLine('', '');
        addLine('NEXUS: "But b = a just means: look at a RIGHT NOW \u2014 it\'s', 'highlight');
        addLine('        5 \u2014 and COPY that number into b. After that, b', 'highlight');
        addLine('        has its own separate 5. Think of it like taking', 'highlight');
        addLine('        a photo. If a changes later, the photo doesn\'t', 'highlight');
        addLine('        magically update."', 'highlight');
        addLine('', '');
        addLine('NEXUS: "Line 3 changes a to 99. But b still has the 5', 'highlight');
        addLine('        it copied earlier. So what is b?"', 'highlight');
        addLine('', '');
        addLine('Try again. What is b?', 'warning');
      } else {
        sound.denied();
        addLine('[WRONG] Think step by step:', 'error');
        addLine('  Line 2 copies a\'s current value into b. What was a at that moment?', 'info');
        addLine('  Line 3 changes a, but does that affect b\'s copy?', 'info');
      }
    });

  } else if (s.phase === 3) {
    // Phase 3: Put it all together — numbers only
    addLine('\u2501\u2501\u2501 Decode the AI\'s Memory \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "I pulled this from the AI\'s memory log. Every', 'highlight');
    addLine('        rule you just learned is in here. Trace it."', 'highlight');
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
          addLine('NEXUS: "Overwriting, the arrow rule, and snapshots \u2014', 'highlight');
          addLine('        all in four lines. You traced that perfectly."', 'highlight');
          addLine('', '');
          addLine('NEXUS: "You just traced code in your head. That\'s the', 'highlight');
          addLine('        single most important skill in programming \u2014', 'highlight');
          addLine('        running the machine in your mind."', 'highlight');
          addLine('', '');
          addLine('NEXUS: "You now understand three foundations:', 'highlight');
          addLine('        DATA \u2014 how machines store things (binary).', 'highlight');
          addLine('        INSTRUCTIONS \u2014 how they follow steps (programs).', 'highlight');
          addLine('        MEMORY \u2014 how they remember (variables).', 'highlight');
          addLine('        Every system ever built rests on these three."', 'highlight');
          addLine('', '');
          addLine('NEXUS: "Hold on. I just found something in the AI\'s', 'highlight');
          addLine('        memory. A variable called target_count. Its', 'highlight');
          addLine('        value keeps going up by one, over and over.', 'highlight');
          addLine('        The AI is counting something... or someone.', 'highlight');
          addLine('        I need to recover more of its memory."', 'highlight');
          addLine('', '');
          addLine('[ Type NEXT to continue ]', 'warning');
          setCurrentInputHandler((input) => {
            if (input.trim().toLowerCase() === 'next') {
              setCurrentInputHandler(null);
              completeMission(2);
            } else {
              addLine('Type NEXT to continue.', 'warning');
            }
          });
        })();
      } else if (parts.length === 2 && parts[0] === 15 && parts[1] === 13) {
        // Common mistake: thinking y tracks x, so y = 15 - 2 = 13
        sound.denied();
        addLine('[ALMOST] x=15 is right! But you fell into the snapshot trap.', 'error');
        addLine('  You used 15 - 2 = 13, meaning you thought y tracked x.', 'info');
        addLine('  But y got a COPY of 10 at line 2. It never changed when x did.', 'info');
        addLine('  So line 4 is: y = 10 - 2 = ?', 'info');
      } else if (parts.length === 2 && parts[0] === 15) {
        // x is right, y is wrong (but not 13)
        sound.denied();
        addLine('[PARTIAL] x=15 is right! Now for y:', 'error');
        addLine('  y got a COPY of x\'s value (10) at line 2. x changed later,', 'info');
        addLine('  but y still has 10. Then line 4: y = 10 - 2 = ?', 'info');
      } else if (parts.length === 2 && parts[1] === 8) {
        // y is right, x is wrong
        sound.denied();
        addLine('[PARTIAL] y=8 is right! Now for x:', 'error');
        addLine('  Line 1: x = 10. Line 3: x = x + 5.', 'info');
        addLine('  Replace x with 10: x = 10 + 5 = ?', 'info');
      } else if (parts.length === 1) {
        sound.denied();
        addLine('[FORMAT] I need TWO numbers \u2014 x then y, separated by a space.', 'error');
        addLine('  Example format: 15 8', 'info');
      } else {
        sound.denied();
        addLine('[WRONG] Go line by line using everything you learned:', 'error');
        addLine('  Line 1: x = 10. Line 2: y gets a COPY of x (y = 10).', 'info');
        addLine('  Line 3: x = x + 5 \u2192 use the arrow rule: 10 + 5 = ?', 'info');
        addLine('  Line 4: y = y - 2 \u2192 y still has 10 (snapshot!): 10 - 2 = ?', 'info');
      }
    });
  }
}
