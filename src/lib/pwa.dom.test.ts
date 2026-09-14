import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@next/third-parties/google", () => ({ sendGAEvent: vi.fn() }));

import { sendGAEvent } from "@next/third-parties/google";
import {
    isIosDevice,
    isIosSafari,
    isMobileDevice,
    isStandalone,
    trackPwaEvent,
} from "./pwa";

/**
 * UA and display-mode sniffing behind the PWA install card. iOS is the case
 * that matters: it has no beforeinstallprompt, and only Safari exposes Add to
 * Home Screen -- so telling a Chrome-on-iOS user to look for it would be wrong.
 */

const setUserAgent = (ua: string) => {
    Object.defineProperty(window.navigator, "userAgent", {
        configurable: true,
        value: ua,
    });
};

const setMaxTouchPoints = (points: number) => {
    Object.defineProperty(window.navigator, "maxTouchPoints", {
        configurable: true,
        value: points,
    });
};

const setDisplayMode = (standalone: boolean) => {
    (window.matchMedia as any) = vi.fn().mockReturnValue({
        matches: standalone,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    });
};

const IPHONE =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const IPAD_DESKTOP_UA =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
const CHROME_DESKTOP =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

beforeEach(() => {
    setUserAgent(CHROME_DESKTOP);
    setMaxTouchPoints(0);
    setDisplayMode(false);
    delete (window.navigator as any).standalone;
    delete (window as any).dataLayer;
    vi.mocked(sendGAEvent).mockClear();
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("isStandalone", () => {
    it("is true when the display mode is standalone", () => {
        setDisplayMode(true);

        expect(isStandalone()).toBe(true);
    });

    it("is false in a normal browser tab", () => {
        expect(isStandalone()).toBe(false);
    });

    // iOS Safari does not support display-mode, so it sets this instead.
    it("is true when iOS Safari flags navigator.standalone", () => {
        (window.navigator as any).standalone = true;

        expect(isStandalone()).toBe(true);
    });

    it("is false when navigator.standalone is explicitly false", () => {
        (window.navigator as any).standalone = false;

        expect(isStandalone()).toBe(false);
    });
});

describe("isIosDevice", () => {
    it.each([
        ["iPhone", IPHONE],
        ["iPad", "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) Safari/604.1"],
        ["iPod", "Mozilla/5.0 (iPod touch; CPU iPhone OS 17_0 like Mac OS X)"],
    ])("detects an %s", (_label, ua) => {
        setUserAgent(ua);

        expect(isIosDevice()).toBe(true);
    });

    /** iPadOS 13+ reports a desktop Mac UA; touch points give it away. */
    it("detects an iPad reporting a desktop Mac user agent", () => {
        setUserAgent(IPAD_DESKTOP_UA);
        setMaxTouchPoints(5);

        expect(isIosDevice()).toBe(true);
    });

    it("does not mistake a real Mac for an iPad", () => {
        setUserAgent(IPAD_DESKTOP_UA);
        setMaxTouchPoints(0);

        expect(isIosDevice()).toBe(false);
    });

    it("is false on desktop Chrome", () => {
        expect(isIosDevice()).toBe(false);
    });
});

describe("isIosSafari", () => {
    it("is true on iPhone Safari", () => {
        setUserAgent(IPHONE);

        expect(isIosSafari()).toBe(true);
    });

    /**
     * Chrome, Firefox, Edge and Opera on iOS are Safari underneath but expose
     * no Add to Home Screen entry, so they must not be told to look for one.
     */
    it.each([
        ["Chrome", "CriOS/120.0"],
        ["Firefox", "FxiOS/120.0"],
        ["Edge", "EdgiOS/120.0"],
        ["Opera", "OPiOS/120.0"],
    ])("is false in %s on iOS", (_label, token) => {
        setUserAgent(`Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) ${token} Mobile/15E148`);

        expect(isIosSafari()).toBe(false);
    });

    it("is false on a non-iOS device", () => {
        expect(isIosSafari()).toBe(false);
    });
});

describe("isMobileDevice", () => {
    it("is true on an iPhone", () => {
        setUserAgent(IPHONE);

        expect(isMobileDevice()).toBe(true);
    });

    it("is true on an iPad reporting a desktop Mac user agent", () => {
        setUserAgent(IPAD_DESKTOP_UA);
        setMaxTouchPoints(5);

        expect(isMobileDevice()).toBe(true);
    });

    it("is true on Android Chrome", () => {
        setUserAgent(
            "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36"
        );

        expect(isMobileDevice()).toBe(true);
    });

    it("is false on desktop Chrome", () => {
        expect(isMobileDevice()).toBe(false);
    });

    it("is false on a real Mac", () => {
        setUserAgent(IPAD_DESKTOP_UA);
        setMaxTouchPoints(0);

        expect(isMobileDevice()).toBe(false);
    });
});

describe("trackPwaEvent", () => {
    it("does nothing when GA has not loaded", () => {
        trackPwaEvent("pwa_installed");

        expect(sendGAEvent).not.toHaveBeenCalled();
    });

    it("forwards the event once GA is present", () => {
        (window as any).dataLayer = [];

        trackPwaEvent("pwa_installed");

        expect(sendGAEvent).toHaveBeenCalledWith("event", "pwa_installed", {});
    });

    it("passes extra parameters through", () => {
        (window as any).dataLayer = [];

        trackPwaEvent("pwa_prompt_shown", { method: "ios" });

        expect(sendGAEvent).toHaveBeenCalledWith("event", "pwa_prompt_shown", {
            method: "ios",
        });
    });
});
