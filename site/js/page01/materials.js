// The phone's real stage: three material options, every map a CC0 scan from ambientCG (ambientcg.com, CC0 1.0),
// converted by tools/materials.py into site/media/materials/<AssetId>/. Shown side by side on the asset sheet
// (site/dev/assets.html) for Wajih's pick; page 1 uses PICK (B, Wajih's pick).
// Each option dresses the frame (the band you see from the front, turned) and the back panel. Restrained, even light.
export const OPTIONS = {
  A: { name: 'Satin aluminium · frosted white', note: 'Brushed aluminium band, a fine-grain white back.',
    frame: { set: 'Metal009', color: 0xE6E8EB, metalness: 0.9, env: 1.7, roughness: 0.36, rough: 1.0, normal: 0.35, repeat: 1 / 36 },
    back: { set: 'Plastic010', color: 0xEDEDEA, metalness: 0, roughness: 0.62, rough: 1.0, normal: 0.25, repeat: 1 / 60 } },
  B: { name: 'Titanium · black glass', note: 'Bead-blasted titanium band, a deep black glass back.',
    frame: { set: 'Metal059A', color: 0xBDB9B2, metalness: 0.9, env: 1.6, roughness: 0.46, rough: 1.0, normal: 0.3, repeat: 1 / 40 },
    back: { set: 'Plastic010', color: 0x151619, metalness: 0, roughness: 0.18, rough: 0.6, normal: 0.12, repeat: 1 / 60 } },
  C: { name: 'Graphite · black leather', note: 'Dark brushed steel band, a black leather back.',
    frame: { set: 'Metal009', color: 0x76787D, metalness: 0.9, env: 1.5, roughness: 0.38, rough: 1.0, normal: 0.35, repeat: 1 / 36 },
    back: { set: 'Leather027', color: 0xFFFFFF, metalness: 0, roughness: 0.75, rough: 1.0, normal: 0.6, repeat: 1 / 45 } },
};
export const PICK = 'B';   // Wajih's pick on the asset sheet (23 Nov): titanium + black glass
export const SOURCES = {
  Metal009: 'ambientCG Metal 009 (brushed metal), CC0',
  Metal059A: 'ambientCG Metal 059 A (titanium), CC0',
  Plastic010: 'ambientCG Plastic 010 (smooth plastic), CC0',
  Leather027: 'ambientCG Leather 027 (black leather), CC0',
};

/** load one option's maps onto two MeshStandardMaterials (frame, back); resolves when the textures are in */
export function dress(THREE, renderer, opt, mats, base = 'media/materials/') {
  const loader = new THREE.TextureLoader(), aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const tex = (url, srgb, rep) => new Promise((res) => loader.load(url, (t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.anisotropy = aniso;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    try { renderer.initTexture(t); } catch (e) {}   // upload now, not on the first real frame
    res(t);
  }, undefined, () => res(null)));
  const one = async (spec, m) => {
    const dir = `${base}${spec.set}/`;
    const [map, rough, normal] = await Promise.all([tex(`${dir}color.webp`, true, spec.repeat), tex(`${dir}rough.webp`, false, spec.repeat), tex(`${dir}normal.webp`, false, spec.repeat)]);
    m.forEach((mm) => {
      mm.map = map; mm.roughnessMap = rough; mm.normalMap = normal;
      if (normal) mm.normalScale.set(spec.normal, spec.normal);
      mm.color.setHex(spec.color); mm.metalness = spec.metalness; mm.roughness = spec.roughness * spec.rough; mm.envMapIntensity = spec.env ?? 1;
      mm.needsUpdate = true;
    });
  };
  return Promise.all([one(opt.frame, mats.frame), one(opt.back, mats.back)]);
}
