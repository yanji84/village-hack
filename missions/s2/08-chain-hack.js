// missions/s2/08-chain-hack.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission, renderTable,
} from '../../engine.js';

import { caesarEncrypt } from '../helpers.js';

export const mission = {
  id: 15,
  num: 'S2-08',
  title: 'THE CHAIN HACK',
  name: 'The Chain Hack',
  desc: 'Chain multiple skills together \u2014 the output of each step feeds the next. Beat the backdoor.',
  skill: 'SKILL: All Skills Combined',
  hints: [
    "Read each step's output carefully \u2014 THAT becomes the input to the next step. Write it down.",
    'Every skill from both seasons shows up somewhere in this chain. Which skill does this step feel like?',
    "If you're stuck on a step, pretend it's a standalone mission. What kind of mission was it?",
  ],
  run: async function() {
    state.missionState = { phase: 0, hintIdx: 0 };

    await typeLines([
      { text: '[CRITICAL ALERT] Victor detected. Attack in progress.', cls: 'error' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Kid \u2014 it\'s me. I\'m back. Victor\'s TRYING to', cls: 'highlight' },
      { text: '        reactivate the backdoor. Right now. You\'ve got one', cls: 'highlight' },
      { text: '        shot at shutting it down before he\'s in."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Nexus found the shutdown sequence. But Victor', cls: 'purple' },
      { text: '          protected it with a chain. Five layers, each using', cls: 'purple' },
      { text: '          a different skill. The output of each layer is the', cls: 'purple' },
      { text: '          input to the next."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'NEXUS: "This is the real test. Everything you\'ve learned.', cls: 'highlight' },
      { text: '        Both seasons. ALL of it. Take notes as you go. Every', cls: 'highlight' },
      { text: '        answer feeds the next question."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'AI CORE: "One step at a time. Breathe. We\'re both with you."', cls: 'purple' },
      { text: '', cls: '' },
    ]);

    runChainPhase();
  },
};

function runChainPhase() {
  const s = state.missionState;
  setPhaseProgress(s.phase + 1, 5);

  if (s.phase === 0) {
    // Step 1: Decode ASCII byte to get a number
    addLine('\u2501\u2501\u2501 Step 1: Decode the Byte \u2501\u2501\u2501', 'highlight');
    addLine('Intercepted a single byte from Victor:', 'info');
    addPre('00000111\n\nPositions: 128 64 32 16 8 4 2 1');
    addLine('What decimal number is this? (This becomes your SHIFT for the next step)', 'warning');

    setCurrentInputHandler((input) => {
      // 00000111 = 4+2+1 = 7
      if (input.trim() === '7') {
        sound.success();
        addLine('[STEP 1 CLEAR] The number is 7. Remember it!', 'success');
        s.shift = 7;
        s.phase = 1;
        addLine('');
        setTimeout(runChainPhase, 800);
      } else {
        sound.denied();
        addLine('[WRONG] Add positions with a 1.', 'error');
      }
    });
  } else if (s.phase === 1) {
    // Step 2: Use shift to decode caesar cipher which gives a SQL clause
    const plain = 'ROLE';
    const encrypted = caesarEncrypt(plain, 7); // YVSL
    addLine('\u2501\u2501\u2501 Step 2: Cipher Decode (using Step 1 as shift) \u2501\u2501\u2501', 'highlight');
    addLine(`Encrypted word: ${encrypted}`, 'info');
    addLine(`Shift (from Step 1): ${s.shift}`, 'info');
    addLine('ALPHABET: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z', 'info');
    addLine('Decode the word:', 'warning');

    setCurrentInputHandler((input) => {
      if (input.toUpperCase().trim() === plain) {
        sound.success();
        addLine(`[STEP 2 CLEAR] The word is "${plain}"`, 'success');
        addLine('This is a COLUMN name in the citizens table!', 'info');
        s.column = plain.toLowerCase();
        s.phase = 2;
        addLine('');
        setTimeout(runChainPhase, 800);
      } else {
        sound.denied();
        addLine(`[WRONG] Shift each letter backward by ${s.shift}.`, 'error');
      }
    });
  } else if (s.phase === 2) {
    // Step 3: Write SQL using the column
    addLine('\u2501\u2501\u2501 Step 3: SQL Query \u2501\u2501\u2501', 'highlight');
    addLine('Use the column from Step 2 to find Victor.', 'info');
    addLine(`Query the citizens table for the row where ${s.column} = 'Stranger'`, 'warning');
    addLine('', '');
    addLine('Type a SELECT query:', 'warning');

    setCurrentInputHandler((input) => {
      const up = input.toUpperCase();
      const ok = up.includes('SELECT') && up.includes('CITIZENS') && up.includes('WHERE') && up.includes('ROLE') && (input.includes("'Stranger'") || input.includes('"Stranger"'));
      if (ok) {
        sound.success();
        addLine('[STEP 3 CLEAR] Query accepted.', 'success');
        renderTable([{ id: 6, name: 'Victor', role: 'Stranger' }], ['id', 'name', 'role']);
        addLine('', '');
        addLine('Victor found! His ID is 6.', 'info');
        s.victorId = 6;
        s.phase = 3;
        addLine('');
        setTimeout(runChainPhase, 800);
      } else {
        sound.denied();
        addLine("[WRONG] Try: SELECT * FROM citizens WHERE role = 'Stranger'", 'error');
      }
    });
  } else if (s.phase === 3) {
    // Step 4: Trace code, find the shutdown password
    addLine('\u2501\u2501\u2501 Step 4: Trace Victor\'s Code \u2501\u2501\u2501', 'highlight');
    addLine('We found Victor\'s shutdown script. Trace it to find the kill password.', 'info');
    addPre(`1  secret = 0
2  base = 100
3  id = 6        # <- from Step 3
4  for i in range(1, 4):
5      secret = secret + i * id
6  result = base + secret
7  print(result)`);
    addLine('', '');
    addLine('What does line 7 print?', 'warning');

    setCurrentInputHandler((input) => {
      // i=1: secret=0+1*6=6, i=2: 6+2*6=18, i=3: 18+3*6=36. result=100+36=136
      if (input.trim() === '136') {
        sound.success();
        addLine('[STEP 4 CLEAR] Password: 136', 'success');
        addLine('  i=1: secret = 0 + 1*6 = 6', 'info');
        addLine('  i=2: secret = 6 + 2*6 = 18', 'info');
        addLine('  i=3: secret = 18 + 3*6 = 36', 'info');
        addLine('  result = 100 + 36 = 136', 'info');
        s.phase = 4;
        addLine('');
        setTimeout(runChainPhase, 800);
      } else {
        sound.denied();
        addLine('[WRONG] Trace the loop. i goes 1,2,3 (range(1,4) excludes 4).', 'error');
      }
    });
  } else if (s.phase === 4) {
    // Step 5: Final logic gate to trigger shutdown
    addLine('\u2501\u2501\u2501 Step 5: Logic Gate Trigger \u2501\u2501\u2501', 'highlight');
    addLine('Final gate needs: (A XOR B) AND C = 1', 'info');
    addLine('C is locked at 1. Find values of A and B that make XOR = 1.', 'warning');
    addLine('(Remember: XOR = 1 when inputs are DIFFERENT)', 'info');
    addLine('Type: A B', 'warning');

    setCurrentInputHandler((input) => {
      const [a, b] = input.trim().split(/\s+/).map(Number);
      if ((a === 0 && b === 1) || (a === 1 && b === 0)) {
        sound.success();
        addLine('[FINAL GATE OPEN!]', 'success');
        addLine('', '');
        setTimeout(async () => {
          await typeLines([
            { text: '[SYSTEM] Executing shutdown password 136...', cls: 'system' },
            { text: '[SYSTEM] Backdoor neutralized.', cls: 'success' },
            { text: '[SYSTEM] Victor\'s access revoked \u2014 permanently.', cls: 'success' },
            { text: '', cls: '' },
            { text: 'AI CORE: "You did it. For real this time."', cls: 'purple' },
            { text: 'AI CORE: "Victor is locked out. The village is safe.', cls: 'purple' },
            { text: '          Permanently. He cannot come back."', cls: 'purple' },
            { text: '', cls: '' },
            { text: 'NEXUS: "Heard the whole thing on my scanner. Kid, I\'ve', cls: 'highlight' },
            { text: '        been at this for thirty years. I\'ve never seen', cls: 'highlight' },
            { text: '        anyone learn this fast. Ever."', cls: 'highlight' },
            { text: '', cls: '' },
            { text: 'NEXUS: "You started tonight as a rookie. You\'re ending', cls: 'highlight' },
            { text: '        as something else. I want you to know what', cls: 'highlight' },
            { text: '        you actually learned."', cls: 'highlight' },
            { text: '', cls: '' },
            { text: '  * Cryptography (Caesar, frequency analysis)', cls: 'info' },
            { text: '  * Binary, ASCII, hex \u2014 the true language of computers', cls: 'info' },
            { text: '  * Boolean logic and circuit design (XOR, half-adder)', cls: 'info' },
            { text: '  * Algorithms, loops, and optimization', cls: 'info' },
            { text: '  * Reading and tracing code like a real programmer', cls: 'info' },
            { text: '  * SQL queries and JOINs', cls: 'info' },
            { text: '  * Password attacks (dictionary, pattern, constraint)', cls: 'info' },
            { text: '', cls: '' },
            { text: 'NEXUS: "That\'s a real computer science education. You', cls: 'highlight' },
            { text: '        know more than most college freshmen now."', cls: 'highlight' },
            { text: '', cls: '' },
            { text: `>>> ${(state.hackerName || 'HACKER')} \u2014 ELITE HACKER <<<`, cls: 'success big' },
            { text: '', cls: '' },
            { text: 'AI CORE: "When you\'re ready, there\'s more. Season 3', cls: 'purple' },
            { text: '          will teach you to write Python. Real code.', cls: 'purple' },
            { text: '          See you then."', cls: 'purple' },
          ]);
          setCurrentInputHandler(null);
          setTimeout(() => completeMission(15), 2000);
        }, 500);
      } else {
        sound.denied();
        addLine('[WRONG] XOR needs different inputs (0,1 or 1,0).', 'error');
      }
    });
  }
}
