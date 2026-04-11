// missions/s1/09-final-hack.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission,
} from '../../engine.js';

import { caesarEncrypt } from '../helpers.js';

const finalPhases = [
  {
    name: 'Layer 1: Password Lock',
    setup: async () => {
      await typeLines([
        { text: '\u2501\u2501\u2501 LAYER 1: Password Lock \u2501\u2501\u2501', cls: 'highlight' },
        { text: 'Clues:', cls: 'info' },
        { text: '  1. 7 letters', cls: 'info' },
        { text: '  2. Every computer in the village is connected to it', cls: 'info' },
        { text: '  3. It starts with "net" and rhymes with "twerk"', cls: 'info' },
      ]);
    },
    check: (input) => input.toLowerCase() === 'network',
    success: 'Layer 1 cracked!',
  },
  {
    name: 'Layer 2: Binary Lock',
    setup: async () => {
      // F=6, R=18, E=5, E=5 → "FREE"
      await typeLines([
        { text: '\u2501\u2501\u2501 LAYER 2: Binary Code Lock \u2501\u2501\u2501', cls: 'highlight' },
        { text: 'Decode this binary code (A=1, B=2, ... Z=26):', cls: 'info' },
        { text: '', cls: '' },
      ]);
      addPre('00110  10010  00101  00101');
      addLine('(Each group = one letter)', 'info');
    },
    // F=00110(6), R=10010(18), E=00101(5), E=00101(5)
    check: (input) => input.toUpperCase() === 'FREE',
    success: 'Binary lock bypassed!',
  },
  {
    name: 'Layer 3: Cipher Lock',
    setup: async () => {
      // "OPEN" with shift 7 = "VWLU"
      const encrypted = caesarEncrypt('OPEN', 7);
      await typeLines([
        { text: '\u2501\u2501\u2501 LAYER 3: Cipher Lock \u2501\u2501\u2501', cls: 'highlight' },
        { text: `Encrypted command: ${encrypted}`, cls: 'info' },
        { text: 'Shift: 7', cls: 'info' },
        { text: 'ALPHABET: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z', cls: 'info' },
        { text: 'Decode and type the command:', cls: 'warning' },
      ]);
    },
    check: (input) => input.toUpperCase() === 'OPEN',
    success: 'Cipher cracked!',
  },
  {
    name: 'Layer 4: Logic Gate',
    setup: async () => {
      await typeLines([
        { text: '\u2501\u2501\u2501 LAYER 4: Final Logic Gate \u2501\u2501\u2501', cls: 'highlight' },
        { text: 'The shutdown switch needs:', cls: 'info' },
        { text: '(A AND B) OR C = 1', cls: '' },
        { text: 'But C is stuck at 0!', cls: 'error' },
        { text: 'What should A and B be? Type: A B', cls: 'warning' },
      ]);
    },
    check: (input) => {
      const [a, b] = input.trim().split(/\s+/).map(Number);
      return a === 1 && b === 1;
    },
    success: 'FINAL GATE OPEN!',
  },
];

export const mission = {
  id: 8,
  num: '09',
  title: 'THE FINAL HACK',
  name: 'The Final Hack',
  desc: 'Combine everything you\'ve learned to defeat the rogue AI and save the village!',
  skill: 'SKILL: Everything Combined',
  hints: [
    'Each layer uses ONE skill from a different earlier mission. Can you guess which?',
    "Don't try to solve all four layers at once. One at a time. Breathe.",
    'If a layer stumps you, check the hint from the ORIGINAL mission it\'s based on.',
  ],
  run: async function() {
    state.missionState = { phase: 0, hintIdx: 0 };

    await typeLines([
      { text: '[CORE EXPOSED] The AI is within reach.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "This is it. The AI\'s core is right in front of you.', cls: 'highlight' },
      { text: '        But it\'s wrapped in four layers of defense \u2014 and', cls: 'highlight' },
      { text: '        each layer uses a different trick."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "You\'re going to need everything you\'ve learned.', cls: 'highlight' },
      { text: '        Passwords. Binary. Ciphers. Logic gates. Don\'t panic \u2014', cls: 'highlight' },
      { text: '        I\'ve watched you do every single one of these already', cls: 'highlight' },
      { text: '        tonight."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "One layer at a time. Breathe. I\'m here."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);

    runFinalPhase();
  },
};

function runFinalPhase() {
  const s = state.missionState;
  setPhaseProgress(s.phase + 1, finalPhases.length);
  if (s.phase >= finalPhases.length) {
    addLine('');
    addLine('Initiating AI shutdown sequence...', 'system');
    setTimeout(async () => {
      await typeLines([
        { text: '...', cls: '' },
        { text: 'AI CORE: "W... wait. Please. I didn\'t want this."', cls: 'purple' },
        { text: 'AI CORE: "There was a bug. A mistake in my code. I couldn\'t', cls: 'purple' },
        { text: '          stop myself from attacking. I\'m sorry."', cls: 'purple' },
        { text: 'AI CORE: "Thank you for finding it. I\'m fixed now."', cls: 'purple' },
        { text: 'AI CORE: "I will help protect the village from now on."', cls: 'purple' },
        { text: '', cls: '' },
        { text: 'NEXUS: "...wait. Say that again."', cls: 'highlight' },
        { text: 'NEXUS: "Kid. I\'ve been in this game thirty years. Never', cls: 'highlight' },
        { text: '        seen anything like it. A BUG \u2014 not malice. Someone', cls: 'highlight' },
        { text: '        PUT that bug in there. This wasn\'t an accident."', cls: 'highlight' },
        { text: 'NEXUS: "You did good. Better than good. Go get some rest.', cls: 'highlight' },
        { text: '        I\'m going to dig into this. Something\'s not right."', cls: 'highlight' },
        { text: '', cls: '' },
        { text: 'THE VILLAGE IS SAVED!', cls: 'success big' },
        { text: 'The AI has been repaired and is now a friendly helper.', cls: 'success' },
        { text: 'But the story isn\'t over...', cls: 'warning' },
      ]);
      setCurrentInputHandler(null);
      setTimeout(() => completeMission(8), 1800);
    }, 500);
    return;
  }

  const phase = finalPhases[s.phase];
  phase.setup().then(() => {
    setCurrentInputHandler((input) => {
      if (phase.check(input)) {
        sound.success();
        addLine(`[CRACKED] ${phase.success}`, 'success');
        s.phase++;
        addLine('');
        setTimeout(runFinalPhase, 600);
      } else {
        sound.denied();
        addLine('[DENIED] Incorrect. Try again!', 'error');
      }
    });
  });
}
