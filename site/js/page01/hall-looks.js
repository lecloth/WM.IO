// The hallway's three looks (Part 5 "Round 5", item 2). Round 4's corridor read as a wireframe: flat lines, no light.
// Expensive comes from real light, depth and shadow, so in every look the frames are real objects (a moulding with
// depth, a mat with a bevelled window, glass that catches the light) and the surfaces are real CC0 scans
// (ambientCG, Poly Haven; CREDITS.md) under real light with soft shadows. No glows; blue only in the blueprints.
//   A · Architect's model (on the page until Wajih picks): white card walls and floor, open to the light above like
//       a scale model, real soft shadows, thin black metal frames. Still ink on paper: the drafting grid is printed
//       on the card and the corridor's edges stay hairlines.
//   B · Gallery: plaster walls and ceiling, a pale oak floor, soft pools of light from a picture light over each frame.
//   C · Engineering lab: concrete, brushed steel frames, a precise grid of ceiling light strips.
// THE SWITCH: `HALL` is the look the real dive uses. `?hall=B` in the address previews another look on the real
// page (for review only; nothing is stored).
export const HALL = 'A';

export function hallPick() {
  try { const q = new URLSearchParams(location.search).get('hall'); if (q && LOOKS[q.toUpperCase()]) return q.toUpperCase(); } catch (e) {}
  return HALL;
}

// tex: a folder in site/media/materials/ (color.webp + normal.webp). tile: world size of one repeat, in CSS px
// (a number, or 'h' * k = k times the corridor's height). Colours are [light, dark].
export const LOOKS = {
  A: {
    id: 'A', name: 'Architect’s model', exposure: 1.08,
    walls: { tex: 'Paper001', tile: 400, grid: true, color: ['#FFFFFF', '#FFFFFF'], base: ['#F5F4F1', '#1C1C1B'], rough: 0.92, normal: 0.35, env: 0.35 },
    floor: { tex: 'Paper001', tile: 400, grid: true, color: ['#FFFFFF', '#FFFFFF'], base: ['#F3F2EE', '#191918'], rough: 0.92, normal: 0.35, env: 0.35 },
    ceiling: null,                                  // open to the light, like a model on a table
    edges: 0.42,                                    // the corridor's edges stay ink hairlines
    wallsCast: true,                                // the walls' own shadows fall on the floor
    frame: { w: 0.013, d: 0.05, color: ['#151515', '#C4C2BD'], metal: [0.65, 1], rough: [0.36, 0.34] },
    mat: ['#FBFAF7', '#2B2B29'],
    glass: 0.2,
    // light: a soft key from above, front left (a window over the model), a sky / ground fill, the studio's reflections
    key: { dir: [-0.38, 0.85, 0.9], i: [2.6, 1.4], color: '#FFFFFF', radius: 5 },
    hemi: { sky: ['#FFFFFF', '#D8D6D0'], ground: ['#D9D6CF', '#2A2927'], i: [1.25, 0.32] },
    env: [0.9, 0.55],
  },
  B: {
    id: 'B', name: 'Gallery', exposure: 1.0,
    walls: { tex: 'Plaster002', tile: ['h', 0.9], color: ['#FFFFFF', '#5A5855'], rough: 0.95, normal: 0.6, env: 0.2 },
    floor: { tex: 'ph-laminate_floor_03', tile: ['h', 0.75], color: ['#FFFFFF', '#5E5B57'], rough: 0.5, normal: 0.5, env: 0.45 },
    ceiling: { tex: 'Plaster002', tile: ['h', 0.9], color: ['#FFFFFF', '#4A4846'], rough: 0.95, normal: 0.4, env: 0.15 },
    edges: 0,
    wallsCast: false,
    frame: { w: 0.024, d: 0.055, color: ['#1B1916', '#1B1916'], metal: [0, 0], rough: [0.58, 0.58] },
    mat: ['#F8F6F1', '#EFECE5'],
    glass: 0.18,
    key: { dir: [-0.2, 1, 0.45], i: [0.9, 0.18], color: '#FFF6EA', radius: 6 },
    hemi: { sky: ['#FFFFFF', '#BFB8AE'], ground: ['#E2D6C4', '#3A332B'], i: [0.8, 0.2] },
    env: [0.7, 0.25],
    // one picture light per frame: a warm spot from the ceiling, its pool covering the frame at rest and as it faces you
    spots: { i: [5, 6], color: '#FFF1E2', angle: 0.42, penumbra: 0.75 },
  },
  C: {
    id: 'C', name: 'Engineering lab', exposure: 1.0,
    walls: { tex: 'Concrete034', tile: ['h', 1.1], aspect: 2, color: ['#FFFFFF', '#55575A'], rough: 0.82, normal: 0.7, env: 0.3 },
    floor: { tex: 'Concrete034', tile: ['h', 1.1], aspect: 2, color: ['#9C9C9C', '#3A3B3D'], rough: 0.42, normal: 0.45, env: 0.6 },
    ceiling: { tex: 'Concrete034', tile: ['h', 1.1], aspect: 2, color: ['#E4E4E4', '#46484A'], rough: 0.85, normal: 0.6, env: 0.2 },
    edges: 0,
    wallsCast: false,
    frame: { w: 0.016, d: 0.05, color: ['#C9CACC', '#C9CACC'], metal: [1, 1], rough: [0.3, 0.3] },
    mat: ['#F2F2F0', '#E2E2DF'],
    glass: 0.2,
    key: { dir: [0.12, 1, 0.3], i: [1.7, 0.9], color: '#FFFFFF', radius: 4 },
    hemi: { sky: ['#FFFFFF', '#9A9DA2'], ground: ['#8E8E8C', '#2A2B2C'], i: [1.0, 0.4] },
    env: [0.8, 0.4],
    // a precise grid of light strips on the ceiling: two along the corridor, one across every `every` x the height
    strips: { along: [-0.24, 0.24], width: 0.022, every: 0.62, color: ['#FFFFFF', '#F4F6F8'] },
  },
};
