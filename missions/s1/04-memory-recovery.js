// missions/s1/04-memory-recovery.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setCurrentInputHandler,
  completeMission,
} from '../../engine.js';

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
        addLine('NEXUS: "Binary to decimal, then variable tracing. Two', 'highlight');
        addLine('        skills chained together."', 'highlight');
        s.phase = 1;
        addLine('');
        setTimeout(runRecoveryPhase, 800);
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
