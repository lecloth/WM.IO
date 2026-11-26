// The hallway's look (Part 5 "Hallway rebuild", 26 Nov, pass 1: the space). One look, the "dark hall", the same in
// light and dark mode (only the sketch it starts from follows the theme: white paper in light mode, dark paper in dark):
// walls about #1C1E22, floor about #111215 with a soft polished sheen, ceiling about #16181B with one light strip down
// its middle, a spotlight pool and a small fixture above each frame, a skirting line. No warm tones. Light and shine are
// painted into the surfaces once (dive.js paintHall: no live lights, shadows or reflections), so the hall costs about
// what the sketch costs.
export const HALL = 'D';
export const LOOKS = {
  D: {
    id: 'D', name: 'Dark hall',
    wall: '#1C1E22', floor: '#111215', ceiling: '#16181B', end: '#1C1E22', door: '#202328',
    light: [0.93, 0.96, 1.0],          // the light's colour (cool neutral, never warm)
    gain: 0.82,                         // how bright the painted light is at full
    shade: 0.62,                        // how dark the painted shade (corners, gaps, skirting) is at full
    strip: ['#1A1C20', '#EEF1F5'],      // the ceiling's light strip: off, on
    fixture: '#2C2F35', lens: ['#2C2F35', '#F4F6F9'],
    edges: { sketch: 0.42, dressed: 0.16, dressedColor: '#C3C7CD' },   // the hairlines: ink in the sketch, faint once dressed
    grid: { sketch: 0.1, dressed: 0.045, dressedColor: '#D9DCE1' },    // the grid: the page's own in the sketch, faint once dressed
    exposure: 1.08,                     // for the real phones on frame 5 (their studio light is the only live light)
  },
};
