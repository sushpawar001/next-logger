"use client";

import { useCallback, useEffect, useState } from "react";
import { isIosSafari, isStandalone, trackPwaEvent } from "@/lib/pwa";

const STORAGE_KEY = "fitdose.install";
const MAX_SHOWINGS = 2;
const MIN_DAYS_BETWEEN = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

type InstallState = { count: number; lastShownAt: number; installed: boolean };

const EMPTY_STATE: InstallState = { count: 0, lastShownAt: 0, installed: false };

function readState(): InstallState {
    if (typeof window === "undefined") return EMPTY_STATE;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? { ...EMPTY_STATE, ...JSON.parse(raw) } : EMPTY_STATE;
    } catch {
        // Private mode / storage disabled — behave as if never prompted.
        return EMPTY_STATE;
    }
}

function writeState(next: Partial<InstallState>) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ ...readState(), ...next })
        );
    } catch {
        /* storage unavailable — the cap degrades to per-session, acceptable */
    }
}

// BeforeInstallPromptEvent is not in lib.dom yet.
type InstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function useInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] =
        useState<InstallPromptEvent | null>(null);
    const [installed, setInstalled] = useState(false);
    const [ios, setIos] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setInstalled(isStandalone() || readState().installed);
        setIos(isIosSafari());

        const onBeforeInstallPrompt = (event: Event) => {
            // Suppress Chrome's own mini-infobar so we can choose the moment.
            event.preventDefault();
            setDeferredPrompt(event as InstallPromptEvent);
        };

        const onAppInstalled = () => {
            setInstalled(true);
            setDeferredPrompt(null);
            setOpen(false);
            writeState({ installed: true });
            trackPwaEvent("pwa_installed");
        };

        window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
        window.addEventListener("appinstalled", onAppInstalled);
        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                onBeforeInstallPrompt
            );
            window.removeEventListener("appinstalled", onAppInstalled);
        };
    }, []);

    // Can we show the card at all? iOS gets instructions (no API), everyone else
    // needs Chrome to have handed us a deferred prompt.
    const isSupported = ios || deferredPrompt !== null;

    const eligible = useCallback(() => {
        if (installed || !isSupported) return false;
        const state = readState();
        if (state.installed) return false;
        if (state.count >= MAX_SHOWINGS) return false;
        if (
            state.lastShownAt &&
            Date.now() - state.lastShownAt < MIN_DAYS_BETWEEN * DAY_MS
        ) {
            return false;
        }
        return true;
    }, [installed, isSupported]);

    /** Show the card if the caps allow it. Returns whether it opened. */
    const requestShow = useCallback(() => {
        if (!eligible()) return false;
        const state = readState();
        writeState({ count: state.count + 1, lastShownAt: Date.now() });
        setOpen(true);
        trackPwaEvent("pwa_prompt_shown", { method: ios ? "ios" : "native" });
        return true;
    }, [eligible, ios]);

    /** Open the card ignoring the caps — for the explicit sidebar action. */
    const forceShow = useCallback(() => {
        if (installed) return;
        setOpen(true);
        trackPwaEvent("pwa_prompt_shown", {
            method: ios ? "ios" : "native",
            source: "manual",
        });
    }, [installed, ios]);

    const promptInstall = useCallback(async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        trackPwaEvent(
            outcome === "accepted"
                ? "pwa_prompt_accepted"
                : "pwa_prompt_dismissed"
        );
        // The event is single-use; Chrome fires a fresh one if still eligible.
        setDeferredPrompt(null);
        setOpen(false);
    }, [deferredPrompt]);

    const dismiss = useCallback(() => {
        setOpen(false);
        trackPwaEvent("pwa_prompt_dismissed");
    }, []);

    return {
        /** Card should be rendered. */
        open,
        setOpen,
        /** Installed, or previously recorded as installed. */
        installed,
        /** iOS Safari — show manual Add to Home Screen instructions. */
        ios,
        /** Some install path exists on this browser. */
        isSupported,
        requestShow,
        forceShow,
        promptInstall,
        dismiss,
    };
}
