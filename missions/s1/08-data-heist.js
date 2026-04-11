// missions/s1/08-data-heist.js
import {
  state, sound,
  addLine, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission, renderTable,
} from '../../engine.js';

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

export const mission = {
  id: 7,
  num: '08',
  title: 'DATA HEIST',
  name: 'Data Heist',
  desc: 'Use special database commands to find the AI\'s secret plans hidden in the town database.',
  skill: 'SKILL: Database Queries (SQL)',
  hints: [
    'Start simple. Get EVERYTHING from the table first. You can always filter afterward.',
    'WHERE is your filter. Which column do you want to filter BY? And what value do you want?',
    'SQL is fussy about quotes. Text values need them. Column names do NOT.',
  ],
  run: async function() {
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
  },
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
        setTimeout(() => completeMission(7), 1000);
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
