"use client";

import { useQuery } from "@tanstack/react-query";
import { qk, REFERENCE_STALE_TIME } from "@/lib/query/keys";
import { getFlat, getList } from "@/lib/query/fetchers";
import type { InsulinNameType } from "@/types/models";

/**
 * The user's saved insulin types.
 *
 * Fetched independently in four places before this hook: InsulinAdd (which
 * renders on /dashboard and /insulin), the insulin edit page, and /profile.
 * They now share one cache entry and one sort.
 */
export function useUserInsulins() {
    return useQuery({
        queryKey: qk.userInsulins(),
        queryFn: () => getList<InsulinNameType>("/api/users/get-insulin"),
        staleTime: REFERENCE_STALE_TIME,
        // Copy before sorting. The code this replaces called
        // `response.data.data.sort(...)`, which against a shared cache would
        // reorder the array every other consumer is holding and defeat
        // structural sharing.
        select: (rows) => [...rows].sort((a, b) => a.name.localeCompare(b.name)),
    });
}

/** The global insulin-type catalogue, shared by /profile and AddNewInsulin. */
export function useInsulinTypes() {
    return useQuery({
        queryKey: qk.insulinTypes(),
        queryFn: () => getList<InsulinNameType>("/api/insulin-type/get"),
        staleTime: REFERENCE_STALE_TIME,
    });
}

export interface SubscriptionInfo {
    subscriptionPlan: "trial" | "premium" | "free";
    subscriptionEndDate: string;
    remainingDays: number;
}

/** The one endpoint that answers with a flat object rather than `{ data }`. */
export function useSubscription() {
    return useQuery({
        queryKey: qk.subscription(),
        queryFn: () => getFlat<SubscriptionInfo>("/api/users/subscription"),
        staleTime: REFERENCE_STALE_TIME,
    });
}
