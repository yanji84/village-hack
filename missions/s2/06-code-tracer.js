// missions/s2/06-code-tracer.js
import {
  state, sound, sleep,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission,
} from '../../engine.js';

// ──────────────────────────────────────────────────────────
// Step-by-step trace animation
// Each `steps` entry: { line, note, vars }  — line is 1-based index into codeLines
// ──────────────────────────────────────────────────────────
async function animateTrace(codeLines, steps) {
  const terminal = document.getElementById('terminal');
  const wrapper = document.createElement('div');
  const container = document.createElement('div');
  container.style.cssText = 'margin:10px 0;padding:12px 14px;border:1px solid #1a2a1a;border-radius:4px;background:#050505;font-family:"Fira Mono",monospace;font-size:13px;';

  const header = document.createElement('div');
  header.style.cssText = 'color:#00aa2a;font-size:11px;margin-bottom:10px;letter-spacing:1.5px;font-weight:bold;';
  header.textContent = '▶ STEP-BY-STEP EXECUTION';
  container.appendChild(header);

  const codeBlock = document.createElement('div');
  codeBlock.style.cssText = 'display:flex;flex-direction:column;gap:2px;margin-bottom:10px;';
  container.appendChild(codeBlock);

  const lineEls = codeLines.map((text) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:3px 6px;border-radius:3px;color:#555;transition:all 0.35s;line-height:1.6;';
    const codeSpan = document.createElement('span');
    codeSpan.style.cssText = 'white-space:pre;flex-shrink:0;';
    codeSpan.textContent = text;
    row.appendChild(codeSpan);
    const noteSpan = document.createElement('span');
    noteSpan.style.cssText = 'font-size:11px;color:#555;transition:all 0.35s;margin-left:auto;padding-left:20px;';
    row._note = noteSpan;
    row.appendChild(noteSpan);
    codeBlock.appendChild(row);
    return row;
  });

  const varsPanel = document.createElement('div');
  varsPanel.style.cssText = 'border-top:1px dashed #1a2a1a;padding-top:8px;color:#7fffa0;font-size:12px;min-height:18px;letter-spacing:0.5px;';
  varsPanel.textContent = '';
  container.appendChild(varsPanel);

  wrapper.appendChild(container);
  terminal.appendChild(wrapper);
  terminal.scrollTop = terminal.scrollHeight;

  for (const step of steps) {
    await sleep(850);
    // dim previously-highlighted line
    lineEls.forEach(el => {
      if (el.style.color === 'rgb(0, 255, 65)' || el.style.color === '#00ff41') {
        el.style.color = '#3a6a3a';
        el.style.background = 'transparent';
      }
    });
    const el = lineEls[step.line - 1];
    if (el) {
      el.style.color = '#00ff41';
      el.style.background = '#0a1a0a';
      if (step.note) {
        el._note.textContent = '→ ' + step.note;
        el._note.style.color = '#ffd966';
      }
    }
    if (step.vars) {
      varsPanel.innerHTML = 'vars: <span style="color:#7fffa0">' + step.vars + '</span>';
    }
    terminal.scrollTop = terminal.scrollHeight;
  }
  await sleep(600);
}

