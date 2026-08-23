import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { useQueryClient } from "@tanstack/react-query";
import QueryProvider from "./QueryProvider";
import { makeQueryClient, queryDefaults } from "@/lib/query/client";

function Probe() {
    const client = useQueryClient();
    const { queries, mutations } = client.getDefaultOptions();

    return (
        <dl>
            <dd data-testid="stale">{String(queries?.staleTime)}</dd>
            <dd data-testid="retry">{String(queries?.retry)}</dd>
            <dd data-testid="focus">{String(queries?.refetchOnWindowFocus)}</dd>
            <dd data-testid="mutation-retry">{String(mutations?.retry)}</dd>
        </dl>
    );
}

describe("QueryProvider", () => {
    it("supplies a QueryClient to its subtree", () => {
        render(
            <QueryProvider>
                <Probe />
            </QueryProvider>
        );

        expect(screen.getByTestId("stale")).toHaveTextContent(String(5 * 60_000));
    });

    /**
     * These defaults exist because reads decrypt every row in JS on a Hobby
     * lambda against a shared M0 cluster. A focus refetch storm or the library's
     * default of three retries is what that tier cannot absorb.
     */
    it("applies the conservative free-tier defaults", () => {
        render(
            <QueryProvider>
                <Probe />
            </QueryProvider>
        );

        expect(screen.getByTestId("retry")).toHaveTextContent("1");
        expect(screen.getByTestId("focus")).toHaveTextContent("false");
    });

    it("never retries mutations, because the add endpoints are not idempotent", () => {
        render(
            <QueryProvider>
                <Probe />
            </QueryProvider>
        );

        expect(screen.getByTestId("mutation-retry")).toHaveTextContent("0");
    });

    it("builds a distinct client per call, so nothing is shared across renders", () => {
        expect(makeQueryClient()).not.toBe(makeQueryClient());
    });

    it("backs off exponentially but caps the delay", () => {
        const retryDelay = queryDefaults?.queries?.retryDelay as (
            attempt: number
        ) => number;

        expect(retryDelay(0)).toBe(1_000);
        expect(retryDelay(1)).toBe(2_000);
        // Capped, so a failing query cannot hold a retry timer open for ages.
        expect(retryDelay(10)).toBe(8_000);
    });
});
