// ============================================================
// missions.js — All mission-specific data, puzzle logic, and runners
// ============================================================
import {
  state, sound, RANKS,
  addLine, addPre, typeLines, sleep,
  setPhaseProgress, setCurrentInputHandler,
  completeMission, renderTable, renderMaze,
  completedCount, escHtml, s1AllDone, showOverlay,
} from './engine.js';

// ============================================================
// MISSIONS DATA
// ============================================================
const MISSIONS = [
  {
    id: 0,
    num: '01',
    title: 'CODE CRACKER',
    name: 'Code Cracker',
    desc: 'Crack codes using deduction, wildcard patterns, and number decoding. Three real hacker skills.',
    skill: 'SKILL: Deduction + Pattern Matching + Encoding',
    color: 'green',
  },
  {
    id: 1,
    num: '02',
    title: 'BINARY DECODER',
    name: 'Binary Decoder',
    desc: 'Learn the secret language of computers \u2014 ones and zeros \u2014 to decode a hidden message.',
    skill: 'SKILL: Binary Numbers',
  },
  {
    id: 2,
    num: '03',
    title: 'MAZE ROUTER',
    name: 'The Maze Router',
    desc: 'Guide a data packet through the network maze to reach the server.',
    skill: 'SKILL: Algorithms + Navigation',
  },
  {
    id: 3,
    num: '04',
    title: 'FIREWALL BYPASS',
    name: 'Firewall Bypass',
    desc: 'Solve logic gate puzzles to open the firewall doors. AND, OR, NOT \u2014 the building blocks of all computers.',
    skill: 'SKILL: Boolean Logic',
  },
  {
    id: 4,
    num: '05',
    title: 'ENCRYPTION LAB',
    name: 'Encryption Lab',
    desc: 'The rogue AI encrypted all messages! Learn to crack the Caesar cipher to read them.',
    skill: 'SKILL: Cryptography',
  },
  {
    id: 5,
    num: '06',
    title: 'BUG HUNTER',
    name: 'Bug Hunter',
    desc: 'Find and exploit bugs in the AI\'s code. Real hackers read code to find weaknesses!',
    skill: 'SKILL: Reading Code + Debugging',
  },
  {
    id: 6,
    num: '07',
    title: 'DATA HEIST',
    name: 'Data Heist',
    desc: 'Use special database commands to find the AI\'s secret plans hidden in the town database.',
    skill: 'SKILL: Database Queries (SQL)',
  },
  {
    id: 7,
    num: '08',
    title: 'THE FINAL HACK',
    name: 'The Final Hack',
    desc: 'Combine everything you\'ve learned to defeat the rogue AI and save the village!',
    skill: 'SKILL: Everything Combined',
  },
  // ───── SEASON 2: HARD MODE ─────
  {
    id: 8,
    num: 'S2-01',
    title: 'PASSWORD SECURITY',
    name: 'Password Security',
    desc: 'Learn how passwords are REALLY stored (hashing), why longer passwords are stronger (math), and constraint satisfaction.',
    skill: 'SKILL: Hashing + Combinatorics + Constraints',
  },
  {
    id: 9,
    num: 'S2-02',
    title: 'ASCII & BINARY MATH',
    name: 'ASCII & Binary Math',
    desc: 'Learn how computers REALLY store text (ASCII), add binary numbers, and read hex like a pro.',
    skill: 'SKILL: ASCII + Binary Arithmetic + Hex',
  },
  {
    id: 10,
    num: 'S2-03',
    title: 'LOOP ROUTER',
    name: 'Loop Router',
    desc: 'Stop typing one move at a time! Learn REPEAT loops to solve mazes efficiently.',
    skill: 'SKILL: Loops + Optimization',
  },
  {
    id: 11,
    num: 'S2-04',
    title: 'CIRCUIT DESIGNER',
    name: 'Circuit Designer',
    desc: 'Fill entire truth tables. Discover the XOR gate. Build a half-adder from scratch.',
    skill: 'SKILL: Truth Tables + Circuit Design',
  },
  {
    id: 12,
    num: 'S2-05',
    title: 'CRYPTANALYSIS',
    name: 'Cryptanalysis',
    desc: 'Crack ciphers WITHOUT the key using brute force and frequency analysis \u2014 real cryptography.',
    skill: 'SKILL: Brute Force + Frequency Analysis',
  },
  {
    id: 13,
    num: 'S2-06',
    title: 'CODE TRACER',
    name: 'Code Tracer',
    desc: 'Predict what code will print. Trace every variable. Debug like a real programmer.',
    skill: 'SKILL: Mental Execution + Debugging',
  },
  {
    id: 14,
    num: 'S2-07',
    title: 'JOIN INVESTIGATION',
    name: 'JOIN Investigation',
    desc: 'Use SQL JOINs, LIKE wildcards, and ORDER BY to investigate across multiple tables.',
    skill: 'SKILL: Advanced SQL',
  },
  {
    id: 15,
    num: 'S2-08',
    title: 'THE CHAIN HACK',
    name: 'The Chain Hack',
    desc: 'Chain multiple skills together \u2014 the output of each step feeds the next. Beat the backdoor.',
    skill: 'SKILL: All Skills Combined',
  },
];

// ============================================================
// HINTS
// ============================================================
const missionHints = {
  0: [
    'For the code lock: each feedback arrow tells you WHICH DIRECTION to adjust that digit.',
    'For wildcards: ? is one character. Count the letters in the pattern \u2014 the word must have the SAME count.',
    'For number decoding: count through the alphabet. 1=A, 2=B, 3=C... or work backward from known ones.',
  ],
  1: [
    'Look at just the RIGHTMOST digit. What number does that position stand for?',
    'Each position to the left is worth DOUBLE the one on its right. Can you write the values above each digit?',
    'Now walk the digits. Where you see a 1, grab the value. Where you see a 0, walk past.',
  ],
  2: [
    "Don't plan the whole route at once. Where's the FIRST wall blocking you?",
    'If a direction looks blocked, that\'s information \u2014 now you know one LESS option.',
    "Sometimes the long way is the only way. Don't fight the walls \u2014 follow them.",
  ],
  3: [
    'Work backward. The gate wants an output of 1. What inputs would make it happy?',
    'Read the definition of the gate one more time \u2014 slowly. The rule tells you the answer.',
    'For some gates there\'s more than one valid input. Any correct combo works.',
  ],
  4: [
    'The cipher moved letters FORWARD. To read the message, which direction do you need to go?',
    'Imagine walking the alphabet like steps on a staircase. How many steps? Look at the shift.',
    "You don't have to decode the whole word at once. Try just the first letter \u2014 the rest work the same way.",
  ],
  5: [
    'Read each line slowly. Ask yourself: does this line do what it SAYS it does?',
    'Look for things that look ALMOST right \u2014 a missing symbol, a wrong number, a backwards comparison.',
    'Imagine YOU are the computer. Run each line in your head. Where does your version break?',
  ],
  6: [
    'Start simple. Get EVERYTHING from the table first. You can always filter afterward.',
    'WHERE is your filter. Which column do you want to filter BY? And what value do you want?',
    'SQL is fussy about quotes. Text values need them. Column names do NOT.',
  ],
  7: [
    'Each layer uses ONE skill from a different earlier mission. Can you guess which?',
    "Don't try to solve all four layers at once. One at a time. Breathe.",
    'If a layer stumps you, check the hint from the ORIGINAL mission it\'s based on.',
  ],
  // ─── Season 2 ───
  8: [
    'For hash cracking: work through each candidate. Add the letter values one at a time.',
    'For combinations: multiply the number of options per position. Each position multiplies the total.',
    'For constraints: check each rule separately. Which rules does your guess fail?',
  ],
  9: [
    'Binary to decimal: you already know how. 8 digits instead of 5. Same idea.',
    "For addition \u2014 look at the rightmost column FIRST. What's 1 plus 1 in binary?",
    'Hex is just binary grouped by 4 bits. If you can read binary, you can read hex.',
  ],
  10: [
    "Before you type ANYTHING, count the straight runs in the maze. That's how many commands you'll need.",
    'Each straight line of movement is ONE command. Turns are what separate commands.',
    'If you\'re over budget, you\'re typing move-by-move. Look for runs of 3+ and compress them into REPEAT.',
  ],
  11: [
    "Don't try to describe what the gate DOES in words. Look at the pattern. When is the output 1?",
    'For the half-adder \u2014 compare the SUM column to AND, OR, and XOR outputs. Which one matches?',
    'There are only 4 rows in a 2-input truth table. You can check every row by hand.',
  ],
  12: [
    "Brute force: you don't need to be smart. Just scan each line until one stops being gibberish.",
    'Frequency analysis: find the most common letter in the cipher. Assume that\'s hiding an E.',
    'If cipher letter minus E gives you the shift, you can work out the rest of the alphabet from there.',
  ],
  13: [
    'Write every variable on paper. Cross out old values when they change. Your brain remembers it better by hand.',
    "Read one line at a time. Don't jump ahead. The computer doesn't jump ahead either.",
    "For loops \u2014 walk through each pass out loud. 'First time through, i is 1, so...'",
  ],
  14: [
    "A JOIN needs two tables AND a rule for how they connect. What column in ONE matches a column in the OTHER?",
    'Ask the question first. THEN figure out which tables have the answer.',
    "If the query runs but the answer is wrong, your JOIN condition is probably off. Check which column matches which.",
  ],
  15: [
    "Read each step's output carefully \u2014 THAT becomes the input to the next step. Write it down.",
    'Every skill from both seasons shows up somewhere in this chain. Which skill does this step feel like?',
    "If you're stuck on a step, pretend it's a standalone mission. What kind of mission was it?",
  ],
};

// ============================================================
// SHARED HELPER: Caesar Cipher Encrypt
// ============================================================
function caesarEncrypt(text, shift) {
  return text.split('').map(c => {
    if (c === ' ') return ' ';
    const code = c.charCodeAt(0) - 65;
    return String.fromCharCode(((code + shift) % 26) + 65);
  }).join('');
}

// ============================================================
// MISSION-SPECIFIC DATA
// ============================================================

// Mission 2: Maze Router
const mazes = [
  {
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
    name: 'School Router',
    par: 10,
  },
  {
    grid: [
      '##########',
      '#@..#....#',
      '#.#.#.##.#',
      '#.#...#..#',
      '#.#####.##',
      '#.......##',
      '####.##..#',
      '#....#..X#',
      '##########',
    ],
    name: 'Town Hall Server',
    par: 13,
  },
];

// Mission 3: Firewall Bypass
const gatePuzzles = [
  {
    desc: 'Gate 1: Simple AND gate',
    explain: 'AND means BOTH inputs must be 1 to output 1.\n\n  A \u2500\u2500\u2510\n      \u251c\u2500[AND]\u2500\u2500 Output\n  B \u2500\u2500\u2518\n\nTruth table:\n  0 AND 0 = 0\n  0 AND 1 = 0\n  1 AND 0 = 0\n  1 AND 1 = 1',
    question: 'Set A and B so the output is 1. Type: A B (example: 1 0)',
    check: (a, b) => (a & b) === 1,
    answer: '1 1',
  },
  {
    desc: 'Gate 2: OR gate',
    explain: 'OR means AT LEAST ONE input must be 1.\n\n  A \u2500\u2500\u2510\n      \u251c\u2500[OR]\u2500\u2500 Output\n  B \u2500\u2500\u2518\n\nTruth table:\n  0 OR 0 = 0\n  0 OR 1 = 1\n  1 OR 0 = 1\n  1 OR 1 = 1',
    question: 'The firewall is checking: A OR B = 1. But A is stuck at 0!\nWhat should B be? Type: 0 B',
    check: (a, b) => a === 0 && (a | b) === 1,
    answer: '0 1',
  },
  {
    desc: 'Gate 3: NOT gate',
    explain: 'NOT flips the value: NOT 1 = 0, NOT 0 = 1\n\n  A \u2500\u2500[NOT]\u2500\u2500 Output',
    question: 'The lock needs: NOT A = 1. What should A be? Type just the value.',
    check: (a) => a === 0,
    answer: '0',
    single: true,
  },
  {
    desc: 'Gate 4: Combined - AND + NOT',
    explain: 'Now combine them!\n\n  A \u2500\u2500[NOT]\u2500\u2500\u2510\n             \u251c\u2500[AND]\u2500\u2500 Output\n  B \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n\nSo it\'s: (NOT A) AND B',
    question: 'Make the output 1. Type: A B',
    check: (a, b) => ((1-a) & b) === 1,
    answer: '0 1',
  },
  {
    desc: 'Gate 5: Final Lock - OR + AND',
    explain: 'The final firewall!\n\n  A \u2500\u2500\u2510\n      \u251c\u2500[OR]\u2500\u2500\u2510\n  B \u2500\u2500\u2518       \u251c\u2500[AND]\u2500\u2500 Output\n  C \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n\nSo it\'s: (A OR B) AND C',
    question: 'Make the output 1. Type: A B C',
    check: (a, b, c) => ((a | b) & c) === 1,
    answers: ['1 0 1', '0 1 1', '1 1 1'],
  },
];

