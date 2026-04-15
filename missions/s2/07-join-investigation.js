// missions/s2/07-join-investigation.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission, renderTable,
} from '../../engine.js';

const townDB2 = {
  citizens: [
    { id: 1, name: 'Alice',   role: 'Mayor' },
    { id: 2, name: 'Bob',     role: 'Teacher' },
    { id: 3, name: 'Eve',     role: 'Librarian' },
    { id: 4, name: 'Charlie', role: 'Sheriff' },
    { id: 5, name: 'Dana',    role: 'Mechanic' },
    { id: 6, name: 'Victor',  role: 'Stranger' },
  ],
  messages: [
    { id: 1, sender_id: 2, text: 'hello class',           time: '09:00' },
    { id: 2, sender_id: 6, text: 'backdoor ready',        time: '02:14' },
    { id: 3, sender_id: 1, text: 'council meeting at 3pm', time: '10:00' },
    { id: 4, sender_id: 6, text: 'payload installed',     time: '02:30' },
    { id: 5, sender_id: 3, text: 'new books arrived',     time: '11:00' },
    { id: 6, sender_id: 4, text: 'all quiet on patrol',   time: '08:30' },
  ],
};

export const mission = {
  id: 14,
  num: 'S2-07',
  title: 'JOIN INVESTIGATION',
  name: 'JOIN Investigation',
  desc: 'Use SQL JOINs, LIKE wildcards, and ORDER BY to investigate across multiple tables.',
  skill: 'SKILL: Advanced SQL',
  hints: [
    'LIKE searches for patterns. The % symbol means "anything can go here". So \'V%\' means "starts with V, anything after".',
    'A JOIN needs a connection rule — ON tableA.column = tableB.column. What column in citizens matches sender_id in messages?',
    'ORDER BY sorts results. ASC = smallest/earliest first. DESC = largest/latest first.',
  ],
  run: async function() {
    state.missionState = { phase: 0, hintIdx: 0, attempts: 0 };

    await typeLines([
      { text: '[CASE FILE OPENED — 02:47 village time]', cls: 'system' },
      { text: '[incident] Two anonymous messages at 2am. Sender unknown.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Something happened last night. Two messages hit', cls: 'purple' },
      { text: '          the village network at 2 AM. Everyone was asleep.', cls: 'purple' },
      { text: '          The messages are suspicious. We need to find out', cls: 'purple' },
      { text: '          who sent them — before they strike again."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Good news: the network logs EVERYTHING. Every', 'cls': 'purple' },
      { text: '          citizen, every message, every timestamp. It\'s all', cls: 'purple' },
      { text: '          sitting in a database."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Bad news: it\'s scattered across TWO tables. To', cls: 'purple' },
      { text: '          crack this, you need a new superpower — SQL. With', cls: 'purple' },
      { text: '          one line, you can search through millions of', cls: 'purple' },
      { text: '          records. Detectives, scientists, and hackers all', cls: 'purple' },
      { text: '          use this exact language."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Here\'s what we\'ve got. Study them."', cls: 'purple' },
      { text: '', cls: '' },
    ]);

    addLine('  ┌──── TABLE: citizens ────────────────┐', 'info');
    renderTable(townDB2.citizens, ['id', 'name', 'role']);
    addLine('', '');
    addLine('  ┌──── TABLE: messages ────────────────┐', 'info');
    renderTable(townDB2.messages, ['id', 'sender_id', 'text', 'time']);
    addLine('', '');

    await typeLines([
      { text: 'AI CORE: "Notice something weird? The messages table doesn\'t', cls: 'purple' },
      { text: '          store sender NAMES. It stores sender_id — a number', cls: 'purple' },
      { text: '          that points to a row in citizens. That number is', cls: 'purple' },
      { text: '          the BRIDGE between the two tables."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Three clues. Three SQL queries. Let\'s go."', cls: 'purple' },
      { text: '', cls: '' },
    ]);

    runJoinPhase();
  },
};

