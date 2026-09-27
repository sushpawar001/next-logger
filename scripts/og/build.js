// Builds the 1200×630 share cards (Open Graph / Twitter) for the /tools pages
// into public/og/<slug>.png. Text is outlined with Inter so the cards look the
// same wherever they are rendered. See README.md for how to run it.
//
// Usage (from a scratch folder, not the app): node build.js <repoRoot>
const fs = require("fs");
const path = require("path");
const opentype = require("opentype.js");
const sharp = require("sharp");

const REPO = process.argv[2];
if (!REPO) throw new Error("pass the repo root");
const OUT = path.join(REPO, "public/og");
const FONT_DIR = process.env.INTER_DIR || __dirname;

const C = {
    ink: "#241A33",
    primary: "#4A3470",
    lavender: "#8E78C4",
    oat: "#E8DFD0",
    cream: "#FAF7F2",
    body: "#5B5068",
    muted: "#6E6480",
    chip: "#EDE6F7",
};

const font = (file) => opentype.loadSync(path.join(FONT_DIR, file));
const F = {
    medium: font("Inter-Medium.ttf"),
    semibold: font("Inter-SemiBold.ttf"),
    bold: font("Inter-Bold.ttf"),
};

// Card copy is shorter than the page titles so it fits the card. Every slug
// must match a tool or hub in src/lib/tools/registry.ts (or "tools" for the
// index); src/lib/tools/seo.test.ts checks each page has its PNG.
const CARDS = [
    // slug, eyebrow, title, subtitle, example, icon, flags
    ["tools", "FitDose tools", "Free Health Calculators", "Diabetes, body, energy and strength", "19 calculators · free · no sign-up", "layout-grid"],
    ["diabetes", "Guide", "Diabetes Calculators", "A1c, blood sugar, GMI and insulin tools", "6 calculators · mg/dL and mmol/L", "book-open"],
    ["a1c-calculator", "Diabetes", "A1c Calculator", "A1c to estimated average glucose, and back", "A1c 7.0% ≈ 154 mg/dL · 8.6 mmol/L", "droplet"],
    ["blood-sugar-converter", "Diabetes", "Blood Sugar Converter", "mg/dL ↔ mmol/L, with fasting and low ranges", "126 mg/dL = 7.0 mmol/L", "arrow-right-left"],
    ["gmi-calculator", "Diabetes", "GMI & Time in Range", "Readings to GMI, variability and CGM targets", "Mean 145 mg/dL → GMI 6.8%", "gauge"],
    ["insulin-sensitivity-factor-calculator", "Diabetes", "Insulin Sensitivity Factor", "Correction factor from the 1800 or 1500 rule", "1800 ÷ 40 units = 45 mg/dL per unit", "crosshair", { education: true }],
    ["insulin-to-carb-ratio-calculator", "Diabetes", "Insulin-to-Carb Ratio", "Grams of carbohydrate per unit of insulin", "500 ÷ 50 units = 1 : 10", "wheat", { education: true }],
    ["bolus-calculator", "Diabetes", "Bolus Insulin Calculator", "Meal dose plus correction, step by step", "carbs ÷ ratio + (glucose − target) ÷ ISF", "syringe", { education: true }],
    ["bmi-calculator", "Body composition", "BMI Calculator", "Body Mass Index with WHO categories", "75 kg · 180 cm → BMI 23.1", "calculator"],
    ["body-fat-calculator", "Body composition", "Body Fat Calculator", "US Navy tape method with ACE categories", "Neck 38 · waist 86 · 178 cm → 17.2%", "percent"],
    ["ideal-weight-calculator", "Body composition", "Ideal Weight Calculator", "Devine, Robinson, Miller and Hamwi compared", "Men, 5 ft 10 in → Devine 73.0 kg", "target"],
    ["whr-calculator", "Body composition", "Waist-to-Hip Ratio", "WHO risk ranges for men and women", "Waist 85 ÷ hip 100 = 0.85", "ruler"],
    ["waist-to-height-ratio-calculator", "Body composition", "Waist-to-Height Ratio", "Keep your waist under half your height", "Waist 84 ÷ height 172 = 0.49", "move-vertical"],
    ["weight-loss-percentage-calculator", "Body composition", "Weight Loss Percentage", "Progress, weekly rate and goal date", "100 kg → 92 kg = 8.0% lost", "chart-line"],
    ["bmr-calculator", "Energy & nutrition", "BMR Calculator", "Calories burned at rest (Mifflin-St Jeor)", "30 y · 180 cm · 80 kg → 1,780 kcal", "flame"],
    ["tdee-calculator", "Energy & nutrition", "TDEE Calculator", "Total daily energy expenditure", "BMR 1,780 × 1.375 = 2,448 kcal a day", "zap"],
    ["calorie-deficit-calculator", "Energy & nutrition", "Calorie Deficit Calculator", "A daily target to lose 0.25–1 kg a week", "0.5 kg a week = 550 kcal a day", "trending-down"],
    ["maintenance-calorie-calculator", "Energy & nutrition", "Maintenance Calories", "The intake that keeps your weight steady", "TDEE 2,400 → 2,300–2,500 kcal", "scale"],
    ["water-intake-calculator", "Energy & nutrition", "Water Intake Calculator", "Daily water from weight, height and activity", "Litres · ounces · cups a day", "glass-water"],
    ["plate-calculator", "Strength", "Plate Calculator", "What to load on each side of the bar", "100 kg = 20 kg bar + 25 + 15 a side", "dumbbell"],
    ["one-rep-max-calculator", "Strength", "One Rep Max Calculator", "Epley, Brzycki and Lombardi, with training loads", "100 kg × 5 reps → 1RM ≈ 115.5 kg", "trophy"],
];

