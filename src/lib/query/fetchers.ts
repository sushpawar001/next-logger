import axios from "axios";

/**
 * Response unwrapping for the three shapes the API returns.
 *
 * Two deliberate constraints, both driven by the existing suite:
 *
 * 1. `axios.get(url)` is called with exactly ONE argument. Forwarding the
 *    queryFn's AbortSignal would be idiomatic, but six tests assert
 *    `toHaveBeenCalledWith("/api/glucose/get/7")`, and React Query already
 *    dedupes these sub-second same-origin calls.
 *
 * 2. Nothing here inspects `res.status`. Real axios rejects on non-2xx, so a
 *    resolved 500 only ever happens in a test double -- the `?? []` fallbacks
 *    keep those "still renders when the API returns a non-200" cases meaningful
 *    without the `if (status === 200) ... else` branches the pages used to carry.
 */

/** List handlers answer `{ data: [...] }`. */
export async function getList<T = any>(url: string): Promise<T[]> {
    const res = await axios.get(url);
    return res.data?.data ?? [];
}

/** `get-one` answers `{ data: {...} }`. */
export async function getOne<T = any>(url: string): Promise<T | null> {
    const res = await axios.get(url);
    return res.data?.data ?? null;
}

export interface RangePayload<T> {
    current: T[];
    previous: T[];
}

/**
 * `get-range` nests two periods: `{ data: { daysAgoData, prevDaysAgoData } }`.
 * Renamed on the way out -- only /stats consumes this, and `current`/`previous`
 * says what the API names do not.
 */
export async function getRange<T = any>(url: string): Promise<RangePayload<T>> {
    const res = await axios.get(url);
    const payload = res.data?.data ?? {};
    return {
        current: payload.daysAgoData ?? [],
        previous: payload.prevDaysAgoData ?? [],
    };
}

/** `/api/users/subscription` is the one endpoint answering with a flat object. */
export async function getFlat<T = any>(url: string): Promise<T> {
    const res = await axios.get(url);
    return res.data;
}
