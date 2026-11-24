// The hallway's look (Part 5 "Round 5", item 2; round 6: look A stays, looks B and C are removed). Round 4's corridor
// read as a wireframe: flat lines, no light. Expensive comes from real light, depth and shadow, so the frames are real
// objects (a moulding with depth, a mat with a bevelled window, glass that catches the light) and the card is a real
// CC0 scan (ambientCG Paper001, CREDITS.md) under real light with soft shadows. No glows; blue only in the blueprints.
//   A · Architect's model: white card walls and floor, open to the light above like a scale model, real soft shadows,
//       thin black metal frames. Ink on paper: the site's grid is printed on the card (round 6: the same cells as the
//       screen's, continued into depth from the hallway's mouth) and the hallway's edges stay hairlines.
// Round 6: no warm tone anywhere (the card, the mat and the light are neutral; the scan is printed in grey).
// tex: a folder in site/media/materials/ (color.webp + normal.webp). Colours are [light, dark].
export const HALL = 'A';
export const LOOKS = {
  A: {
    id: 'A', name: 'Architect’s model', exposure: 1.08,
    walls: { tex: 'Paper001', grid: true, color: ['#FFFFFF', '#FFFFFF'], base: ['#F4F5F7', '#1B1C1D'], rough: 0.92, normal: 0.35, env: 0.35 },
    floor: { tex: 'Paper001', grid: true, color: ['#FFFFFF', '#FFFFFF'], base: ['#F2F3F5', '#18191A'], rough: 0.92, normal: 0.35, env: 0.35 },
    ceiling: null,                                  // open to the light, like a model on a table
    edges: 0.42,                                    // the hallway's edges stay ink hairlines
    wallsCast: true,                                // the walls' own shadows fall on the floor
    frame: { w: 0.013, d: 0.05, color: ['#151515', '#C2C4C7'], metal: [0.65, 1], rough: [0.36, 0.34] },
    mat: ['#FAFBFC', '#2A2B2D'],
    glass: 0.2,
    // light: a soft key from above, front left (a window over the model), a sky / ground fill, the studio's reflections
    key: { dir: [-0.38, 0.85, 0.9], i: [2.6, 1.4], color: '#FFFFFF', radius: 5 },
    hemi: { sky: ['#FFFFFF', '#D5D7DA'], ground: ['#D6D8DB', '#28292B'], i: [1.25, 0.32] },
    env: [0.9, 0.55],
  },
};
