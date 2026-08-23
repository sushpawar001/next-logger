"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { qk, type Resource } from "@/lib/query/keys";

/**
 * Read the message off an axios error without dereferencing blindly.
 *
 * Several call sites used the unguarded `error.response.data.message`, which
 * throws a second time from inside the catch on any non-axios error -- a network
 * drop, or a TypeError thrown further up.
 */
export function mutationErrorMessage(error: any, fallback = "An error occurred") {
    return error?.response?.data?.message ?? error?.response?.data?.error ?? fallback;
}

/**
 * Invalidating at the resource root is deliberate: a backdated entry can land in
 * any day-window, and reconciling each cached window by hand is not worth the
 * complexity. Only the *mounted* window actually refetches -- the rest are
 * simply marked stale and refetch lazily the next time they mount.
 */
export function useAddEntry(resource: Resource) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body: Record<string, any>) => {
            const res = await axios.post(`/api/${resource}/add`, body, {
                withCredentials: true,
            });
            return res.data;
        },
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: qk.resource(resource) }),
    });
}

export function useUpdateEntry(resource: Resource, id: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body: Record<string, any>) => {
            const res = await axios.put(`/api/${resource}/update/${id}`, body);
            return res.data;
        },
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: qk.resource(resource) }),
    });
}

export function useDeleteEntry(resource: Resource) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const res = await axios.delete(`/api/${resource}/delete/${id}`);
            return res.data;
        },
        /**
         * Drop the row from every cached window immediately, so the table
         * responds on click rather than after the round trip. `onSuccess`
         * rather than `onMutate`: the server is the authority on whether the
         * delete was allowed, and showing a row vanish that then reappears is
         * worse than a short wait.
         */
        onSuccess: (_data, id) => {
            queryClient.setQueriesData<any[]>(
                { queryKey: qk.resource(resource) },
                (rows) => (Array.isArray(rows) ? rows.filter((r) => r?._id !== id) : rows)
            );
            queryClient.removeQueries({ queryKey: qk.entry(resource, id) });
            return queryClient.invalidateQueries({ queryKey: qk.resource(resource) });
        },
    });
}
