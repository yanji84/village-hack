// missions/s2/01-password-security.js
import {
  state, sound,
  addLine, addPre, typeLines,
  setPhaseProgress, setCurrentInputHandler,
  completeMission,
} from '../../engine.js';
import { renderPixelGrid } from '../helpers.js';

export const mission = {
  id: 8,
  num: 'S2-01',
  title: 'BINARY MEDIA',
  name: 'Binary Media',
  desc: 'Discover the big secret: images, sound, and video are ALL just numbers. Everything on every screen is binary.',
  skill: 'SKILL: Binary Representation of Media',
  hints: [
    'For RGB: R is Red, G is Green, B is Blue. Red + Green light = Yellow. Red + Blue = Magenta/Pink.',
    'For sound samples: samples per second × seconds = total samples. 44100 × 3.',
    'For video: multiply width × height to get pixels per frame. Then × 3 bytes each. Then × frames per second.',
  ],
  run: async function() {
    state.missionState = { phase: 0, step: 0 };

    await typeLines([
      { text: '[AI CORE — SIGNAL LOCK ESTABLISHED]', cls: 'system' },
      { text: '[scanning] ████░░░░░░░░░░░░░░░░  19%', cls: 'system' },
      { text: '[scanning] ██████████░░░░░░░░░░  54%', cls: 'system' },
      { text: '[scanning] ████████████████████  100%', cls: 'system' },
      { text: '[READY] — AI CORE online. Transmission clean.', cls: 'system' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Hey. You\'re back. Good — I want to show you', cls: 'purple' },
      { text: '          something that blew MY circuits when I first', cls: 'purple' },
      { text: '          realized it."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Last season you learned that letters are secretly', cls: 'purple' },
      { text: '          numbers. A=1, B=2... 1s and 0s under the hood."', cls: 'purple' },
      { text: '', cls: '' },
      { text: 'AI CORE: "That was just the beginning. Here is the BIG', cls: 'purple' },
      { text: '          secret of computers:"', cls: 'purple' },
      { text: '', cls: '' },
      { text: '   ▶ EVERYTHING is secretly numbers.', cls: 'success big' },
      { text: '', cls: '' },
      { text: 'AI CORE: "Photos. Music. Movies. Games. Video calls.', cls: 'purple' },
      { text: '          Every single one — just numbers in disguise.', cls: 'purple' },
      { text: '          Let me prove it to you."', cls: 'purple' },
      { text: '', cls: '' },
    ]);

    runPhase();
  },
};

function runPhase() {
  const s = state.missionState;
  setPhaseProgress(s.phase + 1, 4);

  if (s.phase === 0) return phaseImages();
  if (s.phase === 1) return phaseSound();
  if (s.phase === 2) return phaseVideo();
  if (s.phase === 3) return phaseEverything();
}

