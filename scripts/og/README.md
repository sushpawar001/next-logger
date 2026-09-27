# Share cards (Open Graph / Twitter)

`build.js` draws the 1200 × 630 link-preview cards for the public tools into `public/og/<slug>.png` (served at `/og/<slug>.png`). Page metadata points at them through `shareImage()` in `src/lib/tools/metadata.ts`.

One card per tool, one per hub (`diabetes`) and one for the tools index (`tools`). `src/lib/tools/seo.test.ts` fails if a registered tool or hub has no PNG.

## Design
Cream background, the outlined `fitdose` wordmark, an uppercase cluster label, the tool name in Inter Bold, a one-line description, a worked example on a lavender chip, and the tool's own Lucide icon in an Aubergine tile. Dosing tools carry a "For education only" badge. Colours are the Aubergine & Oat brand palette; red, amber and green stay reserved for glucose status.

All text is outlined with Inter, so the PNGs look the same on any machine. `build.js` throws if a line would run into the icon.

## Updating
Card copy lives in the `CARDS` list in `build.js` (it is shorter than the page titles so it fits). When you add a tool or change a card:

```
# run from a scratch folder, not the app (these are not app dependencies)
npm i opentype.js@1 sharp
# put Inter-Medium.ttf, Inter-SemiBold.ttf and Inter-Bold.ttf next to build.js
# (from the Inter release zip, extras/ttf/), or point INTER_DIR at them
cp <repo>/scripts/og/build.js .
node build.js <repo>
```

Keep the example numbers correct: each one is a worked calculation with the tool's real formula.
