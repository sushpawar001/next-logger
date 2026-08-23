import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/pwa", () => ({
    isStandalone: vi.fn(() => false),
    isIosDevice: vi.fn(() => false),
    isIosSafari: vi.fn(() => false),
    trackPwaEvent: vi.fn(),
}));

import { isIosSafari, isStandalone, trackPwaEvent } from "@/lib/pwa";
import { useInstallPrompt } from "./use-install-prompt";
import { useIsMobile } from "./use-mobile";
import { useQuickLog } from "./use-quick-log";

const STORAGE_KEY = "fitdose.install";
const DAY_MS = 24 * 60 * 60 * 1000;

describe("useIsMobile", () => {
    const setViewport = (width: number) => {
        Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: width,
        });
    };

    it("is true below the 768px breakpoint", () => {
        setViewport(500);

        expect(renderHook(() => useIsMobile()).result.current).toBe(true);
    });

    it("is false at and above the breakpoint", () => {
        setViewport(768);
        expect(renderHook(() => useIsMobile()).result.current).toBe(false);

        setViewport(1200);
        expect(renderHook(() => useIsMobile()).result.current).toBe(false);
    });

    it("is true at one pixel below the breakpoint", () => {
        setViewport(767);

        expect(renderHook(() => useIsMobile()).result.current).toBe(true);
    });

    it("subscribes to and unsubscribes from the media query", () => {
        const addEventListener = vi.fn();
        const removeEventListener = vi.fn();
        vi.mocked(window.matchMedia).mockReturnValue({
            matches: false,
            addEventListener,
            removeEventListener,
        } as any);

        const { unmount } = renderHook(() => useIsMobile());
        expect(addEventListener).toHaveBeenCalledWith(
            "change",
            expect.any(Function)
        );

        unmount();
        expect(removeEventListener).toHaveBeenCalled();
    });

    it("re-evaluates when the media query fires", () => {
        let onChange: () => void = () => {};
        vi.mocked(window.matchMedia).mockReturnValue({
            matches: false,
            addEventListener: (_: string, cb: any) => {
                onChange = cb;
            },
            removeEventListener: vi.fn(),
        } as any);
        setViewport(1200);

        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);

        setViewport(400);
        act(() => onChange());

        expect(result.current).toBe(true);
    });
});

describe("useQuickLog", () => {
    const setSearch = (search: string) => {
        Object.defineProperty(window, "location", {
            writable: true,
            configurable: true,
            value: { ...window.location, search },
        });
    };

    it("is true for the quick=1 shortcut", () => {
        setSearch("?quick=1");

        expect(renderHook(() => useQuickLog()).result.current).toBe(true);
    });

    it.each([
        ["no query string", ""],
        ["a different param", "?foo=bar"],
        ["quick with another value", "?quick=0"],
        ["quick with no value", "?quick"],
    ])("is false for %s", (_label, search) => {
        setSearch(search);

        expect(renderHook(() => useQuickLog()).result.current).toBe(false);
    });

    it("reads the flag alongside other params", () => {
        setSearch("?days=7&quick=1");

        expect(renderHook(() => useQuickLog()).result.current).toBe(true);
    });
});

