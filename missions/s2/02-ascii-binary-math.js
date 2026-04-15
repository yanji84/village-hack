// missions/s2/02-ascii-binary-math.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission,
} from '../../engine.js';

export const mission = {
  id: 9,
  num: 'S2-02',
  title: 'ARRAYS',
  name: 'Arrays',
  desc: 'Hold MANY values in numbered slots. The idea behind every contact list, playlist, and feed.',
  skill: 'SKILL: Arrays + Indexing + Iteration',
  hints: [
    'Arrays start counting at ZERO. The first slot is index 0, not index 1.',
    'For the sum: add the numbers in order. For the "5th score" question: the loop does not care how long the array is.',
    'A swap uses a temporary variable so the first value is not lost when you overwrite it.',
  ],
  run: async function() {
    state.missionState = { phase: 0 };

    await typeLines([
      { text: '[AI CORE — NEW BACKDOOR DETECTED]', cls: 'system' },
      { text: '[scanning] ███████████░░░░░░░░░  55%', cls: 'system' },
      { text: '[scanning] ████████████████████  100%', cls: 'system' },
      { text: '[LAYER FOUND] Data storage subsystem.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Back again. I found the first of VICTOR\u2019s deeper', cls: 'purple' },
      { text: '          backdoors \u2014 hidden inside the village\u2019s data storage.', cls: 'purple' },
      { text: '          This one isn\'t about locks \u2014 it\u2019s about how computers', cls: 'purple' },
      { text: '          REMEMBER lots of things at once."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Back in Season 1 you learned about variables \u2014 one', cls: 'purple' },
      { text: '          value in one box. Useful, but tiny. What if you need to', cls: 'purple' },
      { text: '          store every student\'s name in a school? Every song', cls: 'purple' },
      { text: '          in a playlist? Every contact in your phone?"', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "The answer is the ARRAY. A row of numbered boxes,', cls: 'purple' },
      { text: '          all with the same name, each holding one value.', cls: 'purple' },
      { text: '          This is the backbone of every app you use."', cls: 'purple' },
      { text: '', cls: '' },
    ]);

    runS2M2Phase();
  },
};

function runS2M2Phase() {
  const s = state.missionState;
  setPhaseProgress(s.phase + 1, 4);

  if (s.phase === 0) {
    addLine('╔══════════════════════════════════════╗', 'highlight');
    addLine('║   ▶ PART 1 of 4 — NUMBERED BOXES    ║', 'highlight');
    addLine('╚══════════════════════════════════════╝', 'highlight');
    addLine('', '');
    addLine('AI CORE: "Look at this array of names. It\'s ONE variable', 'purple');
    addLine('          called "names" — but it holds four values at once,', 'purple');
    addLine('          each in its own numbered slot."', 'purple');
    addLine('', '');
    addLine('  names = ["Alice", "Bob", "Eve", "Charlie"]', 'info');
    addLine('', '');
    addPre('     index:    0         1        2          3\n             ┌───────┐ ┌───────┐ ┌───────┐ ┌─────────┐\n   names =  │ Alice │ │  Bob  │ │  Eve  │ │ Charlie │\n             └───────┘ └───────┘ └───────┘ └─────────┘');
    addLine('', '');
    addLine('AI CORE: "To grab a value you write names[INDEX]. The index', 'purple');
    addLine('          is the little number above each box."', 'purple');
    addLine('', '');
    addLine('AI CORE: "Here\'s the catch — and it trips up EVERY beginner.', 'purple');
    addLine('          Computers start counting at ZERO, not one. So the', 'purple');
    addLine('          first slot is index 0, not index 1."', 'purple');
    addLine('', '');
    addLine('AI CORE: "Quick check — what is names[2]?"', 'purple');
    addLine('', '');
    addLine('Type the value stored at names[2]:', 'warning');

    setCurrentInputHandler((input) => {
      const ans = input.trim().toLowerCase().replace(/["']/g, '');
      if (ans === 'eve') {
        sound.success();
        addLine('', '');
        addLine('[CORRECT] names[2] = "Eve" ✓', 'success');
        addLine('', '');
        addLine('AI CORE: "Yes! Count the boxes: 0 is Alice, 1 is Bob,', 'purple');
        addLine('          2 is Eve, 3 is Charlie. The index tells you how', 'purple');
        addLine('          many STEPS to move from the front, not which', 'purple');
        addLine('          position number to grab."', 'purple');
        addLine('', '');
        addLine('AI CORE: "This zero-indexing thing will feel weird for', 'purple');
        addLine('          about a week, then it will click forever. Every', 'purple');
        addLine('          major language — Python, JavaScript, C, Java —', 'purple');
        addLine('          starts at 0."', 'purple');
        addLine('', '');
        addLine('[PART 1 COMPLETE — moving on...]', 'system');
        s.phase = 1;
        setTimeout(runS2M2Phase, 1600);
      } else if (ans === 'charlie') {
        sound.denied();
        addLine('[CLASSIC TRAP] Charlie is at index 3, not 2. Remember — counting starts at 0. So box 0 = Alice, box 1 = Bob, box 2 = ???', 'error');
      } else if (ans === 'bob') {
        sound.denied();
        addLine('[OFF BY ONE] Bob is at index 1. Index 0 is Alice (the first). Count again: 0, 1, 2...', 'error');
      } else {
        sound.denied();
        addLine('[NOT QUITE] Pick from the array: Alice, Bob, Eve, or Charlie. Which one sits at index 2? (Remember: 0 is the first box.)', 'error');
      }
    });
  } else if (s.phase === 1) {
    addLine('╔══════════════════════════════════════╗', 'highlight');
    addLine('║   ▶ PART 2 of 4 — ARRAYS + LOOPS    ║', 'highlight');
    addLine('╚══════════════════════════════════════╝', 'highlight');
    addLine('', '');
    addLine('AI CORE: "An array alone is nice. Pair it with a LOOP and', 'purple');
    addLine('          you get real power. Watch this — test scores from', 'purple');
    addLine('          the village school:"', 'purple');
    addLine('', '');
    addPre('   scores = [90, 85, 72, 95]\n\n             ┌────┐ ┌────┐ ┌────┐ ┌────┐\n   scores =  │ 90 │ │ 85 │ │ 72 │ │ 95 │\n             └────┘ └────┘ └────┘ └────┘\n   index:       0      1      2      3');
    addLine('', '');
    addLine('AI CORE: "Here\'s the loop that adds them up:"', 'purple');
    addLine('', '');
    addPre('   total = 0\n   for each score in scores:\n       total = total + score');
    addLine('', '');
    addLine('AI CORE: "The loop visits every box in order. First it adds', 'purple');
    addLine('          90 to total, then 85, then 72, then 95. What does', 'purple');
    addLine('          total equal when the loop finishes?"', 'purple');
    addLine('', '');
    addLine('Type the final total:', 'warning');

    s.loopStep = 0;

    setCurrentInputHandler((input) => {
      const n = parseInt(input.trim());

      if (s.loopStep === 0) {
        if (n === 342) {
          sound.success();
          addLine('[YES] 90 + 85 + 72 + 95 = 342 ✓', 'success');
          addLine('', '');
          addLine('AI CORE: "Perfect. Now watch — I\'m going to add a FIFTH', 'purple');
          addLine('          score to the array:"', 'purple');
          addLine('', '');
          addLine('   scores = [90, 85, 72, 95, 88]', 'info');
          addLine('', '');
          addLine('AI CORE: "Big question: do we need to CHANGE the loop', 'purple');
          addLine('          code to handle the new score?"', 'purple');
          addLine('', '');
          addPre('   total = 0\n   for each score in scores:\n       total = total + score');
          addLine('', '');
          addLine('Type YES or NO:', 'warning');
          s.loopStep = 1;
        } else {
          sound.denied();
          addLine('[TRY AGAIN] Add them step by step: 90 + 85 = 175. 175 + 72 = 247. 247 + 95 = ?', 'error');
        }
      } else if (s.loopStep === 1) {
        const ans = input.trim().toUpperCase();
        if (ans === 'NO') {
          sound.success();
          addLine('', '');
          addLine('>>> PART 2 COMPLETE <<<', 'success big');
          addLine('', '');
          addLine('AI CORE: "EXACTLY. The loop says \'for each score in', 'purple');
          addLine('          scores\' — it doesn\'t care if there are 4', 'purple');
          addLine('          scores, 5 scores, or 5 million scores. Same', 'purple');
          addLine('          three lines of code handle all of it."', 'purple');
          addLine('', '');
          addLine('AI CORE: "This is the whole reason arrays exist. You', 'purple');
          addLine('          write the logic ONCE, and it runs on every', 'purple');
          addLine('          item. Instagram has billions of posts. The', 'purple');
          addLine('          code that renders your feed is just a loop', 'purple');
          addLine('          over an array."', 'purple');
          addLine('', '');
          addLine('[PART 2 COMPLETE — next layer...]', 'system');
          s.phase = 2;
          setTimeout(runS2M2Phase, 1600);
        } else if (ans === 'YES') {
          sound.denied();
          addLine('[THINK AGAIN] Read the loop carefully — "for each score in scores". It walks every box automatically. Does it mention the number 4 anywhere?', 'error');
        } else {
          sound.denied();
          addLine('[TYPE YES OR NO] Does the loop need to change when the array grows?', 'error');
        }
      }
    });
  } else if (s.phase === 2) {
    addLine('╔═══════════════════════════════════════════╗', 'highlight');
    addLine('║  ▶ PART 3 of 4 — MODIFYING & SWAPPING     ║', 'highlight');
    addLine('╚═══════════════════════════════════════════╝', 'highlight');
    addLine('', '');
    addLine('AI CORE: "Arrays aren\'t just for reading. You can CHANGE', 'purple');
    addLine('          what\'s inside any slot by assigning to it. Like', 'purple');
    addLine('          this:"', 'purple');
    addLine('', '');
    addLine('   items = ["sword", "shield", "potion", "key"]', 'info');
    addLine('   items[2] = "bomb"', 'info');
    addLine('', '');
    addPre('   BEFORE:\n             ┌───────┐ ┌────────┐ ┌────────┐ ┌─────┐\n   items =  │ sword │ │ shield │ │ potion │ │ key │\n             └───────┘ └────────┘ └────────┘ └─────┘\n   index:       0         1          2         3\n\n   AFTER items[2] = "bomb":\n             ┌───────┐ ┌────────┐ ┌──────┐ ┌─────┐\n   items =  │ sword │ │ shield │ │ bomb │ │ key │\n             └───────┘ └────────┘ └──────┘ └─────┘');
    addLine('', '');
    addLine('AI CORE: "Slot 2 used to hold \'potion\'. Now it holds \'bomb\'.', 'purple');
    addLine('          The other slots are untouched."', 'purple');
    addLine('', '');
    addLine('AI CORE: "Now the challenge. VICTOR\'s backdoor has an array', 'purple');
    addLine('          of access codes, and it SWAPS two of them using a', 'purple');
    addLine('          temp variable. Trace the code carefully:"', 'purple');
    addLine('', '');
    addLine('   codes = [10, 20, 30, 40]', 'info');
    addLine('   temp = codes[0]', 'info');
    addLine('   codes[0] = codes[3]', 'info');
    addLine('   codes[3] = temp', 'info');
    addLine('', '');
    addLine('AI CORE: "What does the array look like when those four', 'purple');
    addLine('          lines finish? Type the four numbers separated by', 'purple');
    addLine('          spaces or commas."', 'purple');
    addLine('', '');
    addLine('Example format:  10 20 30 40', 'warning');

    setCurrentInputHandler((input) => {
      const nums = input.trim().split(/[\s,]+/).map(x => parseInt(x)).filter(x => !isNaN(x));
      const expected = [40, 20, 30, 10];
      const match = nums.length === 4 && nums.every((n, i) => n === expected[i]);

      if (match) {
        sound.success();
        addLine('', '');
        addLine('>>> PART 3 COMPLETE <<<', 'success big');
        addLine('codes = [40, 20, 30, 10] — swap successful.', 'success');
        addLine('', '');
        addLine('AI CORE: "Perfect trace. Step by step:"', 'purple');
        addPre('   temp = codes[0]     → temp = 10\n   codes[0] = codes[3] → codes = [40, 20, 30, 40]\n   codes[3] = temp     → codes = [40, 20, 30, 10]');
        addLine('', '');
        addLine('AI CORE: "The temp variable is the trick. Without it, the', 'purple');
        addLine('          moment you overwrite codes[0] with 40, the', 'purple');
        addLine('          original 10 is GONE — and you can\'t put it back.', 'purple');
        addLine('          Temp holds it safely during the swap."', 'purple');
        addLine('', '');
        addLine('AI CORE: "Arrays are the building blocks of every app you', 'purple');
        addLine('          touch. Your contacts list? Array. Your playlist?', 'purple');
        addLine('          Array. Your Instagram feed, your notifications,', 'purple');
        addLine('          your game inventory — arrays, all the way down."', 'purple');
        addLine('', '');
        addLine('[PART 3 COMPLETE — final part...]', 'system');
        s.phase = 3;
        setTimeout(runS2M2Phase, 1600);
      } else if (nums.length === 4 && nums[0] === 10 && nums[3] === 40) {
        sound.denied();
        addLine('[CLOSE — NO SWAP] Looks like you didn\'t apply the swap. After the four lines, codes[0] and codes[3] should have TRADED places. Trace each line again.', 'error');
      } else if (nums.length === 4 && nums[0] === 40 && nums[3] === 40) {
        sound.denied();
        addLine('[ALMOST] codes[0] became 40 ✓. But then the LAST line writes temp (which saved the original 10) into codes[3]. So codes[3] should be...?', 'error');
      } else {
        sound.denied();
        addLine('[TRACE IT LINE BY LINE] temp saves codes[0] (=10). Then codes[0] gets codes[3] (=40). Then codes[3] gets temp (=10). Middle values (20, 30) never change.', 'error');
      }
    });
  } else if (s.phase === 3) {
    addLine('╔═══════════════════════════════════════════╗', 'highlight');
    addLine('║  ▶ PART 4 of 4 — WHY ARRAYS MATTER        ║', 'highlight');
    addLine('╚═══════════════════════════════════════════╝', 'highlight');
    addLine('', '');
    addLine('AI CORE: "One more idea before this backdoor closes. Imagine', 'purple');
    addLine('          you had NO arrays. You wanted to store 1000 student', 'purple');
    addLine('          names. You\'d need a separate variable for each:"', 'purple');
    addLine('', '');
    addPre('   name1 = "Alice"\n   name2 = "Bob"\n   name3 = "Eve"\n   ...\n   name999 = "Zara"\n   name1000 = "Max"');
    addLine('', '');
    addLine('AI CORE: "And to print all 1000 names, you\'d write 1000', 'purple');
    addLine('          print statements. Horrifying."', 'purple');
    addLine('', '');
    addLine('AI CORE: "With an array + loop, it\'s THREE lines, no matter', 'purple');
    addLine('          how many names:"', 'purple');
    addLine('', '');
    addPre('   names = [ ...1000 names... ]\n   for each name in names:\n       print(name)');
    addLine('', '');
    addLine('AI CORE: "Last question of the mission. To print 1000 names,', 'purple');
    addLine('          how many lines of code do you need WITH arrays +', 'purple');
    addLine('          loops (like the code above)?"', 'purple');
    addLine('', '');
    addLine('Type the number of lines:', 'warning');

    setCurrentInputHandler((input) => {
      const n = parseInt(input.trim());
      if (n === 3) {
        sound.success();
        addLine('', '');
        addLine('>>> ALL 4 PARTS SEALED <<<', 'success big');
        addLine('3 lines vs 1000 lines — arrays win by 333×.', 'success');
        addLine('', '');
        addLine('AI CORE: "THREE lines. One to make the array, one to', 'purple');
        addLine('          start the loop, one to print. That\'s it."', 'purple');
        addLine('', '');
        addLine('AI CORE: "This is the superpower. Arrays + loops turn', 'purple');
        addLine('          problems that would be IMPOSSIBLE by hand into', 'purple');
        addLine('          three lines a kid can write. Whether it\'s 10', 'purple');
        addLine('          names, 10 million, or every post ever made —', 'purple');
        addLine('          same code, same three lines."', 'purple');
        addLine('', '');
        addLine('╔══════════════════════════════════════╗', 'system');
        addLine('║        [BACKDOOR SEALED]             ║', 'system');
        addLine('║     DATA STORAGE LAYER LOCKED        ║', 'system');
        addLine('╚══════════════════════════════════════╝', 'system');
        addLine('', '');
        addLine('AI CORE: "You now know the shape of every app you touch.', 'purple');
        addLine('          Variables hold one thing. Arrays hold many.', 'purple');
        addLine('          Loops walk through them. That trio is the', 'purple');
        addLine('          foundation of every program ever written."', 'purple');
        setCurrentInputHandler(null);
        setTimeout(() => completeMission(9), 1500);
      } else if (n === 1000) {
        sound.denied();
        addLine('[OTHER WAY AROUND] 1000 is what you\'d need WITHOUT arrays. WITH the array + loop, the loop handles all 1000 automatically. Count the lines in the code block above.', 'error');
      } else if (n === 2) {
        sound.denied();
        addLine('[ALMOST] Count again — the array line, the "for each" line, AND the print line. How many is that?', 'error');
      } else {
        sound.denied();
        addLine('[COUNT THE CODE] Look at the code block above: one line to create the array, one line to start the loop, one line to print. Total?', 'error');
      }
    });
  }
}
