import screens from "./splash-screens.json";

// iOS ignores the manifest's background_color and icons: an installed PWA
// shows a blank screen on launch unless <link rel="apple-touch-startup-image">
// supplies a PNG whose pixel size exactly matches the screen. So there is one
// image per device size and orientation. scripts/splash/build.js renders them
// into public/splash/ from the same JSON list.

export type SplashScreen = (typeof screens)[number];
export type Orientation = "portrait" | "landscape";

export const SPLASH_SCREENS: readonly SplashScreen[] = screens;
const ORIENTATIONS: readonly Orientation[] = ["portrait", "landscape"];

export function splashPixels(screen: SplashScreen, orientation: Orientation) {
    const w = screen.width * screen.ratio;
    const h = screen.height * screen.ratio;
    return orientation === "portrait" ? { w, h } : { w: h, h: w };
}

export function splashUrl(screen: SplashScreen, orientation: Orientation) {
    const { w, h } = splashPixels(screen, orientation);
    return `/splash/apple-splash-${w}x${h}.png`;
}

// device-width/height are the portrait CSS size in both orientations on iOS;
// only the orientation feature tells them apart.
export function splashMedia(screen: SplashScreen, orientation: Orientation) {
    return (
        `screen and (device-width: ${screen.width}px) and (device-height: ${screen.height}px)` +
        ` and (-webkit-device-pixel-ratio: ${screen.ratio}) and (orientation: ${orientation})`
    );
}

// Shape of Next's metadata.appleWebApp.startupImage.
export function splashStartupImages() {
    return SPLASH_SCREENS.flatMap((screen) =>
        ORIENTATIONS.map((orientation) => ({
            url: splashUrl(screen, orientation),
            media: splashMedia(screen, orientation),
        }))
    );
}