// ============================================================
// PHASE 1: IMAGES ARE NUMBERS
// ============================================================
function phaseImages() {
  const s = state.missionState;
  s.step = 0;

  addLine('╔══════════════════════════════════════════╗', 'highlight');
  addLine('║   ▶ PART 1 of 4 — IMAGES ARE NUMBERS    ║', 'highlight');
  addLine('╚══════════════════════════════════════════╝', 'highlight');
  addLine('', '');
  addLine('AI CORE: "Zoom WAY into any photo on your phone. Like, too', 'purple');
  addLine('          far. You stop seeing the picture and start seeing', 'purple');
  addLine('          tiny colored squares. Those squares are PIXELS."', 'purple');
  addLine('', '');
  addLine('AI CORE: "Here\'s the trick: every pixel is just THREE', 'purple');
  addLine('          numbers. How much RED, how much GREEN, how much', 'purple');
  addLine('          BLUE — each from 0 (none) to 255 (maximum)."', 'purple');
  addLine('', '');
  addPre('  ┌────────────────────────────────────────┐\n  │  PIXEL = ( R , G , B )                  │\n  │                                          │\n  │  (255,   0,   0) = PURE RED   🟥        │\n  │  (  0, 255,   0) = PURE GREEN 🟩        │\n  │  (  0,   0, 255) = PURE BLUE  🟦        │\n  │  (255, 255, 255) = WHITE (all on)       │\n  │  (  0,   0,   0) = BLACK (all off)      │\n  └────────────────────────────────────────┘');
  addLine('', '');
  addLine('AI CORE: "Mixing light is different from mixing paint. Red', 'purple');
  addLine('          light PLUS green light actually makes..."', 'purple');
  addLine('', '');
  addLine('   Pixel = (255, 255, 0)   →   what color?', 'warning');
  addLine('', '');
  addLine('(Type the color name)', 'info');

  setCurrentInputHandler((input) => {
    const ans = input.toLowerCase().trim();
    if (s.step === 0) {
      if (ans.includes('yellow')) {
        sound.success();
        addLine('[CORRECT] Red + Green light = YELLOW. 🟨', 'success');
        addLine('', '');
        addLine('AI CORE: "Weird, right? In paint, red + green = brown.', 'purple');
        addLine('          But computer screens shine LIGHT, and red light', 'purple');
        addLine('          plus green light makes yellow. That\'s why', 'purple');
        addLine('          sunlight looks yellowish-white — it\'s ALL the', 'purple');
        addLine('          colors of light mixed together."', 'purple');
        addLine('', '');
        addLine('AI CORE: "Now — if every pixel is just 3 numbers, and', 'purple');
        addLine('          numbers are just binary (1s and 0s)... then a', 'purple');
        addLine('          PICTURE is just a huge list of 1s and 0s!"', 'purple');
        addLine('', '');
        addLine('AI CORE: "Let me show you. Here is ONE byte — 8 bits —', 'purple');
        addLine('          that draws a little row of pixels. A 1 means', 'purple');
        addLine('          the pixel glows ON. A 0 means it stays dark."', 'purple');
        addLine('', '');
        addPre('            BYTE:   0  1  1  1  1  1  1  0');
        addLine('', '');
        addLine('AI CORE: "Quick question before I render it — how many', 'purple');
        addLine('          pixels will be GLOWING in this byte? (Just', 'purple');
        addLine('          count the 1s.)"', 'purple');
        addLine('', '');
        addLine('Type the count:', 'warning');
        s.step = 1;
      } else {
        sound.denied();
        addLine('[NOT QUITE] Remember — this is LIGHT, not paint. Red light + Green light shining together. What color do you see when a red spotlight and a green spotlight overlap? (Hint: starts with Y.)', 'error');
      }
    } else if (s.step === 1) {
      const n = parseInt(ans);
      if (n === 6) {
        sound.success();
        addLine('[YES] Six 1s — six glowing pixels. Rendering now...', 'success');
        addLine('', '');

        const term = document.getElementById('terminal');
        // Render the single-row byte
        renderPixelGrid(term, [[0,1,1,1,1,1,1,0]]);

        addLine('AI CORE: "There it is. A row of pixels, rendered from', 'purple');
        addLine('          8 bits. Now imagine stacking rows on top of', 'purple');
        addLine('          each other to make a picture..."', 'purple');
        addLine('', '');

        // Render a little 8x8 smiley face
        const smile = [
          [0,0,1,1,1,1,0,0],
          [0,1,0,0,0,0,1,0],
          [1,0,1,0,0,1,0,1],
          [1,0,0,0,0,0,0,1],
          [1,0,1,0,0,1,0,1],
          [1,0,0,1,1,0,0,1],
          [0,1,0,0,0,0,1,0],
          [0,0,1,1,1,1,0,0],
        ];
        renderPixelGrid(term, smile);

        addLine('AI CORE: "An 8×8 smiley face — 64 bits, 8 bytes. That\'s', 'purple');
        addLine('          it. That\'s the whole secret of images."', 'purple');
        addLine('', '');
        addLine('╔══════════════════════════════════════════════╗', 'success');
        addLine('║  💡 AHA: Every photo on your phone is just    ║', 'success');
        addLine('║     millions of tiny numbered squares.         ║', 'success');
        addLine('║     A selfie = a LIST OF NUMBERS.              ║', 'success');
        addLine('╚══════════════════════════════════════════════╝', 'success');
        addLine('', '');
        addLine('>>> PART 1 COMPLETE <<<', 'success big');
        s.phase = 1;
        setTimeout(runPhase, 2000);
      } else {
        sound.denied();
        addLine('[COUNT AGAIN] Look at the byte: 0 1 1 1 1 1 1 0. Just tap each digit and count only the 1s. There are two 0s at the ends — everything in the middle is a 1.', 'error');
      }
    }
  });
}

