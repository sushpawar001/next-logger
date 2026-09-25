import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Logo, { LOGO_ASPECT_RATIOS, logoSrc, type LogoProps } from "./Logo";

// next/image is stubbed in src/test/setup.jsdom.tsx as a plain <img> that
// forwards src/alt/width/height, so the attributes are directly observable.
const img = () => screen.getByRole("img", { name: "FitDose" });

describe("Logo", () => {
    it.each<[LogoProps, string]>([
        [{ variant: "wordmark" }, "/brand/svg/fitdose-wordmark.svg"],
        [{ variant: "wordmark", tone: "default" }, "/brand/svg/fitdose-wordmark.svg"],
        [{ variant: "wordmark", tone: "reversed" }, "/brand/svg/fitdose-wordmark-reversed.svg"],
        [{ variant: "wordmark", tone: "mono-ink" }, "/brand/svg/fitdose-wordmark-mono-ink.svg"],
        [{ variant: "wordmark", tone: "mono-cream" }, "/brand/svg/fitdose-wordmark-mono-cream.svg"],
        [{ variant: "mark" }, "/brand/svg/fitdose-mark.svg"],
        [{ variant: "mark", tone: "reversed" }, "/brand/svg/fitdose-mark-reversed.svg"],
        [{ variant: "mark", tone: "mono-ink" }, "/brand/svg/fitdose-mark-mono-ink.svg"],
        [{ variant: "mark", tone: "mono-cream" }, "/brand/svg/fitdose-mark-mono-cream.svg"],
        [{ variant: "icon" }, "/brand/svg/fitdose-app-icon.svg"],
        [{ variant: "lockup-horizontal" }, "/brand/svg/fitdose-lockup-horizontal.svg"],
        [
            { variant: "lockup-horizontal", tone: "reversed" },
            "/brand/svg/fitdose-lockup-horizontal-reversed.svg",
        ],
        [{ variant: "lockup-stacked" }, "/brand/svg/fitdose-lockup-stacked.svg"],
        [
            { variant: "lockup-stacked", tone: "reversed" },
            "/brand/svg/fitdose-lockup-stacked-reversed.svg",
        ],
    ])("renders %o from %s", (props, src) => {
        render(<Logo {...props} />);

        expect(img()).toHaveAttribute("src", src);
    });

    it("has an accessible name", () => {
        render(<Logo variant="icon" />);

        expect(screen.getByAltText("FitDose")).toBeInTheDocument();
    });

    it("defaults to 28px tall with the wordmark's aspect ratio", () => {
        render(<Logo variant="wordmark" />);

        expect(img()).toHaveAttribute("height", "28");
        // 28 * 3354.51 / 865.63 = 108.5 -> 109, above the 80px minimum
        expect(img()).toHaveAttribute("width", "109");
    });

    it.each<[LogoProps["variant"], number, string]>([
        ["wordmark", 32, "124"],
        ["mark", 40, "31"],
        ["icon", 40, "40"],
        ["lockup-horizontal", 32, "139"],
        ["lockup-stacked", 64, "76"],
    ])("sizes %s at %ipx tall to %spx wide", (variant, height, width) => {
        render(<Logo variant={variant as any} height={height} />);

        expect(img()).toHaveAttribute("height", String(height));
        expect(img()).toHaveAttribute("width", width);
    });

    it("forwards className and priority", () => {
        render(<Logo variant="wordmark" className="h-7 w-auto" priority />);

        expect(img()).toHaveClass("h-7", "w-auto");
    });

    it("keeps aspect ratios in step with the SVG viewBoxes", () => {
        expect(LOGO_ASPECT_RATIOS.icon).toBe(1);
        expect(LOGO_ASPECT_RATIOS.wordmark).toBeCloseTo(3.875, 3);
        expect(LOGO_ASPECT_RATIOS.mark).toBeCloseTo(0.787, 3);
    });

    it("returns undefined for a colourway that has no file", () => {
        expect(logoSrc("icon", "reversed")).toBeUndefined();
        expect(logoSrc("lockup-stacked", "mono-ink")).toBeUndefined();
        expect(logoSrc("mark")).toBe("/brand/svg/fitdose-mark.svg");
    });
});
