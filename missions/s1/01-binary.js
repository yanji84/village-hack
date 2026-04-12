// missions/s1/01-binary.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setCurrentInputHandler,
  completeMission,
  sleep,
} from '../../engine.js';

import { renderPixelGrid } from '../helpers.js';

function addReplayButton(container, animationFn) {
  const btn = document.createElement('span');
  btn.textContent = '[ replay ]';
  btn.style.cssText = 'color: var(--cyan, #00ffff); cursor: pointer; font-size: 11px; opacity: 0.6; transition: opacity 0.2s; margin-top: 4px; display: inline-block;';
  btn.onmouseenter = () => btn.style.opacity = '1';
  btn.onmouseleave = () => btn.style.opacity = '0.6';
  btn.onclick = () => animationFn();
  container.appendChild(btn);
  const terminal = document.getElementById('terminal');
  if (terminal) terminal.scrollTop = terminal.scrollHeight;
}

export const mission = {
  id: 0,
  num: '01',
  title: 'BINARY',
  name: 'Binary \u2014 The Language of Computers',
  desc: 'Learn the ONLY language computers understand \u2014 ones and zeros. Decode numbers, letters, and even pictures.',
  skill: 'SKILL: Binary + Data Representation',
  color: 'green',
  hints: [
    'It works just like regular numbers. The places are: ones, twos, fours, eights. Which places have a 1?',
    'Multiply each digit by its place value, then add them all up. Zeros contribute nothing.',
    'For the pixel grid: step back and look at which squares are green. What letter do they form?',
  ],
  run: async function() {
    state.missionState = { phase: 0, hintIdx: 0 };

    await typeLines([
      { text: '[INCOMING COMMS]', cls: 'system' },
      { text: '', cls: '' },
      { text: `NEXUS: "${state.hackerName || 'Kid'}. I\'m NEXUS \u2014 senior analyst,`, cls: 'highlight' },
      { text: '        thirty years in the field. I\'ll be on comms for', cls: 'highlight' },
      { text: '        every mission. You hear my voice, you listen."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: '[INTERCEPT] Encrypted signal detected from the rogue AI.', cls: 'system' },
      { text: '            Contents: 01000 00101 01100 10000', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "See those 1s and 0s? That\'s BINARY \u2014 the only', cls: 'highlight' },
      { text: '        language computers actually speak. Your phone,', cls: 'highlight' },
      { text: '        your games, every photo you\'ve ever taken \u2014', cls: 'highlight' },
      { text: '        underneath, it\'s ALL ones and zeros."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "We need to decode this signal to know what the', cls: 'highlight' },
      { text: '        AI is planning. But first, you need to learn', cls: 'highlight' },
      { text: '        to think in binary. Don\'t worry \u2014 it works', cls: 'highlight' },
      { text: '        just like the numbers you already know."', cls: 'highlight' },
      { text: '', cls: '' },
    ]);

    runBinaryPhase();
  },
};

async function animateBinaryBreakdown() {
  const termEl = document.getElementById('terminal');

  const columns = [
    { label: 'eights', multiplier: '\u00d78', digit: 1, value: 8 },
    { label: 'fours',  multiplier: '\u00d74', digit: 0, value: 4 },
    { label: 'twos',   multiplier: '\u00d72', digit: 1, value: 2 },
    { label: 'ones',   multiplier: '\u00d71', digit: 0, value: 1 },
  ];

  // Build the grid container
  const wrapper = document.createElement('div');
  wrapper.className = 'binary-breakdown-wrapper';

  const grid = document.createElement('div');
  grid.className = 'binary-breakdown';
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,70px);gap:4px;padding:14px;margin:12px 0;background:#0d1117;border:1px solid #005a15;border-radius:4px;font-family:monospace;text-align:center;';

  // Header row
  const headerCells = columns.map(c => {
    const el = document.createElement('div');
    el.className = 'col';
    el.textContent = c.label;
    el.style.cssText = 'padding:6px 2px;color:#00ff41;font-size:11px;border:1px solid #005a15;border-radius:3px;transition:border-color 0.3s;';
    grid.appendChild(el);
    return el;
  });

  // Digit row
  const digitCells = columns.map(c => {
    const el = document.createElement('div');
    el.className = 'col digit';
    el.textContent = String(c.digit);
    el.style.cssText = `padding:8px 2px;font-size:20px;font-weight:bold;color:${c.digit ? '#00ff41' : '#333'};border:1px solid #005a15;border-radius:3px;transition:all 0.3s;`;
    grid.appendChild(el);
    return el;
  });

  // Result row (initially empty dashes)
  const resultCells = columns.map(() => {
    const el = document.createElement('div');
    el.className = 'col result';
    el.textContent = '-';
    el.style.cssText = 'padding:8px 2px;font-size:16px;font-weight:bold;color:#333;border:1px solid #005a15;border-radius:3px;transition:all 0.3s;';
    grid.appendChild(el);
    return el;
  });

  // Total row
  const totalEl = document.createElement('div');
  totalEl.className = 'total';
  totalEl.style.cssText = 'grid-column:1/-1;padding:10px;font-size:18px;color:#555;border:1px solid #005a15;border-radius:3px;transition:all 0.4s;';
  totalEl.textContent = 'Total: ...';
  grid.appendChild(totalEl);

  wrapper.appendChild(grid);
  termEl.appendChild(wrapper);
  termEl.scrollTop = termEl.scrollHeight;

  // The replay-able animation logic
  async function runAnimation() {
    // Reset all cells to initial state
    columns.forEach((c, i) => {
      headerCells[i].style.borderColor = '#005a15';
      digitCells[i].textContent = String(c.digit);
      digitCells[i].style.color = c.digit ? '#00ff41' : '#333';
      digitCells[i].style.borderColor = '#005a15';
      resultCells[i].textContent = '-';
      resultCells[i].style.color = '#333';
      resultCells[i].style.textShadow = 'none';
      resultCells[i].style.fontSize = '16px';
      resultCells[i].style.borderColor = '#005a15';
    });
    totalEl.textContent = 'Total: ...';
    totalEl.style.color = '#555';
    totalEl.style.fontSize = '18px';
    totalEl.style.fontWeight = 'normal';
    totalEl.style.textShadow = 'none';
    totalEl.style.borderColor = '#005a15';

    // Animate column by column
    let runningTotal = 0;
    await sleep(300);

    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];

      // Highlight the column
      headerCells[i].style.borderColor = '#00ff41';
      digitCells[i].style.borderColor = '#00ff41';
      resultCells[i].style.borderColor = '#00ff41';

      await sleep(200);

      if (col.digit === 1) {
        // Show the multiplication step briefly
        digitCells[i].textContent = `1${col.multiplier}`;
        digitCells[i].style.fontSize = '14px';
        await sleep(400);

        // Then show the value, update total
        runningTotal += col.value;
        digitCells[i].textContent = String(col.digit);
        digitCells[i].style.fontSize = '20px';
        resultCells[i].textContent = String(col.value);
        resultCells[i].style.color = '#00ff41';
        resultCells[i].style.textShadow = '0 0 6px #00ff41';
        totalEl.textContent = 'Total: ' + runningTotal;
        totalEl.style.color = '#00ff41';
      } else {
        // Zero column — show it's skipped
        digitCells[i].textContent = 'OFF';
        digitCells[i].style.fontSize = '11px';
        await sleep(300);
        digitCells[i].textContent = '0';
        digitCells[i].style.fontSize = '20px';
        resultCells[i].textContent = '-';
        resultCells[i].style.color = '#333';
        digitCells[i].style.color = '#333';
      }

      termEl.scrollTop = termEl.scrollHeight;
      await sleep(600);

      // Dim the column after processing (except result stays)
      headerCells[i].style.borderColor = '#005a15';
      digitCells[i].style.borderColor = '#005a15';
      resultCells[i].style.borderColor = '#005a15';
    }

    // Final total pulse
    totalEl.textContent = 'Total: ' + runningTotal;
    totalEl.style.color = '#00ff41';
    totalEl.style.fontSize = '20px';
    totalEl.style.fontWeight = 'bold';
    totalEl.style.textShadow = '0 0 8px #00ff41, 0 0 16px #00aa2a';
    totalEl.style.borderColor = '#00ff41';
    termEl.scrollTop = termEl.scrollHeight;
    await sleep(600);
  }

  // Run the animation the first time
  await runAnimation();

  // Add replay button inside the wrapper
  addReplayButton(wrapper, runAnimation);
}

