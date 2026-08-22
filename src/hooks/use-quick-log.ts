"use client";

import { useEffect, useState } from "react";

/**
 * True when the page was opened from a PWA manifest shortcut, e.g.
 * /glucose?quick=1 (long-press the home screen icon).
 *
 * Read once on mount from location.search rather than useSearchParams(), which
 * would force a Suspense boundary onto these pages. This is a one-shot launch
 * flag, not shareable URL state, so nuqs would be the wrong tool too.
 */
export function useQuickLog(): boolean {
    const [quick, setQuick] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setQuick(params.get("quick") === "1");
    }, []);

    return quick;
}