// ============================================================
// PHASE 2: SOUND IS NUMBERS
// ============================================================
function phaseSound() {
  const s = state.missionState;
  s.step = 0;

  addLine('', '');
  addLine('╔══════════════════════════════════════════╗', 'highlight');
  addLine('║   ▶ PART 2 of 4 — SOUND IS NUMBERS      ║', 'highlight');
  addLine('╚══════════════════════════════════════════╝', 'highlight');
  addLine('', '');
  addLine('AI CORE: "OK, pictures are numbers. But what about SOUND?', 'purple');
  addLine('          You can\'t see sound — how do you stuff a song into', 'purple');
  addLine('          a computer?"', 'purple');
  addLine('', '');
  addLine('AI CORE: "Sound is air wiggling. When you clap, you push', 'purple');
  addLine('          air. The air pushes more air. Eventually it pushes', 'purple');
  addLine('          your eardrum. Your brain says: CLAP!"', 'purple');
  addLine('', '');
  addLine('AI CORE: "A microphone measures how hard the air is pushing,', 'purple');
  addLine('          THOUSANDS of times every second. Each measurement', 'purple');
  addLine('          is called a SAMPLE. Watch this wave:"', 'purple');
  addLine('', '');
  addPre('     +100 ┤           •                              \n      +50 ┤      •         •                          \n        0 ┤  •                 •                •     \n      -50 ┤                        •         •        \n     -100 ┤                           •               \n          └──────────────────────────────────────\n          t: 0   1    2    3    4    5    6    7   8\n\n  SAMPLES: [ 0, 50, 100, 50, 0, -50, -100, -50, 0 ]');
  addLine('', '');
  addLine('AI CORE: "See? The wave is just 9 numbers. Play them back', 'purple');
  addLine('          through a speaker and the speaker wiggles exactly', 'purple');
  addLine('          like the air was wiggling when we recorded it."', 'purple');
  addLine('', '');
  addLine('AI CORE: "Now — CD-quality music records 44,100 samples', 'purple');
  addLine('          per SECOND. Every second, forty-four thousand one', 'purple');
  addLine('          hundred tiny number-measurements of the wiggle."', 'purple');
  addLine('', '');
  addLine('AI CORE: "Quick math. If one second is 44,100 samples, how', 'purple');
  addLine('          many samples are in a 3-SECOND song?"', 'purple');
  addLine('', '');
  addPre('   44,100  samples/second\n        ×  3  seconds\n   ─────────\n        ?  total samples');
  addLine('', '');
  addLine('Type the total number of samples:', 'warning');

  setCurrentInputHandler((input) => {
    const clean = input.replace(/[, _]/g, '').trim();
    const n = parseInt(clean);
    if (n === 132300) {
      sound.success();
      addLine('[BULLSEYE] 44,100 × 3 = 132,300 samples!', 'success');
      addLine('', '');
      addLine('AI CORE: "One hundred and thirty-two THOUSAND numbers —', 'purple');
      addLine('          for a song that\'s barely long enough to say', 'purple');
      addLine('          \'hello, how are you.\'"', 'purple');
      addLine('', '');
      addLine('AI CORE: "A 3-minute pop song? Over 7.9 MILLION numbers.', 'purple');
      addLine('          That\'s a normal song. Every single one, just a', 'purple');
      addLine('          tiny measurement of air-wiggle."', 'purple');
      addLine('', '');
      addLine('╔══════════════════════════════════════════════╗', 'success');
      addLine('║  💡 AHA: Every song on Spotify is a giant     ║', 'success');
      addLine('║     list of numbers, sampled 44,100 times a    ║', 'success');
      addLine('║     second. Your ears turn them back into air  ║', 'success');
      addLine('║     wiggles — and your brain calls it music.   ║', 'success');
      addLine('╚══════════════════════════════════════════════╝', 'success');
      addLine('', '');
      addLine('>>> PART 2 COMPLETE <<<', 'success big');
      s.phase = 2;
      setTimeout(runPhase, 2000);
    } else if (n === 44103 || n === 44100) {
      sound.denied();
      addLine('[CLOSE] That\'s just 1 second (or 1 sec plus a little). We want THREE seconds. So multiply, not add.', 'error');
    } else {
      sound.denied();
      addLine('[TRY AGAIN] 44,100 samples every second, for 3 seconds total. 44,100 + 44,100 + 44,100 — or just 44,100 × 3. Grab a pencil if you need to!', 'error');
    }
  });
}

