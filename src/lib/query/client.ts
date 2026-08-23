import { QueryClient, type QueryClientConfig } from "@tanstack/react-query";

/**
 * Defaults tuned for Vercel Hobby + MongoDB Atlas M0.
 *
 * Reads here are unusually expensive: every row is AES-GCM decrypted field by
 * field in JS inside a serverless invocation, against a shared cluster with a
 * capped connection count. So the defaults are deliberately quieter than the
 * library's -- the goal of this cache is fewer requests, not fresher ones.
 *
 * HARD RULE: never add a persister. `src/app/sw.js/route.ts` states "NEVER cache
 * health data. This is a hard rule, not an optimisation." That covers
 * persistQueryClient, any localStorage/IndexedDB persister, and the
 * broadcast-channel plugin. This cache is in-memory only.
 */
export const queryDefaults: QueryClientConfig["defaultOptions"] = {
    queries: {
        staleTime: 5 * 60_000,
        // Longer than staleTime, so a back-navigation inside the window is
        // instant. Not Infinity -- shorter residency for decrypted health data.
        gcTime: 10 * 60_000,
        // The library default is 3. On /charts that is 3 queries x 3 retries =
        // 9 invocations per outage. One retry covers a genuine cold start;
        // attempts 2 and 3 fix nothing.
        retry: 1,
        retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 8_000),
        // The single biggest volume risk: the default refetches every mounted
        // query on every alt-tab, which on /charts is three full-window decrypts.
        refetchOnWindowFocus: false,
        // This is an installable PWA and mobile networks flap constantly.
        refetchOnReconnect: false,
        // refetchOnMount stays true: it is staleTime-gated, so it costs nothing
        // inside the window and is what refreshes a page returned to later.
    },
    mutations: {
        // /api/{resource}/add is not idempotent -- a retried POST double-inserts.
        retry: 0,
    },
};

export const makeQueryClient = () => new QueryClient({ defaultOptions: queryDefaults });
