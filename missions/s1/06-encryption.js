// missions/s1/06-encryption.js
import {
  state, sound,
  addLine, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission,
} from '../../engine.js';

import { caesarEncrypt } from '../helpers.js';

const cipherPuzzles = [
  {
    plain: 'HELLO',
    shift: 1,
    desc: 'Shift of 1 \u2014 each letter moves forward by 1 in the alphabet. So A\u2192B, B\u2192C, H\u2192I...',
  },
  {
    plain: 'PIZZA',
    shift: 3,
    desc: 'Shift of 3 \u2014 each letter moved forward by 3. To DECODE, go backward by 3.',
  },
  {
    plain: 'SAVE US',
    shift: 5,
    desc: 'Shift of 5 \u2014 the AI\'s final encrypted message! Spaces stay as spaces.',
  },
];

export const mission = {
  id: 5,
  num: '06',
  title: 'ENCRYPTION LAB',
  name: 'Encryption Lab',
  desc: 'The rogue AI encrypted all messages! Learn to crack the Caesar cipher to read them.',
  skill: 'SKILL: Cryptography',
  hints: [
    'The cipher moved letters FORWARD. To read the message, which direction do you need to go?',
    'Imagine walking the alphabet like steps on a staircase. How many steps? Look at the shift.',
    "You don't have to decode the whole word at once. Try just the first letter \u2014 the rest work the same way.",
  ],
  run: async function() {
    state.missionState = { cipherIdx: 0, hintIdx: 0 };

    await typeLines([
      { text: '[COMMS INTERCEPT] All town radio encrypted.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Two thousand years ago, Julius Caesar had a problem.', cls: 'highlight' },
      { text: '        He had to send battle orders across enemy territory.', cls: 'highlight' },
      { text: '        If a messenger got caught, the message was in enemy', cls: 'highlight' },
      { text: '        hands."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "So he made up a rule. Shift every letter three places', cls: 'highlight' },
      { text: '        forward in the alphabet. A becomes D. B becomes E.', cls: 'highlight' },
      { text: '        Garbage to anyone without the rule. Intact to anyone', cls: 'highlight' },
      { text: '        with it. The CAESAR CIPHER."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Two thousand years later, the same idea is still how', cls: 'highlight' },
      { text: '        encryption works \u2014 just with way more complicated', cls: 'highlight' },
      { text: '        rules. Every secure website, every chat app, every', cls: 'highlight' },
      { text: '        bank transfer: a descendant of what Caesar did."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "The AI\'s using it on the town comms. If the cipher', cls: 'highlight' },
      { text: '        shifted letters one way, you need to walk them BACK', cls: 'highlight' },
      { text: '        the same distance to read the original. Three', cls: 'highlight' },
      { text: '        messages to decode. Go."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);

    showCipherPuzzle();
  },
};

function showCipherPuzzle() {
  const s = state.missionState;
  const p = cipherPuzzles[s.cipherIdx];
  const encrypted = caesarEncrypt(p.plain, p.shift);
  setPhaseProgress(s.cipherIdx + 1, cipherPuzzles.length);

  addLine(`\u2501\u2501\u2501 Encrypted Message ${s.cipherIdx + 1} \u2501\u2501\u2501`, 'highlight');
  addLine(p.desc, 'info');
  addLine('');
  addLine(`Encrypted: <span class="highlight">${encrypted}</span>`);
  addLine(`Shift: <span class="highlight">${p.shift}</span>`);
  addLine('');
  addLine('ALPHABET: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z', 'info');
  addLine('');
  addLine('Type the decoded message:', 'warning');

  setCurrentInputHandler((input) => {
    if (input.toUpperCase().trim() === p.plain) {
      sound.success();
      addLine(`[DECODED] "${p.plain}" \u2014 correct!`, 'success');
      s.cipherIdx++;
      if (s.cipherIdx >= cipherPuzzles.length) {
        addLine('');
        addLine('All messages decoded! The AI is calling for help: "SAVE US"', 'success');
        addLine('Wait... the AI wants to be SAVED? This changes everything!', 'success big');
        setCurrentInputHandler(null);
        setTimeout(() => completeMission(5), 1000);
      } else {
        addLine('\nDecrypted! Next message incoming...', 'info');
        setTimeout(showCipherPuzzle, 600);
      }
    } else {
      sound.denied();
      addLine('[WRONG] Check the direction you\'re moving through the alphabet.', 'error');
      addLine('NEXUS: "The cipher walked the letters FORWARD. You need to', 'highlight');
      addLine('        walk them the other way. Same number of steps."', 'highlight');
    }
  });
}
