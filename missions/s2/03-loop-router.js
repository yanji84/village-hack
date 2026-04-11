// missions/s2/03-loop-router.js
import {
  state, sound,
  addLine, typeLines,
  setCurrentInputHandler,
  completeMission, renderMaze,
} from '../../engine.js';

const loopMazes = [
  {
    name: 'Training Grounds',
    grid: [
      '##########',
      '#@.......#',
      '#........#',
      '#........#',
      '#.......X#',
      '##########',
    ],
    budget: 4, // commands, not moves
    hint: 'Only 4 commands needed! Think about REPEAT.',
  },
  {
    name: 'Zigzag Vault',
    grid: [
      '##########',
      '#@.......#',
      '##.#######',
      '#........#',
      '########.#',
      '#........#',
      '#X########',
      '##########',
    ],
    budget: 10,
    hint: 'Six turns. Each run of straight movement is one REPEAT command.',
  },
];

export const mission = {
  id: 10,
  num: 'S2-03',
  title: 'LOOP ROUTER',
  name: 'Loop Router',
  desc: 'Stop typing one move at a time! Learn REPEAT loops to solve mazes efficiently.',
  skill: 'SKILL: Loops + Optimization',
  hints: [
    "Before you type ANYTHING, count the straight runs in the maze. That's how many commands you'll need.",
    'Each straight line of movement is ONE command. Turns are what separate commands.',
    'If you\'re over budget, you\'re typing move-by-move. Look for runs of 3+ and compress them into REPEAT.',
  ],
  run: async function() {
    state.missionState = { mazeIdx: 0, hintIdx: 0 };

    await typeLines([
      { text: '[DEEP NETWORK] Backdoor buried in the routing layer.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Season 1, you walked mazes step by step. UP, UP,', cls: 'purple' },
      { text: '          UP, RIGHT, RIGHT. It worked \u2014 but it was tedious."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Professional programmers hate tedium. So they', cls: 'purple' },
      { text: '          invented something called a LOOP. A loop is a', cls: 'purple' },
      { text: '          promise to the computer: \'Do this, this many times.\'', cls: 'purple' },
      { text: '          One command replaces ten."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "This is possibly the single most important idea in', cls: 'purple' },
      { text: '          all of programming. Every app you\'ve ever used is', cls: 'purple' },
      { text: '          built out of loops running billions of times per', cls: 'purple' },
      { text: '          second."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "I\'ve upgraded your router. Instead of typing UP UP', cls: 'purple' },
      { text: '          UP, you can type:"', cls: 'purple' },
      { text: '', cls: '' },
      { text: '            REPEAT 3 UP', cls: 'info' },
      { text: '', cls: '' },
      { text: 'AI CORE: "And if you want to chain several commands, separate', cls: 'purple' },
      { text: '          them with commas:"', cls: 'purple' },
      { text: '', cls: '' },
      { text: '            REPEAT 3 UP, REPEAT 2 RIGHT, REPEAT 4 DOWN', cls: 'info' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Your new goal is different: solve each maze in the', cls: 'purple' },
      { text: '          FEWEST COMMANDS. Not fewest moves \u2014 fewest COMMANDS.', cls: 'purple' },
      { text: '          A maze with three turns should take about three', cls: 'purple' },
      { text: '          commands. Think before you type."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "This is your first time thinking like a programmer."', cls: 'purple' },
      { text: '', cls: '' },
    ]);

    loadLoopMaze(0);
  },
};

function loadLoopMaze(idx) {
  const m = loopMazes[idx];
  const s = state.missionState;
  s.maze = m.grid.map(r => r.split(''));
  s.budget = m.budget;
  s.commandsUsed = 0;

  // Find player
  for (let r = 0; r < s.maze.length; r++) {
    for (let c = 0; c < s.maze[r].length; c++) {
      if (s.maze[r][c] === '@') { s.pr = r; s.pc = c; }
    }
  }

  addLine(`\u2501\u2501\u2501 ${m.name} \u2501\u2501\u2501`, 'highlight');
  addLine(`Command budget: ${m.budget} commands max`, 'warning');
  addLine(m.hint, 'info');
  renderMaze();
  addLine('Type your program:', 'warning');
  addLine('(Example: REPEAT 3 RIGHT, REPEAT 2 UP)', 'info');

  setCurrentInputHandler((input) => {
    const program = input.toUpperCase().trim();
    const commands = program.split(',').map(c => c.trim()).filter(c => c);

    if (commands.length === 0) {
      addLine('Empty program!', 'error');
      return;
    }

    if (commands.length > s.budget) {
      sound.denied();
      addLine(`[OVER BUDGET] Used ${commands.length} commands, limit is ${s.budget}.`, 'error');
      return;
    }

    // Parse and execute
    const dirMap = { UP: [-1,0], DOWN: [1,0], LEFT: [0,-1], RIGHT: [0,1] };
    // Reset maze
    s.maze = m.grid.map(r => r.split(''));
    for (let r = 0; r < s.maze.length; r++) {
      for (let c = 0; c < s.maze[r].length; c++) {
        if (s.maze[r][c] === '@') { s.pr = r; s.pc = c; }
      }
    }

    for (const cmd of commands) {
      let match = cmd.match(/^REPEAT\s+(\d+)\s+(UP|DOWN|LEFT|RIGHT)$/);
      let count = 1, dir;
      if (match) { count = parseInt(match[1]); dir = match[2]; }
      else if (['UP','DOWN','LEFT','RIGHT'].includes(cmd)) dir = cmd;
      else {
        sound.denied();
        addLine(`[SYNTAX ERROR] Bad command: "${cmd}"`, 'error');
        addLine('Use: REPEAT N DIR  (example: REPEAT 3 UP)', 'info');
        return;
      }

      const [dr, dc] = dirMap[dir];
      for (let i = 0; i < count; i++) {
        const nr = s.pr + dr;
        const nc = s.pc + dc;
        if (nr < 0 || nr >= s.maze.length || nc < 0 || nc >= s.maze[0].length || s.maze[nr][nc] === '#') {
          sound.denied();
          addLine(`[CRASH] "${cmd}" hit a wall on step ${i+1}!`, 'error');
          renderMaze();
          return;
        }
        if (s.maze[nr][nc] === 'X') {
          s.maze[s.pr][s.pc] = ',';
          s.maze[nr][nc] = '@';
          s.pr = nr; s.pc = nc;
          sound.success();
          addLine(`[SUCCESS] Reached goal in ${commands.length} commands!`, 'success');
          renderMaze();

          s.mazeIdx = (s.mazeIdx || 0) + 1;
          if (s.mazeIdx < loopMazes.length) {
            addLine('\nExcellent! One more maze...', 'info');
            setTimeout(() => loadLoopMaze(s.mazeIdx), 900);
          } else {
            addLine('All mazes solved with loops!', 'success big');
            setCurrentInputHandler(null);
            setTimeout(() => completeMission(10), 1000);
          }
          return;
        }
        s.maze[s.pr][s.pc] = ',';
        s.maze[nr][nc] = '@';
        s.pr = nr; s.pc = nc;
      }
    }

    renderMaze();
    addLine('[PROGRAM ENDED] Didn\'t reach goal. Try again!', 'warning');
  });
}
