import { sendGAEvent } from "@next/third-parties/google";

/** True when running as an installed PWA rather than a browser tab. */
export function isStandalone(): boolean {
    if (typeof window === "undefined") return false;
    return (
        window.matchMedia?.("(display-mode: standalone)")?.matches === true ||
        // iOS Safari does not support display-mode; it sets this instead.
        (window.navigator as any).standalone === true
    );
}

/** True on iPhone/iPad, including iPadOS 13+ which reports itself as a Mac. */
export function isIosDevice(): boolean {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent;
    if (/iphone|ipad|ipod/i.test(ua)) return true;
    return /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
}

/**
 * iOS only exposes Add to Home Screen from Safari's own share sheet. Chrome and
 * Firefox on iOS are Safari under the hood but have no A2HS entry, so we must
 * not tell those users to look for one.
 */
export function isIosSafari(): boolean {
    if (!isIosDevice()) return false;
    const ua = navigator.userAgent;
    return !/crios|fxios|edgios|opios/i.test(ua);
}

/**
 * True on phones and tablets. Desktop Chrome fires beforeinstallprompt too, but
 * the install nag only makes sense where the home screen is a real destination,
 * so we gate the prompt on this. Covers iPad's desktop-Mac UA via isIosDevice.
 */
export function isMobileDevice(): boolean {
    if (typeof navigator === "undefined") return false;
    if (isIosDevice()) return true;
    return /Android|Mobi|IEMobile|BlackBerry|Opera Mini/i.test(
        navigator.userAgent
    );
}

/**
 * Fire a GA event, no-op when GA has not loaded (dev, or GA_ID unset) so we
 * don't spam the console with warnings.
 */
export function trackPwaEvent(
    name: string,
    params: Record<string, string> = {}
): void {
    if (typeof window === "undefined") return;
    if (!(window as any).dataLayer) return;
    sendGAEvent("event", name, params);
}
