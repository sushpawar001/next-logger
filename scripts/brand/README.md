# FitDose logo — final assets

Assets live in `public/brand/` (served at `/brand/...`). Generated 2026-09-26 by `scripts/brand/build.js`. Colours and rules: `docs/designs/brand-guidelines.md` (local-only).

All SVGs are **pure outlined paths**: no live text, masks, clip paths or `<use>`. They look identical everywhere (browsers, Figma, Illustrator, print) and need no font installed. The wordmark lettering is Inter Bold (SIL Open Font License, which allows use in logos).

The wave in every drop is a **real cut-out**. On transparent PNGs the background shows through the gap, so the logo works on any backing colour.

## Which file do I use?

| Need | File |
|---|---|
| Website header, docs, email signature (light background) | `public/brand/svg/fitdose-wordmark.svg` |
| Same, on dark / Night / photo with dark overlay | `public/brand/svg/fitdose-wordmark-reversed.svg` |
| One-colour print, stamp, fax | `public/brand/svg/fitdose-wordmark-mono-ink.svg` |
| One-colour on Aubergine (merch, slides) | `public/brand/svg/fitdose-wordmark-mono-cream.svg` |
| Symbol alone (avatar badge, loading state, watermark) | `public/brand/svg/fitdose-mark*.svg` |
| App store, social profile picture | `public/brand/png/fitdose-app-icon-1024.png` |
| Splash screen, pitch deck title | `public/brand/svg/fitdose-lockup-stacked.svg` |
| Link previews (Open Graph / Twitter card) | `public/brand/png/og-image-1200x630.png` |

**Prefer the wordmark on its own.** The lockups repeat the drop (once in the icon, once as the "o"). Use them only where the app-icon association matters, such as app-store listings, onboarding and install prompts.

## Contents

### `public/brand/svg/` (master vectors, 16 files)
| File | Colourway |
|---|---|
| `fitdose-wordmark` | Ink letters · Aubergine/Lavender drop |
| `fitdose-wordmark-reversed` | Cream letters · Cream/Lavender drop |
| `fitdose-wordmark-mono-ink` / `-mono-cream` | Single colour |
| `fitdose-mark` / `-reversed` / `-mono-ink` / `-mono-cream` | Drop only, same four colourways |
| `fitdose-app-icon` | Rounded Aubergine tile (25% corner radius) |
| `fitdose-app-icon-square` | Full-bleed square. iOS/Android apply their own mask |
| `favicon` | Simplified drop (bolder gap, one colour) for ≤ 24 px |
| `fitdose-lockup-horizontal` / `-reversed` | Icon + wordmark side by side |
| `fitdose-lockup-stacked` / `-reversed` | Icon above wordmark |
| `og-image` | 1200 × 630 social card on Cream |

### `public/brand/png/` (25 files, transparent unless noted)
- Wordmarks and horizontal lockups at **4000 px** and **1000 px** wide
- Marks at **2048 px** tall
- Stacked lockups at **2000 px** wide
- `fitdose-app-icon-1024/512/192.png`: rounded, transparent corners (PWA `purpose: "any"`)
- `fitdose-app-icon-square-1024.png`: full-bleed, for app stores
- `icon-maskable-512.png`: full-bleed, **opaque**, drop inside the 80% safe zone (PWA `purpose: "maskable"`)
- `apple-touch-icon.png`: 180 × 180, **opaque** (iOS rounds the corners itself)
- `og-image-1200x630.png`: **opaque**

### `public/brand/favicon/`
`favicon.ico` (16 + 32 + 48 in one file), `favicon.svg`, `favicon-16/32/48.png`.

## Wiring into the Next.js app
In the App Router, placing files in `src/app/` is enough: `favicon.ico`, `icon.svg` (← `favicon.svg`), `apple-icon.png` (← `apple-touch-icon.png`), `opengraph-image.png` (← `og-image-1200x630.png`). Next.js then emits the `<link>`/`<meta>` tags automatically. PWA icons go in `public/` and are referenced from the web manifest.

## Rebuilding
```bash
# run from a scratch folder, not the app (these are not app dependencies)
npm i opentype.js@1 sharp paper
# put Inter Bold (700) as b.ttf next to build.js
node scripts/brand/build.js public/brand
```
The master drop geometry, the wave and all colours are defined at the top of `build.js`. Change them there and rebuild. Never edit the exported files by hand.
