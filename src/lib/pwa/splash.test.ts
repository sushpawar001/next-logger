import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import {
    SPLASH_SCREENS,
    splashMedia,
    splashPixels,
    splashStartupImages,
    splashUrl,
} from "./splash";

const PUBLIC_DIR = path.resolve(__dirname, "../../../public");

describe("iOS launch images", () => {
    const images = splashStartupImages();

    it("has a portrait and a landscape image per screen", () => {
        expect(images).toHaveLength(SPLASH_SCREENS.length * 2);
    });

    it("never maps two media queries to the same file or the same query twice", () => {
        expect(new Set(images.map((i) => i.url)).size).toBe(images.length);
        expect(new Set(images.map((i) => i.media)).size).toBe(images.length);
    });

    // scripts/splash/build.js writes these; a new device needs the script re-run.
    it.each(images.map((i) => i.url))("public%s exists", (url) => {
        expect(existsSync(path.join(PUBLIC_DIR, url))).toBe(true);
    });

    it("sizes the image in device pixels and swaps them for landscape", () => {
        const iphone16 = SPLASH_SCREENS.find((s) => s.width === 393)!;

        expect(splashPixels(iphone16, "portrait")).toEqual({ w: 1179, h: 2556 });
        expect(splashUrl(iphone16, "landscape")).toBe("/splash/apple-splash-2556x1179.png");
    });

    it("keeps the portrait CSS size in the landscape query, as iOS reports it", () => {
        const iphone16 = SPLASH_SCREENS.find((s) => s.width === 393)!;

        expect(splashMedia(iphone16, "landscape")).toBe(
            "screen and (device-width: 393px) and (device-height: 852px)" +
                " and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
        );
    });
});
