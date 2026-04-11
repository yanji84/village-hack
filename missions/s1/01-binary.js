// missions/s1/01-binary.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setCurrentInputHandler,
  completeMission,
  sleep,
} from '../../engine.js';

import { renderPixelGrid } from '../helpers.js';

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
      { text: `NEXUS: "${state.hackerName || 'Kid'}. I\'m NEXUS. Thirty years`, cls: 'highlight' },
      { text: '        in the game. I\'ll be on comms for every mission."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: '[INTERCEPT] Signal from the rogue AI \u2014 but it\'s all 1s and 0s.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'NEXUS: "That\'s BINARY \u2014 the only language computers actually', cls: 'highlight' },
      { text: '        speak. Every photo, game, message, song \u2014 underneath', cls: 'highlight' },
      { text: '        it all, just ones and zeros. We need to decode this', cls: 'highlight' },
      { text: '        signal to know what the AI is planning."', cls: 'highlight' },
      { text: '', cls: '' },
      { text: 'NEXUS: "I\'ll teach you to read it. It works just like the', cls: 'highlight' },
      { text: '        numbers you already know."', cls: 'highlight' },
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

  // Multiplier row
  const multCells = columns.map(c => {
    const el = document.createElement('div');
    el.className = 'col';
    el.textContent = c.multiplier;
    el.style.cssText = 'padding:4px 2px;color:#888;font-size:12px;border:1px solid #005a15;border-radius:3px;transition:border-color 0.3s;';
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

  termEl.appendChild(grid);
  termEl.scrollTop = termEl.scrollHeight;

  // Animate column by column
  let runningTotal = 0;
  await sleep(300);

  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];

    // Highlight the column
    headerCells[i].style.borderColor = '#00ff41';
    multCells[i].style.borderColor = '#00ff41';
    digitCells[i].style.borderColor = '#00ff41';
    resultCells[i].style.borderColor = '#00ff41';

    await sleep(200);

    if (col.digit === 1) {
      // Show the value, update total
      runningTotal += col.value;
      resultCells[i].textContent = String(col.value);
      resultCells[i].style.color = '#00ff41';
      resultCells[i].style.textShadow = '0 0 6px #00ff41';
      totalEl.textContent = 'Total: ' + runningTotal;
      totalEl.style.color = '#00ff41';
    } else {
      // Show "skip" in red
      resultCells[i].textContent = 'skip';
      resultCells[i].style.color = '#ff3333';
      resultCells[i].style.fontSize = '10px';
      digitCells[i].style.color = '#1a1a1a';
    }

    termEl.scrollTop = termEl.scrollHeight;
    await sleep(600);

    // Dim the column after processing (except result stays)
    headerCells[i].style.borderColor = '#005a15';
    multCells[i].style.borderColor = '#005a15';
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

async function runBinaryPhase() {
  const s = state.missionState;

  if (s.phase === 0) {
    // Phase 1: Learn binary — one worked example, one practice, then decode
    addLine('NEXUS: "You know how regular numbers work. In 352, the 2 is', 'highlight');
    addLine('        in the ONES place, the 5 in the TENS place, the 3', 'highlight');
    addLine('        in the HUNDREDS. Each place is 10\u00d7 bigger."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "Binary is the SAME idea \u2014 but each place is 2\u00d7', 'highlight');
    addLine('        bigger instead of 10\u00d7. So the places go:', 'highlight');
    addLine('        ones, twos, fours, eights."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "Let me walk you through one."', 'highlight');
    addLine('', '');

    await animateBinaryBreakdown();

    addLine('', '');
    addLine('NEXUS: "Where you see a 1, grab that value. Where you see a', 'highlight');
    addLine('        0, skip it. Add up what you grabbed."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "Your turn. Same idea. What number is 0110?"', 'highlight');
    addLine('', '');
    addPre('          eights  fours  twos  ones\n            \u00d78     \u00d74    \u00d72    \u00d71\n\n            0      1      1     0');
    addLine('', '');

    setCurrentInputHandler((input) => {
      if (input.trim() === '6') {
        sound.success();
        addLine('[CORRECT] Fours + twos = 4+2 = 6.', 'success');
        addLine('NEXUS: "You can read binary. Let\'s use it."', 'highlight');
        s.phase = 1;
        addLine('');
        setTimeout(runBinaryPhase, 800);
      } else {
        s.wrongCount = (s.wrongCount || 0) + 1;
        sound.denied();
        if (s.wrongCount === 1) {
          addLine('[WRONG] Which places have a 1? Add up those place values.', 'error');
        } else if (s.wrongCount === 2) {
          addLine('[WRONG] The fours place has a 1, the twos place has a 1. 4 + 2 = ?', 'error');
        } else {
          addLine('[WRONG] 4 + 2. Type the number.', 'error');
        }
      }
    });

  } else if (s.phase === 1) {
    // Phase 2: Decode the intercepted signal (binary → letters)
    addLine('\u2501\u2501\u2501 Decoding the AI\'s Signal \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "Computers store letters as numbers too. A=1, B=2,', 'highlight');
    addLine('        C=3... Z=26. Then that number is stored in binary.', 'highlight');
    addLine('        Decode the binary, get the number, look up the letter."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "The intercepted signal has 4 letters. Each one is 5', 'highlight');
    addLine('        binary digits. Same rules \u2014 just one more place:', 'highlight');
    addLine('        sixteens, eights, fours, twos, ones."', 'highlight');
    addLine('', '');

    // H=8, E=5, L=12, P=16 → HELP
    const secretWord = 'HELP';
    const binaryCodes = secretWord.split('').map(l => {
      const num = l.charCodeAt(0) - 64;
      return num.toString(2).padStart(5, '0');
    });

    addPre('  sixteens  eights  fours  twos  ones\n     \u00d716      \u00d78     \u00d74    \u00d72    \u00d71\n\n' + binaryCodes.map((b, i) => `  Letter ${i+1}:  ${b.split('').join('       ')}`).join('\n') + '\n\n  A=1  B=2  C=3  D=4  E=5  F=6  G=7  H=8\n  I=9  J=10 K=11 L=12 M=13 N=14 O=15 P=16');
    addLine('', '');
    addLine('NEXUS: "Decode all four. Type the word."', 'highlight');

    setCurrentInputHandler((input) => {
      if (input.toUpperCase().trim() === secretWord) {
        sound.success();
        addLine(`[DECODED] The signal says: "${secretWord}"`, 'success');
        addLine('', '');
        addLine('NEXUS: "...HELP? The rogue AI is asking for HELP?', 'highlight');
        addLine('        That doesn\'t make sense. Something\'s off.', 'highlight');
        addLine('        I\'ll look into it. For now, let\'s keep going."', 'highlight');
        s.phase = 2;
        addLine('');
        setTimeout(runBinaryPhase, 1000);
      } else {
        sound.denied();
        let correct = 0;
        const inp = input.toUpperCase();
        for (let i = 0; i < Math.min(inp.length, secretWord.length); i++) {
          if (inp[i] === secretWord[i]) correct++;
        }
        if (correct > 0 && inp.length === secretWord.length) {
          addLine(`[PARTIAL] ${correct}/${secretWord.length} letters right. Check the others.`, 'warning');
        } else {
          addLine('[WRONG] Decode each group: count the places with 1s, look up the letter.', 'error');
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
    addLine('NEXUS: "One more thing. Binary doesn\'t just store numbers', 'highlight');
    addLine('        and letters. It stores PICTURES too."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "Every screen is a grid of tiny squares called pixels.', 'highlight');
    addLine('        Each pixel is either ON (1) or OFF (0). A grid of', 'highlight');
    addLine('        bits IS an image."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "I\'m going to give you 5 rows of binary. For each', 'highlight');
    addLine('        row, click the squares that should be ON \u2014 the ones', 'highlight');
    addLine('        where the binary digit is 1. You\'re RENDERING an', 'highlight');
    addLine('        image from binary, just like a screen does."', 'highlight');
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

function showPixelRow() {
  const s = state.missionState;
  const row = s.currentRow;
  const hGrid = s.hGrid;
  const COLS = 5;

  if (row >= hGrid.length) {
    // All rows done — reveal the letter
    sound.success();
    addLine('', '');
    addLine('NEXUS: "You just RENDERED an image from binary. What letter', 'highlight');
    addLine('        did you make?"', 'highlight');

    setCurrentInputHandler((input) => {
      if (input.toUpperCase().trim() === 'H') {
        sound.success();
        addLine('[CORRECT] It\'s the letter H!', 'success');
        addLine('', '');

        // Discovery moment: same bits as numbers
        addLine('NEXUS: "Now here\'s the mind-bending part. Read each row', 'highlight');
        addLine('        as a binary NUMBER instead of a picture:"', 'highlight');
        addLine('', '');
        addPre(hGrid.map(r => {
          const binStr = r.join('');
          const num = parseInt(binStr, 2);
          return `  ${r.join(' ')}  =  ${num}`;
        }).join('\n'));
        addLine('', '');
        addLine('NEXUS: "Same bits. As a picture: the letter H. As', 'highlight');
        addLine('        numbers: 17, 17, 31, 17, 17. The DATA didn\'t', 'highlight');
        addLine('        change \u2014 only how you INTERPRET it."', 'highlight');
        addLine('', '');
        addLine('NEXUS: "That\'s the deepest idea in computer science.', 'highlight');
        addLine('        Data means nothing without context. Same 0s and', 'highlight');
        addLine('        1s can be numbers, letters, pictures, sound \u2014', 'highlight');
        addLine('        anything. Depends on how you read them."', 'highlight');
        addLine('', '');
        addLine('NEXUS: "You just learned the language of every computer', 'highlight');
        addLine(`        on Earth. Not bad for a first mission, ${state.hackerName || 'kid'}."`, 'highlight');
        addLine('', '');
        addLine('[ Type NEXT to continue ]', 'warning');

        setCurrentInputHandler((input2) => {
          setCurrentInputHandler(null);
          completeMission(0);
        });
      } else {
        sound.denied();
        addLine('[WRONG] Look at the green squares in the grid. What letter shape?', 'error');
      }
    });
    return;
  }

  // Show the binary for this row, ask kid to click the right squares
  const rowBinary = hGrid[row];
  addLine(`Row ${row + 1} of 5:  <span style="color:var(--cyan);font-weight:bold;letter-spacing:3px">${rowBinary.join(' ')}</span>`, '');
  addLine('Click the squares that should be ON (where the digit is 1), then type OK.', 'info');

  // Highlight the active row cells
  for (let c = 0; c < COLS; c++) {
    const cell = s.gridCells[row * COLS + c];
    cell.style.border = '1px solid #333';
  }

  setCurrentInputHandler((input) => {
    if (input.toUpperCase().trim() !== 'OK') {
      addLine('Type OK when you\'ve clicked the right squares for this row.', 'info');
      return;
    }

    // Check if the kid's clicks match the binary
    const gridState = [];
    for (let c = 0; c < COLS; c++) {
      const cell = s.gridCells[row * COLS + c];
      // Browser stores colors as rgb() not hex, so check for green channel
      const isOn = cell.style.background.includes('0, 255, 65') || cell.style.background.includes('00ff41');
      gridState.push(isOn ? 1 : 0);
    }

    const correct = gridState.every((v, i) => v === rowBinary[i]);

    if (correct) {
      sound.success();
      addLine(`[ROW ${row + 1} CORRECT]`, 'success');
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
      setTimeout(showPixelRow, 500);
    } else {
      sound.denied();
      addLine('[WRONG] Check the binary again. 1 = click ON, 0 = leave OFF.', 'error');
      // Reset this row
      for (let c = 0; c < COLS; c++) {
        const cell = s.gridCells[row * COLS + c];
        cell.style.background = '#111';
        cell.style.border = '1px solid #333';
        cell.style.boxShadow = 'none';
      }
    }
  });
}