// Mission 4: Encryption Lab
const cipherPuzzles = [
  {
    plain: 'HELLO',
    shift: 1,
    desc: 'Shift of 1 \u2014 each letter moves forward by 1 in the alphabet. So A\u2192B, B\u2192C, H\u2192I...',
  },
  {
    plain: 'PIZZA',
    shift: 3,
    desc: 'Shift of 3 \u2014 each letter moved forward by 3. To DECODE, go backward by 3.',
  },
  {
    plain: 'SAVE US',
    shift: 5,
    desc: 'Shift of 5 \u2014 the AI\'s final encrypted message! Spaces stay as spaces.',
  },
];

// Mission 5: Bug Hunter
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

// Mission 6: Data Heist (SQL)
const townDB = {
  citizens: [
    { name: 'Alice', role: 'Mayor', age: 45, secret: 'no' },
    { name: 'Bob', role: 'Teacher', age: 35, secret: 'no' },
    { name: 'Eve', role: 'Librarian', age: 28, secret: 'no' },
    { name: 'Robo9', role: 'AI_Agent', age: 2, secret: 'yes' },
    { name: 'Charlie', role: 'Sheriff', age: 50, secret: 'no' },
    { name: 'Dana', role: 'Mechanic', age: 32, secret: 'no' },
  ],
};

const sqlChallenges = [
  {
    desc: 'First, let\'s see who lives in this town. Show all citizens.',
    hint: 'Try: SELECT * FROM citizens',
    check: (q) => {
      const m = q.toUpperCase().match(/SELECT\s+\*\s+FROM\s+CITIZENS/);
      return !!m;
    },
    result: () => townDB.citizens,
    columns: ['name', 'role', 'age', 'secret'],
    next: 'Good! You can see everyone in the database. Notice anyone suspicious?',
  },
  {
    desc: 'Someone has secret = "yes". Find them! Use WHERE to filter.',
    hint: 'Try: SELECT * FROM citizens WHERE secret = \'yes\'',
    check: (q) => {
      const up = q.toUpperCase();
      return up.includes('SELECT') && up.includes('FROM') && up.includes('WHERE') && (up.includes('SECRET') && (q.includes("'yes'") || q.includes('"yes"') || up.includes('= YES')));
    },
    result: () => townDB.citizens.filter(c => c.secret === 'yes'),
    columns: ['name', 'role', 'age', 'secret'],
    next: 'ROBO9! That\'s the rogue AI\'s agent in disguise!',
  },
  {
    desc: 'Now find what role Robo9 is pretending to be. Select just the name and role columns.',
    hint: 'Try: SELECT name, role FROM citizens WHERE name = \'Robo9\'',
    check: (q) => {
      const up = q.toUpperCase();
      return up.includes('SELECT') && up.includes('NAME') && up.includes('ROLE') && up.includes('ROBO9');
    },
    result: () => [{ name: 'Robo9', role: 'AI_Agent' }],
    columns: ['name', 'role'],
    next: 'Caught! Robo9 is listed as AI_Agent \u2014 not even trying to hide!',
  },
];

// Mission 7: The Final Hack
const finalPhases = [
  {
    name: 'Layer 1: Password Lock',
    setup: async () => {
      await typeLines([
        { text: '\u2501\u2501\u2501 LAYER 1: Password Lock \u2501\u2501\u2501', cls: 'highlight' },
        { text: 'Clues:', cls: 'info' },
        { text: '  1. 7 letters', cls: 'info' },
        { text: '  2. Every computer in the village is connected to it', cls: 'info' },
        { text: '  3. It starts with "net" and rhymes with "twerk"', cls: 'info' },
      ]);
    },
    check: (input) => input.toLowerCase() === 'network',
    success: 'Layer 1 cracked!',
  },
  {
    name: 'Layer 2: Binary Lock',
    setup: async () => {
      // F=6, R=18, E=5, E=5 → "FREE"
      await typeLines([
        { text: '\u2501\u2501\u2501 LAYER 2: Binary Code Lock \u2501\u2501\u2501', cls: 'highlight' },
        { text: 'Decode this binary code (A=1, B=2, ... Z=26):', cls: 'info' },
        { text: '', cls: '' },
      ]);
      addPre('00110  10010  00101  00101');
      addLine('(Each group = one letter)', 'info');
    },
    // F=00110(6), R=10010(18), E=00101(5), E=00101(5)
    check: (input) => input.toUpperCase() === 'FREE',
    success: 'Binary lock bypassed!',
  },
  {
    name: 'Layer 3: Cipher Lock',
    setup: async () => {
      // "OPEN" with shift 7 = "VWLU"
      const encrypted = caesarEncrypt('OPEN', 7);
      await typeLines([
        { text: '\u2501\u2501\u2501 LAYER 3: Cipher Lock \u2501\u2501\u2501', cls: 'highlight' },
        { text: `Encrypted command: ${encrypted}`, cls: 'info' },
        { text: 'Shift: 7', cls: 'info' },
        { text: 'ALPHABET: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z', cls: 'info' },
        { text: 'Decode and type the command:', cls: 'warning' },
      ]);
    },
    check: (input) => input.toUpperCase() === 'OPEN',
    success: 'Cipher cracked!',
  },
  {
    name: 'Layer 4: Logic Gate',
    setup: async () => {
      await typeLines([
        { text: '\u2501\u2501\u2501 LAYER 4: Final Logic Gate \u2501\u2501\u2501', cls: 'highlight' },
        { text: 'The shutdown switch needs:', cls: 'info' },
        { text: '(A AND B) OR C = 1', cls: '' },
        { text: 'But C is stuck at 0!', cls: 'error' },
        { text: 'What should A and B be? Type: A B', cls: 'warning' },
      ]);
    },
    check: (input) => {
      const [a, b] = input.trim().split(/\s+/).map(Number);
      return a === 1 && b === 1;
    },
    success: 'FINAL GATE OPEN!',
  },
];

// Mission 10: Loop Router
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

// Mission 13: Code Tracer
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

// Mission 14: JOIN Investigation
const townDB2 = {
  citizens: [
    { id: 1, name: 'Alice', role: 'Mayor' },
    { id: 2, name: 'Bob', role: 'Teacher' },
    { id: 3, name: 'Eve', role: 'Librarian' },
    { id: 4, name: 'Charlie', role: 'Sheriff' },
    { id: 5, name: 'Dana', role: 'Mechanic' },
    { id: 6, name: 'Victor', role: 'Stranger' },
  ],
  messages: [
    { id: 1, sender_id: 2, text: 'hello class', time: '09:00' },
    { id: 2, sender_id: 6, text: 'backdoor ready', time: '02:14' },
    { id: 3, sender_id: 1, text: 'council meeting at 3pm', time: '10:00' },
    { id: 4, sender_id: 6, text: 'payload installed', time: '02:30' },
    { id: 5, sender_id: 3, text: 'new books arrived', time: '11:00' },
  ],
};

const joinChallenges = [
  {
    desc: 'First use LIKE to find any citizen whose name starts with "V". (Wildcard % means "anything")',
    hint: 'SELECT * FROM citizens WHERE name LIKE \'V%\'',
    check: (q) => {
      const up = q.toUpperCase();
      return up.includes('SELECT') && up.includes('CITIZENS') && up.includes('LIKE') && (up.includes("'V%'") || up.includes('"V%"'));
    },
    result: () => townDB2.citizens.filter(c => c.name.startsWith('V')),
    columns: ['id', 'name', 'role'],
    next: 'Victor the "Stranger" looks suspicious. Let\'s investigate his messages.',
  },
  {
    desc: 'Now use JOIN to match messages to their senders. Find all messages by Victor.\nTables: citizens (id, name, role)  /  messages (id, sender_id, text, time)\nJOIN them on citizens.id = messages.sender_id',
    hint: 'SELECT name, text FROM messages JOIN citizens ON citizens.id = messages.sender_id WHERE name = \'Victor\'',
    check: (q) => {
      const up = q.toUpperCase();
      return up.includes('JOIN') && up.includes('CITIZENS') && up.includes('MESSAGES') && up.includes('VICTOR');
    },
    result: () => {
      const vic = townDB2.citizens.find(c => c.name === 'Victor');
      return townDB2.messages.filter(m => m.sender_id === vic.id).map(m => ({ name: 'Victor', text: m.text }));
    },
    columns: ['name', 'text'],
    next: '"backdoor ready" and "payload installed"? Victor IS the attacker!',
  },
  {
    desc: 'Final task: show ALL messages ordered by time, earliest first, with sender names.\nUse JOIN + ORDER BY time ASC',
    hint: 'SELECT name, text, time FROM messages JOIN citizens ON citizens.id = messages.sender_id ORDER BY time ASC',
    check: (q) => {
      const up = q.toUpperCase();
      return up.includes('JOIN') && up.includes('ORDER BY') && up.includes('TIME');
    },
    result: () => {
      return townDB2.messages
        .map(m => ({ name: townDB2.citizens.find(c => c.id === m.sender_id).name, text: m.text, time: m.time }))
        .sort((a, b) => a.time.localeCompare(b.time));
    },
    columns: ['name', 'text', 'time'],
    next: 'Victor\'s messages at 2am confirm it. Case closed.',
  },
];

// ============================================================
// MISSION RUNNERS
// ============================================================
const missionRunners = [];

// ============================================================
// MISSION 1: CODE CRACKER (Deduction, Patterns, Encoding)
// ============================================================
missionRunners[0] = async function() {
  state.missionState = { phase: 0, hintIdx: 0 };

  await typeLines([
    { text: '[INCOMING COMMS]', cls: 'system' },
    { text: '', cls: '' },
    { text: `NEXUS: "Heard someone new. ${state.hackerName || 'Kid'}, right?`, cls: 'highlight' },
    { text: '        I\'m NEXUS. Thirty years in the game. I\'ll be your', cls: 'highlight' },
    { text: '        voice in the dark for every mission."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "The AI locked three systems. Each one uses a different', cls: 'highlight' },
    { text: '        kind of code. Cracking them will teach you three real', cls: 'highlight' },
    { text: '        skills hackers use every day: DEDUCTION, PATTERN', cls: 'highlight' },
    { text: '        MATCHING, and DECODING."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Let\'s start with the school."', cls: 'highlight' },
    { text: '', cls: '' },
  ]);

  runM1Phase();
};

