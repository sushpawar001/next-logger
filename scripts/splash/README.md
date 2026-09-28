# iOS launch images (PWA splash)

`build.js` renders the launch images an installed iPhone/iPad shows while the app loads, into `public/splash/apple-splash-<w>x<h>.png`. The root layout links them through `appleWebApp.startupImage` (`src/lib/pwa/splash.ts`).

iOS ignores the manifest's `background_color` and icons, and only shows an image whose pixel size **exactly** matches the screen, in the matching orientation. Without one it launches on a blank screen. So there is one PNG per device size, portrait and landscape (there is no orientation lock, since `/charts` reads better in landscape).

Android builds its own splash from the manifest (`src/app/manifest.ts`): `background_color`, the 512px icon and `name`. Keep `background_color` in step with `BACKGROUND` here.

## Design
The reversed stacked lockup (`public/brand/svg/fitdose-lockup-stacked-reversed.svg`), 160 CSS px wide, centred on Aubergine `#4A3470`. The lockup's icon tile is also Aubergine, so only the cream drop and wordmark show.

## Updating
The device list is `src/lib/pwa/splash-screens.json`, shared by the metadata and this script. When Apple ships a new screen size, add it there and re-run. `src/lib/pwa/splash.test.ts` fails if a listed size has no PNG.

```
# sharp is already in the pnpm store as a Next.js dependency
NODE_PATH="$(ls -d node_modules/.pnpm/sharp@*/node_modules | head -1)" node scripts/splash/build.js "$PWD"
# or, from a scratch folder: npm i sharp && node <repo>/scripts/splash/build.js <repo>
```