const esc = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Outlined text: path data plus its advance width, with kerning and tracking. */
function text(f, str, x, y, size, tracking = 0) {
    const scale = size / f.unitsPerEm;
    const glyphs = f.stringToGlyphs(str);
    let cursor = x;
    let d = "";
    glyphs.forEach((glyph, i) => {
        d += glyph.getPath(cursor, y, size).toPathData(2);
        const kern = i < glyphs.length - 1 ? f.getKerningValue(glyph, glyphs[i + 1]) : 0;
        cursor += (glyph.advanceWidth + kern) * scale + tracking;
    });
    return { d, width: cursor - x - tracking };
}

function iconSvg(name) {
    const file = path.join(REPO, "node_modules/lucide-react/dist/esm/icons", `${name}.mjs`);
    const src = fs.readFileSync(file, "utf8");
    const match = src.match(/const __iconData = (\{[\s\S]*?\n\});/);
    if (!match) throw new Error(`No icon data in ${name}`);
    return Function(`return ${match[1]}`)()
        .node.map(([tag, attrs]) => {
            const a = Object.entries(attrs)
                .filter(([k]) => k !== "key")
                .map(([k, v]) => `${k}="${esc(v)}"`)
                .join(" ");
            return `<${tag} ${a}/>`;
        })
        .join("");
}

const wordmarkSrc = fs.readFileSync(path.join(REPO, "public/brand/svg/fitdose-wordmark.svg"), "utf8");
const wordmarkViewBox = wordmarkSrc.match(/viewBox="([^"]+)"/)[1];
const [, , vbW, vbH] = wordmarkViewBox.split(" ").map(Number);
const wordmarkInner = wordmarkSrc
    .replace(/^<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replace(/<title>.*?<\/title>/, "");

/** One line if it fits, else the two-line split with the shortest longest line. */
function balance(str, maxChars) {
    if (str.length <= maxChars) return [str];
    const words = str.split(" ");
    let best = null;
    for (let i = 1; i < words.length; i++) {
        const lines = [words.slice(0, i).join(" "), words.slice(i).join(" ")];
        const longest = Math.max(...lines.map((l) => l.length));
        if (!best || longest < best.longest) best = { lines, longest };
    }
    return best.lines;
}

function card([, eyebrow, title, subtitle, example, icon, flags = {}]) {
    const X = 80;
    const titleSize = 68;
    const lines = balance(title, 17);
    const lineHeight = Math.round(titleSize * 1.1);
    const titleTop = 238;
    const titleBottom = titleTop + (lines.length - 1) * lineHeight;
    const subY = titleBottom + 58;
    const chipY = subY + 44;
    const chipH = 62;

    const eyebrowText = text(F.bold, eyebrow.toUpperCase(), X, 160, 22, 2.6);
    const titleText = lines.map((l, i) => text(F.bold, l, X, titleTop + i * lineHeight, titleSize, -1.4).d).join("");
    const subText = text(F.medium, subtitle, X, subY, 30);
    const exampleText = text(F.semibold, example, X + 26, chipY + 41, 27);
    const chipW = Math.round(exampleText.width + 52);

    for (const [label, width] of [["title", Math.max(...lines.map((l) => text(F.bold, l, 0, 0, titleSize, -1.4).width))], ["subtitle", subText.width], ["example", chipW]]) {
        if (X + width > 880) throw new Error(`${title}: ${label} runs into the icon (${Math.round(X + width)}px)`);
    }

    let footer;
    if (flags.education) {
        const badge = text(F.semibold, "For education only", 0, 0, 20);
        const badgeW = Math.round(badge.width + 44);
        footer = `<rect x="${X}" y="548" width="${badgeW}" height="44" rx="22" fill="none" stroke="${C.primary}" stroke-width="2"/>
<path fill="${C.primary}" d="${text(F.semibold, "For education only", X + 22, 577, 20).d}"/>
<path fill="${C.muted}" d="${text(F.medium, "Free · runs in your browser", X + badgeW + 24, 577, 22).d}"/>`;
    } else {
        footer = `<path fill="${C.muted}" d="${text(F.medium, "Free · runs in your browser · nothing stored", X, 577, 22).d}"/>`;
    }

    const wordmarkH = 44;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
<rect width="1200" height="630" fill="${C.cream}"/>
<circle cx="1015" cy="330" r="318" fill="${C.oat}"/>
<circle cx="1015" cy="330" r="318" fill="none" stroke="${C.lavender}" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="2 10"/>
<rect x="885" y="200" width="260" height="260" rx="64" fill="${C.primary}"/>
<g transform="translate(915 230) scale(8.333)" fill="none" stroke="${C.cream}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${iconSvg(icon)}</g>
<svg x="${X}" y="60" height="${wordmarkH}" width="${((wordmarkH * vbW) / vbH).toFixed(1)}" viewBox="${wordmarkViewBox}">${wordmarkInner}</svg>
<path fill="${C.primary}" d="${eyebrowText.d}"/>
<path fill="${C.ink}" d="${titleText}"/>
<path fill="${C.body}" d="${subText.d}"/>
<rect x="${X}" y="${chipY}" width="${chipW}" height="${chipH}" rx="16" fill="${C.chip}"/>
<path fill="${C.primary}" d="${exampleText.d}"/>
${footer}
</svg>`;
}

(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    for (const c of CARDS) {
        const svg = card(c);
        await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.join(OUT, `${c[0]}.png`));
    }
    console.log(`Wrote ${CARDS.length} cards to ${OUT}`);
})();
