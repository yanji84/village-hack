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
      { text: '[SYSTEM] \u26a0 VILLAGE NETWORK OFFLINE \u2014 routing grid jammed', cls: 'system' },
      { text: '[SYSTEM] Cause: unauthorized signal disruption (see Mission 01)', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "That rogue AI signal didn\'t just ping our system', cls: 'highlight' },
      { text: '        \u2014 it scrambled the network routers. Data packets', cls: 'highlight' },
      { text: '        are trapped mid-transit in the routing grid."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "Automated routing is down, so we do this the old', cls: 'highlight' },
      { text: '        way: you write the directions, the computer follows', cls: 'highlight' },
      { text: '        them. Step. By. Step. No thinking on its part, no', cls: 'highlight' },
      { text: '        guessing \u2014 it does EXACTLY what you tell it."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "That\'s what a program IS. Not magic. Just a list', cls: 'highlight' },
      { text: '        of precise instructions."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: '  @ = data packet (you move this)', cls: 'info' },
      { text: '  X = destination (get @ here)', cls: 'info' },
      { text: '  # = wall (crash if you hit one!)', cls: 'info' },
      { text: '', cls: '' },
      { text: '  Directions:  U (up)  D (down)  L (left)  R (right)', cls: 'info' },
      { text: '  Type your steps separated by spaces, e.g.:  R R D', cls: 'info' },
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
  s.hintIdx = 0;

  // Render the maze
  const maze = level.grid.map(r => r.split(''));
  renderMaze(maze);

  addLine('', '');
  addLine('Type HINT if you get stuck.', 'info');
  addLine('', '');
  if (idx === 0) {
    addLine('NEXUS: "Start simple. See the @ and the X?', 'highlight');
    addLine('        @ is your data packet. X is where it needs to go.', 'highlight');
    addLine('        Which direction moves @ to X? Just one letter."', 'highlight');
  } else if (idx === 1) {
    addLine('NEXUS: "Now X is farther away. This time, write ALL', 'highlight');
    addLine('        your steps at once \u2014 like R R D. The computer', 'highlight');
    addLine('        runs them in order: first, second, third.', 'highlight');
    addLine('        No skipping, no rearranging."', 'highlight');
    addLine('', '');
    addLine('This is called a SEQUENCE \u2014 a list of steps run in order.', 'info');
    addLine('Every program ever written is built from sequences.', 'info');
  } else if (idx === 2) {
    addLine('NEXUS: "Walls in the way now. You can\'t go through them.', 'highlight');
    addLine('        Plan your ENTIRE route before typing anything.', 'highlight');
    addLine('        Trace it with your finger on screen first."', 'highlight');
    addLine('', '');
    addLine('Pro tip: count the steps in each direction before you type.', 'info');
  } else {
    addLine('NEXUS: "Final maze. Bigger grid, more walls. Same rules.', 'highlight');
    addLine('        Real programmers plan before they code.', 'highlight');
    addLine('        Take your time \u2014 think first, type second."', 'highlight');
    addLine('', '');
    addLine(`Target: reach X in ${level.par} steps or fewer for optimal routing.`, 'info');
  }

  const inputHandler = (input) => {
    const dirMap = { UP:[-1,0], U:[-1,0], DOWN:[1,0], D:[1,0], LEFT:[0,-1], L:[0,-1], RIGHT:[0,1], R:[0,1] };
    const raw = input.toUpperCase().trim();

    // HINT command
    if (raw === 'HINT' || raw === 'HELP') {
      const hints = mission.hints;
      const hintIdx = s.hintIdx || 0;
      if (hintIdx < hints.length) {
        addLine(`[HINT ${hintIdx + 1}/${hints.length}] ${hints[hintIdx]}`, 'info');
        s.hintIdx = hintIdx + 1;
      } else {
        addLine('[HINT] No more hints. Try tracing your path on the maze with your finger!', 'info');
      }
      return;
    }
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

        await sleep(350);

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

      // Pause before result messages for readability
      await sleep(500);

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
          addLine('NEXUS: "One instruction. One result. The computer did', 'highlight');
          addLine('        EXACTLY what you typed. Not what you meant.', 'highlight');
          addLine('        Not what made sense. What. You. Typed."', 'highlight');
          addLine('', '');
          addLine('KEY IDEA: Computers follow instructions perfectly \u2014 but they', 'info');
          addLine('ONLY do what you tell them. If you say "go right" they go right,', 'info');
          addLine('even if left was obviously better. They never guess.', 'info');
        } else if (idx === 1) {
          addLine('', '');
          addLine('NEXUS: "Multiple steps, one after another \u2014 that\'s a', 'highlight');
          addLine('        SEQUENCE. Swap two steps? Completely different', 'highlight');
          addLine('        result. Order matters. Always."', 'highlight');
          if (s.attempts > 1) {
            addLine('', '');
            addLine('NEXUS: "You crashed, found the broken step, and fixed', 'highlight');
            addLine('        it. That process has a name: DEBUGGING."', 'highlight');
            addLine('', '');
            addLine('Every programmer debugs constantly. Crashing is not failure \u2014', 'info');
            addLine('it\'s how programs tell you where the problem is.', 'info');
          }
        } else if (idx === 2) {
          addLine('', '');
          addLine('NEXUS: "You planned a path around obstacles. That\'s', 'highlight');
          addLine('        what programming really looks like \u2014 more', 'highlight');
          addLine('        thinking, less typing."', 'highlight');
          addLine('', '');
          addLine('Real programmers spend 80% of their time THINKING about', 'info');
          addLine('the problem and 20% typing. Planning isn\'t slow \u2014 it\'s smart.', 'info');
        } else if (idx === 3) {
          addLine('', '');
          if (steps.length <= level.par) {
            addLine('NEXUS: "Optimal path. Zero wasted steps. Efficient."', 'highlight');
          }
          if (s.attempts === 1) {
            addLine('NEXUS: "First try on a maze this size? You traced the', 'highlight');
            addLine('        whole path before typing. That\'s how real', 'highlight');
            addLine('        programmers work."', 'highlight');
          } else if (s.attempts <= 3) {
            addLine(`NEXUS: "${s.attempts} attempts. Each crash pointed you`, 'highlight');
            addLine('        straight to the bug. You fixed it and moved on.', 'highlight');
            addLine('        That\'s the debugging loop: write, test, fix."', 'highlight');
          } else {
            addLine(`NEXUS: "${s.attempts} attempts. That takes persistence.`, 'highlight');
            addLine('        But notice \u2014 each crash told you EXACTLY which', 'highlight');
            addLine('        step was wrong. Errors aren\'t the enemy.', 'highlight');
            addLine('        They\'re the feedback."', 'highlight');
          }
        }

        s.levelIdx = (s.levelIdx || 0) + 1;
        if (s.levelIdx < programLevels.length) {
          addLine('', '');
          setTimeout(() => loadProgramLevel(s.levelIdx), 1000);
        } else {
          addLine('', '');
          addLine('NEXUS: "You just did what every programmer does:', 'highlight');
          addLine('        wrote instructions, tested them, hit bugs,', 'highlight');
          addLine('        found the broken step, fixed it, tried again."', 'highlight');
          addLine('', '');
          addLine('You learned three concepts real programmers use every day:', 'info');
          addLine('  1. PROGRAMS = precise step-by-step instructions', 'info');
          addLine('  2. SEQUENCE = order matters, every step counts', 'info');
          addLine('  3. DEBUGGING = using errors to find and fix problems', 'info');
          addLine('', '');
          addLine('NEXUS: "While you were routing packets, I ran a deeper', 'highlight');
          addLine('        diagnostic on the network damage. Something', 'highlight');
          addLine('        doesn\'t add up..."', 'highlight');
          addLine('', '');
          addLine('NEXUS: "The AI didn\'t DESTROY the network. It was', 'highlight');
          addLine('        trying to ISOLATE something. Like it was', 'highlight');
          addLine('        building a quarantine zone. Why would a rogue', 'highlight');
          addLine('        AI protect us from something?"', 'highlight');
          addLine('', '');
          addLine('NEXUS: "I found data fragments it left behind. But', 'highlight');
          addLine('        they keep CHANGING. To read them, we\'ll need', 'highlight');
          addLine('        to understand how computers store and track', 'highlight');
          addLine('        data that changes over time..."', 'highlight');
          addLine('', '');
          addLine('[ Type NEXT to continue ]', 'warning');
          setCurrentInputHandler(() => {
            setCurrentInputHandler(null);
            completeMission(1);
          });
        }
      } else if (crashStep >= 0) {
        sound.denied();
        addLine(`[CRASH] Step ${crashStep + 1} of ${steps.length}: "${steps[crashStep]}" hit a wall!`, 'error');
        if (crashStep === 0) {
          addLine('Your very first step hit a wall! Look at @ on the maze \u2014', 'info');
          addLine('which directions have open space (dots) next to it?', 'info');
          addLine('Remember: # = wall (blocked!), . = open path (safe to move)', 'info');
        } else {
          addLine(`Steps 1\u2013${crashStep} worked fine. Step ${crashStep + 1} is the bug.`, 'info');
          addLine(`Fix: keep your first ${crashStep} step${crashStep > 1 ? 's' : ''}, change step ${crashStep + 1}, then add the rest.`, 'info');
        }
        // Progressive hints on repeated failures
        if (s.attempts === 3) {
          addLine('', '');
          addLine('NEXUS: "Tip: put your finger on @ and trace your steps', 'highlight');
          addLine('        one at a time. Where does your finger hit #?"', 'highlight');
        } else if (s.attempts === 5) {
          addLine('', '');
          addLine('NEXUS: "Still stuck? # is a wall, . is open path.', 'highlight');
          addLine('        You can only move through dots and X."', 'highlight');
        } else if (s.attempts >= 7) {
          addLine('', '');
          // Show which directions are valid from the position before crash
          const maze2 = level.grid.map(r => r.split(''));
          let cr = 0, cc = 0;
          for (let r = 0; r < maze2.length; r++)
            for (let c = 0; c < maze2[r].length; c++)
              if (maze2[r][c] === '@') { cr = r; cc = c; }
          // Walk to the crash point using dirMap from outer scope
          for (let i = 0; i < crashStep; i++) {
            const [dr,dc] = dirMap[steps[i]];
            cr += dr; cc += dc;
          }
          const validDirs = [];
          if (cr > 0 && maze2[cr-1][cc] !== '#') validDirs.push('U');
          if (cr < maze2.length-1 && maze2[cr+1][cc] !== '#') validDirs.push('D');
          if (cc > 0 && maze2[cr][cc-1] !== '#') validDirs.push('L');
          if (cc < maze2[cr].length-1 && maze2[cr][cc+1] !== '#') validDirs.push('R');
          addLine(`NEXUS: "At step ${crashStep + 1}, your valid options are: ${validDirs.join(', ')}"`, 'highlight');
        }
        // Re-render fresh maze so the kid sees the original layout
        addLine('', '');
        const freshMaze = level.grid.map(r => r.split(''));
        renderMaze(freshMaze);
        // Re-enable input after crash
        setCurrentInputHandler(inputHandler);
      } else {
        sound.denied();
        addLine(`[INCOMPLETE] Your program ran all ${steps.length} steps but @ didn't reach X.`, 'error');
        addLine('Your program needs more steps. @ stopped but X is still ahead!', 'info');
        if (s.attempts >= 2) {
          addLine('', '');
          addLine('NEXUS: "Look at the maze above \u2014 see where @ stopped?', 'highlight');
          addLine('        Now find X. Count the squares between them', 'highlight');
          addLine('        and add those directions to your program."', 'highlight');
        }
        // Show the maze with @ at its final position so the player can see where it stopped
        addLine('', '');
        updateMazeInPlace();
        // Re-render fresh maze below so they can plan the full route
        addLine('', '');
        addLine('Here is the original maze for planning:', 'info');
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
