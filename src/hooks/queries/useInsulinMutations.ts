"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { qk } from "@/lib/query/keys";
import type { InsulinNameType } from "@/types/models";

/** Saves the user's chosen insulin types -- the draft the profile page holds. */
export function useSaveUserInsulins() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (insulinData: InsulinNameType[]) => {
            const res = await axios.post("/api/users/bulk-add-insulin", {
                insulinData,
            });
            return res.data;
        },
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: qk.userInsulins() }),
    });
}

/**
 * Adds a type to the global catalogue and to the user, in that order -- the
 * second call needs the name the first one stored.
 */
export function useAddNewInsulin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (name: string) => {
            const created = await axios.post("/api/insulin-type/add", { name });
            const added = await axios.post("/api/users/add-insulin", {
                name: created.data.entry?.name ?? name,
            });
            return { type: created.data.entry, insulin: added.data.insulin };
        },
        onSuccess: () =>
            Promise.all([
                queryClient.invalidateQueries({ queryKey: qk.insulinTypes() }),
                queryClient.invalidateQueries({ queryKey: qk.userInsulins() }),
            ]),
    });
}
