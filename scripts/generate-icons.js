/**
 * Generates the PWA icon set into public/icons/.
 *
 * Standalone, zero-dependency: rasterises the FitDose mark (Lucide `Activity`
 * glyph on the brand gradient) and encodes PNGs using only node:zlib. Kept in
 * the repo because there is no sharp / ImageMagick in this environment, so this
 * is the only way to regenerate the set after a design tweak.
 *
 *   node scripts/generate-icons.js
 *
 * Source of truth for the artwork is public/icons/source.svg — keep the two in
 * sync by eye if you edit either.
 */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// --- Brand -----------------------------------------------------------------

// bg-gradient-to-br from-[#5E4AE3] to-[#7C3AED] (see DashboardHeader.tsx)
const GRADIENT_FROM = [0x5e, 0x4a, 0xe3];
const GRADIENT_TO = [0x7c, 0x3a, 0xed];
const GLYPH = [0xff, 0xff, 0xff];

// Lucide `activity`, 24x24 viewBox, stroke-width 2, round cap + join.
const ACTIVITY_POINTS = [
    [22, 12],
    [18, 12],
    [15, 21],
    [9, 3],
    [6, 12],
    [2, 12],
];
const VIEWBOX = 24;
const STROKE_WIDTH = 2;

const SAMPLES = 4; // supersampling factor per axis, for antialiasing

// --- Geometry --------------------------------------------------------------

function distanceToSegment(px, py, ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    const lengthSquared = dx * dx + dy * dy;
    let t = lengthSquared === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + t * dx;
    const cy = ay + t * dy;
    return Math.hypot(px - cx, py - cy);
}

// Distance to the whole polyline. Because we threshold on distance, round caps
// and round joins fall out for free — no special-casing needed.
function distanceToGlyph(px, py, points) {
    let best = Infinity;
    for (let i = 0; i < points.length - 1; i++) {
        const d = distanceToSegment(px, py, points[i][0], points[i][1], points[i + 1][0], points[i + 1][1]);
        if (d < best) best = d;
    }
    return best;
}

// --- Rasteriser ------------------------------------------------------------

/**
 * @param {number} size      output edge length in px
 * @param {number} glyphScale fraction of the canvas the 24x24 glyph box spans
 * @returns {Buffer} raw RGB pixel data, size*size*3
 */
function renderIcon(size, glyphScale) {
    const pixels = Buffer.alloc(size * size * 3);

    const glyphBox = size * glyphScale;
    const glyphOrigin = (size - glyphBox) / 2;
    const unitsPerPixel = VIEWBOX / glyphBox;
    const halfStroke = STROKE_WIDTH / 2;

    const inverseSamples = 1 / SAMPLES;
    const samplesTotal = SAMPLES * SAMPLES;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            // Background: 45-degree linear gradient, top-left -> bottom-right.
            const t = (x + y) / (2 * (size - 1));
            const bgR = Math.round(GRADIENT_FROM[0] + (GRADIENT_TO[0] - GRADIENT_FROM[0]) * t);
            const bgG = Math.round(GRADIENT_FROM[1] + (GRADIENT_TO[1] - GRADIENT_FROM[1]) * t);
            const bgB = Math.round(GRADIENT_FROM[2] + (GRADIENT_TO[2] - GRADIENT_FROM[2]) * t);

            // Supersample the glyph to get an antialiased coverage value.
            let covered = 0;
            for (let sy = 0; sy < SAMPLES; sy++) {
                for (let sx = 0; sx < SAMPLES; sx++) {
                    const px = (x + (sx + 0.5) * inverseSamples - glyphOrigin) * unitsPerPixel;
                    const py = (y + (sy + 0.5) * inverseSamples - glyphOrigin) * unitsPerPixel;
                    if (distanceToGlyph(px, py, ACTIVITY_POINTS) <= halfStroke) covered++;
                }
            }
            const alpha = covered / samplesTotal;

            const offset = (y * size + x) * 3;
            pixels[offset] = Math.round(bgR + (GLYPH[0] - bgR) * alpha);
            pixels[offset + 1] = Math.round(bgG + (GLYPH[1] - bgG) * alpha);
            pixels[offset + 2] = Math.round(bgB + (GLYPH[2] - bgB) * alpha);
        }
    }

    return pixels;
}

// --- PNG encoder (colour type 2, 8-bit RGB, no alpha) ----------------------

const CRC_TABLE = (() => {
    const table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c;
    }
    return table;
})();

function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData), 0);
    return Buffer.concat([length, typeAndData, crc]);
}

function encodePng(pixels, size) {
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(size, 0); // width
    ihdr.writeUInt32BE(size, 4); // height
    ihdr[8] = 8; // bit depth
    ihdr[9] = 2; // colour type: truecolour RGB
    ihdr[10] = 0; // deflate
    ihdr[11] = 0; // adaptive filtering
    ihdr[12] = 0; // no interlace

    // One filter byte (0 = None) per scanline.
    const stride = size * 3;
    const raw = Buffer.alloc((stride + 1) * size);
    for (let y = 0; y < size; y++) {
        raw[y * (stride + 1)] = 0;
        pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
    }

    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk("IHDR", ihdr),
        chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
        chunk("IEND", Buffer.alloc(0)),
    ]);
}

// --- Output ----------------------------------------------------------------

// Maskable icons get a smaller glyph so the mark survives Android's adaptive
// mask, which can crop up to the outer 20% on each edge.
const TARGETS = [
    { file: "icon-192.png", size: 192, glyphScale: 0.55 },
    { file: "icon-512.png", size: 512, glyphScale: 0.55 },
    { file: "icon-maskable-512.png", size: 512, glyphScale: 0.42 },
    { file: "apple-touch-icon.png", size: 180, glyphScale: 0.55 },
];

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

for (const target of TARGETS) {
    const png = encodePng(renderIcon(target.size, target.glyphScale), target.size);
    fs.writeFileSync(path.join(outDir, target.file), png);
    console.log(`${target.file.padEnd(24)} ${target.size}x${target.size}  ${(png.length / 1024).toFixed(1)} KB`);
}

console.log(`\nWrote ${TARGETS.length} icons to public/icons/`);
