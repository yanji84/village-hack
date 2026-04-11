// missions/s1/03-variables.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setCurrentInputHandler,
  completeMission,
} from '../../engine.js';

import { renderBox } from '../helpers.js';

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
      { text: 'NEXUS: "You keep score in games, right? You start at 0...', cls: 'highlight' },
      { text: '        score a point... now it\'s 1... another... 2. The', cls: 'highlight' },
      { text: '        number changes but the LABEL stays the same: score."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "That\'s what a VARIABLE is. A name that holds a', cls: 'highlight' },
      { text: '        value. The value can change. The name stays."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);

    runVariablesPhase();
  },
};

function runVariablesPhase() {
  const s = state.missionState;

  if (s.phase === 0) {
    // Phase 1: The box metaphor — visual
    addLine('NEXUS: "In code, it looks like this:"', 'highlight');
    addLine('', '');
    addLine('    score = 0', 'info');
    addPre(renderBox('score', '0'));
    addLine('', '');
    addLine('    score = 10', 'info');
    addPre(renderBox('score', '10'));
    addLine('', '');
    addLine('NEXUS: "The 0 is GONE. Replaced. A variable only holds ONE', 'highlight');
    addLine('        value at a time. When a new value goes in, the old', 'highlight');
    addLine('        one is erased."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "Quick check. I run these two lines:"', 'highlight');
    addPre('  1  age = 7\n  2  age = 9');
    addLine('', '');
    addLine('What is age now?', 'warning');

    setCurrentInputHandler((input) => {
      if (input.trim() === '9') {
        sound.success();
        addLine('[CORRECT] age was 7, then replaced with 9.', 'success');
        addLine('NEXUS: "The 7 is gone. Only 9 remains."', 'highlight');
        s.phase = 1;
        addLine('');
        setTimeout(runVariablesPhase, 800);
      } else if (input.trim() === '7') {
        sound.denied();
        addLine('[WRONG] Line 2 REPLACED the value. age was 7, then became 9.', 'error');
      } else {
        sound.denied();
        addLine('[WRONG] Line 1 puts 7 in. Line 2 replaces it with 9. What\'s left?', 'error');
      }
    });

  } else if (s.phase === 1) {
    // Phase 2: The = trap — arrow mental model
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
        s.phase = 2;
        addLine('');
        setTimeout(runVariablesPhase, 800);
      } else if (input.trim() === '3') {
        sound.denied();
        addLine('[WRONG] Line 2 changes x. It takes the old x (3), adds 2. What\'s 3+2?', 'error');
      } else {
        sound.denied();
        addLine('[WRONG] Line 1: x is 3. Line 2: x = x + 2 = 3 + 2 = ?', 'error');
      }
    });

  } else if (s.phase === 2) {
    // Phase 3: Copy, not link — let them get it wrong first
    addLine('\u2501\u2501\u2501 Tricky One \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "Read this carefully."', 'highlight');
    addLine('', '');
    addPre('  1  a = 5\n  2  b = a\n  3  a = 99');
    addLine('', '');
    addLine('What is b after line 3?', 'warning');

    setCurrentInputHandler((input) => {
      if (input.trim() === '5') {
        sound.success();
        addLine('[CORRECT] b is 5.', 'success');
        addLine('', '');
        addLine('NEXUS: "Most people get this wrong the first time. They', 'highlight');
        addLine('        think b = a LINKS them \u2014 like b is a shortcut to', 'highlight');
        addLine('        a. It\'s not. b = a COPIES the value. After line 2,', 'highlight');
        addLine('        b has its own 5. When a changes in line 3, b', 'highlight');
        addLine('        doesn\'t know and doesn\'t care."', 'highlight');
        s.phase = 3;
        addLine('');
        setTimeout(runVariablesPhase, 800);
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
    // Phase 4: Put it all together — numbers only
    addLine('\u2501\u2501\u2501 Put It All Together \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "Everything you learned in one problem. Trace it."', 'highlight');
    addLine('', '');
    addPre('  1  x = 10\n  2  y = x\n  3  x = x + 5\n  4  y = y - 2');
    addLine('', '');
    addLine('What are x and y after line 4? Type: x y', 'warning');

    // x=10, y=10 (copy), x=10+5=15, y=10-2=8
    setCurrentInputHandler((input) => {
      const parts = input.trim().split(/[\s,]+/).map(Number);
      if (parts.length === 2 && parts[0] === 15 && parts[1] === 8) {
        sound.success();
        addLine('[CORRECT] x=15, y=8.', 'success');
        addLine('', '');
        addLine('NEXUS: "Line by line:', 'highlight');
        addLine('  1: x = 10', 'info');
        addLine('  2: y = x \u2192 y gets a COPY: y = 10', 'info');
        addLine('  3: x = x + 5 \u2192 10 + 5 = 15  (y still 10)', 'info');
        addLine('  4: y = y - 2 \u2192 10 - 2 = 8', 'info');
        addLine('', '');
        addLine('NEXUS: "Assignment, overwriting, the arrow rule, and', 'highlight');
        addLine('        copies \u2014 all in four lines. You nailed it."', 'highlight');
        addLine('', '');
        addLine('NEXUS: "Three missions, three pillars:', 'highlight');
        addLine('        DATA (binary) \u2014 how computers store things.', 'highlight');
        addLine('        INSTRUCTIONS (programs) \u2014 how they do things.', 'highlight');
        addLine('        MEMORY (variables) \u2014 how they remember things.', 'highlight');
        addLine('        Everything in CS is built from these three."', 'highlight');
        addLine('', '');
        addLine('NEXUS: "One more thing. I found something in the AI\'s', 'highlight');
        addLine('        memory. A counter variable, incrementing since', 'highlight');
        addLine('        the attack started. It\'s counting something.', 'highlight');
        addLine('        I don\'t know what yet."', 'highlight');
        addLine('', '');
        addLine('[ Type NEXT to continue ]', 'warning');
        setCurrentInputHandler(() => {
          setCurrentInputHandler(null);
          completeMission(2);
        });
      } else if (parts.length === 2 && parts[0] === 15 && parts[1] === 13) {
        // Common mistake: thinking y tracks x, so y = 15 - 2 = 13
        sound.denied();
        addLine('[WRONG] y didn\'t follow x\'s change. y got a COPY of 10 at line 2.', 'error');
        addLine('  x changed to 15, but y is still 10. Then line 4: 10 - 2 = ?', 'info');
      } else {
        sound.denied();
        addLine('[WRONG] Trace each line. Remember: y = x copies the value, not a link.', 'error');
      }
    });
  }
}