// ============================================================
// PHASE 3: VIDEO = IMAGES + TIME
// ============================================================
function phaseVideo() {
  const s = state.missionState;
  s.step = 0;

  addLine('', '');
  addLine('╔══════════════════════════════════════════╗', 'highlight');
  addLine('║   ▶ PART 3 of 4 — VIDEO IS NUMBERS × TIME║', 'highlight');
  addLine('╚══════════════════════════════════════════╝', 'highlight');
  addLine('', '');
  addLine('AI CORE: "Last one before I tie it all together. VIDEO."', 'purple');
  addLine('', '');
  addLine('AI CORE: "Flipbook trick: draw a stickman a little different', 'purple');
  addLine('          on each page, flip fast, and — he\'s WALKING. Your', 'purple');
  addLine('          brain stitches still pictures into motion."', 'purple');
  addLine('', '');
  addLine('AI CORE: "Video is the exact same trick. A movie is just a', 'purple');
  addLine('          stack of IMAGES called FRAMES, shown in order,', 'purple');
  addLine('          really fast — usually 30 frames every second."', 'purple');
  addLine('', '');
  addLine('AI CORE: "Let\'s do the math for ONE FRAME of HD video', 'purple');
  addLine('          (1080p). Each frame is 1920 wide × 1080 tall."', 'purple');
  addLine('', '');
  addPre('   STEP 1  —  how many PIXELS in one frame?\n\n     1920\n   ×  1080\n   ──────\n      ???');
  addLine('', '');
  addLine('AI CORE: "Take your time. You can use paper or a calculator', 'purple');
  addLine('          — real engineers do. What\'s 1920 × 1080?"', 'purple');
  addLine('', '');
  addLine('Type the number of pixels:', 'warning');

  s.step = 0;

  setCurrentInputHandler((input) => {
    const clean = input.replace(/[, _]/g, '').trim();
    const n = parseInt(clean);

    if (s.step === 0) {
      if (n === 2073600) {
        sound.success();
        addLine('[CORRECT] 1920 × 1080 = 2,073,600 pixels per frame!', 'success');
        addLine('', '');
        addLine('AI CORE: "Over two MILLION pixels. In ONE frame. And', 'purple');
        addLine('          remember — each pixel needs 3 numbers (R, G,', 'purple');
        addLine('          B). We call 1 number a BYTE."', 'purple');
        addLine('', '');
        addPre('   STEP 2  —  how many BYTES in one frame?\n\n     2,073,600 pixels\n   ×         3 bytes/pixel\n   ──────────\n            ??? bytes');
        addLine('', '');
        addLine('Type the bytes-per-frame:', 'warning');
        s.step = 1;
      } else {
        sound.denied();
        addLine('[NOT QUITE] 1920 × 1080. Try it in pieces if it\'s scary: 1920 × 1000 = 1,920,000. Then 1920 × 80 = 153,600. Add them up.', 'error');
      }
    } else if (s.step === 1) {
      if (n === 6220800) {
        sound.success();
        addLine('[YES] 2,073,600 × 3 = 6,220,800 bytes per frame!', 'success');
        addLine('', '');
        addLine('AI CORE: "Over six MILLION bytes for ONE still picture.', 'purple');
        addLine('          But video plays THIRTY of those every second."', 'purple');
        addLine('', '');
        addPre('   STEP 3  —  how many BYTES per SECOND?\n\n     6,220,800 bytes/frame\n   ×        30 frames/second\n   ──────────\n            ??? bytes/second');
        addLine('', '');
        addLine('Type the bytes-per-second:', 'warning');
        s.step = 2;
      } else {
        sound.denied();
        addLine('[ALMOST] Each pixel is 3 bytes (R + G + B). We just found 2,073,600 pixels. So: 2,073,600 × 3.', 'error');
      }
    } else if (s.step === 2) {
      if (n === 186624000) {
        sound.success();
        addLine('[INCREDIBLE] 6,220,800 × 30 = 186,624,000 bytes/second!', 'success');
        addLine('', '');
        addLine('AI CORE: "That\'s about 186 MEGABYTES. Per second. Of', 'purple');
        addLine('          raw video. A 10-minute YouTube clip would be', 'purple');
        addLine('          over 100 GIGABYTES — bigger than most phones!"', 'purple');
        addLine('', '');
        addLine('╔══════════════════════════════════════════════╗', 'success');
        addLine('║  💡 AHA: Raw video is MASSIVE. That\'s why      ║', 'success');
        addLine('║     smart people invented COMPRESSION — tricks ║', 'success');
        addLine('║     to squish those numbers way, way smaller   ║', 'success');
        addLine('║     so videos actually fit on your phone.      ║', 'success');
        addLine('╚══════════════════════════════════════════════╝', 'success');
        addLine('', '');
        addLine('>>> PART 3 COMPLETE <<<', 'success big');
        s.phase = 3;
        setTimeout(runPhase, 2000);
      } else {
        sound.denied();
        addLine('[ONE MORE TRY] 6,220,800 × 30. Shortcut: 6,220,800 × 3 = 18,662,400. Now × 10. (× 10 just adds a zero!)', 'error');
      }
    }
  });
}