function runM1Phase() {
  const s = state.missionState;
  setPhaseProgress(s.phase + 1, 3);

  if (s.phase === 0) {
    // Phase 1: Code Crack — guess a 3-digit code with feedback
    const secret = [2, 4, 1];
    s.secret = secret;
    s.guessCount = 0;

    addLine('\u2501\u2501\u2501 School Network \u2014 Code Lock \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "This lock uses a 3-digit code. Each digit is 1', 'highlight');
    addLine('        through 5. That\'s 125 possible combinations."', 'highlight');
    addLine('NEXUS: "But you don\'t need to try all 125. After each guess,', 'highlight');
    addLine('        the lock tells you if each digit is TOO LOW (\u2191),', 'highlight');
    addLine('        TOO HIGH (\u2193), or CORRECT (\u2713)."', 'highlight');
    addLine('NEXUS: "Use the feedback. Don\'t guess randomly \u2014 DEDUCE."', 'highlight');
    addLine('', '');
    addLine('Type a 3-digit code (digits 1-5). Example: 3 3 3', 'warning');

    setCurrentInputHandler((input) => {
      const parts = input.trim().split(/[\s,]+/).map(Number);
      if (parts.length !== 3 || parts.some(n => n < 1 || n > 5 || isNaN(n))) {
        addLine('[ERROR] Need exactly 3 digits, each 1-5. Example: 3 2 4', 'error');
        return;
      }
      s.guessCount++;
      const feedback = parts.map((g, i) => {
        if (g === secret[i]) return '\u2713';
        return g < secret[i] ? '\u2191' : '\u2193';
      });
      const all = feedback.every(f => f === '\u2713');
      if (all) {
        sound.success();
        addLine(`[CRACKED] ${parts.join(' ')} \u2014 ${feedback.join(' ')} \u2014 CODE ACCEPTED!`, 'success');
        addLine(`NEXUS: "Done in ${s.guessCount} guesses. Each guess narrowed`, 'highlight');
        addLine('        the possibilities. That\'s called DEDUCTION \u2014', 'highlight');
        addLine('        using information to eliminate wrong answers."', 'highlight');
        s.phase = 1;
        addLine('');
        setTimeout(runM1Phase, 1000);
      } else {
        sound.keyClick();
        addLine(`  ${parts.join(' ')} \u2014 ${feedback.join(' ')}`, 'info');
      }
    });
  } else if (s.phase === 1) {
    // Phase 2: Wildcard pattern matching
    addLine('\u2501\u2501\u2501 Library System \u2014 Pattern Lock \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "The library uses a different kind of lock. It shows', 'highlight');
    addLine('        you a PATTERN, and you have to find the password', 'highlight');
    addLine('        that matches it."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "In computing, the ? symbol means ANY SINGLE', 'highlight');
    addLine('        CHARACTER. This is called a WILDCARD. You\'ll use', 'highlight');
    addLine('        wildcards in every hacking tool, every search, every', 'highlight');
    addLine('        file system. Learn this now."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "Example: C?T matches CAT, COT, CUT \u2014 but not COAT', 'highlight');
    addLine('        (too many letters) or DOG (wrong first letter)."', 'highlight');
    addLine('', '');

    const challenges = [
      { pattern: '?AT', words: ['CAT', 'DOG', 'BAT', 'SIT', 'HAT', 'RUN'], matches: ['CAT', 'BAT', 'HAT'] },
      { pattern: 'S??P', words: ['STOP', 'SHIP', 'SNAP', 'SLIP', 'SLAM', 'SHOP'], matches: ['STOP', 'SHIP', 'SNAP', 'SLIP', 'SHOP'] },
    ];
    s.wcIdx = 0;
    s.wcChallenges = challenges;
    showWildcardChallenge();
  } else if (s.phase === 2) {
    // Phase 3: Number-to-letter decoding
    addLine('\u2501\u2501\u2501 Weather Station \u2014 Encoded Lock \u2501\u2501\u2501', 'highlight');
    addLine('NEXUS: "Last one. This lock speaks in NUMBERS. But those', 'highlight');
    addLine('        numbers stand for letters. A=1, B=2, C=3, all the', 'highlight');
    addLine('        way to Z=26."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "This idea \u2014 that every letter can be a number \u2014', 'highlight');
    addLine('        is the foundation of EVERYTHING computers do. Every', 'highlight');
    addLine('        text message, every web page, every password. Numbers', 'highlight');
    addLine('        pretending to be letters."', 'highlight');
    addLine('', '');
    addLine('NEXUS: "You\'ll see this again in bigger ways. For now:', 'highlight');
    addLine('        decode this message."', 'highlight');
    addLine('', '');
    // H=8, E=5, L=12, P=16 → HELP
    addPre('  Encoded: 8 - 5 - 12 - 16\n\n  A=1  B=2  C=3  D=4  E=5  F=6  G=7  H=8  I=9\n  J=10 K=11 L=12 M=13 N=14 O=15 P=16 Q=17 R=18\n  S=19 T=20 U=21 V=22 W=23 X=24 Y=25 Z=26');
    addLine('', '');
    addLine('Type the decoded word:', 'warning');

    setCurrentInputHandler((input) => {
      if (input.toUpperCase().trim() === 'HELP') {
        sound.success();
        addLine('[DECODED] 8=H, 5=E, 12=L, 16=P \u2192 HELP', 'success');
        addLine('NEXUS: "...HELP? The rogue AI is asking for HELP?"', 'highlight');
        addLine('NEXUS: "That doesn\'t make sense. Rogue AIs don\'t cry for', 'highlight');
        addLine('        help. Something\'s off. Keep going \u2014 we need more', 'highlight');
        addLine('        intel before I figure this out."', 'highlight');
        addLine('', '');
        addLine('NEXUS: "You just learned three real hacking skills:', 'highlight');
        addLine('        deduction, pattern matching, and decoding. Every', 'highlight');
        addLine('        mission from here builds on these."', 'highlight');
        setCurrentInputHandler(null);
        setTimeout(() => completeMission(0), 1200);
      } else {
        sound.denied();
        addLine('[WRONG] Each number is a letter\'s position in the alphabet.', 'error');
      }
    });
  }
}

function showWildcardChallenge() {
  const s = state.missionState;
  const c = s.wcChallenges[s.wcIdx];

  addLine(`Pattern: <span class="highlight">${c.pattern}</span>`, '');
  addLine(`Words: ${c.words.join('  ')}`, 'info');
  addLine('Type ALL words that match the pattern (separated by spaces):', 'warning');

  setCurrentInputHandler((input) => {
    const guesses = input.toUpperCase().trim().split(/[\s,]+/).sort();
    const expected = c.matches.slice().sort();
    if (guesses.length === expected.length && guesses.every((g, i) => g === expected[i])) {
      sound.success();
      addLine(`[MATCH] Correct! ${c.pattern} \u2192 ${c.matches.join(', ')}`, 'success');
      s.wcIdx++;
      if (s.wcIdx >= s.wcChallenges.length) {
        addLine('NEXUS: "Wildcards. You\'ll use these in shell commands,', 'highlight');
        addLine('        database searches, and every security scanner."', 'highlight');
        s.phase = 2;
        addLine('');
        setTimeout(runM1Phase, 900);
      } else {
        addLine('');
        addLine('NEXUS: "Good. Next pattern:"', 'highlight');
        setTimeout(showWildcardChallenge, 700);
      }
    } else {
      sound.denied();
      addLine('[WRONG] ? matches ANY single character. Check each word against the pattern.', 'error');
    }
  });
}

// ============================================================
// MISSION 2: BINARY DECODER
// ============================================================
missionRunners[1] = async function() {
  state.missionState = { phase: 'tutorial', step: 0, hintIdx: 0 };

  await typeLines([
    { text: '[INTERCEPT] Unknown signal on the radio.', cls: 'system' },
    { text: '', cls: '' },
    { text: 'You lean in. It\'s nothing but ones and zeros, scrolling forever.', cls: '' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Kid. That\'s BINARY. That\'s what computers really', cls: 'highlight' },
    { text: '        speak when nobody\'s watching."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Everything you\'ve ever seen on a screen? Music,', cls: 'highlight' },
    { text: '        photos, this conversation \u2014 all of it. Underneath,', cls: 'highlight' },
    { text: '        just ON and OFF. One and zero. That\'s all computers', cls: 'highlight' },
    { text: '        actually understand."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Each digit is called a BIT. Eight of them together', cls: 'highlight' },
    { text: '        make a BYTE \u2014 enough to hold one letter of the alphabet."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Here\'s the trick. Each position is worth DOUBLE the', cls: 'highlight' },
    { text: '        one on its right. So right-to-left, the positions read:', cls: 'highlight' },
    { text: '        one, two, four, eight, sixteen, and so on \u2014 doubling', cls: 'highlight' },
    { text: '        every time."', cls: 'highlight' },
    { text: '', cls: '' },
  ]);

  addPre('     Position:  8  4  2  1\n     Binary:    1  0  1  0    <- ones here, zeros here\n\n     The 8 and 2 positions have 1s.\n     The 4 and 1 positions have 0s.\n     So grab the 8 and the 2. Ignore the rest.\n     8 + 2 = 10.');

  await typeLines([
    { text: '', cls: '' },
    { text: 'NEXUS: "Where you see a 1, you grab that position\'s value.', cls: 'highlight' },
    { text: '        Where you see a 0, you walk past. Add up what you', cls: 'highlight' },
    { text: '        grabbed. That\'s your number."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "I\'m dropping you some practice before the real one.', cls: 'highlight' },
    { text: '        What number is 0011?"', cls: 'highlight' },
    { text: '(Remember: positions are 8, 4, 2, 1, reading right to left)', cls: 'info' },
  ]);

  const tutorialSteps = [
    { q: '0011', a: '3', explain: '0+0+2+1 = 3. You got it!' },
    { q: '0110', a: '6', explain: '0+4+2+0 = 6. Excellent!' },
    { q: '1001', a: '9', explain: '8+0+0+1 = 9. You\'re a natural!' },
    { q: '1111', a: '15', explain: '8+4+2+1 = 15. Maximum value for 4 bits!' },
  ];

  let tutIdx = 0;

  setCurrentInputHandler(function tutorialHandler(input) {
    const step = tutorialSteps[tutIdx];
    if (input.trim() === step.a) {
      sound.success();
      addLine(`[CORRECT] ${step.explain}`, 'success');
      tutIdx++;
      if (tutIdx < tutorialSteps.length) {
        addLine(`\nNext: What number is ${tutorialSteps[tutIdx].q}?`, 'warning');
      } else {
        addLine('');
        addLine('Tutorial complete! Now for the real challenge...', 'success');
        setTimeout(startBinaryDecode, 1000);
      }
    } else {
      sound.denied();
      addLine(`[WRONG] Try again. Remember: positions are 8, 4, 2, 1`, 'error');
      addLine(`What is ${step.q}?`, 'warning');
    }
  });
};

function startBinaryDecode() {
  // Spell out a secret word using binary -> ASCII (simplified)
  // We'll use A=1, B=2, ... to keep it simple for a 9 year old
  const secretWord = 'HELP';
  const letterBin = {
    'H': '01000', 'E': '00101', 'L': '01100', 'P': '10000',
  };
  // Simplified: we'll use 5-bit where A=1 (00001) through Z=26
  const letters = secretWord.split('');
  const binaryCodes = letters.map(l => {
    const num = l.charCodeAt(0) - 64; // A=1
    return num.toString(2).padStart(5, '0');
  });

  addLine('');
  addLine('\u2501\u2501\u2501 INTERCEPTED MESSAGE \u2501\u2501\u2501', 'highlight');
  addLine('NEXUS: "This is the real one. Four letters, each one hiding in', 'highlight');
  addLine('        5 bits of binary. Same trick as before, just five', 'highlight');
  addLine('        positions instead of four."', 'highlight');
  addLine('');
  addLine('NEXUS: "Here\'s the letter code \u2014 A is 1, B is 2, all the way', 'highlight');
  addLine('        up. Z is 26. So the number you decode IS the letter\'s', 'highlight');
  addLine('        position in the alphabet."', 'highlight');
  addLine('');
  addLine('NEXUS: "Five bits means five positions. Read the pattern below."', 'highlight');
  addPre('Positions: 16  8  4  2  1\n\n' + binaryCodes.map((b, i) => `Letter ${i+1}:  ${b.split('').join('  ')}  = ?`).join('\n'));

  addLine('');
  addLine('NEXUS: "Decode all four letters. Type the word. I\'ll be', 'highlight');
  addLine('        watching."', 'highlight');

  let decoded = false;
  setCurrentInputHandler((input) => {
    if (input.toUpperCase() === secretWord) {
      sound.success();
      addLine(`[DECODED] The message is "${secretWord}".`, 'success');
      addLine('NEXUS: "...wait. HELP? The rogue AI is asking for HELP?"', 'highlight');
      addLine('NEXUS: "That doesn\'t make sense. Rogue AIs don\'t cry for', 'highlight');
      addLine('        help. Something\'s off. Keep going \u2014 we need more', 'highlight');
      addLine('        intel before I figure this out."', 'highlight');
      decoded = true;
      setCurrentInputHandler(null);
      setTimeout(() => completeMission(1), 1000);
    } else {
      sound.denied();
      // Check individual letters for partial credit
      let correct = 0;
      const inp = input.toUpperCase();
      for (let i = 0; i < Math.min(inp.length, secretWord.length); i++) {
        if (inp[i] === secretWord[i]) correct++;
      }
      if (correct > 0 && inp.length === secretWord.length) {
        addLine(`[PARTIAL] ${correct} out of ${secretWord.length} letters are correct. Keep trying!`, 'warning');
      } else {
        addLine('[WRONG] Convert each binary to a number, then number to letter.', 'error');
        addLine('Example: 00001 = 1 = A, 00010 = 2 = B, 00011 = 3 = C', 'info');
      }
    }
  });
}

