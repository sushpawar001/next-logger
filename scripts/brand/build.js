// Builds the final FitDose logo assets: outlined SVGs, PNGs, favicon.ico.
// Usage: node build.js <outDir>
const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');
const paper = require('paper');
const sharp = require('sharp');

const OUT = process.argv[2];
if (!OUT) throw new Error('pass output dir');
const SVG_DIR = path.join(OUT, 'svg');
const PNG_DIR = path.join(OUT, 'png');
const FAV_DIR = path.join(OUT, 'favicon');
for (const d of [SVG_DIR, PNG_DIR, FAV_DIR]) fs.mkdirSync(d, { recursive: true });

const C = { ink: '#241A33', aub: '#4A3470', lav: '#8E78C4', oat: '#E8DFD0', cream: '#FAF7F2', lavLight: '#B9A9DC' };

const bold = opentype.loadSync(path.join(__dirname, 'b.ttf'));
if (bold.tables.os2.usWeightClass !== 700) throw new Error('b.ttf must be Inter Bold (700)');

paper.setup(new paper.Size(1000, 1000));

// ── Master drop geometry (100 × 118 grid: tip (50,12), body circle Ø88 at (50,82)) ──
const DROP = 'M50,12 C44,24 6,54 6,82 A44,44 0 0 0 94,82 C94,54 56,24 50,12 Z';
const wave = (dy) => `M-10,${84 + dy} C10,${72 + dy} 30,${72 + dy} 50,${84 + dy} S90,${96 + dy} 110,${84 + dy}`;

function dropGeometry(gap) {
  const h = gap / 2;
  const drop = new paper.Path(DROP);
  const above = new paper.Path(`${wave(-h)} V-10 H-10 Z`);
  const below = new paper.Path(`${wave(h)} V140 H-10 Z`);
  const top = drop.intersect(above);
  const level = drop.intersect(below);
  return { drop, top, level };
}
const GEO_FULL = dropGeometry(6);
const GEO_SIMPLE = dropGeometry(13);

// Returns SVG path data for the drop placed so that 1 unit = s px and grid origin at (tx,ty).
function placeDrop(geo, s, tx, ty) {
  const m = new paper.Matrix(s, 0, 0, s, tx, ty);
  const d = (item) => { const c = item.clone({ insert: false }); c.transform(m); return c.getPathData(null, 2); };
  return { top: d(geo.top), level: d(geo.level) };
}
// Place by circle: centre (cx,cy), diameter D.
function dropByCircle(geo, cx, cy, D) {
  const s = D / 88;
  return { ...placeDrop(geo, s, cx - 50 * s, cy - 82 * s), s, bbox: { x1: cx - 44 * s, x2: cx + 44 * s, y1: cy - 70 * s, y2: cy + 44 * s } };
}

// ── Text outlines ──
function layout(font, text, size, trackingEm) {
  const scale = size / font.unitsPerEm;
  let x = 0; const glyphs = [];
  const chars = [...text];
  chars.forEach((ch, i) => {
    const g = font.charToGlyph(ch);
    const p = g.getPath(x, 0, size);
    glyphs.push({ ch, path: p, bbox: p.getBoundingBox(), x });
    x += g.advanceWidth * scale + trackingEm * size;
    if (i < chars.length - 1) x += font.getKerningValue(g, font.charToGlyph(chars[i + 1])) * scale;
  });
  return glyphs;
}
const union = (bs) => bs.reduce((a, b) => ({ x1: Math.min(a.x1, b.x1), y1: Math.min(a.y1, b.y1), x2: Math.max(a.x2, b.x2), y2: Math.max(a.y2, b.y2) }));
const translatePath = (d, dx, dy) => { const p = new paper.CompoundPath(d); p.translate(new paper.Point(dx, dy)); const out = p.getPathData(null, 2); p.remove(); return out; };

// ── Wordmark at font size 1000 (baseline y=0) ──
const F = 1000;
const WM = (() => {
  const gl = layout(bold, 'fitdose', F, -0.02);
  const o = gl.find((g) => g.ch === 'o');
  const D = 0.95 * (o.bbox.x2 - o.bbox.x1);
  const cx = (o.bbox.x1 + o.bbox.x2) / 2;
  const cy = o.bbox.y2 - D / 2; // circle bottom sits on the o's baseline overshoot
  const drop = dropByCircle(GEO_FULL, cx, cy, D);
  const letters = gl.filter((g) => g.ch !== 'o');
  const lettersD = letters.map((g) => g.path.toPathData(2)).join('');
  const bbox = union([...letters.map((g) => g.bbox), drop.bbox]);
  const asc = -gl.find((g) => g.ch === 'd').bbox.y1;
  return { lettersD, drop, bbox, asc };
})();

