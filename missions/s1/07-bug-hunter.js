// missions/s1/07-bug-hunter.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission,
} from '../../engine.js';

const bugPuzzles = [
  {
    title: 'Door Lock Code',
    code: `1  password = "OPEN123"
2  attempt = input("Enter password: ")
3  if attempt == password:
4    print("Door unlocked!")
5  else:
6    print("Wrong password!")
7  # User types "open123" \u2014 door stays locked. Why?`,
    bugLine: 3,
    explain: 'Line 3: Comparison is case-sensitive. "open123" != "OPEN123". Should convert both to the same case: `if attempt.upper() == password:`',
    hint: 'The user typed the right letters, but something about capital vs lowercase...',
  },
  {
    title: 'Counting Loop',
    code: `1  total = 0
2  for i in range(1, 5):
3    total = total + 1
4  print("Sum of 1-5 is:", total)`,
    bugLine: 3,
    explain: 'Line 3: Adds 1 each time instead of adding i. Should be total = total + i. The loop counts 1,1,1,1 instead of 1,2,3,4!',
    hint: 'The code says it adds up numbers 1 to 5, but what is it actually adding?',
  },
  {
    title: 'Temperature Alarm',
    code: `1  temp = read_sensor()
2  if temp > 100:
3    print("Normal temperature")
4  else:
5    print("WARNING: Too hot!")`,
    bugLine: 2,
    explain: 'Lines 2-5: Logic is backwards! If temp > 100 it says "Normal" but should say "WARNING". The > should be < (or swap the messages).',
    hint: 'Is temperature OVER 100 really "normal"?',
  },
];

export const mission = {
  id: 6,
  num: '07',
  title: 'BUG HUNTER',
  name: 'Bug Hunter',
  desc: 'Find and exploit bugs in the AI\'s code. Real hackers read code to find weaknesses!',
  skill: 'SKILL: Reading Code + Debugging',
  hints: [
    'Read each line slowly. Ask yourself: does this line do what it SAYS it does?',
    'Look for things that look ALMOST right \u2014 a missing symbol, a wrong number, a backwards comparison.',
    'Imagine YOU are the computer. Run each line in your head. Where does your version break?',
  ],
  run: async function() {
    state.missionState = { bugIdx: 0, hintIdx: 0 };

    await typeLines([
      { text: '[SOURCE DUMP ACQUIRED] Portions of the AI\'s code recovered.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Every hacker learns this skill before anything else:', cls: 'highlight' },
      { text: '        READ THE CODE. Real hackers don\'t GUESS at what', cls: 'highlight' },
      { text: '        software does. They read it, line by line, until they', cls: 'highlight' },
      { text: '        can predict what it\'ll do before running it."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Sometimes the code is wrong. That\'s called a BUG.', cls: 'highlight' },
      { text: '        Sometimes a bug is just annoying. Sometimes a bug is', cls: 'highlight' },
      { text: '        how you BREAK IN. Bugs are hacker gold."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "I\'m going to show you three short programs pulled', cls: 'highlight' },
      { text: '        from the AI\'s guts. Each one has exactly ONE mistake.', cls: 'highlight' },
      { text: '        Don\'t skim. Read every line like it\'s a sentence. Ask', cls: 'highlight' },
      { text: '        yourself: does this line do what it SAYS it does?"', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "When you spot the bug, type the LINE NUMBER. Not the', cls: 'highlight' },
      { text: '        fix \u2014 just the line number."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);

    showBugPuzzle();
  },
};

function showBugPuzzle() {
  const s = state.missionState;
  const p = bugPuzzles[s.bugIdx];
  setPhaseProgress(s.bugIdx + 1, bugPuzzles.length);

  addLine(`\u2501\u2501\u2501 ${p.title} \u2501\u2501\u2501`, 'highlight');
  addLine('Find the bug! Which line has the mistake?', 'warning');
  addPre(p.code);
  addLine('Type the line number:', 'warning');

  setCurrentInputHandler((input) => {
    const num = parseInt(input.trim());
    if (num === p.bugLine) {
      sound.success();
      addLine(`[FOUND] Bug on line ${p.bugLine}!`, 'success');
      addLine(p.explain, 'info');
      s.bugIdx++;
      if (s.bugIdx >= bugPuzzles.length) {
        addLine('');
        addLine('All bugs found! The AI\'s defenses are crumbling!', 'success big');
        setCurrentInputHandler(null);
        setTimeout(() => completeMission(6), 1000);
      } else {
        addLine('\nNice catch! Next code snippet...', 'info');
        setTimeout(showBugPuzzle, 600);
      }
    } else {
      sound.denied();
      addLine(`[WRONG] Line ${num} looks fine. Look more carefully!`, 'error');
      addLine(p.hint, 'warning');
    }
  });
}
