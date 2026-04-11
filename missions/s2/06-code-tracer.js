// missions/s2/06-code-tracer.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission,
} from '../../engine.js';

const tracePuzzles = [
  {
    type: 'predict',
    title: 'Predict the Output',
    code: `1  x = 5
2  y = 3
3  z = x + y
4  z = z * 2
5  print(z)`,
    question: 'What does line 5 print?',
    answer: '16',
    explain: 'x=5, y=3, z=5+3=8, z=8*2=16. Output: 16',
  },
  {
    type: 'predict',
    title: 'Predict the Loop',
    code: `1  total = 0
2  for i in range(1, 5):
3      total = total + i
4  print(total)`,
    question: 'What does line 4 print?  (range(1,5) = 1,2,3,4)',
    answer: '10',
    explain: 'i goes 1,2,3,4. total: 0+1=1, 1+2=3, 3+3=6, 6+4=10. Output: 10',
  },
  {
    type: 'trace',
    title: 'Trace the Variables',
    code: `1  a = 10
2  b = 4
3  a = a - b
4  b = b + a
5  a = b - 1`,
    question: 'What are the values of a and b after line 5? Type: a b',
    check: (input) => {
      const [a, b] = input.trim().split(/\s+/).map(Number);
      return a === 9 && b === 10;
    },
    answer: '9 10',
    explain: 'a=10, b=4. Line 3: a=10-4=6. Line 4: b=4+6=10. Line 5: a=10-1=9. Final: a=9, b=10',
  },
  {
    type: 'fix',
    title: 'Fix the Bug',
    code: `1  password = "secret"
2  attempt = input()
3  if attempt = password:
4      print("YES")
5  else:
6      print("NO")`,
    question: 'Line 3 has a bug. Type the corrected line 3:',
    check: (input) => input.replace(/\s/g, '').toLowerCase() === 'ifattempt==password:',
    answer: 'if attempt == password:',
    explain: 'Single = is assignment. Double == is comparison. Must be "if attempt == password:"',
  },
];

export const mission = {
  id: 13,
  num: 'S2-06',
  title: 'CODE TRACER',
  name: 'Code Tracer',
  desc: 'Predict what code will print. Trace every variable. Debug like a real programmer.',
  skill: 'SKILL: Mental Execution + Debugging',
  hints: [
    'Write every variable on paper. Cross out old values when they change. Your brain remembers it better by hand.',
    "Read one line at a time. Don't jump ahead. The computer doesn't jump ahead either.",
    "For loops \u2014 walk through each pass out loud. 'First time through, i is 1, so...'",
  ],
  run: async function() {
    state.missionState = { idx: 0, hintIdx: 0 };

    await typeLines([
      { text: '[REVERSE ENGINEERING] Reading Victor\'s scripts.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'AI CORE: "In Season 1, you learned to FIND bugs \u2014 spot the', cls: 'purple' },
      { text: '          line that was wrong. Now you learn to do something', cls: 'purple' },
      { text: '          much harder: RUN code in your head."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "This skill separates beginners from experts. A', cls: 'purple' },
      { text: '          beginner types code, hits run, sees the result. An', cls: 'purple' },
      { text: '          expert reads ten lines and KNOWS what those lines', cls: 'purple' },
      { text: '          will do before running anything. They track every', cls: 'purple' },
      { text: '          variable in their head like pieces on a chessboard."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "This is called TRACING. Every real programmer does', cls: 'purple' },
      { text: '          it, every day, multiple times a day. It\'s also how', cls: 'purple' },
      { text: '          you read someone else\'s code and understand what', cls: 'purple' },
      { text: '          it does \u2014 critical for reverse engineering."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "I will give you four short programs from Victor\'s', cls: 'purple' },
      { text: '          files. Don\'t just read them. BE the computer. Go', cls: 'purple' },
      { text: '          line by line. Track every variable as it changes."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Pro tip: use paper. Write each variable down,', cls: 'purple' },
      { text: '          cross out old values when they change. Your brain', cls: 'purple' },
      { text: '          remembers better by hand than by eye."', cls: 'purple' },
      { text: '', cls: '' },
    ]);

    showTracePuzzle();
  },
};

function showTracePuzzle() {
  const s = state.missionState;
  const p = tracePuzzles[s.idx];
  setPhaseProgress(s.idx + 1, tracePuzzles.length);

  addLine(`\u2501\u2501\u2501 ${p.title} \u2501\u2501\u2501`, 'highlight');
  addPre(p.code);
  addLine(p.question, 'warning');

  setCurrentInputHandler((input) => {
    const ok = p.check ? p.check(input) : input.trim() === p.answer;
    if (ok) {
      sound.success();
      addLine(`[CORRECT] ${p.explain}`, 'success');
      s.idx++;
      if (s.idx >= tracePuzzles.length) {
        addLine('');
        addLine('You can now read code like a real programmer!', 'success big');
        setCurrentInputHandler(null);
        setTimeout(() => completeMission(13), 1200);
      } else {
        addLine('');
        setTimeout(showTracePuzzle, 700);
      }
    } else {
      sound.denied();
      addLine('[WRONG] Trace each line carefully. Write variable values on paper!', 'error');
    }
  });
}