function wordmarkGroup(colors, dx = 0, dy = 0, k = 1) {
  const t = `translate(${dx.toFixed(2)} ${dy.toFixed(2)}) scale(${k})`;
  return `<g transform="${t}"><path fill="${colors.letters}" d="${WM.lettersD}"/><path fill="${colors.top}" d="${WM.drop.top}"/><path fill="${colors.level}" d="${WM.drop.level}"/></g>`;
}

// ── Icon (144 grid) ──
function iconGroup({ rounded = true, simple = false } = {}) {
  const rx = rounded ? (simple ? 32 : 36) : 0;
  const d = simple ? placeDrop(GEO_SIMPLE, 0.82, 31, 23.6 - 10 * 0.82) : placeDrop(GEO_FULL, 0.72, 36, 27.5 - 10 * 0.72);
  const fillLevel = simple ? C.cream : C.lav;
  return `<rect width="144" height="144" rx="${rx}" fill="${C.aub}"/><path fill="${C.cream}" d="${d.top}"/><path fill="${fillLevel}" d="${d.level}"/>`;
}

const svgDoc = (vb, w, h, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}"><title>${title}</title>${body}</svg>\n`;

const COLORWAYS = {
  '':            { letters: C.ink,   top: C.aub,   level: C.lav },
  '-reversed':   { letters: C.cream, top: C.cream, level: C.lav },
  '-mono-ink':   { letters: C.ink,   top: C.ink,   level: C.ink },
  '-mono-cream': { letters: C.cream, top: C.cream, level: C.cream },
};

const files = []; // { name, svg, w, h, pngs: [{file, width, height?}] }
const add = (name, svg, w, h, pngs = []) => { fs.writeFileSync(path.join(SVG_DIR, name + '.svg'), svg); files.push({ name, svg, w, h, pngs }); };

// Wordmarks
{
  const pad = WM.asc * 0.06;
  const b = WM.bbox; const w = b.x2 - b.x1 + 2 * pad; const h = b.y2 - b.y1 + 2 * pad;
  for (const [suf, col] of Object.entries(COLORWAYS)) {
    const body = wordmarkGroup(col, -b.x1 + pad, -b.y1 + pad);
    add(`fitdose-wordmark${suf}`, svgDoc(`0 0 ${w.toFixed(2)} ${h.toFixed(2)}`, w.toFixed(0), h.toFixed(0), body, 'FitDose'), w, h,
      [{ file: `fitdose-wordmark${suf}@4000w.png`, width: 4000 }, { file: `fitdose-wordmark${suf}@1000w.png`, width: 1000 }]);
  }
}

// Mark (drop only)
{
  const D = 880; const drop = dropByCircle(GEO_FULL, 500, 0, D);
  const pad = 40; const b = drop.bbox;
  const w = b.x2 - b.x1 + 2 * pad; const h = b.y2 - b.y1 + 2 * pad;
  for (const [suf, col] of Object.entries(COLORWAYS)) {
    const body = `<g transform="translate(${(-b.x1 + pad).toFixed(2)} ${(-b.y1 + pad).toFixed(2)})"><path fill="${col.top}" d="${drop.top}"/><path fill="${col.level}" d="${drop.level}"/></g>`;
    add(`fitdose-mark${suf}`, svgDoc(`0 0 ${w.toFixed(2)} ${h.toFixed(2)}`, w.toFixed(0), h.toFixed(0), body, 'FitDose mark'), w, h,
      [{ file: `fitdose-mark${suf}@2048h.png`, height: 2048 }]);
  }
}

// App icons
add('fitdose-app-icon', svgDoc('0 0 144 144', 1024, 1024, iconGroup(), 'FitDose'), 144, 144,
  [1024, 512, 192].map((s) => ({ file: `fitdose-app-icon-${s}.png`, width: s })));
add('fitdose-app-icon-square', svgDoc('0 0 144 144', 1024, 1024, iconGroup({ rounded: false }), 'FitDose'), 144, 144,
  [{ file: 'fitdose-app-icon-square-1024.png', width: 1024 }, { file: 'icon-maskable-512.png', width: 512 }, { file: 'apple-touch-icon.png', width: 180 }]);
add('favicon', svgDoc('0 0 144 144', 144, 144, iconGroup({ simple: true }), 'FitDose'), 144, 144,
  [16, 32, 48].map((s) => ({ file: `favicon-${s}.png`, width: s, dir: FAV_DIR })));