async function runBinaryPhase() {
  const s = state.missionState;

  if (s.phase === 0) {
    // Phase 1: Learn binary — one worked example, one practice, then decode
    addLine('NEXUS: "You already know how numbers work. Take 352:"', 'highlight');
    addLine('', '');
    addPre('         hundreds   tens   ones\n            3        5      2\n          3\u00d7100  +  5\u00d710  +  2\u00d71  =  352');
    addLine('', '');
    addLine('NEXUS: "Each place is 10\u00d7 bigger than the one before it.', 'highlight');
    addLine('        That\'s why we call it BASE 10."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "Binary is BASE 2 \u2014 same idea, but each place is', 'highlight');
    addLine('        2\u00d7 bigger instead of 10\u00d7. And you only get two', 'highlight');
    addLine('        digits: 0 and 1. Think of each place like a', 'highlight');
    addLine('        light switch \u2014 either ON (1) or OFF (0)."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "Let me walk you through one. Watch carefully."', 'highlight');
    addLine('', '');

    await animateBinaryBreakdown();

    addLine('', '');
    addLine('NEXUS: "Simple rule: wherever the switch is ON (1), grab', 'highlight');
    addLine('        that place value. Wherever it\'s OFF (0), skip it.', 'highlight');
    addLine('        Add up the ON values. That\'s your number."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "Your turn. What number is 0110?"', 'highlight');
    addLine('', '');
    addPre('          eights  fours  twos  ones\n            \u00d78     \u00d74    \u00d72    \u00d71\n\n     OFF    0      1      1     0    OFF\n                   ON     ON');
    addLine('', '');

    setCurrentInputHandler((input) => {
      if (input.trim() === '6') {
        sound.success();
        addLine('[DECODED] 0110 = fours(ON) + twos(ON) = 4 + 2 = 6', 'success');
        addLine('', '');
        addLine('NEXUS: "Nice. You just read binary like a machine does.', 'highlight');
        addLine('        Now let\'s use this to crack that signal."', 'highlight');
        s.phase = 1;
        addLine('');
        setTimeout(runBinaryPhase, 800);
      } else {
        s.wrongCount = (s.wrongCount || 0) + 1;
        sound.denied();
        if (s.wrongCount === 1) {
          addLine('NEXUS: "Look at which switches are ON. The fours and', 'error');
          addLine('        the twos both have a 1. Add those values."', 'error');
        } else if (s.wrongCount === 2) {
          addLine('NEXUS: "Fours switch is ON = 4. Twos switch is ON = 2.', 'error');
          addLine('        What\'s 4 + 2?"', 'error');
        } else {
          addLine('[HINT] 4 + 2. Type just the number.', 'error');
        }
      }
    });

  } else if (s.phase === 1) {
    // Phase 2: Decode the intercepted signal (binary → letters)
    s.wrongCount = 0; // reset for this phase
    addLine('\u2501\u2501\u2501 Decoding the AI\'s Signal \u2501\u2501\u2501', 'highlight');
    addLine('', '');
    addLine('NEXUS: "Good. Now here\'s why binary matters right now.', 'highlight');
    addLine('        Computers store LETTERS as numbers. Every letter', 'highlight');
    addLine('        gets a number: A=1, B=2, C=3... Z=26."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "To send a letter, a computer converts it to its', 'highlight');
    addLine('        number, then writes THAT number in binary.', 'highlight');
    addLine('        So the letter C becomes 3, which becomes 00011."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "That signal we intercepted has 4 binary groups \u2014', 'highlight');
    addLine('        4 letters. Each group uses 5 digits, which adds', 'highlight');
    addLine('        one more place to what you already know:', 'highlight');
    addLine('        sixteens, eights, fours, twos, ones."', 'highlight');
    addLine('', '');

    // H=8, E=5, L=12, P=16 → HELP
    const secretWord = 'HELP';
    const binaryCodes = secretWord.split('').map(l => {
      const num = l.charCodeAt(0) - 64;
      return num.toString(2).padStart(5, '0');
    });

    // Build the reference table as a readable block
    const header = '  sixteens  eights  fours  twos  ones\n     \u00d716      \u00d78     \u00d74    \u00d72    \u00d71\n';
    const letterRows = binaryCodes.map((b, i) =>
      `  Letter ${i+1}:  ${b.split('').join('       ')}`
    ).join('\n');
    const alphabet = '\n\n  A=1  B=2  C=3  D=4  E=5  F=6  G=7  H=8\n  I=9  J=10 K=11 L=12 M=13 N=14 O=15 P=16';
    addPre(header + '\n' + letterRows + alphabet);
    addLine('', '');
    addLine('NEXUS: "Decode each group to a number, look up the letter,', 'highlight');
    addLine('        then type all 4 letters as one word."', 'highlight');

    setCurrentInputHandler((input) => {
      if (input.toUpperCase().trim() === secretWord) {
        sound.success();
        addLine(`[SIGNAL DECODED] >>> ${secretWord} <<<`, 'success');
        addLine('', '');
        addLine('NEXUS: "Wait... HELP?"', 'highlight');
        addLine('', '');
        addLine('NEXUS: "...That\'s the message? The rogue AI \u2014 the one', 'highlight');
        addLine('        they told us is dangerous \u2014 is sending a', 'highlight');
        addLine('        DISTRESS signal? Something doesn\'t add up.', 'highlight');
        addLine('        I\'ll dig into this. For now, one more lesson."', 'highlight');
        s.phase = 2;
        addLine('');
        setTimeout(runBinaryPhase, 1000);
      } else {
        s.wrongCount = (s.wrongCount || 0) + 1;
        sound.denied();
        let correct = 0;
        const inp = input.toUpperCase().trim();
        for (let i = 0; i < Math.min(inp.length, secretWord.length); i++) {
          if (inp[i] === secretWord[i]) correct++;
        }
        if (correct > 0 && inp.length === secretWord.length) {
          addLine(`[PARTIAL] ${correct} of ${secretWord.length} letters correct. Re-check the others.`, 'warning');
        } else if (s.wrongCount === 1) {
          addLine('NEXUS: "Same method. For each group: find the 1s, add', 'error');
          addLine('        their place values, then look up the letter."', 'error');
        } else if (s.wrongCount === 2) {
          addLine('NEXUS: "I\'ll walk you through Letter 1: 01000.', 'error');
          addLine('        Only the eights switch is ON. 8 = H.', 'error');
          addLine('        Now do the same for the other three."', 'error');
        } else {
          addLine('[HINT] Letter 1: 01000 = 8 = H. Do the same for each group, then type all 4 letters as one word.', 'error');
        }
      }
    });

  } else if (s.phase === 2) {
    // Phase 3: Render binary as pixels — row by row
    const hGrid = [
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,1,1,1,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
    ];

    addLine('\u2501\u2501\u2501 Binary as Pictures \u2501\u2501\u2501', 'highlight');
    addLine('', '');
    addLine('NEXUS: "Numbers, letters... but binary goes further.', 'highlight');
    addLine('        It stores PICTURES too."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "Your screen is a grid of tiny squares called', 'highlight');
    addLine('        PIXELS. Each pixel is a switch \u2014 1 means the', 'highlight');
    addLine('        pixel lights up. 0 means it stays dark."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "I\'m sending you 5 rows of binary data. Click the', 'highlight');
    addLine('        grid squares that should be ON (the 1s) to build', 'highlight');
    addLine('        the image, row by row. You\'re doing exactly what', 'highlight');
    addLine('        a screen does millions of times per second."', 'highlight');
    addLine('', '');

    // Create the 5x5 interactive grid (all dark initially)
    const termEl = document.getElementById('terminal');
    const ROWS = 5, COLS = 5;
    const gridState = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    s.currentRow = 0;
    s.hGrid = hGrid;

    const gridDiv = document.createElement('div');
    gridDiv.style.cssText = 'display:inline-grid;gap:3px;margin:12px 0;padding:14px;border:1px solid #005a15;background:#050505;border-radius:4px;cursor:pointer;';
    gridDiv.style.gridTemplateColumns = `repeat(${COLS}, 36px)`;
    s.gridCells = [];

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('div');
        const isActiveRow = r === 0;
        cell.style.cssText = `width:36px;height:36px;border-radius:3px;border:1px solid ${isActiveRow ? '#333' : '#1a2a1a'};background:#111;transition:all 0.15s;`;
        cell.dataset.r = r;
        cell.dataset.c = c;
        cell.onclick = () => {
          const row = parseInt(cell.dataset.r);
          const col = parseInt(cell.dataset.c);
          if (row !== s.currentRow) return; // only current row is clickable
          gridState[row][col] = gridState[row][col] ? 0 : 1;
          if (gridState[row][col]) {
            cell.style.background = '#00ff41';
            cell.style.border = '1px solid #00aa2a';
            cell.style.boxShadow = '0 0 6px #00ff41';
          } else {
            cell.style.background = '#111';
            cell.style.border = '1px solid #333';
            cell.style.boxShadow = 'none';
          }
          sound.keyClick();
          // Auto-check: if this row now matches the target, advance
          checkPixelRow(s, gridState, hGrid, COLS);
        };
        s.gridCells.push(cell);
        gridDiv.appendChild(cell);
      }
    }
    termEl.appendChild(gridDiv);
    termEl.scrollTop = termEl.scrollHeight;

    addLine('', '');
    showPixelRow();
  }
}