// ============================================================
// PHASE 4: EVERYTHING IS BINARY
// ============================================================
function phaseEverything() {
  addLine('', '');
  addLine('╔══════════════════════════════════════════╗', 'highlight');
  addLine('║   ▶ PART 4 of 4 — EVERYTHING IS BINARY  ║', 'highlight');
  addLine('╚══════════════════════════════════════════╝', 'highlight');
  addLine('', '');
  addLine('AI CORE: "Look what you just figured out, hacker:"', 'purple');
  addLine('', '');
  addPre('  ┌──────────────────────────────────────────────┐\n  │                                                │\n  │    TEXT       →  numbers  (A=65, B=66, ...)   │\n  │    IMAGES     →  numbers  (R, G, B per pixel) │\n  │    SOUND      →  numbers  (44,100 per second) │\n  │    VIDEO      →  numbers  (millions per frame)│\n  │                                                │\n  │    ...and numbers are just  1s and 0s.         │\n  │                                                │\n  └──────────────────────────────────────────────┘');
  addLine('', '');
  addLine('AI CORE: "Your favorite game? Numbers. The TikTok you', 'purple');
  addLine('          watched this morning? Numbers. The text your', 'purple');
  addLine('          friend sent? Numbers. Your voice on a phone call?', 'purple');
  addLine('          Numbers, going through the air, turning back into', 'purple');
  addLine('          your voice on the other side."', 'purple');
  addLine('', '');
  addLine('AI CORE: "Final puzzle. And this one\'s sneaky."', 'purple');
  addLine('', '');
  addLine('   Name ONE thing your computer does', 'warning');
  addLine('   that ISN\'T secretly just numbers.', 'warning');
  addLine('', '');
  addLine('(Think hard — or type what you notice.)', 'info');

  setCurrentInputHandler((input) => {
    const ans = input.toLowerCase().trim();
    const trickAnswers = [
      'nothing', 'none', 'nada', 'nope', 'zero', 'null',
      'everything', 'everything is numbers', 'all numbers',
      'all of it', 'theres nothing', "there's nothing", 'theres none',
      "there is nothing", 'no', 'n/a', 'na', '0',
      "it's all numbers", 'its all numbers',
    ];

    const matchesTrick = trickAnswers.some(t => ans === t || ans.includes(t));

    if (matchesTrick) {
      sound.success();
      addLine('', '');
      addLine('[YOU GOT IT] There is NOTHING. It\'s numbers all the way down.', 'success big');
      addLine('', '');
      addLine('AI CORE: "That was a trick question and you saw through', 'purple');
      addLine('          it. Every pixel, every sound wave, every letter,', 'purple');
      addLine('          every frame of every video — all of it is just', 'purple');
      addLine('          numbers that are secretly 1s and 0s."', 'purple');
      addLine('', '');
      addLine('AI CORE: "This is the BIGGEST secret in computing. Once', 'purple');
      addLine('          you see it, you can\'t un-see it. And it means', 'purple');
      addLine('          something wild: if you can understand numbers,', 'purple');
      addLine('          you can understand ANYTHING a computer does."', 'purple');
      addLine('', '');
      addLine('╔══════════════════════════════════════════════╗', 'success');
      addLine('║                                                ║', 'success');
      addLine('║   🧠 BINARY MEDIA: MASTERED                    ║', 'success');
      addLine('║                                                ║', 'success');
      addLine('║   You now know the Big Secret of computing.    ║', 'success');
      addLine('║   Everything is numbers. Numbers are binary.   ║', 'success');
      addLine('║                                                ║', 'success');
      addLine('╚══════════════════════════════════════════════╝', 'success');
      addLine('', '');
      addLine('AI CORE: "Welcome to Season 2. The REAL stuff starts now."', 'purple');
      setCurrentInputHandler(null);
      setTimeout(() => completeMission(8), 2000);
    } else {
      sound.denied();
      addLine('[KEEP THINKING] We went through text, images, sound, and video — and every one turned out to be numbers underneath. So... what does the computer do that ISN\'T numbers? (Hint: the answer might be a word that means "not a single thing".)', 'error');
    }
  });
}
