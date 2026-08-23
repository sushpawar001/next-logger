"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { makeQueryClient } from "@/lib/query/client";

/**
 * Mounted in the (Dashboard) layout rather than the root layout, so the cache is
 * torn down when the user navigates out of the authenticated subtree and the
 * react-query runtime stays out of the public /tools bundles.
 */
export default function QueryProvider({ children }: { children: ReactNode }) {
    // useState, never a module-scope singleton: a shared client would be reused
    // across concurrent server renders and could leak one user's health data
    // into another user's response.
    const [client] = useState(makeQueryClient);

    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
