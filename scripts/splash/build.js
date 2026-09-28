// Builds the iOS launch images (apple-touch-startup-image) into
// public/splash/apple-splash-<w>x<h>.png: the reversed stacked lockup centred
// on Aubergine. The device list is src/lib/pwa/splash-screens.json, shared
// with the metadata in src/lib/pwa/splash.ts. See README.md for how to run it.
//
// Usage (from a scratch folder, not the app): node build.js <repoRoot>
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const REPO = process.argv[2];
if (!REPO) throw new Error("pass the repo root");
const OUT = path.join(REPO, "public/splash");
const SCREENS = require(path.join(REPO, "src/lib/pwa/splash-screens.json"));
const LOCKUP = fs.readFileSync(
    path.join(REPO, "public/brand/svg/fitdose-lockup-stacked-reversed.svg")
);

// Matches manifest theme_color/background_color, so Android and iOS launch on
// the same colour. The lockup's icon tile is also #4A3470, so on this
// background it disappears and only the cream drop and wordmark show.
const BACKGROUND = "#4A3470";
// Lockup width in CSS px. A fixed physical size, like a native launch screen,
// rather than a share of the screen, which would make it huge on iPads.
const LOCKUP_CSS_WIDTH = 160;

async function render(w, h, ratio) {
    const logoWidth = Math.round(LOCKUP_CSS_WIDTH * ratio);
    const logo = await sharp(LOCKUP, { density: 300 })
        .resize({ width: logoWidth })
        .png()
        .toBuffer();
    const { height: logoHeight } = await sharp(logo).metadata();

    return sharp({
        create: { width: w, height: h, channels: 3, background: BACKGROUND },
    })
        .composite([
            {
                input: logo,
                left: Math.round((w - logoWidth) / 2),
                top: Math.round((h - logoHeight) / 2),
            },
        ])
        .png({ palette: true, compressionLevel: 9 })
        .toBuffer();
}

(async () => {
    fs.rmSync(OUT, { recursive: true, force: true });
    fs.mkdirSync(OUT, { recursive: true });

    for (const s of SCREENS) {
        const pw = s.width * s.ratio;
        const ph = s.height * s.ratio;
        for (const [w, h] of [[pw, ph], [ph, pw]]) {
            const file = path.join(OUT, `apple-splash-${w}x${h}.png`);
            fs.writeFileSync(file, await render(w, h, s.ratio));
            console.log(path.relative(REPO, file));
        }
    }
})();