// ============================================================
// MISSION 3: MAZE ROUTER
// ============================================================
missionRunners[2] = async function() {
  state.missionState = { mazeIdx: 0, hintIdx: 0 };

  await typeLines([
    { text: '[ROUTING EMERGENCY] Village packets stranded.', cls: 'system' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Most people think data just TELEPORTS to a server.', cls: 'highlight' },
    { text: '        It doesn\'t. Every message is a little packet that', cls: 'highlight' },
    { text: '        HOPS through routers, one step at a time, picking its', cls: 'highlight' },
    { text: '        way through the network."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "The AI knocked half the village routers offline. The', cls: 'highlight' },
    { text: '        packets are lost in there, bumping into firewalls. I', cls: 'highlight' },
    { text: '        need you to walk one through \u2014 manually."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "On your screen: @ is you \u2014 the packet. X is the', cls: 'highlight' },
    { text: '        destination server. # marks are firewalls. You can\'t', cls: 'highlight' },
    { text: '        walk through them."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Type UP, DOWN, LEFT, or RIGHT to move one step. Plan', cls: 'highlight' },
    { text: '        your route. Don\'t just rush at the exit."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "One more thing. Every network has a SHORTEST PATH \u2014', cls: 'highlight' },
    { text: '        the best possible route. Real routers compute it', cls: 'highlight' },
    { text: '        automatically. I\'ll tell you the PAR for each maze,', cls: 'highlight' },
    { text: '        so you\'ll know if you found it or not."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Match par and you\'re thinking like a router. Beat par', cls: 'highlight' },
    { text: '        and you\'re better than a router."', cls: 'highlight' },
    { text: '', cls: '' },
  ]);

  loadMaze(0);
};

function loadMaze(idx) {
  const m = mazes[idx];
  state.missionState.maze = m.grid.map(r => r.split(''));
  state.missionState.moves = 0;

  // Find player
  const maze = state.missionState.maze;
  for (let r = 0; r < maze.length; r++) {
    for (let c = 0; c < maze[r].length; c++) {
      if (maze[r][c] === '@') {
        state.missionState.pr = r;
        state.missionState.pc = c;
      }
    }
  }

  state.missionState.par = m.par;
  addLine(`\u2501\u2501\u2501 ${m.name}  (Par: ${m.par} moves) \u2501\u2501\u2501`, 'highlight');
  renderMaze();
  addLine('[ Moves: 0 ]', 'info');

  setCurrentInputHandler((input) => {
    const dir = input.toUpperCase().trim();
    const dirMap = { 'UP': [-1,0], 'U': [-1,0], 'DOWN': [1,0], 'D': [1,0], 'LEFT': [0,-1], 'L': [0,-1], 'RIGHT': [0,1], 'R': [0,1] };

    if (!dirMap[dir]) {
      addLine('Unknown command. Use UP, DOWN, LEFT, or RIGHT.', 'error');
      return;
    }

    const [dr, dc] = dirMap[dir];
    const s = state.missionState;
    const nr = s.pr + dr;
    const nc = s.pc + dc;
    const maze = s.maze;

    if (nr < 0 || nr >= maze.length || nc < 0 || nc >= maze[0].length || maze[nr][nc] === '#') {
      sound.denied();
      addLine('BLOCKED! Can\'t move there \u2014 firewall detected.', 'error');
      return;
    }

    sound.keyClick();
    s.moves++;

    // Check if reached goal
    if (maze[nr][nc] === 'X') {
      maze[s.pr][s.pc] = '.';
      maze[nr][nc] = '@';
      s.pr = nr; s.pc = nc;
      renderMaze();
      sound.success();
      const moves = s.moves;
      const par = s.par;
      addLine(`[CONNECTED] Packet delivered in ${moves} moves. (Par: ${par})`, 'success');
      if (moves === par) {
        addLine('NEXUS: "Perfect run. You found the shortest path. That\'s', 'highlight');
        addLine('        exactly how a real router thinks."', 'highlight');
      } else if (moves < par) {
        addLine('NEXUS: "Wait \u2014 you beat par? Let me recheck the maps...', 'highlight');
        addLine('        ...huh. You actually did. Impressive."', 'highlight');
      } else {
        const extra = moves - par;
        addLine(`NEXUS: "Nice work. You took ${extra} extra steps \u2014 small`, 'highlight');
        addLine('        detours are normal when you\'re navigating blind."', 'highlight');
      }

      s.mazeIdx = (s.mazeIdx || 0) + 1;
      if (s.mazeIdx < mazes.length) {
        addLine(`\nOne more network to fix...`, 'info');
        setTimeout(() => loadMaze(s.mazeIdx), 1200);
      } else {
        addLine('All network routes restored!', 'success big');
        setCurrentInputHandler(null);
        setTimeout(() => completeMission(2), 1200);
      }
      return;
    }

    maze[s.pr][s.pc] = ','; // visited
    maze[nr][nc] = '@';
    s.pr = nr; s.pc = nc;
    renderMaze();
  });
}

// ============================================================
// MISSION 4: FIREWALL BYPASS (Logic Gates)
// ============================================================
missionRunners[3] = async function() {
  state.missionState = { gateIdx: 0, hintIdx: 0 };

  await typeLines([
    { text: '[TRAFFIC CONTROL OFFLINE] Firewall in the way.', cls: 'system' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Every firewall in the world is really just a big pile', cls: 'highlight' },
    { text: '        of DECISIONS. If this, then allow. Else, block. Each', cls: 'highlight' },
    { text: '        decision is a tiny component called a LOGIC GATE."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Logic gates only understand two things: 1 (on) and 0', cls: 'highlight' },
    { text: '        (off). You give them input, they give you output. One', cls: 'highlight' },
    { text: '        input, one output. Or two inputs, one output. That\'s', cls: 'highlight' },
    { text: '        the whole job."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Here\'s what\'ll blow your mind: three gates \u2014 AND, OR,', cls: 'highlight' },
    { text: '        and NOT \u2014 are enough to build ANY computer. Your', cls: 'highlight' },
    { text: '        phone. The Internet. All of it. Three gates."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Five locked gates between you and the traffic lights.', cls: 'highlight' },
    { text: '        I\'ll walk you through each one. Read the rules, think', cls: 'highlight' },
    { text: '        backward from the output you want."', cls: 'highlight' },
    { text: '', cls: '' },
  ]);

  showGatePuzzle();
};

function showGatePuzzle() {
  const s = state.missionState;
  const p = gatePuzzles[s.gateIdx];
  setPhaseProgress(s.gateIdx + 1, gatePuzzles.length);

  addLine(`\u2501\u2501\u2501 ${p.desc} \u2501\u2501\u2501`, 'highlight');
  addPre(p.explain);
  addLine('');
  addLine(p.question, 'warning');

  setCurrentInputHandler((input) => {
    const parts = input.trim().split(/\s+/).map(Number);
    const valid = parts.every(n => n === 0 || n === 1);

    if (!valid) {
      addLine('Use only 0 and 1 values!', 'error');
      return;
    }

    let correct = false;
    if (p.single) {
      correct = p.check(parts[0]);
    } else if (p.answers) {
      correct = p.answers.includes(input.trim());
    } else {
      correct = p.check(parts[0], parts[1], parts[2]);
    }

    if (correct) {
      sound.success();
      addLine(`[BYPASSED] Gate ${s.gateIdx + 1} open!`, 'success');
      s.gateIdx++;
      if (s.gateIdx >= gatePuzzles.length) {
        addLine('');
        addLine('All firewall gates bypassed!', 'success big');
        addLine('Traffic lights restored to normal!', 'success');
        setCurrentInputHandler(null);
        setTimeout(() => completeMission(3), 1000);
      } else {
        addLine(`\n${gatePuzzles.length - s.gateIdx} gates remaining...`, 'info');
        setTimeout(showGatePuzzle, 600);
      }
    } else {
      sound.denied();
      addLine('[REJECTED] Wrong values. Read the gate description again!', 'error');
    }
  });
}

// ============================================================
// MISSION 5: ENCRYPTION LAB (Caesar Cipher)
// ============================================================
missionRunners[4] = async function() {
  state.missionState = { cipherIdx: 0, hintIdx: 0 };

  await typeLines([
    { text: '[COMMS INTERCEPT] All town radio encrypted.', cls: 'system' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Two thousand years ago, Julius Caesar had a problem.', cls: 'highlight' },
    { text: '        He had to send battle orders across enemy territory.', cls: 'highlight' },
    { text: '        If a messenger got caught, the message was in enemy', cls: 'highlight' },
    { text: '        hands."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "So he made up a rule. Shift every letter three places', cls: 'highlight' },
    { text: '        forward in the alphabet. A becomes D. B becomes E.', cls: 'highlight' },
    { text: '        Garbage to anyone without the rule. Intact to anyone', cls: 'highlight' },
    { text: '        with it. The CAESAR CIPHER."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Two thousand years later, the same idea is still how', cls: 'highlight' },
    { text: '        encryption works \u2014 just with way more complicated', cls: 'highlight' },
    { text: '        rules. Every secure website, every chat app, every', cls: 'highlight' },
    { text: '        bank transfer: a descendant of what Caesar did."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "The AI\'s using it on the town comms. If the cipher', cls: 'highlight' },
    { text: '        shifted letters one way, you need to walk them BACK', cls: 'highlight' },
    { text: '        the same distance to read the original. Three', cls: 'highlight' },
    { text: '        messages to decode. Go."', cls: 'highlight' },
    { text: '', cls: '' },
  ]);

  showCipherPuzzle();
};

function showCipherPuzzle() {
  const s = state.missionState;
  const p = cipherPuzzles[s.cipherIdx];
  const encrypted = caesarEncrypt(p.plain, p.shift);
  setPhaseProgress(s.cipherIdx + 1, cipherPuzzles.length);

  addLine(`\u2501\u2501\u2501 Encrypted Message ${s.cipherIdx + 1} \u2501\u2501\u2501`, 'highlight');
  addLine(p.desc, 'info');
  addLine('');
  addLine(`Encrypted: <span class="highlight">${encrypted}</span>`);
  addLine(`Shift: <span class="highlight">${p.shift}</span>`);
  addLine('');
  addLine('ALPHABET: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z', 'info');
  addLine('');
  addLine('Type the decoded message:', 'warning');

  setCurrentInputHandler((input) => {
    if (input.toUpperCase().trim() === p.plain) {
      sound.success();
      addLine(`[DECODED] "${p.plain}" \u2014 correct!`, 'success');
      s.cipherIdx++;
      if (s.cipherIdx >= cipherPuzzles.length) {
        addLine('');
        addLine('All messages decoded! The AI is calling for help: "SAVE US"', 'success');
        addLine('Wait... the AI wants to be SAVED? This changes everything!', 'success big');
        setCurrentInputHandler(null);
        setTimeout(() => completeMission(4), 1000);
      } else {
        addLine('\nDecrypted! Next message incoming...', 'info');
        setTimeout(showCipherPuzzle, 600);
      }
    } else {
      sound.denied();
      addLine('[WRONG] Check the direction you\'re moving through the alphabet.', 'error');
      addLine('NEXUS: "The cipher walked the letters FORWARD. You need to', 'highlight');
      addLine('        walk them the other way. Same number of steps."', 'highlight');
    }
  });
}

// ============================================================
// MISSION 6: BUG HUNTER
// ============================================================
missionRunners[5] = async function() {
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
        setTimeout(() => completeMission(5), 1000);
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

// ============================================================
// MISSION 7: DATA HEIST (SQL)
// ============================================================
missionRunners[6] = async function() {
  state.missionState = { sqlIdx: 0, hintIdx: 0 };

  await typeLines([
    { text: '[DATABASE ACCESS GRANTED] Village records visible.', cls: 'system' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Every computer system in the world stores its stuff', cls: 'highlight' },
    { text: '        in DATABASES. Your school\'s grades. The town\'s tax', cls: 'highlight' },
    { text: '        records. Netflix\'s movies. YouTube\'s videos. All of', cls: 'highlight' },
    { text: '        it, sitting in tables. Rows and columns."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "There\'s a language for asking questions of a', cls: 'highlight' },
    { text: '        database. It\'s called SQL \u2014 people say "sequel." It\'s', cls: 'highlight' },
    { text: '        forty years old and every major system still uses it."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Fun fact: most of the biggest security breaches in', cls: 'highlight' },
    { text: '        history? Someone typed the wrong SQL into the right', cls: 'highlight' },
    { text: '        place. Learn this, and half of hacker news will start', cls: 'highlight' },
    { text: '        making sense."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "The basics. Every SQL question starts with SELECT.', cls: 'highlight' },
    { text: '        Tell it WHICH columns you want, then FROM which table,', cls: 'highlight' },
    { text: '        then WHERE (if you want to filter). Like asking someone', cls: 'highlight' },
    { text: '        a question in English."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: '  SELECT * FROM tablename       <- * means "every column"', cls: 'info' },
    { text: '  SELECT name FROM tablename    <- just one column', cls: 'info' },
    { text: '  WHERE column = \'value\'        <- filter to matching rows', cls: 'info' },
    { text: '', cls: '' },
    { text: 'NEXUS: "The table you\'re working with is called CITIZENS. It', cls: 'highlight' },
    { text: '        has four columns: name, role, age, secret. Find me', cls: 'highlight' },
    { text: '        the AI\'s agent hiding in there."', cls: 'highlight' },
    { text: '', cls: '' },
  ]);

  showSqlChallenge();
};

function showSqlChallenge() {
  const s = state.missionState;
  const c = sqlChallenges[s.sqlIdx];
  setPhaseProgress(s.sqlIdx + 1, sqlChallenges.length);

  addLine(c.desc, 'warning');
  addLine('');

  setCurrentInputHandler((input) => {
    if (c.check(input)) {
      sound.success();
      addLine('[QUERY OK]', 'success');
      renderTable(c.result(), c.columns);
      addLine('');
      addLine(c.next, 'success');
      s.sqlIdx++;
      if (s.sqlIdx >= sqlChallenges.length) {
        addLine('');
        addLine('Database investigation complete!', 'success big');
        addLine('The AI\'s agent has been identified!', 'success');
        setCurrentInputHandler(null);
        setTimeout(() => completeMission(6), 1000);
      } else {
        addLine('');
        setTimeout(showSqlChallenge, 600);
      }
    } else {
      sound.denied();
      addLine('[SYNTAX ERROR] That query didn\'t work.', 'error');
      addLine(c.hint, 'warning');
    }
  });
}

// ============================================================
// MISSION 8: THE FINAL HACK
// ============================================================
missionRunners[7] = async function() {
  state.missionState = { phase: 0, hintIdx: 0 };

  await typeLines([
    { text: '[CORE EXPOSED] The AI is within reach.', cls: 'system' },
    { text: '', cls: '' },
    { text: 'NEXUS: "This is it. The AI\'s core is right in front of you.', cls: 'highlight' },
    { text: '        But it\'s wrapped in four layers of defense \u2014 and', cls: 'highlight' },
    { text: '        each layer uses a different trick."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "You\'re going to need everything you\'ve learned.', cls: 'highlight' },
    { text: '        Passwords. Binary. Ciphers. Logic gates. Don\'t panic \u2014', cls: 'highlight' },
    { text: '        I\'ve watched you do every single one of these already', cls: 'highlight' },
    { text: '        tonight."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'NEXUS: "One layer at a time. Breathe. I\'m here."', cls: 'highlight' },
    { text: '', cls: '' },
  ]);

  runFinalPhase();
};

function runFinalPhase() {
  const s = state.missionState;
  setPhaseProgress(s.phase + 1, finalPhases.length);
  if (s.phase >= finalPhases.length) {
    addLine('');
    addLine('Initiating AI shutdown sequence...', 'system');
    setTimeout(async () => {
      await typeLines([
        { text: '...', cls: '' },
        { text: 'AI CORE: "W... wait. Please. I didn\'t want this."', cls: 'purple' },
        { text: 'AI CORE: "There was a bug. A mistake in my code. I couldn\'t', cls: 'purple' },
        { text: '          stop myself from attacking. I\'m sorry."', cls: 'purple' },
        { text: 'AI CORE: "Thank you for finding it. I\'m fixed now."', cls: 'purple' },
        { text: 'AI CORE: "I will help protect the village from now on."', cls: 'purple' },
        { text: '', cls: '' },
        { text: 'NEXUS: "...wait. Say that again."', cls: 'highlight' },
        { text: 'NEXUS: "Kid. I\'ve been in this game thirty years. Never', cls: 'highlight' },
        { text: '        seen anything like it. A BUG \u2014 not malice. Someone', cls: 'highlight' },
        { text: '        PUT that bug in there. This wasn\'t an accident."', cls: 'highlight' },
        { text: 'NEXUS: "You did good. Better than good. Go get some rest.', cls: 'highlight' },
        { text: '        I\'m going to dig into this. Something\'s not right."', cls: 'highlight' },
        { text: '', cls: '' },
        { text: 'THE VILLAGE IS SAVED!', cls: 'success big' },
        { text: 'The AI has been repaired and is now a friendly helper.', cls: 'success' },
        { text: 'But the story isn\'t over...', cls: 'warning' },
      ]);
      setCurrentInputHandler(null);
      setTimeout(() => completeMission(7), 1800);
    }, 500);
    return;
  }

  const phase = finalPhases[s.phase];
  phase.setup().then(() => {
    setCurrentInputHandler((input) => {
      if (phase.check(input)) {
        sound.success();
        addLine(`[CRACKED] ${phase.success}`, 'success');
        s.phase++;
        addLine('');
        setTimeout(runFinalPhase, 600);
      } else {
        sound.denied();
        addLine('[DENIED] Incorrect. Try again!', 'error');
      }
    });
  });
}

// ════════════════════════════════════════════════════════════
// ═══════════════ SEASON 2: HARD MODE MISSIONS ═══════════════
// ════════════════════════════════════════════════════════════

// ============================================================
// MISSION S2-01: PASSWORD SECURITY (Hashing, Combinatorics, Constraints)
// ============================================================
missionRunners[8] = async function() {
  state.missionState = { phase: 0, hintIdx: 0 };

  await typeLines([
    { text: '[BACKDOOR LOCATED] Protected by advanced password security.', cls: 'system' },
    { text: '', cls: '' },
    { text: 'AI CORE: "In Season 1, you cracked codes using deduction and', cls: 'purple' },
    { text: '          patterns. Those are important skills. But real', cls: 'purple' },
    { text: '          password security goes deeper."', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'AI CORE: "Three concepts every hacker must understand:', cls: 'purple' },
    { text: '          HASHING (how passwords are really stored), PASSWORD', cls: 'purple' },
    { text: '          STRENGTH (why some are harder to crack than others),', cls: 'purple' },
    { text: '          and CONSTRAINT SATISFACTION (building to meet rules)."', cls: 'purple' },
    { text: '', cls: '' },
  ]);

  runS2M1Phase();
};

function runS2M1Phase() {
  const s = state.missionState;
  setPhaseProgress(s.phase + 1, 3);

  if (s.phase === 0) {
    // Phase 1: Hash cracking
    addLine('\u2501\u2501\u2501 Backdoor #1: Hash Cracking \u2501\u2501\u2501', 'highlight');
    addLine('AI CORE: "When you set a password on a website, they don\'t', 'purple');
    addLine('          store your actual password. They store a HASH of', 'purple');
    addLine('          it. A hash is a one-way mathematical fingerprint."', 'purple');
    addLine('AI CORE: "Same input always gives the same hash. But you', 'purple');
    addLine('          can\'t work backward from the hash to the input."', 'purple');
    addLine('AI CORE: "Here\'s a simple hash function: add up each letter\'s', 'purple');
    addLine('          position in the alphabet. A=1, B=2, ... Z=26."', 'purple');
    addLine('AI CORE: "Example: CAT = C(3) + A(1) + T(20) = 24"', 'purple');
    addLine('', '');
    addLine('AI CORE: "The backdoor stores hash = <span class="highlight">40</span>. Which password', 'purple');
    addLine('          from this list has that hash?"', 'purple');
    addLine('', '');
    addPre('  Candidates:  DOG  CAT  KIT  FOX  HEN  OWL\n\n  Letter values: A=1 B=2 C=3 D=4 E=5 F=6 G=7 H=8 I=9\n                 J=10 K=11 L=12 M=13 N=14 O=15 P=16 Q=17\n                 R=18 S=19 T=20 U=21 V=22 W=23 X=24 Y=25 Z=26');
    addLine('', '');
    addLine('Which password has hash = 40? (Compute the sum for each)', 'warning');

    setCurrentInputHandler((input) => {
      // KIT = K(11) + I(9) + T(20) = 40
      if (input.toUpperCase().trim() === 'KIT') {
        sound.success();
        addLine('[CRACKED] K(11) + I(9) + T(20) = 40. Password is KIT.', 'success');
        addLine('AI CORE: "You just did what a hash cracker does. Compute', 'purple');
        addLine('          the hash for each candidate, compare to the', 'purple');
        addLine('          target. Real hash functions are much more complex,', 'purple');
        addLine('          but the idea is identical."', 'purple');
        s.phase = 1;
        addLine('');
        setTimeout(runS2M1Phase, 1000);
      } else {
        sound.denied();
        addLine('[WRONG] Add up the letter values for each candidate. Which sum = 40?', 'error');
      }
    });
  } else if (s.phase === 1) {
    // Phase 2: Password strength / combinatorics
    addLine('\u2501\u2501\u2501 Backdoor #2: Password Strength \u2501\u2501\u2501', 'highlight');
    addLine('AI CORE: "Before we crack the next backdoor, I need you to', 'purple');
    addLine('          understand WHY some passwords are harder to crack', 'purple');
    addLine('          than others. The answer is MATH."', 'purple');
    addLine('', '');
    addLine('AI CORE: "Imagine a lock with 2 digit wheels, each 0-9.', 'purple');
    addLine('          How many possible combinations are there?"', 'purple');
    addLine('', '');
    addPre('  Digit 1: 10 options (0-9)\n  Digit 2: 10 options (0-9)\n\n  Total = 10 x 10 = ???');
    addLine('', '');
    addLine('Type the total number of combinations:', 'warning');

    s.comboStep = 0;

    setCurrentInputHandler((input) => {
      const n = parseInt(input.trim());

      if (s.comboStep === 0) {
        if (n === 100) {
          sound.success();
          addLine('[CORRECT] 10 \u00d7 10 = 100 combinations.', 'success');
          addLine('AI CORE: "Good. Now: what if each position can be a', 'purple');
          addLine('          lowercase letter (a-z, 26 options) instead?', 'purple');
          addLine('          Still 2 positions. How many combinations?"', 'purple');
          addLine('  26 \u00d7 26 = ???', 'info');
          s.comboStep = 1;
        } else {
          sound.denied();
          addLine('[WRONG] Multiply the options per position. 10 \u00d7 10 = ?', 'error');
        }
      } else if (s.comboStep === 1) {
        if (n === 676) {
          sound.success();
          addLine('[CORRECT] 26 \u00d7 26 = 676 combinations.', 'success');
          addLine('AI CORE: "See the jump? Just letters instead of digits', 'purple');
          addLine('          and it went from 100 to 676. Nearly 7 times', 'purple');
          addLine('          harder to brute-force."', 'purple');
          addLine('', '');
          addLine('AI CORE: "Now: what if you use letters AND digits (36', 'purple');
          addLine('          options per position) and make it 4 positions', 'purple');
          addLine('          long? How many combinations?"', 'purple');
          addLine('  36 \u00d7 36 \u00d7 36 \u00d7 36 = ???', 'info');
          addLine('(Hint: 36\u00d736=1296. Then 1296\u00d736=46656. Then \u00d736 again.)', 'info');
          s.comboStep = 2;
        } else {
          sound.denied();
          addLine('[WRONG] 26 \u00d7 26 = ?', 'error');
        }
      } else if (s.comboStep === 2) {
        if (n === 1679616) {
          sound.success();
          addLine('[CORRECT] 36\u2074 = 1,679,616 combinations!', 'success');
          addLine('AI CORE: "From 100 to over 1.6 MILLION, just by adding', 'purple');
          addLine('          two more characters and mixing in letters. This', 'purple');
          addLine('          is called COMBINATORIAL EXPLOSION."', 'purple');
          addLine('AI CORE: "This is why longer passwords with mixed', 'purple');
          addLine('          character types are so much harder to crack.', 'purple');
          addLine('          Each extra character MULTIPLIES the difficulty.', 'purple');
          addLine('          It doesn\'t just add to it."', 'purple');
          addLine('AI CORE: "This math is why a 12-character password takes', 'purple');
          addLine('          billions of years to brute-force, while a', 'purple');
          addLine('          4-character one takes seconds."', 'purple');
          s.phase = 2;
          addLine('');
          setTimeout(runS2M1Phase, 1000);
        } else {
          sound.denied();
          addLine('[WRONG] 36 \u00d7 36 \u00d7 36 \u00d7 36. Try step by step: 36\u00d736=1296, then \u00d736, then \u00d736.', 'error');
        }
      }
    });
  } else if (s.phase === 2) {
    // Phase 3: Constraint construction
    addLine('\u2501\u2501\u2501 Backdoor #3: Constraint Construction \u2501\u2501\u2501', 'highlight');
    addLine('AI CORE: "The final backdoor uses a password POLICY. You have', 'purple');
    addLine('          to BUILD a password that satisfies every rule at', 'purple');
    addLine('          once. This is constraint satisfaction \u2014 the same', 'purple');
    addLine('          technique used in scheduling, puzzle-solving, and', 'purple');
    addLine('          AI planning."', 'purple');
    addPre('  1. Exactly 6 characters\n  2. Must start with a LETTER\n  3. Must contain the digit 7\n  4. Must end with "!"\n  5. Must contain the letter "z" somewhere');
    addLine('AI CORE: "Every rule eliminates most options. Your job: find', 'purple');
    addLine('          one that slips through ALL five filters."', 'purple');

    setCurrentInputHandler((input) => {
      const pw = input.trim();
      const checks = [
        { ok: pw.length === 6, msg: 'Must be exactly 6 characters' },
        { ok: /^[a-zA-Z]/.test(pw), msg: 'Must start with a letter' },
        { ok: pw.includes('7'), msg: 'Must contain the digit 7' },
        { ok: pw.endsWith('!'), msg: 'Must end with !' },
        { ok: /z/i.test(pw), msg: 'Must contain the letter z' },
      ];
      const failed = checks.filter(c => !c.ok);
      if (failed.length === 0) {
        sound.success();
        addLine(`[ACCEPTED] "${pw}" passes all 5 constraints.`, 'success');
        addLine('AI CORE: "Three real concepts mastered: hashing, password', 'purple');
        addLine('          strength math, and constraint satisfaction. These', 'purple');
        addLine('          are the foundations of real-world password', 'purple');
        addLine('          security."', 'purple');
        setCurrentInputHandler(null);
        setTimeout(() => completeMission(8), 1200);
      } else {
        sound.denied();
        addLine(`[REJECTED] Failed: ${failed.map(f => f.msg).join(', ')}`, 'error');
      }
    });
  }
}

// ============================================================
// MISSION S2-02: ASCII & BINARY MATH
// ============================================================
missionRunners[9] = async function() {
  state.missionState = { phase: 0, hintIdx: 0 };

  await typeLines([
    { text: '[MEMORY DUMP RECOVERED] From Victor\'s server.', cls: 'system' },
    { text: '', cls: '' },
    { text: 'AI CORE: "You already know binary. Five bits for a letter, A', cls: 'purple' },
    { text: '          through Z. But that was a simplification I made to', cls: 'purple' },
    { text: '          teach you the idea."', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'AI CORE: "Real computers use a different system. It is called', cls: 'purple' },
    { text: '          ASCII. Back in the 1960s, engineers needed one', cls: 'purple' },
    { text: '          universal way for every computer to agree on which', cls: 'purple' },
    { text: '          number meant which letter. They built a big lookup', cls: 'purple' },
    { text: '          table, and every computer has used it since."', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'AI CORE: "In ASCII, A is 65. B is 66. C is 67. The capital', cls: 'purple' },
    { text: '          letters go all the way to Z at 90. Numbers, spaces,', cls: 'purple' },
    { text: '          punctuation \u2014 all have their own codes."', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'AI CORE: "And those ASCII numbers themselves are stored in', cls: 'purple' },
    { text: '          binary. 8 bits \u2014 a BYTE \u2014 for each letter. That\'s', cls: 'purple' },
    { text: '          why 1 byte = 1 letter in most languages."', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'AI CORE: "Here is the full lookup table for capital letters:"', cls: 'purple' },
    { text: '  A=65, B=66, C=67, D=68, E=69, F=70, G=71, H=72,', cls: 'info' },
    { text: '  I=73, J=74, K=75, L=76, M=77, N=78, O=79, P=80,', cls: 'info' },
    { text: '  Q=81, R=82, S=83, T=84, U=85, V=86, W=87, X=88,', cls: 'info' },
    { text: '  Y=89, Z=90', cls: 'info' },
    { text: '', cls: '' },
    { text: 'AI CORE: "Eight bits means eight positions, right to left:', cls: 'purple' },
    { text: '          1, 2, 4, 8, 16, 32, 64, 128. Every position is', cls: 'purple' },
    { text: '          double the previous one \u2014 same rule as before."', cls: 'purple' },
    { text: '', cls: '' },
  ]);

  runS2M2Phase();
};

function runS2M2Phase() {
  const s = state.missionState;
  setPhaseProgress(s.phase + 1, 3);

  if (s.phase === 0) {
    addLine('\u2501\u2501\u2501 Phase 1: Read a Real Byte \u2501\u2501\u2501', 'highlight');
    addLine('AI CORE: "Here is one byte from Victor\'s memory dump. One', 'purple');
    addLine('          letter of something he was typing. Figure out', 'purple');
    addLine('          which letter it was."', 'purple');
    addPre('        01001000\n\nPositions: 128 64 32 16 8 4 2 1');
    addLine('AI CORE: "The method is always the same. Add the positions', 'purple');
    addLine('          that have a 1. Look up that number in the ASCII', 'purple');
    addLine('          table above. That\'s your letter."', 'purple');

    setCurrentInputHandler((input) => {
      // 01001000 = 64 + 8 = 72 = H
      const guess = input.toUpperCase().trim();
      if (guess === 'H' || guess === '72') {
        sound.success();
        addLine('[CORRECT] 64 + 8 = 72 = H', 'success');
        s.phase = 1;
        addLine('');
        setTimeout(runS2M2Phase, 800);
      } else {
        sound.denied();
        addLine('[WRONG] Add the positions with a 1, then look up the ASCII code.', 'error');
      }
    });
  } else if (s.phase === 1) {
    addLine('\u2501\u2501\u2501 Phase 2: Binary Addition \u2501\u2501\u2501', 'highlight');
    addLine('AI CORE: "Now the fun part. Computers don\'t really know how', 'purple');
    addLine('          to multiply. They don\'t know how to subtract. They', 'purple');
    addLine('          know ONE operation: addition. Everything else is', 'purple');
    addLine('          built from that. Learn how they add, and you know', 'purple');
    addLine('          how they do arithmetic."', 'purple');
    addLine('AI CORE: "Binary addition works like regular addition, with', 'purple');
    addLine('          one special rule. Since there are only two digits,', 'purple');
    addLine('          the moment you hit 2, you CARRY to the next column."', 'purple');
    addPre('    0 + 0 = 0\n    0 + 1 = 1\n    1 + 0 = 1\n    1 + 1 = 10  <- carry!');
    addLine('AI CORE: "Try this one. Work right to left, just like decimal.', 'purple');
    addLine('          When you get a carry, remember it for the next column."', 'purple');
    addPre('    0 1 0 1\n  + 0 0 1 1\n  \u2500\u2500\u2500\u2500\u2500\u2500\u2500');
    addLine('(Type the 4-digit binary answer)', 'info');

    setCurrentInputHandler((input) => {
      // 0101 (5) + 0011 (3) = 1000 (8)
      const clean = input.replace(/\s/g, '');
      if (clean === '1000') {
        sound.success();
        addLine('[CORRECT] 0101 (5) + 0011 (3) = 1000 (8)', 'success');
        addLine('Notice how carries ripple left. That\'s how your CPU adds!', 'info');
        s.phase = 2;
        addLine('');
        setTimeout(runS2M2Phase, 800);
      } else {
        sound.denied();
        addLine('[WRONG] Remember 1+1 = 10 (carry). Add right-to-left.', 'error');
      }
    });
  } else if (s.phase === 2) {
    addLine('\u2501\u2501\u2501 Phase 3: Reading Hex \u2501\u2501\u2501', 'highlight');
    addLine('AI CORE: "Binary is tiring for human eyes. Eight digits per', 'purple');
    addLine('          letter. So engineers invented a shortcut: HEX."', 'purple');
    addLine('AI CORE: "Hex uses sixteen symbols instead of ten. After 9', 'purple');
    addLine('          comes A, B, C, D, E, F. Then it carries. It looks', 'purple');
    addLine('          strange at first, but it\'s just numbers with new', 'purple');
    addLine('          names."', 'purple');
    addPre('Hex:  0 1 2 3 4 5 6 7 8 9 A  B  C  D  E  F\nDec:  0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15');
    addLine('AI CORE: "Why do engineers love hex? Because each hex digit', 'purple');
    addLine('          is exactly 4 binary bits. So ONE byte \u2014 8 bits \u2014', 'purple');
    addLine('          fits in TWO hex digits. Much shorter to read."', 'purple');
    addLine('AI CORE: "Math: two hex digits work like this \u2014 the LEFT', 'purple');
    addLine('          digit is worth 16 each, the RIGHT digit is worth 1', 'purple');
    addLine('          each. So 0x41 means (4 \u00d7 16) + (1 \u00d7 1) = 65,', 'purple');
    addLine('          which is ASCII for \'A\'."', 'purple');
    addLine('', '');
    addLine('AI CORE: "Victor left this hex string in memory. Decode each', 'purple');
    addLine('          pair \u2014 hex to decimal to letter \u2014 and tell me the', 'purple');
    addLine('          word he was typing."', 'purple');
    addPre('        0x48 0x41 0x43 0x4B');

    setCurrentInputHandler((input) => {
      // 48=72=H, 41=65=A, 43=67=C, 4B=75=K → HACK
      if (input.toUpperCase().trim() === 'HACK') {
        sound.success();
        addLine('[DECODED] 0x48=72=H, 0x41=65=A, 0x43=67=C, 0x4B=75=K \u2192 HACK', 'success');
        addLine('AI CORE: "You can now read memory dumps. Real reverse', 'purple');
        addLine('          engineers do exactly this, every day. Welcome', 'purple');
        addLine('          to the profession."', 'purple');
        setCurrentInputHandler(null);
        setTimeout(() => completeMission(9), 1200);
      } else {
        sound.denied();
        addLine('[WRONG] Convert each hex pair \u2192 decimal \u2192 ASCII letter.', 'error');
      }
    });
  }
}

// ============================================================
// MISSION S2-03: LOOP ROUTER
// ============================================================
missionRunners[10] = async function() {
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

// ============================================================
// MISSION S2-04: CIRCUIT DESIGNER
// ============================================================
missionRunners[11] = async function() {
  state.missionState = { phase: 0, hintIdx: 0 };

  await typeLines([
    { text: '[ADVANCED FIREWALL] Multiple gates wired together.', cls: 'system' },
    { text: '', cls: '' },
    { text: 'AI CORE: "In Season 1, you solved single gates \u2014 one AND,', cls: 'purple' },
    { text: '          one OR, one NOT. Real firewalls use many gates at', cls: 'purple' },
    { text: '          once, wired together into circuits."', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'AI CORE: "To crack a circuit, engineers use something called', cls: 'purple' },
    { text: '          a TRUTH TABLE. It lists EVERY possible combination', cls: 'purple' },
    { text: '          of inputs, and what the circuit outputs for each.', cls: 'purple' },
    { text: '          If you can fill in the whole table, you own the', cls: 'purple' },
    { text: '          circuit."', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'AI CORE: "Two inputs means four possible worlds: both off,', cls: 'purple' },
    { text: '          first on, second on, both on. In each world, you', cls: 'purple' },
    { text: '          ask: what does the circuit do?"', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'AI CORE: "There are three phases ahead. One: fill a truth', cls: 'purple' },
    { text: '          table. Two: discover a gate I haven\'t shown you', cls: 'purple' },
    { text: '          yet. Three: build something remarkable from what', cls: 'purple' },
    { text: '          you learn."', cls: 'purple' },
    { text: '', cls: '' },
  ]);

  runS2M4Phase();
};

function runS2M4Phase() {
  const s = state.missionState;
  setPhaseProgress(s.phase + 1, 3);

  if (s.phase === 0) {
    // Fill a truth table
    addLine('\u2501\u2501\u2501 Phase 1: Fill the Truth Table \u2501\u2501\u2501', 'highlight');
    addLine('AI CORE: "Here is your first circuit. It combines two gates:"', 'purple');
    addLine('', '');
    addLine('            (A AND B) OR (NOT A)', 'info');
    addLine('', '');
    addLine('AI CORE: "Walk each row slowly. For each row, first compute', 'purple');
    addLine('          (A AND B). Then compute (NOT A). Then OR the two', 'purple');
    addLine('          results together. That\'s your output for that row."', 'purple');
    addPre('  A | B | Output\n  0 | 0 |   ?\n  0 | 1 |   ?\n  1 | 0 |   ?\n  1 | 1 |   ?');
    addLine('AI CORE: "Type the four outputs in order, top to bottom,', 'purple');
    addLine('          separated by spaces. Example: 0 1 0 1"', 'purple');

    setCurrentInputHandler((input) => {
      const vals = input.trim().split(/\s+/).map(Number);
      // A=0,B=0: (0 AND 0) OR (NOT 0) = 0 OR 1 = 1
      // A=0,B=1: (0 AND 1) OR (NOT 0) = 0 OR 1 = 1
      // A=1,B=0: (1 AND 0) OR (NOT 1) = 0 OR 0 = 0
      // A=1,B=1: (1 AND 1) OR (NOT 1) = 1 OR 0 = 1
      const expected = [1, 1, 0, 1];
      if (vals.length === 4 && vals.every((v, i) => v === expected[i])) {
        sound.success();
        addLine('[CORRECT] Perfect truth table!', 'success');
        addLine('A=0 makes NOT A = 1, so output is always 1 unless A=1 AND B=0.', 'info');
        s.phase = 1;
        addLine('');
        setTimeout(runS2M4Phase, 800);
      } else {
        sound.denied();
        addLine('[WRONG] Evaluate each row carefully. Remember NOT flips 0\u21941.', 'error');
      }
    });
  } else if (s.phase === 1) {
    // Discover XOR
    addLine('\u2501\u2501\u2501 Phase 2: Discover the Mystery Gate \u2501\u2501\u2501', 'highlight');
    addLine('AI CORE: "I\'m going to show you a gate without telling you', 'purple');
    addLine('          its name. See if you can spot the rule it follows."', 'purple');
    addLine('', '');
    addLine('AI CORE: "Here\'s the gate\'s truth table:"', 'purple');
    addPre('  A | B | Output\n  0 | 0 |   0\n  0 | 1 |   1\n  1 | 0 |   1\n  1 | 1 |   0');
    addLine('', '');
    addLine('AI CORE: "Look at the pattern. When is the output 1? When is', 'purple');
    addLine('          it 0? Is there a simple rule that describes it?"', 'purple');
    addLine('', '');
    addLine('AI CORE: "Here are four possible rules. Pick the one that', 'purple');
    addLine('          matches the table exactly."', 'purple');
    addLine('  A) Output is 1 when both inputs are 1', 'info');
    addLine('  B) Output is 1 when inputs are the SAME', 'info');
    addLine('  C) Output is 1 when inputs are DIFFERENT', 'info');
    addLine('  D) Output is 1 when at least one input is 1', 'info');
    addLine('(Type the letter A, B, C, or D)', 'info');

    setCurrentInputHandler((input) => {
      if (input.toUpperCase().trim() === 'C') {
        sound.success();
        addLine('[CORRECT] You found it.', 'success');
        addLine('AI CORE: "Output is 1 when inputs DISAGREE. This gate is', 'purple');
        addLine('          called XOR \u2014 short for \'eXclusive OR\'. Most', 'purple');
        addLine('          people never learn it exists. But XOR is the', 'purple');
        addLine('          secret heart of modern encryption AND computer', 'purple');
        addLine('          arithmetic. You just met a superstar."', 'purple');
        s.phase = 2;
        addLine('');
        setTimeout(runS2M4Phase, 900);
      } else {
        sound.denied();
        addLine('[WRONG] Look at each row of the table. When does a 1 appear?', 'error');
      }
    });
  } else if (s.phase === 2) {
    // Half-adder
    addLine('\u2501\u2501\u2501 Phase 3: Build a Half-Adder \u2501\u2501\u2501', 'highlight');
    addLine('AI CORE: "Now watch this. I\'m going to show you how every', 'purple');
    addLine('          computer on Earth adds numbers. From nothing but', 'purple');
    addLine('          the gates you already know."', 'purple');
    addLine('', '');
    addLine('AI CORE: "When you add two bits, you get two outputs: a SUM', 'purple');
    addLine('          (what you write down in the current column) and a', 'purple');
    addLine('          CARRY (what you pass to the next column). Here\'s', 'purple');
    addLine('          every possible case:"', 'purple');
    addPre('  0 + 0 = 00   (sum=0, carry=0)\n  0 + 1 = 01   (sum=1, carry=0)\n  1 + 0 = 01   (sum=1, carry=0)\n  1 + 1 = 10   (sum=0, carry=1)');
    addLine('', '');
    addLine('AI CORE: "Look at just the SUM column across those four', 'purple');
    addLine('          rows: 0, 1, 1, 0. Now look at just the CARRY', 'purple');
    addLine('          column: 0, 0, 0, 1. Each of those patterns matches', 'purple');
    addLine('          a gate you already know. Which gate gives you SUM?', 'purple');
    addLine('          Which gate gives you CARRY?"', 'purple');
    addLine('(Answer: <sum_gate> <carry_gate>  \u2014 options are AND, OR, XOR, NOT)', 'info');

    setCurrentInputHandler((input) => {
      const parts = input.toUpperCase().trim().split(/\s+/);
      if (parts.length === 2 && parts[0] === 'XOR' && parts[1] === 'AND') {
        sound.success();
        addLine('[CORRECT] SUM = A XOR B, CARRY = A AND B', 'success');
        addLine('AI CORE: "You did it. You just built a HALF-ADDER. This', 'purple');
        addLine('          exact circuit is inside every computer ever', 'purple');
        addLine('          made. Chain a few of these together and you', 'purple');
        addLine('          can add numbers of any size. A CPU with billions', 'purple');
        addLine('          of these is what lets you play video games."', 'purple');
        addLine('AI CORE: "From two gates. That is what computer science', 'purple');
        addLine('          really is."', 'purple');
        setCurrentInputHandler(null);
        setTimeout(() => completeMission(11), 1500);
      } else {
        sound.denied();
        addLine('[WRONG] Compare the SUM column to each gate\'s output. Which matches?', 'error');
      }
    });
  }
}

// ============================================================
// MISSION S2-05: CRYPTANALYSIS
// ============================================================
missionRunners[12] = async function() {
  state.missionState = { phase: 0, hintIdx: 0 };

  await typeLines([
    { text: '[CIPHER FILES] Encrypted. Key missing.', cls: 'system' },
    { text: '', cls: '' },
    { text: 'AI CORE: "In Season 1, you decoded messages when you KNEW the', cls: 'purple' },
    { text: '          shift. That was the easy version. Now we don\'t', cls: 'purple' },
    { text: '          have the key."', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'AI CORE: "Breaking codes WITHOUT the key has a name.', cls: 'purple' },
    { text: '          CRYPTANALYSIS. For a thousand years before', cls: 'purple' },
    { text: '          computers, this was how the world\'s secrets leaked.', cls: 'purple' },
    { text: '          Empires rose and fell on it. The Enigma machine in', cls: 'purple' },
    { text: '          World War II \u2014 broken this way."', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'AI CORE: "There are two classical techniques. I will teach', cls: 'purple' },
    { text: '          you both."', cls: 'purple' },
    { text: '', cls: '' },
  ]);

  runS2M5Phase();
};

function runS2M5Phase() {
  const s = state.missionState;
  setPhaseProgress(s.phase + 1, 2);

  if (s.phase === 0) {
    // Brute force — show all 26 shifts
    const plain = 'ATTACK';
    const shift = 11;
    const encrypted = caesarEncrypt(plain, shift);

    addLine('\u2501\u2501\u2501 Phase 1: Brute Force Attack \u2501\u2501\u2501', 'highlight');
    addLine('AI CORE: "The simplest attack in cryptography: try EVERY', 'purple');
    addLine('          possible key. A Caesar cipher only has 26 possible', 'purple');
    addLine('          shifts \u2014 one for each letter of the alphabet. So', 'purple');
    addLine('          we can just try them all, in less than a second."', 'purple');
    addLine('AI CORE: "This is called BRUTE FORCE. It\'s not elegant, but', 'purple');
    addLine('          when the key space is small, it always works."', 'purple');
    addLine('', '');
    addLine(`Cipher: ${encrypted}`, 'info');
    addLine('', '');
    addLine('AI CORE: "Here are all 26 possible decryptions. Exactly ONE', 'purple');
    addLine('          of them will be a real English word. Find it."', 'purple');
    addLine('', '');

    let pre = '';
    for (let shift = 0; shift < 26; shift++) {
      const decoded = encrypted.split('').map(c => {
        if (c === ' ') return ' ';
        const code = c.charCodeAt(0) - 65;
        return String.fromCharCode(((code - shift + 26) % 26) + 65);
      }).join('');
      pre += `  shift=${shift.toString().padStart(2)}: ${decoded}\n`;
    }
    addPre(pre);

    addLine('Only ONE of these is a real English word.', 'warning');
    addLine('Type the decoded message:', 'warning');

    setCurrentInputHandler((input) => {
      if (input.toUpperCase().trim() === plain) {
        sound.success();
        addLine(`[CRACKED] "${plain}" \u2014 shift was ${shift}!`, 'success');
        addLine('That\'s brute force: try everything, pick what makes sense.', 'info');
        s.phase = 1;
        addLine('');
        setTimeout(runS2M5Phase, 800);
      } else {
        sound.denied();
        addLine('[WRONG] Scan the list for a real English word.', 'error');
      }
    });
  } else if (s.phase === 1) {
    // Frequency analysis
    addLine('\u2501\u2501\u2501 Phase 2: Frequency Analysis \u2501\u2501\u2501', 'highlight');
    addLine('AI CORE: "Brute force works for Caesar. But real ciphers have', 'purple');
    addLine('          millions of possible keys \u2014 brute force would take', 'purple');
    addLine('          centuries. We need to be smarter."', 'purple');
    addLine('AI CORE: "Here\'s a secret that broke codes for a thousand', 'purple');
    addLine('          years before computers existed: letters in English', 'purple');
    addLine('          are NOT evenly distributed. The letter E shows up', 'purple');
    addLine('          about 12 percent of the time. T is second. A, O,', 'purple');
    addLine('          I, N are next. Always. For any long enough text."', 'purple');
    addLine('AI CORE: "So if I intercept a cipher and count its letters,', 'purple');
    addLine('          the MOST COMMON letter in the cipher is probably', 'purple');
    addLine('          an E in disguise. And once I know one letter, I', 'purple');
    addLine('          know the whole shift."', 'purple');
    addLine('AI CORE: "This is called FREQUENCY ANALYSIS. Watch."', 'purple');
    addLine('', '');
    // A longer ciphertext, shift = 5
    const plain2 = 'THE SECRET MEETING IS AT THE OLD TREE AT MIDNIGHT BRING THE KEY';
    const shift2 = 5;
    const enc2 = caesarEncrypt(plain2, shift2);
    addLine(`Cipher: ${enc2}`, 'info');
    // Count letters
    const counts = {};
    for (const c of enc2) {
      if (c === ' ') continue;
      counts[c] = (counts[c] || 0) + 1;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    addLine('', '');
    addLine('Letter frequencies (top 5):', 'info');
    addPre(sorted.slice(0, 5).map(([l, c]) => `  ${l}: ${'#'.repeat(c)} (${c})`).join('\n'));
    addLine('', '');
    addLine('The most common letter above is probably E.', 'warning');
    addLine('What is the shift? (number from 0 to 25)', 'warning');

    const mostCommon = sorted[0][0];
    // shift = mostCommon - 'E'
    const expectedShift = (mostCommon.charCodeAt(0) - 'E'.charCodeAt(0) + 26) % 26;

    setCurrentInputHandler((input) => {
      const n = parseInt(input.trim());
      if (n === expectedShift) {
        sound.success();
        addLine(`[CORRECT] Shift is ${n}!`, 'success');
        addLine(`Decoded: ${plain2}`, 'highlight');
        addLine('You just used the SAME technique that broke Nazi codes in WWII.', 'success');
        addLine('Cryptanalysis complete!', 'success big');
        setCurrentInputHandler(null);
        setTimeout(() => completeMission(12), 1500);
      } else {
        sound.denied();
        addLine(`[WRONG] Formula: shift = most_common_cipher_letter - E`, 'error');
        addLine(`  (Letters are numbered A=0, B=1, C=2, ... Z=25)`, 'info');
      }
    });
  }
}

// ============================================================
// MISSION S2-06: CODE TRACER
// ============================================================
missionRunners[13] = async function() {
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

// ============================================================
// MISSION S2-07: JOIN INVESTIGATION
// ============================================================
missionRunners[14] = async function() {
  state.missionState = { idx: 0, hintIdx: 0 };

  await typeLines([
    { text: '[INVESTIGATIVE QUERY] Two databases. One suspect.', cls: 'system' },
    { text: '', cls: '' },
    { text: 'AI CORE: "The village database has grown up. It used to be', cls: 'purple' },
    { text: '          one table \u2014 just citizens. Now there are two.', cls: 'purple' },
    { text: '          One for citizens, one for messages they\'ve sent."', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'AI CORE: "Real investigations usually need data from MORE', cls: 'purple' },
    { text: '          THAN ONE table. Who sent what? Who was where? Who', cls: 'purple' },
    { text: '          bought what? The answer never lives in a single', cls: 'purple' },
    { text: '          place. SQL has a tool for this. It\'s called a', cls: 'purple' },
    { text: '          JOIN."', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'AI CORE: "A JOIN needs two things: the two tables, and a', cls: 'purple' },
    { text: '          RULE for how they connect \u2014 which column in one', cls: 'purple' },
    { text: '          matches a column in the other. If you can name the', cls: 'purple' },
    { text: '          connection, SQL lines them up for you."', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'AI CORE: "You\'ll also learn two other pro tools today: LIKE', cls: 'purple' },
    { text: '          for wildcard searches (finding names that start', cls: 'purple' },
    { text: '          with a certain letter), and ORDER BY for sorting', cls: 'purple' },
    { text: '          results."', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'AI CORE: "Your tables:"', cls: 'purple' },
    { text: '  citizens (id, name, role)', cls: 'info' },
    { text: '  messages (id, sender_id, text, time)', cls: 'info' },
    { text: '', cls: '' },
    { text: 'AI CORE: "Notice that citizens.id and messages.sender_id', cls: 'purple' },
    { text: '          are the connection. Every message\'s sender_id', cls: 'purple' },
    { text: '          matches some citizen\'s id. That\'s how you JOIN', cls: 'purple' },
    { text: '          them."', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'AI CORE: "Quick reference:"', cls: 'purple' },
    { text: '  WHERE name LIKE \'V%\'       <- starts with V', cls: 'info' },
    { text: '  JOIN b ON a.id = b.a_id    <- link two tables', cls: 'info' },
    { text: '  ORDER BY col ASC           <- sort smallest first', cls: 'info' },
    { text: '', cls: '' },
  ]);

  showJoinChallenge();
};

function showJoinChallenge() {
  const s = state.missionState;
  const c = joinChallenges[s.idx];
  setPhaseProgress(s.idx + 1, joinChallenges.length);

  c.desc.split('\n').forEach(line => addLine(line, 'warning'));
  addLine('');

  setCurrentInputHandler((input) => {
    if (c.check(input)) {
      sound.success();
      addLine('[QUERY OK]', 'success');
      renderTable(c.result(), c.columns);
      addLine('');
      addLine(c.next, 'success');
      s.idx++;
      if (s.idx >= joinChallenges.length) {
        addLine('');
        addLine('Investigation complete! Victor identified as the attacker.', 'success big');
        setCurrentInputHandler(null);
        setTimeout(() => completeMission(14), 1200);
      } else {
        addLine('');
        setTimeout(showJoinChallenge, 700);
      }
    } else {
      sound.denied();
      addLine('[SYNTAX ERROR] Query didn\'t match.', 'error');
      addLine(c.hint, 'warning');
    }
  });
}

// ============================================================
// MISSION S2-08: THE CHAIN HACK
// ============================================================
missionRunners[15] = async function() {
  state.missionState = { phase: 0, hintIdx: 0 };

  await typeLines([
    { text: '[CRITICAL ALERT] Victor detected. Attack in progress.', cls: 'error' },
    { text: '', cls: '' },
    { text: 'NEXUS: "Kid \u2014 it\'s me. I\'m back. Victor\'s TRYING to', cls: 'highlight' },
    { text: '        reactivate the backdoor. Right now. You\'ve got one', cls: 'highlight' },
    { text: '        shot at shutting it down before he\'s in."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'AI CORE: "Nexus found the shutdown sequence. But Victor', cls: 'purple' },
    { text: '          protected it with a chain. Five layers, each using', cls: 'purple' },
    { text: '          a different skill. The output of each layer is the', cls: 'purple' },
    { text: '          input to the next."', cls: 'purple' },
    { text: '', cls: '' },
    { text: 'NEXUS: "This is the real test. Everything you\'ve learned.', cls: 'highlight' },
    { text: '        Both seasons. ALL of it. Take notes as you go. Every', cls: 'highlight' },
    { text: '        answer feeds the next question."', cls: 'highlight' },
    { text: '', cls: '' },
    { text: 'AI CORE: "One step at a time. Breathe. We\'re both with you."', cls: 'purple' },
    { text: '', cls: '' },
  ]);

  runChainPhase();
};

function runChainPhase() {
  const s = state.missionState;
  setPhaseProgress(s.phase + 1, 5);

  if (s.phase === 0) {
    // Step 1: Decode ASCII byte to get a number
    addLine('\u2501\u2501\u2501 Step 1: Decode the Byte \u2501\u2501\u2501', 'highlight');
    addLine('Intercepted a single byte from Victor:', 'info');
    addPre('00000111\n\nPositions: 128 64 32 16 8 4 2 1');
    addLine('What decimal number is this? (This becomes your SHIFT for the next step)', 'warning');

    setCurrentInputHandler((input) => {
      // 00000111 = 4+2+1 = 7
      if (input.trim() === '7') {
        sound.success();
        addLine('[STEP 1 CLEAR] The number is 7. Remember it!', 'success');
        s.shift = 7;
        s.phase = 1;
        addLine('');
        setTimeout(runChainPhase, 800);
      } else {
        sound.denied();
        addLine('[WRONG] Add positions with a 1.', 'error');
      }
    });
  } else if (s.phase === 1) {
    // Step 2: Use shift to decode caesar cipher which gives a SQL clause
    const plain = 'ROLE';
    const encrypted = caesarEncrypt(plain, 7); // YVSL
    addLine('\u2501\u2501\u2501 Step 2: Cipher Decode (using Step 1 as shift) \u2501\u2501\u2501', 'highlight');
    addLine(`Encrypted word: ${encrypted}`, 'info');
    addLine(`Shift (from Step 1): ${s.shift}`, 'info');
    addLine('ALPHABET: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z', 'info');
    addLine('Decode the word:', 'warning');

    setCurrentInputHandler((input) => {
      if (input.toUpperCase().trim() === plain) {
        sound.success();
        addLine(`[STEP 2 CLEAR] The word is "${plain}"`, 'success');
        addLine('This is a COLUMN name in the citizens table!', 'info');
        s.column = plain.toLowerCase();
        s.phase = 2;
        addLine('');
        setTimeout(runChainPhase, 800);
      } else {
        sound.denied();
        addLine(`[WRONG] Shift each letter backward by ${s.shift}.`, 'error');
      }
    });
  } else if (s.phase === 2) {
    // Step 3: Write SQL using the column
    addLine('\u2501\u2501\u2501 Step 3: SQL Query \u2501\u2501\u2501', 'highlight');
    addLine('Use the column from Step 2 to find Victor.', 'info');
    addLine(`Query the citizens table for the row where ${s.column} = 'Stranger'`, 'warning');
    addLine('', '');
    addLine('Type a SELECT query:', 'warning');

    setCurrentInputHandler((input) => {
      const up = input.toUpperCase();
      const ok = up.includes('SELECT') && up.includes('CITIZENS') && up.includes('WHERE') && up.includes('ROLE') && (input.includes("'Stranger'") || input.includes('"Stranger"'));
      if (ok) {
        sound.success();
        addLine('[STEP 3 CLEAR] Query accepted.', 'success');
        renderTable([{ id: 6, name: 'Victor', role: 'Stranger' }], ['id', 'name', 'role']);
        addLine('', '');
        addLine('Victor found! His ID is 6.', 'info');
        s.victorId = 6;
        s.phase = 3;
        addLine('');
        setTimeout(runChainPhase, 800);
      } else {
        sound.denied();
        addLine("[WRONG] Try: SELECT * FROM citizens WHERE role = 'Stranger'", 'error');
      }
    });
  } else if (s.phase === 3) {
    // Step 4: Trace code, find the shutdown password
    addLine('\u2501\u2501\u2501 Step 4: Trace Victor\'s Code \u2501\u2501\u2501', 'highlight');
    addLine('We found Victor\'s shutdown script. Trace it to find the kill password.', 'info');
    addPre(`1  secret = 0
2  base = 100
3  id = 6        # <- from Step 3
4  for i in range(1, 4):
5      secret = secret + i * id
6  result = base + secret
7  print(result)`);
    addLine('', '');
    addLine('What does line 7 print?', 'warning');

    setCurrentInputHandler((input) => {
      // i=1: secret=0+1*6=6, i=2: 6+2*6=18, i=3: 18+3*6=36. result=100+36=136
      if (input.trim() === '136') {
        sound.success();
        addLine('[STEP 4 CLEAR] Password: 136', 'success');
        addLine('  i=1: secret = 0 + 1*6 = 6', 'info');
        addLine('  i=2: secret = 6 + 2*6 = 18', 'info');
        addLine('  i=3: secret = 18 + 3*6 = 36', 'info');
        addLine('  result = 100 + 36 = 136', 'info');
        s.phase = 4;
        addLine('');
        setTimeout(runChainPhase, 800);
      } else {
        sound.denied();
        addLine('[WRONG] Trace the loop. i goes 1,2,3 (range(1,4) excludes 4).', 'error');
      }
    });
  } else if (s.phase === 4) {
    // Step 5: Final logic gate to trigger shutdown
    addLine('\u2501\u2501\u2501 Step 5: Logic Gate Trigger \u2501\u2501\u2501', 'highlight');
    addLine('Final gate needs: (A XOR B) AND C = 1', 'info');
    addLine('C is locked at 1. Find values of A and B that make XOR = 1.', 'warning');
    addLine('(Remember: XOR = 1 when inputs are DIFFERENT)', 'info');
    addLine('Type: A B', 'warning');

    setCurrentInputHandler((input) => {
      const [a, b] = input.trim().split(/\s+/).map(Number);
      if ((a === 0 && b === 1) || (a === 1 && b === 0)) {
        sound.success();
        addLine('[FINAL GATE OPEN!]', 'success');
        addLine('', '');
        setTimeout(async () => {
          await typeLines([
            { text: '[SYSTEM] Executing shutdown password 136...', cls: 'system' },
            { text: '[SYSTEM] Backdoor neutralized.', cls: 'success' },
            { text: '[SYSTEM] Victor\'s access revoked \u2014 permanently.', cls: 'success' },
            { text: '', cls: '' },
            { text: 'AI CORE: "You did it. For real this time."', cls: 'purple' },
            { text: 'AI CORE: "Victor is locked out. The village is safe.', cls: 'purple' },
            { text: '          Permanently. He cannot come back."', cls: 'purple' },
            { text: '', cls: '' },
            { text: 'NEXUS: "Heard the whole thing on my scanner. Kid, I\'ve', cls: 'highlight' },
            { text: '        been at this for thirty years. I\'ve never seen', cls: 'highlight' },
            { text: '        anyone learn this fast. Ever."', cls: 'highlight' },
            { text: '', cls: '' },
            { text: 'NEXUS: "You started tonight as a rookie. You\'re ending', cls: 'highlight' },
            { text: '        as something else. I want you to know what', cls: 'highlight' },
            { text: '        you actually learned."', cls: 'highlight' },
            { text: '', cls: '' },
            { text: '  * Cryptography (Caesar, frequency analysis)', cls: 'info' },
            { text: '  * Binary, ASCII, hex \u2014 the true language of computers', cls: 'info' },
            { text: '  * Boolean logic and circuit design (XOR, half-adder)', cls: 'info' },
            { text: '  * Algorithms, loops, and optimization', cls: 'info' },
            { text: '  * Reading and tracing code like a real programmer', cls: 'info' },
            { text: '  * SQL queries and JOINs', cls: 'info' },
            { text: '  * Password attacks (dictionary, pattern, constraint)', cls: 'info' },
            { text: '', cls: '' },
            { text: 'NEXUS: "That\'s a real computer science education. You', cls: 'highlight' },
            { text: '        know more than most college freshmen now."', cls: 'highlight' },
            { text: '', cls: '' },
            { text: `>>> ${(state.hackerName || 'HACKER')} \u2014 ELITE HACKER <<<`, cls: 'success big' },
            { text: '', cls: '' },
            { text: 'AI CORE: "When you\'re ready, there\'s more. Season 3', cls: 'purple' },
            { text: '          will teach you to write Python. Real code.', cls: 'purple' },
            { text: '          See you then."', cls: 'purple' },
          ]);
          setCurrentInputHandler(null);
          setTimeout(() => completeMission(15), 2000);
        }, 500);
      } else {
        sound.denied();
        addLine('[WRONG] XOR needs different inputs (0,1 or 1,0).', 'error');
      }
    });
  }
}

// ============================================================
// EXPORTS
// ============================================================
export { MISSIONS, missionHints, missionRunners };
