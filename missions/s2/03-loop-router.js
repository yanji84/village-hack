// missions/s2/03-loop-router.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission, renderMaze,
} from '../../engine.js';

const loopMazes = [
  {
    name: 'Straight Shot',
    grid: [
      '###########',
      '#@.......X#',
      '###########',
    ],
    budget: 1,
    intro: 'One hallway. No turns. But look at the old way: RIGHT, RIGHT, RIGHT, RIGHT, RIGHT, RIGHT, RIGHT, RIGHT. Eight commands. Your new router can do better.',
    hint: 'One straight run = ONE command. How far is the goal?',
    lesson: 'One command replaced eight. That is the whole point of a loop.',
  },
  {
    name: 'The Corner',
    grid: [
      '##########',
      '#@.......#',
      '########.#',
      '########X#',
      '##########',
    ],
    budget: 2,
    intro: 'One turn. Count the STRAIGHT RUNS \u2014 the corner is what separates commands.',
    hint: 'A run right, then a run down. Two runs = two commands.',
    lesson: 'Every turn in a maze is a new command. No turns = one command. One turn = two.',
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
    budget: 6,
    intro: 'Five turns now. Trace the path with your finger FIRST, counting each straight run. Then type.',
    hint: 'Six runs total. If you planned it step-by-step, you will blow the budget.',
    lesson: 'Loops turn tedious work into thinking work. You traded typing for planning.',
  },
  {
    name: 'The Gauntlet',
    grid: [
      '############',
      '#@.........#',
      '##########.#',
      '#..........#',
      '#.##########',
      '#.........X#',
      '############',
    ],
    budget: 5,
    intro: 'Big maze. But structure is what matters, not size. Look for the runs \u2014 they are LONG here.',
    hint: 'Four turns. Five runs. The runs are 9-2-9-2-9. See the pattern?',
    lesson: 'Doubling the maze size barely changed the command count. Loops make size cheap.',
  },
];

