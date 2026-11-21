// sheet 03b (part of 03 Disciplines): Security (Yale's lock -> the pick that fails) and AI (Babbage's engine -> a
// drafted quote at a human checkpoint). Builder D2. See tools/notes/sheet-03b.md.
import { initSecurity } from '../sheet03b/security.js';
import { initAI } from '../sheet03b/ai.js';

export function init(engine) {
  const sec = document.getElementById('s03-security');
  const ai = document.getElementById('s03-ai');
  if (sec) initSecurity(engine, sec);
  if (ai) initAI(engine, ai);
}