describe("useInstallPrompt", () => {
    /** Dispatches the Chrome event that makes an install path available. */
    const fireBeforeInstallPrompt = () => {
        const event: any = new Event("beforeinstallprompt");
        event.prompt = vi.fn().mockResolvedValue(undefined);
        event.userChoice = Promise.resolve({ outcome: "accepted" });
        act(() => {
            window.dispatchEvent(event);
        });
        return event;
    };

    beforeEach(() => {
        window.localStorage.clear();
        vi.mocked(isStandalone).mockReturnValue(false);
        vi.mocked(isIosSafari).mockReturnValue(false);
        vi.mocked(trackPwaEvent).mockClear();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("availability", () => {
        it("is unsupported until a browser offers an install path", () => {
            const { result } = renderHook(() => useInstallPrompt());

            expect(result.current.isSupported).toBe(false);
            expect(result.current.ios).toBe(false);
        });

        it("is supported on iOS Safari with no deferred prompt", () => {
            vi.mocked(isIosSafari).mockReturnValue(true);

            const { result } = renderHook(() => useInstallPrompt());

            expect(result.current.ios).toBe(true);
            expect(result.current.isSupported).toBe(true);
        });

        it("becomes supported once Chrome defers its prompt", () => {
            const { result } = renderHook(() => useInstallPrompt());
            expect(result.current.isSupported).toBe(false);

            fireBeforeInstallPrompt();

            expect(result.current.isSupported).toBe(true);
        });

        it("suppresses Chrome's own mini-infobar", () => {
            renderHook(() => useInstallPrompt());
            const event: any = new Event("beforeinstallprompt");
            event.preventDefault = vi.fn();

            act(() => {
                window.dispatchEvent(event);
            });

            expect(event.preventDefault).toHaveBeenCalled();
        });

        it("reports installed when already running standalone", () => {
            vi.mocked(isStandalone).mockReturnValue(true);

            expect(renderHook(() => useInstallPrompt()).result.current.installed).toBe(
                true
            );
        });

        it("reports installed from persisted state", () => {
            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ installed: true })
            );

            expect(renderHook(() => useInstallPrompt()).result.current.installed).toBe(
                true
            );
        });
    });

    describe("requestShow caps", () => {
        it("opens the card and records the showing", () => {
            const { result } = renderHook(() => useInstallPrompt());
            fireBeforeInstallPrompt();

            act(() => {
                expect(result.current.requestShow()).toBe(true);
            });

            expect(result.current.open).toBe(true);
            const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
            expect(stored.count).toBe(1);
            expect(stored.lastShownAt).toBeGreaterThan(0);
            expect(trackPwaEvent).toHaveBeenCalledWith("pwa_prompt_shown", {
                method: "native",
            });
        });

        it("refuses after the maximum number of showings", () => {
            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ count: 2, lastShownAt: 0, installed: false })
            );
            const { result } = renderHook(() => useInstallPrompt());
            fireBeforeInstallPrompt();

            act(() => {
                expect(result.current.requestShow()).toBe(false);
            });

            expect(result.current.open).toBe(false);
        });

        it("refuses again within the cooldown window", () => {
            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ count: 1, lastShownAt: Date.now() - DAY_MS }),
            );
            const { result } = renderHook(() => useInstallPrompt());
            fireBeforeInstallPrompt();

            act(() => {
                expect(result.current.requestShow()).toBe(false);
            });
        });

        it("allows another showing once the cooldown has elapsed", () => {
            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    count: 1,
                    lastShownAt: Date.now() - 8 * DAY_MS,
                }),
            );
            const { result } = renderHook(() => useInstallPrompt());
            fireBeforeInstallPrompt();

            act(() => {
                expect(result.current.requestShow()).toBe(true);
            });
        });

        it("refuses when no install path exists", () => {
            const { result } = renderHook(() => useInstallPrompt());

            act(() => {
                expect(result.current.requestShow()).toBe(false);
            });
        });

        it("refuses when already installed", () => {
            vi.mocked(isStandalone).mockReturnValue(true);
            const { result } = renderHook(() => useInstallPrompt());
            fireBeforeInstallPrompt();

            act(() => {
                expect(result.current.requestShow()).toBe(false);
            });
        });

        it("labels the event as ios when on iOS Safari", () => {
            vi.mocked(isIosSafari).mockReturnValue(true);
            const { result } = renderHook(() => useInstallPrompt());

            act(() => {
                result.current.requestShow();
            });

            expect(trackPwaEvent).toHaveBeenCalledWith("pwa_prompt_shown", {
                method: "ios",
            });
        });
    });

    describe("forceShow", () => {
        it("opens the card regardless of the caps", () => {
            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ count: 99, lastShownAt: Date.now() })
            );
            const { result } = renderHook(() => useInstallPrompt());

            act(() => {
                result.current.forceShow();
            });

            expect(result.current.open).toBe(true);
            expect(trackPwaEvent).toHaveBeenCalledWith(
                "pwa_prompt_shown",
                expect.objectContaining({ source: "manual" })
            );
        });

        it("does nothing when already installed", () => {
            vi.mocked(isStandalone).mockReturnValue(true);
            const { result } = renderHook(() => useInstallPrompt());

            act(() => {
                result.current.forceShow();
            });

            expect(result.current.open).toBe(false);
        });
    });

    describe("promptInstall", () => {
        it("shows the native prompt and records the outcome", async () => {
            const { result } = renderHook(() => useInstallPrompt());
            const event = fireBeforeInstallPrompt();

            await act(async () => {
                await result.current.promptInstall();
            });

            expect(event.prompt).toHaveBeenCalled();
            expect(trackPwaEvent).toHaveBeenCalledWith("pwa_prompt_accepted");
            expect(result.current.open).toBe(false);
        });

        it("records a dismissal", async () => {
            const { result } = renderHook(() => useInstallPrompt());
            const event: any = new Event("beforeinstallprompt");
            event.prompt = vi.fn().mockResolvedValue(undefined);
            event.userChoice = Promise.resolve({ outcome: "dismissed" });
            act(() => {
                window.dispatchEvent(event);
            });

            await act(async () => {
                await result.current.promptInstall();
            });

            expect(trackPwaEvent).toHaveBeenCalledWith("pwa_prompt_dismissed");
        });

        it("consumes the single-use event", async () => {
            const { result } = renderHook(() => useInstallPrompt());
            fireBeforeInstallPrompt();

            await act(async () => {
                await result.current.promptInstall();
            });

            expect(result.current.isSupported).toBe(false);
        });

        it("does nothing without a deferred prompt", async () => {
            const { result } = renderHook(() => useInstallPrompt());

            await act(async () => {
                await result.current.promptInstall();
            });

            expect(trackPwaEvent).not.toHaveBeenCalled();
        });
    });

    describe("appinstalled", () => {
        it("marks the app installed and persists it", () => {
            const { result } = renderHook(() => useInstallPrompt());

            act(() => {
                window.dispatchEvent(new Event("appinstalled"));
            });

            expect(result.current.installed).toBe(true);
            expect(result.current.open).toBe(false);
            expect(
                JSON.parse(window.localStorage.getItem(STORAGE_KEY)!).installed
            ).toBe(true);
            expect(trackPwaEvent).toHaveBeenCalledWith("pwa_installed");
        });
    });

    describe("dismiss", () => {
        it("closes the card and records the dismissal", () => {
            const { result } = renderHook(() => useInstallPrompt());

            act(() => {
                result.current.forceShow();
            });
            act(() => {
                result.current.dismiss();
            });

            expect(result.current.open).toBe(false);
            expect(trackPwaEvent).toHaveBeenCalledWith("pwa_prompt_dismissed");
        });
    });

    describe("storage failures", () => {
        it("behaves as never-prompted when localStorage throws", () => {
            const getItem = vi
                .spyOn(Storage.prototype, "getItem")
                .mockImplementation(() => {
                    throw new Error("private mode");
                });
            const setItem = vi
                .spyOn(Storage.prototype, "setItem")
                .mockImplementation(() => {
                    throw new Error("private mode");
                });

            const { result } = renderHook(() => useInstallPrompt());
            fireBeforeInstallPrompt();

            act(() => {
                expect(result.current.requestShow()).toBe(true);
            });

            getItem.mockRestore();
            setItem.mockRestore();
        });

        it("ignores malformed stored state", () => {
            window.localStorage.setItem(STORAGE_KEY, "{not json");

            const { result } = renderHook(() => useInstallPrompt());
            fireBeforeInstallPrompt();

            act(() => {
                expect(result.current.requestShow()).toBe(true);
            });
        });
    });
});
