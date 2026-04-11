// missions/s2/07-join-investigation.js
import {
  state, sound,
  addLine, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission, renderTable,
} from '../../engine.js';

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

export const mission = {
  id: 15,
  num: 'S2-07',
  title: 'JOIN INVESTIGATION',
  name: 'JOIN Investigation',
  desc: 'Use SQL JOINs, LIKE wildcards, and ORDER BY to investigate across multiple tables.',
  skill: 'SKILL: Advanced SQL',
  hints: [
    "A JOIN needs two tables AND a rule for how they connect. What column in ONE matches a column in the OTHER?",
    'Ask the question first. THEN figure out which tables have the answer.',
    "If the query runs but the answer is wrong, your JOIN condition is probably off. Check which column matches which.",
  ],
  run: async function() {
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
  },
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
        setTimeout(() => completeMission(15), 1200);
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