// Lockups
function lockups(suf, col) {
  const b = WM.bbox; const W = b.x2 - b.x1; const asc = WM.asc;
  // Horizontal: icon height = 1.35 × ascender, centred on the ascender midline
  {
    const I = 1.35 * asc; const gap = 0.3 * I;
    const iconY = -asc / 2 - I / 2;
    const pad = asc * 0.06;
    const x1 = 0, y1 = Math.min(iconY, b.y1), x2 = I + gap + W, y2 = Math.max(iconY + I, b.y2);
    const body = `<g transform="translate(${pad} ${(-y1 + pad).toFixed(2)})"><g transform="translate(0 ${iconY.toFixed(2)}) scale(${(I / 144).toFixed(5)})">${iconGroup()}</g>${wordmarkGroup(col, I + gap - b.x1, 0)}</g>`;
    const w = x2 - x1 + 2 * pad, h = y2 - y1 + 2 * pad;
    add(`fitdose-lockup-horizontal${suf}`, svgDoc(`0 0 ${w.toFixed(2)} ${h.toFixed(2)}`, w.toFixed(0), h.toFixed(0), body, 'FitDose'), w, h,
      [{ file: `fitdose-lockup-horizontal${suf}@4000w.png`, width: 4000 }, { file: `fitdose-lockup-horizontal${suf}@1000w.png`, width: 1000 }]);
  }
  // Stacked: icon above wordmark
  {
    const I = 0.5 * W; const gap = 0.2 * I; const pad = asc * 0.06;
    let parts = `<g transform="translate(${((W - I) / 2).toFixed(2)} 0) scale(${(I / 144).toFixed(5)})">${iconGroup()}</g>`;
    const wmTop = I + gap; // wordmark bbox top
    parts += wordmarkGroup(col, -b.x1, wmTop - b.y1);
    const H = wmTop + (b.y2 - b.y1);
    const w = W + 2 * pad, h = H + 2 * pad;
    const name = `fitdose-lockup-stacked${suf}`;
    const body = `<g transform="translate(${pad} ${pad})">${parts}</g>`;
    const svg = svgDoc(`0 0 ${w.toFixed(2)} ${h.toFixed(2)}`, w.toFixed(0), h.toFixed(0), body, 'FitDose');
    add(name, svg, w, h, [{ file: `${name}@2000w.png`, width: 2000 }]);
    if (suf === '') lockups.stacked = { body: parts, w: W, h: H };
  }
}
lockups('', COLORWAYS['']);
lockups('-reversed', COLORWAYS['-reversed']);

// OG / social image 1200×630
{
  const st = lockups.stacked; const k = 400 / st.h;
  const dx = (1200 - st.w * k) / 2, dy = (630 - st.h * k) / 2;
  const body = `<rect width="1200" height="630" fill="${C.cream}"/><g transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)}) scale(${k.toFixed(5)})">${st.body}</g>`;
  add('og-image', svgDoc('0 0 1200 630', 1200, 630, body, 'FitDose'), 1200, 630, [{ file: 'og-image-1200x630.png', width: 1200 }]);
}

// ── Rasterise ──
(async () => {
  for (const f of files) {
    for (const p of f.pngs) {
      const target = p.width ? { w: p.width, h: Math.round((p.width * f.h) / f.w) } : { h: p.height, w: Math.round((p.height * f.w) / f.h) };
      const svgW = parseFloat(f.svg.match(/width="([\d.]+)"/)[1]);
      const density = Math.min(72 * (target.w / svgW) * 2, 20000);
      let img = sharp(Buffer.from(f.svg), { density }).resize(target.w, target.h);
      if (/^(apple-touch-icon|icon-maskable|og-image)/.test(p.file)) img = img.flatten({ background: /^og/.test(p.file) ? C.cream : C.aub });
      await img.png().toFile(path.join(p.dir || PNG_DIR, p.file));
    }
  }
  // favicon.ico with PNG-encoded 16/32/48 entries
  const imgs = [16, 32, 48].map((s) => fs.readFileSync(path.join(FAV_DIR, `favicon-${s}.png`)));
  const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(imgs.length, 4);
  let offset = 6 + 16 * imgs.length; const dir = [];
  imgs.forEach((buf, i) => {
    const s = [16, 32, 48][i]; const e = Buffer.alloc(16);
    e.writeUInt8(s, 0); e.writeUInt8(s, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(buf.length, 8); e.writeUInt32LE(offset, 12);
    offset += buf.length; dir.push(e);
  });
  fs.writeFileSync(path.join(FAV_DIR, 'favicon.ico'), Buffer.concat([header, ...dir, ...imgs]));
  fs.copyFileSync(path.join(SVG_DIR, 'favicon.svg'), path.join(FAV_DIR, 'favicon.svg'));
  console.log('svg', fs.readdirSync(SVG_DIR).length, 'png', fs.readdirSync(PNG_DIR).length, 'favicon', fs.readdirSync(FAV_DIR).length);
})();