function showHint(hintText) {
  addLine(hintText, 'warning');
}

function runJoinPhase() {
  const s = state.missionState;
  setPhaseProgress(s.phase + 1, 3);
  s.attempts = 0;

  if (s.phase === 0) {
    runLikePhase();
  } else if (s.phase === 1) {
    runJoinVictorPhase();
  } else if (s.phase === 2) {
    runOrderByPhase();
  }
}

// ───────────────────────────── PHASE 1: LIKE ─────────────────────────────
function runLikePhase() {
  const s = state.missionState;

  addLine('╔═══════════════════════════════════════════╗', 'highlight');
  addLine('║   ▶ CLUE 1 of 3 — THE NEWCOMER            ║', 'highlight');
  addLine('╚═══════════════════════════════════════════╝', 'highlight');
  addLine('', '');
  addLine('AI CORE: "The sheriff mentioned a stranger recently moved into', 'purple');
  addLine('          the village. Name starts with V. Let\'s see if the', 'purple');
  addLine('          citizens table has anyone matching that."', 'purple');
  addLine('', '');
  addLine('AI CORE: "New tool: the LIKE operator. It searches for PATTERNS.', 'purple');
  addLine('          The % symbol is a wildcard — it means \'anything can go', 'purple');
  addLine('          here\'. So \'V%\' means \'starts with V, then anything\'."', 'purple');
  addLine('', '');
  addPre("   WHERE name LIKE 'V%'     <- starts with V\n   WHERE name LIKE '%son'   <- ends with son\n   WHERE name LIKE '%a%'    <- has 'a' anywhere");
  addLine('', '');
  addLine('TASK: Write a SQL query to find all citizens whose name starts with V.', 'warning');
  addLine('      (query the citizens table, use LIKE, use the wildcard \'V%\')', 'warning');
  addLine('', '');

  setCurrentInputHandler((input) => {
    const result = validateLike(input);
    if (result.ok) {
      sound.success();
      addLine('[QUERY OK] Running against citizens table...', 'success');
      addLine('', '');
      renderTable(townDB2.citizens.filter(c => c.name.startsWith('V')), ['id', 'name', 'role']);
      addLine('', '');
      addLine('AI CORE: "Victor. Role: \'Stranger\'. id = 6. Remember that', 'purple');
      addLine('          number — it\'s our key to the next table."', 'purple');
      addLine('', '');
      addLine('[CLUE 1 LOGGED — next: trace his messages]', 'system');
      s.phase = 1;
      setTimeout(runJoinPhase, 1800);
    } else {
      sound.denied();
      s.attempts++;
      addLine(`[QUERY FAILED] ${result.reason}`, 'error');
      addLine('', '');
      if (s.attempts === 1) {
        addLine('AI CORE: "Think about the shape. You need SELECT something, FROM', 'purple');
        addLine('          a table, WHERE a column matches a pattern. Which table', 'purple');
        addLine('          has names? Which operator searches patterns?"', 'purple');
      } else if (s.attempts === 2) {
        addLine('AI CORE: "Try this structure — fill in the blanks:"', 'purple');
        addPre("   SELECT * FROM citizens WHERE name LIKE '__%'");
      } else {
        addLine('AI CORE: "Here\'s the exact query. Type it and we\'ll move on:"', 'purple');
        addPre("   SELECT * FROM citizens WHERE name LIKE 'V%'");
      }
    }
  });
}

