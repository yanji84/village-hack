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
      { text: 'NEXUS: "The village network is down. Data packets are', cls: 'highlight' },
      { text: '        jammed in the routing grid. We need to manually', cls: 'highlight' },
      { text: '        guide them through. Time to write your first', cls: 'highlight' },
      { text: '        programs."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: '@ is the data packet. X is the destination.', cls: 'info' },
      { text: 'Commands: U (up)  D (down)  L (left)  R (right)', cls: 'info' },
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
    addLine('NEXUS: "Move @ to X. Type one command and press Enter."', 'highlight');
  } else {
    addLine('Write your program:', 'warning');
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
      addLine('[ERROR] Write at least one step.', 'error');
      return;
    }

    for (let i = 0; i < steps.length; i++) {
      if (!dirMap[steps[i]]) {
        addLine(`[SYNTAX ERROR] "${steps[i]}" \u2014 use U, D, L, or R.`, 'error');
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
          addLine('NEXUS: "That\'s a program. One instruction. The computer', 'highlight');
          addLine('        did EXACTLY what you said. Nothing more."', 'highlight');
        } else if (idx === 1) {
          addLine('', '');
          addLine('NEXUS: "A program is a SEQUENCE. The computer runs each', 'highlight');
          addLine('        step in order. Change the order, change the', 'highlight');
          addLine('        result."', 'highlight');
          if (s.attempts > 1) {
            addLine('NEXUS: "You crashed and fixed it. That\'s called', 'highlight');
            addLine('        DEBUGGING \u2014 the most important skill a', 'highlight');
            addLine('        programmer has."', 'highlight');
          }
        } else if (idx === 2) {
          addLine('', '');
          addLine('NEXUS: "First wall. You had to PLAN around it. Real', 'highlight');
          addLine('        programmers spend more time thinking than typing.', 'highlight');
          addLine('        That\'s not slow \u2014 that\'s smart."', 'highlight');
        } else if (idx === 3) {
          addLine('', '');
          if (steps.length <= level.par) {
            addLine('NEXUS: "Optimal path. No wasted steps."', 'highlight');
          }
          if (s.attempts > 1) {
            addLine(`NEXUS: "${s.attempts} attempts. Each crash showed you exactly`, 'highlight');
            addLine('        where the bug was. You fixed it and tried again.', 'highlight');
            addLine('        That cycle \u2014 write, crash, find the bug, fix,', 'highlight');
            addLine('        retry \u2014 is the entire job of programming."', 'highlight');
          }
        }

        s.levelIdx = (s.levelIdx || 0) + 1;
        if (s.levelIdx < programLevels.length) {
          addLine('', '');
          setTimeout(() => loadProgramLevel(s.levelIdx), 1000);
        } else {
          addLine('', '');
          addLine('NEXUS: "You just wrote programs, found bugs, and fixed', 'highlight');
          addLine('        them. That\'s what every programmer does, every', 'highlight');
          addLine('        day. The programs get longer. The idea stays', 'highlight');
          addLine('        the same."', 'highlight');
          addLine('', '');
          addLine('NEXUS: "While you were routing, I ran a diagnostic. The', 'highlight');
          addLine('        AI didn\'t DESTROY the network \u2014 it was trying to', 'highlight');
          addLine('        ISOLATE something. Like it was quarantining a', 'highlight');
          addLine('        virus. Why would a rogue AI do that?"', 'highlight');
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
          addLine('The very first step crashed. Check which direction @ can move.', 'info');
        } else {
          addLine(`Steps 1\u2013${crashStep} ran fine. Step ${crashStep + 1} is the bug.`, 'info');
        }
        // Re-enable input after crash
        setCurrentInputHandler(inputHandler);
      } else {
        sound.denied();
        addLine(`Ran ${steps.length} steps but didn't reach X. Need more steps.`, 'error');
        // Re-enable input after incomplete
        setCurrentInputHandler(inputHandler);
      }
      terminal.scrollTop = terminal.scrollHeight;
    })();
  };

  setCurrentInputHandler(inputHandler);
}
