// missions/s1/02-first-program.js
import {
  state, sound,
  addLine, typeLines,
  setCurrentInputHandler,
  completeMission, renderMaze, sleep,
} from '../../engine.js';

const programLevels = [
  {
    // Phase 1: one step. Trivial.
    grid: [
      '####',
      '#@X#',
      '####',
    ],
    par: 1,
  },
  {
    // Phase 2: three steps, no walls in the way.
    grid: [
      '#####',
      '#@..#',
      '#..X#',
      '#####',
    ],
    par: 3,
  },
  {
    // Phase 3: small maze with one wall to navigate around.
    grid: [
      '######',
      '#@.#.#',
      '#..#.#',
      '#....#',
      '#.#.X#',
      '######',
    ],
    par: 6,
  },
  {
    // Phase 4: the real maze.
    grid: [
      '########',
      '#@.....#',
      '#.####.#',
      '#.#..#.#',
      '#.#.##.#',
      '#......#',
      '#.####X#',
      '########',
    ],
    par: 10,
  },
];

export const mission = {
  id: 1,
  num: '02',
  title: 'FIRST PROGRAM',
  name: 'Your First Program',
  desc: 'Write a complete set of instructions and watch the computer follow them EXACTLY. One wrong step = crash.',
  skill: 'SKILL: Sequential Instructions + Debugging',
  hints: [
    'Trace your program step by step with your finger on the maze BEFORE you submit.',
    'If it crashed, look at which step hit the wall. Everything BEFORE that step was correct.',
    'The computer runs your program EXACTLY as written. No shortcuts, no common sense.',
  ],
  run: async function() {
    state.missionState = { levelIdx: 0, hintIdx: 0 };

    await typeLines([
      { text: '[SYSTEM] Village network offline. Data packets stuck.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Remember that rogue AI signal from Mission 1?', cls: 'highlight' },
      { text: '        It knocked out the village network. Data packets', cls: 'highlight' },
      { text: '        are stuck in the routing grid."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "We need to guide them through manually. You\'ll', cls: 'highlight' },
      { text: '        write INSTRUCTIONS for the computer to follow.', cls: 'highlight' },
      { text: '        That\'s what a program is \u2014 a list of steps."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: '@ is the data packet. X is the destination.', cls: 'info' },
      { text: 'Steps: U (up)  D (down)  L (left)  R (right)', cls: 'info' },
      { text: '', cls: '' },
    ]);

    loadProgramLevel(0);
  },
};

// Inject shake/pulse CSS once
let _cssInjected = false;
function injectAnimCSS() {
  if (_cssInjected) return;
  _cssInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }
    @keyframes pulse-green {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .maze-shake .maze-display {
      animation: shake 0.3s ease-in-out 3;
    }
    .maze-goal-pulse .player {
      animation: pulse-green 0.5s ease-in-out 4;
      color: #0f0 !important;
      text-shadow: 0 0 8px #0f0;
    }
  `;
  document.head.appendChild(style);
}

function loadProgramLevel(idx) {
  const level = programLevels[idx];
  const s = state.missionState;
  s.level = level;
  s.attempts = 0;

  // Render the maze
  const maze = level.grid.map(r => r.split(''));
  renderMaze(maze);

  addLine('', '');
  if (idx === 0) {
    addLine('NEXUS: "Move @ one step to X. Type R and press Enter."', 'highlight');
  } else if (idx === 1) {
    addLine('NEXUS: "Now X is farther away. Write ALL your steps at', 'highlight');
    addLine('        once \u2014 like R R D. The computer runs them in order."', 'highlight');
  } else if (idx === 2) {
    addLine('NEXUS: "Walls ahead. Plan your path BEFORE you type.', 'highlight');
    addLine('        Trace it with your finger on screen."', 'highlight');
  } else {
    addLine('NEXUS: "Bigger maze. Same idea. Think first, then type."', 'highlight');
  }

  const inputHandler = (input) => {
    const dirMap = { UP:[-1,0], U:[-1,0], DOWN:[1,0], D:[1,0], LEFT:[0,-1], L:[0,-1], RIGHT:[0,1], R:[0,1] };
    const raw = input.toUpperCase().trim();
    // Accept both "R R D" and "RRD" \u2014 split on spaces/commas, then split
    // any remaining multi-char tokens into individual characters if they're
    // all valid single-letter commands (U/D/L/R)
    let steps = raw.split(/[\s,]+/);
    steps = steps.flatMap(token => {
      if (dirMap[token]) return [token]; // already valid (U, D, L, R, UP, DOWN, etc.)
      if (/^[UDLR]+$/.test(token)) return token.split(''); // "RRD" \u2192 ["R","R","D"]
      return [token]; // leave invalid tokens for error handling below
    });

    if (steps.length === 0 || (steps.length === 1 && steps[0] === '')) {
      addLine('[ERROR] Type your steps using U, D, L, R. Example: R R D', 'error');
      return;
    }

    for (let i = 0; i < steps.length; i++) {
      if (!dirMap[steps[i]]) {
        addLine(`[SYNTAX ERROR] "${steps[i]}" is not a valid step. Use U (up), D (down), L (left), or R (right).`, 'error');
        return;
      }
    }

    s.attempts++;

    // Disable input during animation
    setCurrentInputHandler(null);

    injectAnimCSS();

    const terminal = document.getElementById('terminal');

    // Build step indicator: [Step 1/10] R R D D ...
    const stepIndicator = document.createElement('div');
    stepIndicator.style.cssText = 'margin:6px 0;font-family:inherit;font-size:13px;';
    const stepSpans = steps.map((cmd, i) => {
      const span = document.createElement('span');
      span.textContent = cmd;
      span.style.cssText = 'margin-right:4px;padding:2px 5px;border-radius:2px;color:#555;transition:all 0.15s;font-family:inherit;';
      return span;
    });
    stepSpans.forEach(sp => stepIndicator.appendChild(sp));
    terminal.appendChild(stepIndicator);

    // Render the maze ONCE — we'll update it in place
    const maze = level.grid.map(r => r.split(''));
    let pr, pc;
    for (let r = 0; r < maze.length; r++) {
      for (let c = 0; c < maze[r].length; c++) {
        if (maze[r][c] === '@') { pr = r; pc = c; }
      }
    }
    renderMaze(maze);
    // Grab the maze element we just rendered so we can update it
    const mazeContainer = terminal.lastElementChild;
    terminal.scrollTop = terminal.scrollHeight;

    // Helper: re-render maze content IN PLACE
    function updateMazeInPlace() {
      const mazeEl = mazeContainer.querySelector('.maze-display') || mazeContainer;
      let html = '';
      for (const row of maze) {
        for (const cell of row) {
          if (cell === '#') html += '<span class="wall">#</span>';
          else if (cell === '@') html += '<span class="player">@</span>';
          else if (cell === 'X') html += '<span class="goal">X</span>';
          else if (cell === ',') html += '<span class="visited">.</span>';
          else html += '<span class="path">.</span>';
        }
        html += '\n';
      }
      mazeEl.innerHTML = html;
    }

    // Run animated execution
    (async () => {
      let crashStep = -1;
      let reachedGoal = false;

      for (let i = 0; i < steps.length; i++) {
        // Highlight current step
        stepSpans.forEach((sp, j) => {
          if (j === i) {
            sp.style.color = '#00ffff';
            sp.style.fontWeight = 'bold';
            sp.style.background = 'rgba(0,255,255,0.1)';
          } else if (j < i) {
            sp.style.color = '#00ff41';
            sp.style.fontWeight = 'normal';
            sp.style.background = 'none';
          } else {
            sp.style.color = '#555';
            sp.style.fontWeight = 'normal';
            sp.style.background = 'none';
          }
        });

        await sleep(300);

        const [dr, dc] = dirMap[steps[i]];
        const nr = pr + dr;
        const nc = pc + dc;

        if (nr < 0 || nr >= maze.length || nc < 0 || nc >= maze[0].length || maze[nr][nc] === '#') {
          crashStep = i;
          stepSpans[i].style.color = '#ff3333';
          stepSpans[i].style.background = 'rgba(255,51,51,0.15)';
          stepSpans[i].style.fontWeight = 'bold';
          // Shake the maze
          mazeContainer.classList.add('maze-shake');
          setTimeout(() => mazeContainer.classList.remove('maze-shake'), 900);
          terminal.scrollTop = terminal.scrollHeight;
          break;
        }

        maze[pr][pc] = ',';
        pr = nr; pc = nc;

        if (maze[nr][nc] === 'X') {
          maze[nr][nc] = '@';
          reachedGoal = true;
          updateMazeInPlace();
          mazeContainer.classList.add('maze-goal-pulse');
          stepSpans[i].style.color = '#00ff41';
          stepSpans[i].style.fontWeight = 'bold';
          stepSpans[i].style.background = 'rgba(0,255,65,0.15)';
          break;
        }
        maze[nr][nc] = '@';
        updateMazeInPlace();
      }

      // Small pause before result messages
      await sleep(400);

      // Mark completed steps green
      stepSpans.forEach((sp, j) => {
        if (reachedGoal) {
          sp.style.color = 'var(--green,#0a0)';
          sp.style.fontWeight = 'normal';
        }
      });

      if (reachedGoal) {
        sound.success();
        addLine(`[PROGRAM COMPLETE] ${steps.length} steps.`, 'success');

        // Teaching happens AFTER success, not before
        if (idx === 0) {
          addLine('', '');
          addLine('NEXUS: "That\'s a program \u2014 one instruction. The computer', 'highlight');
          addLine('        did EXACTLY what you said. Not what you MEANT,', 'highlight');
          addLine('        what you SAID. Remember that."', 'highlight');
        } else if (idx === 1) {
          addLine('', '');
          addLine('NEXUS: "Multiple steps in order \u2014 that\'s called a', 'highlight');
          addLine('        SEQUENCE. Every program is a sequence. Change', 'highlight');
          addLine('        the order, change the result."', 'highlight');
          if (s.attempts > 1) {
            addLine('', '');
            addLine('NEXUS: "You crashed and fixed it. That\'s called', 'highlight');
            addLine('        DEBUGGING. Even the best programmers debug', 'highlight');
            addLine('        constantly. It\'s not failing \u2014 it\'s learning."', 'highlight');
          }
        } else if (idx === 2) {
          addLine('', '');
          addLine('NEXUS: "You had to PLAN around that wall. Real', 'highlight');
          addLine('        programmers spend more time thinking than', 'highlight');
          addLine('        typing. That\'s not slow \u2014 that\'s smart."', 'highlight');
        } else if (idx === 3) {
          addLine('', '');
          if (steps.length <= level.par) {
            addLine('NEXUS: "Optimal path. No wasted steps. Nice."', 'highlight');
          }
          if (s.attempts === 1) {
            addLine('NEXUS: "First try. You planned it out. That\'s', 'highlight');
            addLine('        real programmer thinking."', 'highlight');
          } else {
            addLine(`NEXUS: "${s.attempts} attempts. Each crash told you exactly`, 'highlight');
            addLine('        where the bug was. Write, crash, find the bug,', 'highlight');
            addLine('        fix, retry. That\'s programming."', 'highlight');
          }
        }

        s.levelIdx = (s.levelIdx || 0) + 1;
        if (s.levelIdx < programLevels.length) {
          addLine('', '');
          setTimeout(() => loadProgramLevel(s.levelIdx), 1000);
        } else {
          addLine('', '');
          addLine('NEXUS: "You just wrote programs, debugged them, and', 'highlight');
          addLine('        made them work. That\'s what every programmer', 'highlight');
          addLine('        does. The programs get bigger. The idea stays', 'highlight');
          addLine('        the same."', 'highlight');
          addLine('', '');
          addLine('NEXUS: "While you were routing packets, I ran a', 'highlight');
          addLine('        diagnostic. The AI didn\'t DESTROY the network', 'highlight');
          addLine('        \u2014 it was trying to ISOLATE something. Like it', 'highlight');
          addLine('        was quarantining a virus. Why would a rogue AI', 'highlight');
          addLine('        do that?"', 'highlight');
          addLine('', '');
          addLine('NEXUS: "I found fragments of data it left behind. But', 'highlight');
          addLine('        they keep changing. We\'ll need to learn how', 'highlight');
          addLine('        computers store and track changing data..."', 'highlight');
          addLine('', '');
          addLine('[ Type NEXT to continue ]', 'warning');
          setCurrentInputHandler(() => {
            setCurrentInputHandler(null);
            completeMission(1);
          });
        }
      } else if (crashStep >= 0) {
        sound.denied();
        addLine(`[CRASH] Step ${crashStep + 1} ("${steps[crashStep]}") hit a wall!`, 'error');
        if (crashStep === 0) {
          addLine('The very first step crashed. Look at @ \u2014 which direction can it move?', 'info');
        } else {
          addLine(`Steps 1\u2013${crashStep} were correct. Step ${crashStep + 1} is the bug \u2014 fix just that step.`, 'info');
        }
        // Progressive hints on repeated failures
        if (s.attempts >= 3) {
          addLine('NEXUS: "Try tracing your path on the maze with your finger before typing."', 'highlight');
        }
        // Re-render fresh maze so the kid sees the original layout
        addLine('', '');
        const freshMaze = level.grid.map(r => r.split(''));
        renderMaze(freshMaze);
        // Re-enable input after crash
        setCurrentInputHandler(inputHandler);
      } else {
        sound.denied();
        addLine(`Your program ran ${steps.length} steps but didn't reach X.`, 'error');
        if (s.attempts >= 2) {
          addLine('NEXUS: "Count the squares between @ and X. You need more steps."', 'highlight');
        } else {
          addLine('You need more steps to reach the destination.', 'info');
        }
        // Re-render fresh maze
        addLine('', '');
        const freshMaze = level.grid.map(r => r.split(''));
        renderMaze(freshMaze);
        // Re-enable input after incomplete
        setCurrentInputHandler(inputHandler);
      }
      terminal.scrollTop = terminal.scrollHeight;
    })();
  };

  setCurrentInputHandler(inputHandler);
}
