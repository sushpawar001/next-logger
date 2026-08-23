"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { qk, listStaleTime, type Resource } from "@/lib/query/keys";
import { getList } from "@/lib/query/fetchers";

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
