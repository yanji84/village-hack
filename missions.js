// missions.js — loader
import { mission as m0 } from './missions/s1/01-binary.js';
import { mission as m1 } from './missions/s1/02-first-program.js';
import { mission as m2 } from './missions/s1/03-variables.js';
import { mission as m3 } from './missions/s1/04-memory-recovery.js';
import { mission as m4 } from './missions/s1/05-logic-gates.js';
import { mission as m5 } from './missions/s1/06-encryption.js';
import { mission as m6 } from './missions/s1/07-bug-hunter.js';
import { mission as m7 } from './missions/s1/08-data-heist.js';
import { mission as m8 } from './missions/s1/09-final-hack.js';
import { mission as m9 } from './missions/s2/01-password-security.js';
import { mission as m10 } from './missions/s2/02-ascii-binary-math.js';
import { mission as m11 } from './missions/s2/03-loop-router.js';
import { mission as m12 } from './missions/s2/04-circuit-designer.js';
import { mission as m13 } from './missions/s2/05-cryptanalysis.js';
import { mission as m14 } from './missions/s2/06-code-tracer.js';
import { mission as m15 } from './missions/s2/07-join-investigation.js';
import { mission as m16 } from './missions/s2/08-chain-hack.js';

const allMissions = [m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15, m16];

export const MISSIONS = allMissions.map(m => {
  const o = { id: m.id, num: m.num, title: m.title, name: m.name, desc: m.desc, skill: m.skill };
  if (m.color) o.color = m.color;
  return o;
});

export const missionHints = {};
allMissions.forEach(m => { missionHints[m.id] = m.hints; });

export const missionRunners = [];
allMissions.forEach(m => { missionRunners[m.id] = m.run; });