function validateLike(q) {
  const up = q.toUpperCase().trim();
  if (!up.startsWith('SELECT')) return { ok: false, reason: 'Every SQL query starts with SELECT.' };
  if (!up.includes('FROM')) return { ok: false, reason: 'You need FROM <table> to say which table to read.' };
  if (up.includes('FROM CITIZEN ') || up.match(/FROM\s+CITIZEN\b(?!S)/)) {
    return { ok: false, reason: "Table is called 'citizens' (plural), not 'citizen'." };
  }
  if (!up.includes('CITIZENS')) return { ok: false, reason: 'Which table has names? Use FROM citizens.' };
  if (!up.includes('LIKE')) return { ok: false, reason: 'Use the LIKE operator for pattern matching.' };
  if (!up.match(/['"]V%['"]/)) return { ok: false, reason: "Pattern must be 'V%' — V followed by the % wildcard." };
  return { ok: true };
}

// ─────────────────────────── PHASE 2: JOIN + WHERE ───────────────────────
function runJoinVictorPhase() {
  const s = state.missionState;

  addLine('╔═══════════════════════════════════════════╗', 'highlight');
  addLine('║   ▶ CLUE 2 of 3 — CROSSING THE TABLES     ║', 'highlight');
  addLine('╚═══════════════════════════════════════════╝', 'highlight');
  addLine('', '');
  addLine('AI CORE: "We know Victor\'s id = 6. Now we need every message', 'purple');
  addLine('          where sender_id = 6 — but we want to SEE the names,', 'purple');
  addLine('          not just numbers. That\'s what JOIN is for."', 'purple');
  addLine('', '');
  addLine('AI CORE: "A JOIN lines up two tables. You give it a RULE — which', 'purple');
  addLine('          column on the left matches which column on the right.', 'purple');
  addLine('          SQL then stitches matching rows together."', 'purple');
  addLine('', '');
  addPre("   SELECT col1, col2\n   FROM tableA\n   JOIN tableB ON tableA.id = tableB.a_id\n   WHERE ...");
  addLine('', '');
  addLine('AI CORE: "Our two tables connect through:"', 'purple');
  addPre('   citizens.id  ←→  messages.sender_id');
  addLine('', '');
  addLine('TASK: JOIN messages with citizens, then show only Victor\'s messages.', 'warning');
  addLine('      Columns to return: name, text', 'warning');
  addLine('', '');

  setCurrentInputHandler((input) => {
    const result = validateJoin(input);
    if (result.ok) {
      sound.success();
      addLine('[JOIN OK] Stitching tables together...', 'success');
      addLine('', '');
      const rows = townDB2.messages
        .filter(m => m.sender_id === 6)
        .map(m => ({ name: 'Victor', text: m.text }));
      renderTable(rows, ['name', 'text']);
      addLine('', '');
      addLine('AI CORE: "\'backdoor ready\'. \'payload installed\'. At 2 AM.', 'purple');
      addLine('          We just caught him. VICTOR is the attacker."', 'purple');
      addLine('', '');
      addLine('[CLUE 2 LOGGED — one more query to close the case]', 'system');
      s.phase = 2;
      setTimeout(runJoinPhase, 1800);
    } else {
      sound.denied();
      s.attempts++;
      addLine(`[QUERY FAILED] ${result.reason}`, 'error');
      addLine('', '');
      if (s.attempts === 1) {
        addLine('AI CORE: "Step back. You need BOTH tables in the query. What', 'purple');
        addLine('          single column appears in citizens AND connects to', 'purple');
        addLine('          something in messages? That\'s your ON clause."', 'purple');
      } else if (s.attempts === 2) {
        addLine('AI CORE: "Fill in the blanks:"', 'purple');
        addPre("   SELECT name, text\n   FROM messages\n   JOIN citizens ON citizens.___ = messages.______\n   WHERE name = 'Victor'");
      } else {
        addLine('AI CORE: "Exact query:"', 'purple');
        addPre("   SELECT name, text FROM messages\n   JOIN citizens ON citizens.id = messages.sender_id\n   WHERE name = 'Victor'");
      }
    }
  });
}

function validateJoin(q) {
  const up = q.toUpperCase().trim();
  if (!up.startsWith('SELECT')) return { ok: false, reason: 'Start with SELECT.' };
  if (!up.includes('JOIN')) return { ok: false, reason: 'You need the JOIN keyword to combine two tables.' };
  if (!up.includes('CITIZENS') || !up.includes('MESSAGES')) {
    return { ok: false, reason: 'Both tables must appear — citizens AND messages.' };
  }
  if (!up.includes(' ON ')) return { ok: false, reason: 'JOIN without ON is like a handshake with no hand. Add ON <col> = <col>.' };
  if (!up.match(/CITIZENS\.ID\s*=\s*MESSAGES\.SENDER_ID/) &&
      !up.match(/MESSAGES\.SENDER_ID\s*=\s*CITIZENS\.ID/)) {
    return { ok: false, reason: 'ON condition should match citizens.id = messages.sender_id.' };
  }
  if (!up.includes('VICTOR')) {
    return { ok: false, reason: "Don't forget to filter — WHERE name = 'Victor'." };
  }
  return { ok: true };
}

// ─────────────────────── PHASE 3: ORDER BY + CONCEPT ─────────────────────
function runOrderByPhase() {
  const s = state.missionState;

  addLine('╔═══════════════════════════════════════════╗', 'highlight');
  addLine('║   ▶ CLUE 3 of 3 — THE TIMELINE            ║', 'highlight');
  addLine('╚═══════════════════════════════════════════╝', 'highlight');
  addLine('', '');
  addLine('AI CORE: "To hand this to the sheriff, we need a complete', 'purple');
  addLine('          timeline — every message, every sender, sorted from', 'purple');
  addLine('          earliest to latest. That\'s three tools at once:"', 'purple');
  addLine('', '');
  addPre('   JOIN      <- combine the two tables\n   SELECT    <- name, text, time\n   ORDER BY  <- sort by time, ASC (earliest first)');
  addLine('', '');
  addLine('TASK: Show name, text, time for EVERY message, sorted by time ascending.', 'warning');
  addLine('', '');

  setCurrentInputHandler((input) => {
    const result = validateOrderBy(input);
    if (result.ok) {
      sound.success();
      addLine('[QUERY OK] Building timeline...', 'success');
      addLine('', '');
      const rows = townDB2.messages
        .map(m => ({
          name: townDB2.citizens.find(c => c.id === m.sender_id).name,
          text: m.text,
          time: m.time,
        }))
        .sort((a, b) => a.time.localeCompare(b.time));
      renderTable(rows, ['name', 'text', 'time']);
      addLine('', '');
      addLine('AI CORE: "Look at the top two rows. Victor. 02:14. 02:30.', 'purple');
      addLine('          Everyone else is asleep or at work during daylight.', 'purple');
      addLine('          Pattern is undeniable. Case closed."', 'purple');
      addLine('', '');
      s.phase = 3;
      setTimeout(runConceptPhase, 1800);
    } else {
      sound.denied();
      s.attempts++;
      addLine(`[QUERY FAILED] ${result.reason}`, 'error');
      addLine('', '');
      if (s.attempts === 1) {
        addLine('AI CORE: "Same JOIN as before, but no WHERE — we want ALL', 'purple');
        addLine('          rows. Then add ORDER BY at the end."', 'purple');
      } else if (s.attempts === 2) {
        addLine('AI CORE: "Fill in the blanks:"', 'purple');
        addPre("   SELECT name, text, time\n   FROM messages\n   JOIN citizens ON citizens.id = messages.sender_id\n   ORDER BY ____ ___");
      } else {
        addLine('AI CORE: "Exact query:"', 'purple');
        addPre("   SELECT name, text, time FROM messages\n   JOIN citizens ON citizens.id = messages.sender_id\n   ORDER BY time ASC");
      }
    }
  });
}

function validateOrderBy(q) {
  const up = q.toUpperCase().trim();
  if (!up.startsWith('SELECT')) return { ok: false, reason: 'Start with SELECT.' };
  if (!up.includes('JOIN')) return { ok: false, reason: 'Still need JOIN — we want sender NAMES, not just ids.' };
  if (!up.includes(' ON ')) return { ok: false, reason: 'JOIN needs an ON clause.' };
  if (!up.includes('ORDER BY')) return { ok: false, reason: 'Missing ORDER BY — that\'s the sort.' };
  if (!up.match(/ORDER\s+BY\s+TIME/)) return { ok: false, reason: 'ORDER BY which column? We want to sort by time.' };
  if (up.includes('VICTOR') || up.includes("'V")) {
    return { ok: false, reason: 'No WHERE filter this time — we want ALL messages in the timeline.' };
  }
  return { ok: true };
}

// ────────────────────── PHASE 4: CONCEPTUAL INSIGHT ──────────────────────
function runConceptPhase() {
  addLine('╔═══════════════════════════════════════════╗', 'highlight');
  addLine('║   ▶ BONUS — WHY TABLES ARE DESIGNED       ║', 'highlight');
  addLine('╚═══════════════════════════════════════════╝', 'highlight');
  addLine('', '');
  addLine('AI CORE: "One last thing. A design question that separates', 'purple');
  addLine('          beginners from people who REALLY get databases."', 'purple');
  addLine('', '');
  addLine('AI CORE: "The messages table stores sender_id (a number). Why', 'purple');
  addLine('          not just store the sender\'s NAME directly? That would', 'purple');
  addLine('          be simpler — no JOIN needed."', 'purple');
  addLine('', '');
  addPre("   A)  Numbers take less space than text\n   B)  Names can change. IDs never change.\n   C)  Databases don't allow text in most columns\n   D)  It was just a random design choice");
  addLine('', '');
  addLine('Type A, B, C, or D:', 'warning');

  setCurrentInputHandler((input) => {
    const ans = input.trim().toUpperCase();
    if (ans === 'B') {
      sound.success();
      addLine('', '');
      addLine('>>> CASE CLOSED <<<', 'success big');
      addLine('', '');
      addLine('AI CORE: "Exactly. If Alice changes her name to Alicia tomorrow,', 'purple');
      addLine('          you update ONE row in citizens — and every message', 'purple');
      addLine('          she ever sent still points to her correctly. If you\'d', 'purple');
      addLine('          stored \'Alice\' in every message, you\'d have to hunt', 'purple');
      addLine('          down and rewrite thousands of rows."', 'purple');
      addLine('', '');
      addLine('AI CORE: "That\'s called NORMALIZATION. Store each fact in ONE', 'purple');
      addLine('          place. Point to it from everywhere else. It\'s the', 'purple');
      addLine('          single most important idea in database design."', 'purple');
      addLine('', '');
      addLine('╔══════════════════════════════════════════╗', 'system');
      addLine('║   [INVESTIGATION COMPLETE]               ║', 'system');
      addLine('║   Suspect: VICTOR   Evidence: LOGGED     ║', 'system');
      addLine('║   Techniques: LIKE, JOIN, ORDER BY       ║', 'system');
      addLine('╚══════════════════════════════════════════╝', 'system');
      addLine('', '');
      addLine('AI CORE: "You just used the same query language that runs every', 'purple');
      addLine('          bank, every social network, every hospital record', 'purple');
      addLine('          system on Earth. Three keywords. One caught attacker.', 'purple');
      addLine('          That\'s the superpower."', 'purple');
      setCurrentInputHandler(null);
      setTimeout(() => completeMission(14), 1500);
    } else if (ans === 'A') {
      sound.denied();
      addLine('[PARTIAL] True — numbers are smaller. But that\'s not the MAIN reason. Think about what happens when data CHANGES.', 'error');
    } else if (ans === 'C') {
      sound.denied();
      addLine('[NOPE] Databases store text just fine (the name column in citizens is text!). Think about change over time.', 'error');
    } else if (ans === 'D') {
      sound.denied();
      addLine('[NOT RANDOM] Database designers agonize over this. There\'s a real reason. Think: what if a citizen changes their name?', 'error');
    } else {
      sound.denied();
      addLine('[TYPE A, B, C, or D]', 'error');
    }
  });
}
