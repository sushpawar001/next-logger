/**
 * Query-key factory.
 *
 * Kept free of any `@tanstack/*` import so it can be unit-tested in the fast
 * `node` vitest project (`src/lib/**` is already in that project's include list).
 *
 * The keys are hierarchical -- `[ROOT, resource]` is a prefix of every list,
 * range and entry key for that resource -- so a mutation invalidates everything
 * it could possibly have affected with a single `invalidateQueries` call.
 */

/**
 * The API path segment, so the key and the URL derive from one string. Note the
 * plural `measurements`: the page route is `/measurement` but the endpoint is
 * `/api/measurements/*`, and a second mapping table is not worth having.
 */
export const RESOURCES = ["glucose", "weight", "insulin", "measurements"] as const;

export type Resource = (typeof RESOURCES)[number];

/** Only these two expose a `/get-range/` endpoint. */
export type RangeResource = "glucose" | "weight";

const ROOT = "fitdose" as const;

/**
 * `Number(days)` / `String(id)` normalisation is load-bearing. `weight/page.tsx`
 * is the one page whose period handler does not `parseInt`, so without this the
 * same window keys as `"7"` there and `7` everywhere else -- two cache slots for
 * one payload, silently defeating the cross-page dedup this exists for.
 */
export const qk = {
    all: () => [ROOT] as const,

    /** Prefix covering a resource's list, range and entry keys. */
    resource: (r: Resource) => [ROOT, r] as const,

    list: (r: Resource, days: number | string) =>
        [ROOT, r, "list", Number(days)] as const,
    range: (r: RangeResource, days: number | string) =>
        [ROOT, r, "range", Number(days)] as const,
    entry: (r: Resource, id: string) => [ROOT, r, "entry", String(id)] as const,

    user: () => [ROOT, "user"] as const,
    userInsulins: () => [ROOT, "user", "insulins"] as const,
    subscription: () => [ROOT, "user", "subscription"] as const,

    insulinTypes: () => [ROOT, "insulin-types"] as const,
};

/**
 * Long windows are the expensive reads: every row is decrypted field-by-field in
 * JS on a Hobby lambda, and a measurements row is eight AES-GCM operations. Hold
 * those longer so re-opening /charts at 365 days is free.
 */
export const listStaleTime = (days: number | string) =>
    Number(days) > 30 ? 10 * 60_000 : 5 * 60_000;

/** Reference data changes only through mutations we invalidate explicitly. */
export const REFERENCE_STALE_TIME = 30 * 60_000;

/**
 * A single frozen empty array to fall back on while a query is pending.
 *
 * Writing `query.data ?? []` inline allocates a new array on every render,
 * which breaks referential equality for anything downstream that memoises on
 * it -- on /stats that spins the useMemo/useEffect chain into an infinite
 * render loop.
 */
export const EMPTY_ROWS: any[] = [];
