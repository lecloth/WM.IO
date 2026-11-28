// Every word on the security page (page 3: beats 1-5 in dive.js), in one place. All of them are placeholders, shown
// flagged as drafts: Wajih will rewrite them for a different metaphor later, and this list is the single edit for it.
// The beats read only from here (dive.js; page01/page.js for the reduced-motion stills). Plain text, curly quotes.
export const SECURITY_WORDS = {
  // beat 2, the room of locks: the headline while the camera holds (the style lab's B3 placeholder)
  room: { eyebrow: 'Outside · every lock you own', line: 'One door is never the only door.' },
  // beat 4, three ways to see one lock: one caption per look (e: the eyebrow, l: the line)
  looks: {
    x: { e: 'The thief’s view · X-ray', l: 'He sees straight through it.' },
    m: { e: 'Our view · matte', l: 'The same five spots, each one fixed.' },
    b: { e: 'Your view · brass', l: 'Polished, closed. It just works.' },
  },
  // beat 4's five numbered spots, in order (01-05): the part's name, the thief's weak spot (X-ray), our fix (matte).
  // Which part each one points at is the drawing's business (dive.js SPOT_PARTS), not the words'.
  spots: [
    { name: 'Key', weak: 'Weak passwords', fix: 'Only the right people get in' },
    { name: 'Pins', weak: 'An open back door', fix: 'Every request checked' },
    { name: 'Plug', weak: 'Data lying in the open', fix: 'Your data locked away' },
    { name: 'Housing', weak: 'Old software', fix: 'Built strong from the start' },
    { name: 'Springs', weak: 'No alerts', fix: 'Alerts when something’s wrong' },
  ],
  // beat 5: the last word, once the key is out
  locked: 'Locked.',
  // read aloud only (screen readers): the whole security page in one paragraph (it uses the words above)
  sr: 'Then the walk carries on into the door’s brass lock, down its keyway past the pins, and back out to a room of locks in every direction: “One door is never the only door.” They fly home, burst apart and come back together as one lock. Three ways to see it: the thief’s view in X-ray, five weak spots marked (weak passwords, an open back door, data lying in the open, old software, no alerts); our view in matte, the same five spots fixed (only the right people get in, every request checked, your data locked away, built strong from the start, alerts when something’s wrong); your view in brass: polished, closed, it just works. The key turns back and comes out. Locked.',
};