export const mission = {
  id: 10,
  num: 'S2-03',
  title: 'LOOP ROUTER',
  name: 'Loop Router',
  desc: 'Upgrade from one-move-at-a-time to REPEAT loops. Learn the single most important idea in programming.',
  skill: 'SKILL: Loops + Abstraction',
  hints: [
    'Before typing ANYTHING, trace the path with your finger and count the straight runs. Each run = one command.',
    'Turns separate commands. A straight hallway with no turns is always ONE command, no matter how long.',
    'Over budget? You are typing move-by-move. Look for runs of 3+ steps and compress them with REPEAT.',
  ],
  run: async function() {
    state.missionState = { mazeIdx: 0, hintIdx: 0 };

    await typeLines([
      { text: '[DEEP NETWORK] Backdoor buried in the routing layer.', cls: 'system' },
      { text: '[scanning] ████████████████████  100%', cls: 'system' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Back in Season 1, you walked mazes step by step.', cls: 'purple' },
      { text: '          UP, UP, UP, RIGHT, RIGHT, RIGHT. It worked \u2014', cls: 'purple' },
      { text: '          but it was slow, and your fingers got tired."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Professional programmers hate tedium. They', cls: 'purple' },
      { text: '          invented something called a LOOP. A loop is a', cls: 'purple' },
      { text: '          promise to the computer:"', cls: 'purple' },
      { text: '', cls: '' },
      { text: '            \u201cDo this thing. This many times.\u201d', cls: 'info' },
      { text: '', cls: '' },
      { text: 'AI CORE: "One instruction replaces a hundred. This might be', cls: 'purple' },
      { text: '          the most important idea in all of programming.', cls: 'purple' },
      { text: '          Every app on your phone runs loops billions of', cls: 'purple' },
      { text: '          times a second. Without loops, software would not', cls: 'purple' },
      { text: '          exist."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "I\u2019ve upgraded your router. You used to write one', cls: 'purple' },
      { text: '          instruction per step. Now you can write one', cls: 'purple' },
      { text: '          instruction for a hundred steps:"', cls: 'purple' },
      { text: '', cls: '' },
      { text: '            REPEAT 3 UP', cls: 'info' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Chain several with commas:"', cls: 'purple' },
      { text: '', cls: '' },
      { text: '            REPEAT 3 UP, REPEAT 2 RIGHT, REPEAT 4 DOWN', cls: 'info' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Your goal is different from Season 1. Before, you', cls: 'purple' },
      { text: '          counted MOVES. Now you count COMMANDS. Solve each', cls: 'purple' },
      { text: '          maze in the fewest commands. Think first, type', cls: 'purple' },
      { text: '          second \u2014 that is what programming really is."', cls: 'purple' },
      { text: '', cls: '' },
    ]);

    loadLoopMaze(0);
  },
};

const TOTAL_PHASES = loopMazes.length + 1; // mazes + final insight

function loadLoopMaze(idx) {
  const m = loopMazes[idx];
  const s = state.missionState;
  setPhaseProgress(idx + 1, TOTAL_PHASES);
  s.maze = m.grid.map(r => r.split(''));
  s.budget = m.budget;

  for (let r = 0; r < s.maze.length; r++) {
    for (let c = 0; c < s.maze[r].length; c++) {
      if (s.maze[r][c] === '@') { s.pr = r; s.pc = c; }
    }
  }

  addLine('', '');
  addLine('\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501', 'highlight');
  addLine(`\u25b6 MAZE ${idx + 1} of ${loopMazes.length} \u2014 ${m.name}`, 'highlight');
  addLine('\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501', 'highlight');
  addLine('', '');
  addLine(`AI CORE: "${m.intro}"`, 'purple');
  addLine('', '');
  renderMaze();
  addLine('', '');
  addLine(`[BUDGET] ${m.budget} command${m.budget === 1 ? '' : 's'} max   \u2022   @ = you   \u2022   X = goal   \u2022   . = breadcrumb trail`, 'info');
  addLine(`HINT: ${m.hint}`, 'warning');
  addLine('', '');
  addLine('Type your program (example: REPEAT 3 RIGHT, REPEAT 2 UP):', 'warning');

  setCurrentInputHandler((input) => {
    const program = input.toUpperCase().trim();
    const commands = program.split(',').map(c => c.trim()).filter(c => c);

    if (commands.length === 0) {
      addLine('[EMPTY] Type at least one command. Example: REPEAT 5 RIGHT', 'error');
      return;
    }

    // Detect uncompressed move-by-move typing first for a friendlier message.
    const singleMoves = commands.filter(c => ['UP','DOWN','LEFT','RIGHT'].includes(c)).length;

    if (commands.length > s.budget) {
      sound.denied();
      addLine(`[OVER BUDGET] You used ${commands.length} commands. The limit is ${s.budget}.`, 'error');
      if (singleMoves >= 3) {
        addLine(`AI CORE: "You typed ${singleMoves} single moves. Look for runs of 3 or more in the same direction and wrap them in REPEAT."`, 'purple');
      } else {
        addLine('AI CORE: "Count the straight runs in the maze. That is your command count. If it is more than the budget, there is a shorter path."', 'purple');
      }
      return;
    }

    // Reset maze to fresh state for execution
    s.maze = m.grid.map(r => r.split(''));
    for (let r = 0; r < s.maze.length; r++) {
      for (let c = 0; c < s.maze[r].length; c++) {
        if (s.maze[r][c] === '@') { s.pr = r; s.pc = c; }
      }
    }

    const dirMap = { UP: [-1,0], DOWN: [1,0], LEFT: [0,-1], RIGHT: [0,1] };

    for (const cmd of commands) {
      let match = cmd.match(/^REPEAT\s+(\d+)\s+(UP|DOWN|LEFT|RIGHT)$/);
      let count = 1, dir;
      if (match) { count = parseInt(match[1]); dir = match[2]; }
      else if (['UP','DOWN','LEFT','RIGHT'].includes(cmd)) dir = cmd;
      else {
        sound.denied();
        addLine(`[SYNTAX ERROR] "${cmd}" isn\u2019t a command I know.`, 'error');
        addLine('Use: REPEAT <number> <UP|DOWN|LEFT|RIGHT>. Example: REPEAT 3 UP', 'info');
        return;
      }

      const [dr, dc] = dirMap[dir];
      for (let i = 0; i < count; i++) {
        const nr = s.pr + dr;
        const nc = s.pc + dc;
        if (nr < 0 || nr >= s.maze.length || nc < 0 || nc >= s.maze[0].length || s.maze[nr][nc] === '#') {
          sound.denied();
          addLine(`[CRASH] "${cmd}" hit a wall on step ${i+1}.`, 'error');
          renderMaze();
          addLine('AI CORE: "No worries \u2014 every programmer debugs. Check where the walls force a turn, then try again."', 'purple');
          return;
        }
        if (s.maze[nr][nc] === 'X') {
          s.maze[s.pr][s.pc] = ',';
          s.maze[nr][nc] = '@';
          s.pr = nr; s.pc = nc;
          sound.success();
          addLine('', '');
          addLine(`[GOAL] Solved in ${commands.length} command${commands.length === 1 ? '' : 's'} (budget was ${s.budget}).`, 'success');
          renderMaze();
          addLine('', '');
          addLine(`AI CORE: "${m.lesson}"`, 'purple');

          s.mazeIdx = idx + 1;
          if (s.mazeIdx < loopMazes.length) {
            addLine('', '');
            setTimeout(() => loadLoopMaze(s.mazeIdx), 1400);
          } else {
            setTimeout(runFinalInsight, 1600);
          }
          return;
        }
        s.maze[s.pr][s.pc] = ',';
        s.maze[nr][nc] = '@';
        s.pr = nr; s.pc = nc;
      }
    }

    renderMaze();
    addLine('[PROGRAM ENDED] Your program ran out before reaching the goal. Trace where you stopped and try again.', 'warning');
  });
}

function runFinalInsight() {
  const s = state.missionState;
  setPhaseProgress(TOTAL_PHASES, TOTAL_PHASES);
  setCurrentInputHandler(null);

  addLine('', '');
  addLine('\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501', 'highlight');
  addLine('\u25b6 FINAL INSIGHT \u2014 WHY THIS MATTERS', 'highlight');
  addLine('\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501', 'highlight');
  addLine('', '');
  addLine('AI CORE: "One more question. No maze this time \u2014 just think."', 'purple');
  addLine('', '');
  addLine('AI CORE: "Imagine a maze that is one GIANT straight hallway,', 'purple');
  addLine('          100 squares long. No turns. Just a long, boring', 'purple');
  addLine('          corridor from @ to X."', 'purple');
  addLine('', '');
  addPre('  #####################...###########\n  #@..................................X#\n  #####################...###########\n                 (100 squares long)');
  addLine('', '');
  addLine('AI CORE: "WITHOUT loops, how many commands?', 'purple');
  addLine('          WITH one REPEAT, how many commands?"', 'purple');
  addLine('', '');
  addLine('Type your answer as TWO numbers separated by a space (without with):', 'warning');
  addLine('(Example: if you think 50 without and 2 with, type: 50 2)', 'info');

  s.insightStep = 0;

  setCurrentInputHandler((input) => {
    const parts = input.trim().split(/\s+/).map(n => parseInt(n));
    if (parts.length !== 2 || parts.some(isNaN)) {
      addLine('[FORMAT] Type two numbers with a space. Example: 100 1', 'error');
      return;
    }
    const [without, withLoop] = parts;

    if (without === 100 && withLoop === 1) {
      sound.success();
      addLine('', '');
      addLine('>>> 100 vs 1 <<<', 'success big');
      addLine('', '');
      addLine('AI CORE: "One command. One. That is the whole magic.', 'purple');
      addLine('          A hundred moves, packed into a single line of', 'purple');
      addLine('          instruction. And it works the exact same way', 'purple');
      addLine('          for a MILLION moves, or a BILLION."', 'purple');
      addLine('', '');
      addLine('AI CORE: "This is called ABSTRACTION \u2014 describing WHAT', 'purple');
      addLine('          you want instead of every tiny step. When you', 'purple');
      addLine('          watch a video, thousands of loops are running.', 'purple');
      addLine('          When a game renders a screen, loops. When your', 'purple');
      addLine('          phone scrolls a list, loops."', 'purple');
      addLine('', '');
      addLine('AI CORE: "You didn\u2019t just solve mazes today. You learned', 'purple');
      addLine('          to think like a programmer: find the pattern,', 'purple');
      addLine('          then compress it."', 'purple');
      addLine('', '');
      addLine('╔══════════════════════════════════════╗', 'system');
      addLine('║      [ROUTING LAYER CLEARED]         ║', 'system');
      addLine('║       LOOP ABSTRACTION LOCKED        ║', 'system');
      addLine('╚══════════════════════════════════════╝', 'system');
      setCurrentInputHandler(null);
      setTimeout(() => completeMission(10), 1800);
    } else if (without === 100 && withLoop !== 1) {
      sound.denied();
      addLine('[HALF RIGHT] Yes \u2014 100 commands without loops, one per step. But WITH loops, how few commands could cover all 100 squares in one straight direction?', 'error');
    } else if (withLoop === 1 && without !== 100) {
      sound.denied();
      addLine('[HALF RIGHT] Yes \u2014 one REPEAT command covers the whole hallway. But WITHOUT loops, you\u2019d need one command per square. How many squares?', 'error');
    } else {
      sound.denied();
      addLine('[THINK AGAIN] Without loops: one command = one move. 100 squares = ? commands. With a loop: REPEAT 100 RIGHT is one single command.', 'error');
    }
  });
}