function checkPixelRow(s, gridState, hGrid, COLS) {
  const row = s.currentRow;
  if (row >= hGrid.length) return;
  const rowBinary = hGrid[row];

  // Check if current row matches
  const matches = rowBinary.every((v, i) => gridState[row][i] === v);
  if (!matches) return; // not done yet, wait for more clicks

  // Row is correct — advance
  sound.success();
  addLine(`[ROW ${row + 1} \u2713]`, 'success');

  // Lock this row's cells
  for (let c = 0; c < COLS; c++) {
    const cell = s.gridCells[row * COLS + c];
    cell.onclick = null;
    cell.style.cursor = 'default';
  }
  s.currentRow++;

  // Highlight next row
  if (s.currentRow < hGrid.length) {
    for (let c = 0; c < COLS; c++) {
      const cell = s.gridCells[s.currentRow * COLS + c];
      cell.style.border = '1px solid #333';
    }
  }
  setTimeout(showPixelRow, 400);
}

function showPixelRow() {
  const s = state.missionState;
  const row = s.currentRow;
  const hGrid = s.hGrid;
  const COLS = 5;

  if (row >= hGrid.length) {
    // All rows done — reveal the letter
    sound.success();
    addLine('', '');
    addLine('[IMAGE RENDERED]', 'success');
    addLine('', '');
    addLine('NEXUS: "Look at the pattern you just built. Step back and', 'highlight');
    addLine('        look at the shape. What letter is it?"', 'highlight');

    setCurrentInputHandler((input) => {
      if (input.toUpperCase().trim() === 'H') {
        sound.success();
        addLine('[CORRECT] It\'s the letter H!', 'success');
        addLine('', '');

        // Discovery moment: same bits as numbers
        addLine('', '');
        addLine('NEXUS: "Now here\'s the part that blows my mind, even', 'highlight');
        addLine('        after thirty years. Read each row as a binary', 'highlight');
        addLine('        NUMBER instead of a picture:"', 'highlight');
        addLine('', '');
        addPre(hGrid.map(r => {
          const binStr = r.join('');
          const num = parseInt(binStr, 2);
          return `  ${r.join(' ')}  \u2192  ${num}`;
        }).join('\n'));
        addLine('', '');
        addLine('NEXUS: "The exact same 0s and 1s. As a picture: the', 'highlight');
        addLine('        letter H. As numbers: 17, 17, 31, 17, 17.', 'highlight');
        addLine('        The DATA didn\'t change \u2014 only how you', 'highlight');
        addLine('        INTERPRET it."', 'highlight');
        addLine('', '');
        addLine('NEXUS: "That\'s the deepest idea in all of computing.', 'highlight');
        addLine('        The same 1s and 0s can be a number, a letter,', 'highlight');
        addLine('        a pixel, a sound \u2014 ANYTHING. The meaning', 'highlight');
        addLine('        depends entirely on how you choose to read it."', 'highlight');
        addLine('', '');
        addLine(`NEXUS: "You just learned the language that runs every`, 'highlight');
        addLine(`        computer on the planet. Every single one.`, 'highlight');
        addLine(`        Not bad for your first mission, ${state.hackerName || 'kid'}."`, 'highlight');
        addLine('', '');
        addLine('NEXUS: "But that HELP signal... it doesn\'t sit right.', 'highlight');
        addLine('        If this AI is as dangerous as they say, why is', 'highlight');
        addLine('        it calling for help? Someone\'s not telling us', 'highlight');
        addLine('        the whole story. Next mission, we go deeper \u2014', 'highlight');
        addLine('        we need to learn how computers actually THINK."', 'highlight');
        addLine('', '');
        addLine('[ Type NEXT to continue ]', 'warning');

        setCurrentInputHandler((input2) => {
          setCurrentInputHandler(null);
          completeMission(0);
        });
      } else {
        sound.denied();
        addLine('NEXUS: "Look at the lit squares. What letter do they', 'error');
        addLine('        form? Two tall columns connected in the middle."', 'error');
      }
    });
    return;
  }

  // Show the binary for this row
  const rowBinary = hGrid[row];
  const coloredBits = rowBinary.map(b =>
    b ? `<span style="color:#00ff41;font-weight:bold">${b}</span>` : `<span style="color:#555">${b}</span>`
  ).join('   ');
  addLine(`Row ${row + 1} of 5:  <span style="letter-spacing:3px">${coloredBits}</span>`, '');
  addLine(`Click the ${rowBinary.filter(b => b === 1).length} square${rowBinary.filter(b => b === 1).length !== 1 ? 's' : ''} where the digit is 1.`, 'info');

  // Highlight the active row cells
  for (let c = 0; c < COLS; c++) {
    const cell = s.gridCells[row * COLS + c];
    cell.style.border = '1px solid #333';
  }

  // No input handler needed — auto-check happens on click (see checkPixelRow)
  setCurrentInputHandler(null);
}