// ──────────────────────────────────────────────────────────
// Puzzle definitions
// ──────────────────────────────────────────────────────────
const tracePuzzles = [
  {
    title: 'THE SWAP',
    intro: [
      'AI CORE: "First program. Two variables holding village zone names.',
      '          Victor wants them swapped. But assignment in code is',
      '          NOT like trading cards — it overwrites."',
    ],
    codeLines: [
      '1  a = "north"',
      '2  b = "south"',
      '3  temp = a',
      '4  a = b',
      '5  b = temp',
    ],
    codeRaw: `1  a = "north"
2  b = "south"
3  temp = a
4  a = b
5  b = temp`,
    question: 'After line 5 runs, what are a and b?  Type: a b  (example: "east west")',
    check: (input) => {
      const parts = input.trim().toLowerCase().replace(/["']/g, '').split(/\s+/);
      return parts[0] === 'south' && parts[1] === 'north';
    },
    answer: 'south north',
    explain: 'Line 3 parks a\'s value in temp. Line 4 overwrites a with b. Line 5 rescues the old a from temp into b. Without temp, a would be lost forever.',
    concept: 'SWAP IDIOM — assignment overwrites. If you don\'t save the value first, it\'s gone.',
    hints: [
      'Trace slowly. After line 3, what\'s in temp? After line 4, what\'s in a?',
      'The key moment is line 4: a = b. The old value of a is GONE from a — but not from memory. Where did we put it?',
      'Line 3: temp="north". Line 4: a becomes "south" (a lost "north"). Line 5: b becomes temp which is "north".',
    ],
    errorHint: 'Did a get overwritten before you read it? Line 4 destroys the old a. Only temp still holds it.',
    trace: [
      { line: 1, note: 'a ← "north"', vars: 'a="north"' },
      { line: 2, note: 'b ← "south"', vars: 'a="north", b="south"' },
      { line: 3, note: 'save a into temp', vars: 'a="north", b="south", temp="north"' },
      { line: 4, note: 'a OVERWRITTEN by b', vars: 'a="south", b="south", temp="north"' },
      { line: 5, note: 'b gets rescued value from temp', vars: 'a="south", b="north", temp="north"' },
    ],
  },

  {
    title: 'THE ACCUMULATOR',
    intro: [
      'AI CORE: "Next: a LOOP. One variable that builds up across many',
      '          passes. Programmers call it an accumulator. You\'ll see',
      '          this pattern everywhere — scores, sums, running totals."',
    ],
    codeLines: [
      '1  total = 0',
      '2  for i in range(1, 5):',
      '3      total = total + i',
      '4  print(total)',
    ],
    codeRaw: `1  total = 0
2  for i in range(1, 5):
3      total = total + i
4  print(total)`,
    question: 'range(1, 5) yields i = 1, 2, 3, 4.  What does line 4 print?',
    check: (input) => input.trim() === '10',
    answer: '10',
    explain: 'i walks 1,2,3,4. total: 0 → 1 → 3 → 6 → 10. Four iterations, not five — range stops BEFORE 5.',
    concept: 'ACCUMULATOR PATTERN — total starts at zero, each pass adds to it. Same shape powers every score counter you\'ve ever seen.',
    hints: [
      'Walk through each pass out loud. "First pass: i=1, total was 0, now total is 0+1=1."',
      'range(1, 5) stops BEFORE 5. So i takes 4 values, not 5.',
      '0+1=1, 1+2=3, 3+3=6, 6+4=10. Four adds, answer 10.',
    ],
    errorHint: 'Did you account for all iterations — and did you stop at the right one? range(1,5) is 1,2,3,4 (stops BEFORE 5).',
    trace: [
      { line: 1, note: 'total ← 0', vars: 'total=0' },
      { line: 2, note: 'i = 1', vars: 'total=0, i=1' },
      { line: 3, note: 'total = 0+1', vars: 'total=1, i=1' },
      { line: 2, note: 'i = 2', vars: 'total=1, i=2' },
      { line: 3, note: 'total = 1+2', vars: 'total=3, i=2' },
      { line: 2, note: 'i = 3', vars: 'total=3, i=3' },
      { line: 3, note: 'total = 3+3', vars: 'total=6, i=3' },
      { line: 2, note: 'i = 4', vars: 'total=6, i=4' },
      { line: 3, note: 'total = 6+4', vars: 'total=10, i=4' },
      { line: 2, note: 'i would be 5 → STOP (range excludes 5)', vars: 'total=10' },
      { line: 4, note: 'prints 10', vars: 'total=10' },
    ],
  },

  {
    title: 'THE BRANCH',
    intro: [
      'AI CORE: "Now a conditional. Victor\'s intrusion alarm graded',
      '          threat levels. Here\'s the trap: only ONE branch runs.',
      '          elif is a RACE — first match wins, the rest are skipped."',
    ],
    codeLines: [
      '1  score = 75',
      '2  if score >= 90:',
      '3      grade = "A"',
      '4  elif score >= 80:',
      '5      grade = "B"',
      '6  elif score >= 70:',
      '7      grade = "C"',
      '8  else:',
      '9      grade = "F"',
      '10 print(grade)',
    ],
    codeRaw: `1  score = 75
2  if score >= 90:
3      grade = "A"
4  elif score >= 80:
5      grade = "B"
6  elif score >= 70:
7      grade = "C"
8  else:
9      grade = "F"
10 print(grade)`,
    question: 'What does line 10 print?  (one letter)',
    check: (input) => input.trim().toUpperCase() === 'C',
    answer: 'C',
    explain: 'score=75. 75>=90? No. 75>=80? No. 75>=70? YES → grade="C". The remaining branches are skipped entirely.',
    concept: 'elif SHORT-CIRCUITS — once a condition matches, every later branch (including else) is ignored. Only one branch runs. Ever.',
    hints: [
      'Check each condition in ORDER. Stop at the first one that\'s true.',
      'Is 75 >= 90? No. Is 75 >= 80? No. Is 75 >= 70? ...',
      'First true branch wins. 75 >= 70 is true, so grade="C", and nothing else runs.',
    ],
    errorHint: 'Only ONE branch runs — the first one whose condition is true. Walk the conditions top-down and stop at the first true one.',
    trace: [
      { line: 1, note: 'score ← 75', vars: 'score=75' },
      { line: 2, note: '75 >= 90? FALSE — skip', vars: 'score=75' },
      { line: 4, note: '75 >= 80? FALSE — skip', vars: 'score=75' },
      { line: 6, note: '75 >= 70? TRUE!', vars: 'score=75' },
      { line: 7, note: 'grade ← "C"', vars: 'score=75, grade="C"' },
      { line: 10, note: 'prints "C" (else skipped)', vars: 'score=75, grade="C"' },
    ],
  },

  {
    title: 'THE OFF-BY-ONE',
    intro: [
      'AI CORE: "Time to FIX code. This is Victor\'s alarm-counter loop.',
      '          It\'s supposed to print numbers 1 through 5. It doesn\'t.',
      '          Classic bug — famous enough to have its own name:',
      '          OFF-BY-ONE. Probably the #1 bug in computing history."',
    ],
    codeLines: [
      '1  # Print numbers 1 to 5 (inclusive)',
      '2  for i in range(1, 5):',
      '3      print(i)',
    ],
    codeRaw: `1  # Print numbers 1 to 5 (inclusive)
2  for i in range(1, 5):
3      print(i)`,
    question: 'Line 2 has an off-by-one bug. Type the corrected line 2:',
    check: (input) => {
      const n = input.replace(/\s/g, '').toLowerCase();
      return n === 'foriinrange(1,6):';
    },
    answer: 'for i in range(1, 6):',
    explain: 'range(a, b) goes from a up to but NOT INCLUDING b. To print 1..5, you need range(1, 6). The upper bound is exclusive.',
    concept: 'HALF-OPEN INTERVALS — range excludes the top. Same rule for array slicing, string slicing, most "from X to Y" APIs. Knowing it saves you years of bugs.',
    hints: [
      'range(1, 5) stops BEFORE 5. Count what it actually prints.',
      'You need to go one higher. If the top is exclusive, what number makes 5 get included?',
      'range(1, 6) → 1, 2, 3, 4, 5. Now 5 is included because the loop stops BEFORE 6.',
    ],
    errorHint: 'Look at the NUMBERS in range(), not the variable names. The upper bound is exclusive — to include 5, the upper must be...?',
    trace: [
      { line: 1, note: 'goal: print 1,2,3,4,5', vars: '' },
      { line: 2, note: 'range(1,6) → yields 1,2,3,4,5', vars: 'i=1' },
      { line: 3, note: 'prints 1', vars: 'i=1' },
      { line: 2, note: 'next i', vars: 'i=2' },
      { line: 3, note: 'prints 2', vars: 'i=2' },
      { line: 2, note: '...continues through 5', vars: 'i=5' },
      { line: 3, note: 'prints 5 — and NOW stops', vars: 'i=5' },
    ],
  },

  {
    title: 'THE OPERATOR',
    intro: [
      'AI CORE: "Final one. And the most dangerous bug in Victor\'s code.',
      '          It LOOKS right. It RUNS without crashing. But it lets',
      '          ANYONE through the password check. Spot why."',
    ],
    codeLines: [
      '1  password = "secret"',
      '2  attempt = input()',
      '3  if attempt = password:',
      '4      print("ACCESS GRANTED")',
      '5  else:',
      '6      print("DENIED")',
    ],
    codeRaw: `1  password = "secret"
2  attempt = input()
3  if attempt = password:
4      print("ACCESS GRANTED")
5  else:
6      print("DENIED")`,
    question: 'Line 3 has a bug that lets everyone through. Type the corrected line 3:',
    check: (input) => input.replace(/\s/g, '').toLowerCase() === 'ifattempt==password:',
    answer: 'if attempt == password:',
    explain: 'A single = ASSIGNS (overwrite). A double == COMPARES (ask). Line 3 was overwriting attempt with password and then treating the result as "true" — so every login passed.',
    concept: 'ASSIGNMENT vs EQUALITY — one character, totally different meaning. = does, == asks. This one character has cost the industry billions of dollars in bugs.',
    hints: [
      'Look at the operator, not the variable names. What does a single = actually do?',
      'A single = ASSIGNS a value. It doesn\'t ask a question. To compare, you need a different symbol.',
      'Use == (double equals). That\'s how you ask "are these equal?" instead of "set this equal to".',
    ],
    errorHint: 'Look at the OPERATOR, not the variable names. One symbol assigns, another compares. Which one asks a question?',
    trace: [
      { line: 1, note: 'password ← "secret"', vars: 'password="secret"' },
      { line: 2, note: 'attempt ← whatever user types', vars: 'password="secret", attempt=???' },
      { line: 3, note: '== COMPARES (asks true/false)', vars: 'password="secret", attempt=???' },
      { line: 4, note: 'only runs if attempt matches', vars: '' },
      { line: 6, note: 'otherwise this runs', vars: '' },
    ],
  },
];

// ──────────────────────────────────────────────────────────
// Mission export
// ──────────────────────────────────────────────────────────
export const mission = {
  id: 13,
  num: 'S2-06',
  title: 'CODE TRACER',
  name: 'Code Tracer',
  desc: 'Become the computer. Run code in your head, line by line, variable by variable — the skill that separates beginners from experts.',
  skill: 'SKILL: Mental Execution + Debugging',
  hints: [
    'Write every variable on paper. Cross out old values when they change. Your hand remembers better than your eye.',
    'Read one line at a time. Don\'t jump ahead. The computer doesn\'t either.',
    'For loops — walk each pass out loud. "First time through, i is 1, so..." The words force the trace to slow down.',
  ],
  run: async function() {
    state.missionState = { idx: 0, hintIdx: 0 };

    await typeLines([
      { text: '[REVERSE ENGINEERING] Reading Victor\'s scripts.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'AI CORE: "In Season 1 you learned to FIND bugs — spot the', cls: 'purple' },
      { text: '          line that looked wrong. Now you learn something', cls: 'purple' },
      { text: '          much harder. You learn to BE the computer."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "A beginner hits Run and HOPES. An expert reads', cls: 'purple' },
      { text: '          ten lines and KNOWS what\'ll happen before the', cls: 'purple' },
      { text: '          code executes. They track every variable in their', cls: 'purple' },
      { text: '          head like pieces on a chessboard."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Programmers call this TRACING. They do it every', cls: 'purple' },
      { text: '          day, all day. It\'s how you read unfamiliar code.', cls: 'purple' },
      { text: '          It\'s how you debug without a debugger. It\'s how', cls: 'purple' },
      { text: '          you reverse-engineer an enemy\'s script."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Five programs. Each one a real concept Victor', cls: 'purple' },
      { text: '          used against us. Don\'t read them. EXECUTE them.', cls: 'purple' },
      { text: '          Line by line. Variable by variable. Be the CPU."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Pro tip: grab paper. Write each variable down,', cls: 'purple' },
      { text: '          cross out old values when they change. Trust me —', cls: 'purple' },
      { text: '          your hand remembers what your eye forgets."', cls: 'purple' },
      { text: '', cls: '' },
    ]);

    showTracePuzzle();
  },
};

function showTracePuzzle() {
  const s = state.missionState;
  const p = tracePuzzles[s.idx];
  setPhaseProgress(s.idx + 1, tracePuzzles.length);
  s.attempts = 0;

  addLine('', '');
  addLine(`─── PROGRAM ${s.idx + 1} of ${tracePuzzles.length} — ${p.title} ───`, 'highlight');
  addLine('', '');
  for (const line of p.intro) addLine(line, 'purple');
  addLine('', '');
  addPre(p.codeRaw);
  addLine('', '');
  addLine(p.question, 'warning');

  setCurrentInputHandler(async (input) => {
    const ok = p.check ? p.check(input) : input.trim() === p.answer;
    if (ok) {
      sound.success();
      setCurrentInputHandler(null);
      addLine('', '');
      addLine(`[CORRECT] ${p.explain}`, 'success');
      addLine('', '');

      // Animated trace replay
      await animateTrace(p.codeLines, p.trace);

      addLine('', '');
      addLine(`AI CORE: "${p.concept}"`, 'purple');
      addLine('', '');

      s.idx++;
      if (s.idx >= tracePuzzles.length) {
        addLine('', '');
        addLine('╔══════════════════════════════════════╗', 'system');
        addLine('║   [ALL 5 PROGRAMS EXECUTED]          ║', 'system');
        addLine('║   YOU ARE NOW THE COMPUTER           ║', 'system');
        addLine('╚══════════════════════════════════════╝', 'system');
        addLine('', '');
        addLine('AI CORE: "Swap. Loop. Branch. Off-by-one. Operator bug.', 'purple');
        addLine('          Five concepts — and every one is a real thing', 'purple');
        addLine('          that fails in real code every single day."', 'purple');
        addLine('', '');
        addLine('AI CORE: "From now on, when you read code, you won\'t see', 'purple');
        addLine('          text. You\'ll see VARIABLES MOVING. That shift —', 'purple');
        addLine('          that\'s what programming really is. Welcome to', 'purple');
        addLine('          the other side of Run."', 'purple');
        addLine('', '');
        addLine('You can now read code like a real programmer!', 'success big');
        setTimeout(() => completeMission(13), 1800);
      } else {
        setTimeout(showTracePuzzle, 900);
      }
    } else {
      sound.denied();
      s.attempts = (s.attempts || 0) + 1;
      if (s.attempts === 1) {
        addLine(`[NOT QUITE] ${p.errorHint}`, 'error');
      } else if (s.attempts === 2) {
        addLine(`[HINT] ${p.hints[1]}`, 'error');
      } else {
        addLine(`[HINT] ${p.hints[2]}`, 'error');
      }
    }
  });
}
