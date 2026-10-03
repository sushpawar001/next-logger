"use client";

import {
    keepPreviousData,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    qk,
    listStaleTime,
    type Resource,
    type RangeResource,
} from "@/lib/query/keys";
import { getList, getOne, getRange } from "@/lib/query/fetchers";

/**
 * A day-window of one metric.
 *
 * `keepPreviousData` is what makes the period selector usable: changing the
 * window changes the key, and without it the hook would drop to `isPending`
 * with no data and blank the page behind a skeleton. With it, the previous
 * window stays on screen while the new one loads -- and narrowing back to a
 * window still in cache resolves synchronously, with no request at all.
 */
export function useEntries<T = any>(resource: Resource, days: number | string) {
    return useQuery({
        queryKey: qk.list(resource, days),
        queryFn: () => getList<T>(`/api/${resource}/get/${Number(days)}`),
        placeholderData: keepPreviousData,
        staleTime: listStaleTime(days),
    });
}

/**
 * `current` from a range response, cut to the window `/get/[days]` returns.
 * get-range starts its window at midnight `days` ago while get starts it at
 * this moment `days` ago, so `current` can hold up to a day of extra rows.
 */
export function listWindowFromRange<T extends { createdAt?: any }>(
    current: T[],
    days: number | string,
    now: Date = new Date()
): T[] {
    const daysAgo = new Date(now);
    daysAgo.setDate(daysAgo.getDate() - Number(days));
    return current.filter((row) => new Date(row.createdAt) > daysAgo);
}

/**
 * A window plus the window immediately before it, for the period-over-period
 * figures on /stats. Only glucose and weight expose `/get-range/`.
 *
 * The current half is also the list for the same window, so it seeds that
 * cache entry when nothing is there yet. Moving from /stats to /charts then
 * reads from cache instead of decrypting the period again. It never replaces
 * a list that was fetched (or invalidated) on its own: the trim uses the
 * browser clock, so a row right at the cutoff may differ from what
 * `/get/[days]` would return, which is only acceptable as a first fill.
 */
export function useEntryRange<T = any>(
    resource: RangeResource,
    days: number | string
) {
    const queryClient = useQueryClient();
    return useQuery({
        queryKey: qk.range(resource, days),
        queryFn: async () => {
            const startedAt = Date.now();
            const payload = await getRange<T>(
                `/api/${resource}/get-range/${Number(days)}`
            );
            const listKey = qk.list(resource, days);
            if (queryClient.getQueryData(listKey) === undefined) {
                queryClient.setQueryData(
                    listKey,
                    listWindowFromRange(payload.current as any[], days),
                    { updatedAt: startedAt }
                );
            }
            return payload;
        },
        placeholderData: keepPreviousData,
        staleTime: listStaleTime(days),
    });
}

/** A single entry, for the `[entryId]` edit pages. */
export function useEntry<T = any>(resource: Resource, id: string) {
    return useQuery({
        queryKey: qk.entry(resource, id),
        queryFn: () => getOne<T>(`/api/${resource}/get-one/${id}`),
        enabled: Boolean(id),
    });
}
