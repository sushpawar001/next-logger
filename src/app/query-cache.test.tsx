/**
 * The point of the migration: pages that ask for the same window share one
 * request. These render two consumers against a single QueryClient, the way the
 * (Dashboard) layout holds one client across navigation within its subtree.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    makeTestQueryClient,
    renderWithProviders,
    screen,
    waitFor,
} from "@/test/render";
import { qk } from "@/lib/query/keys";
import { QueryClient } from "@tanstack/react-query";

vi.mock("axios");
vi.mock("@/helpers/notify", () => ({ default: vi.fn() }));
vi.mock("@/helpers/entryLogged", () => ({ default: vi.fn() }));

import axios from "axios";
import GlucosePage from "./(Dashboard)/glucose/page";
import WeightPage from "./(Dashboard)/weight/page";
import DiabetesDashboard from "@/components/Dashboards/DiabetesDashboard";

const get = vi.mocked(axios.get);

const glucoseRows = [{ _id: "g1", value: 110, createdAt: "2026-01-01T00:00:00.000Z" }];
const weightRows = [{ _id: "w1", value: 72.4, createdAt: "2026-01-01T00:00:00.000Z" }];

beforeEach(() => {
    get.mockReset();
    get.mockImplementation((url: string) => {
        if (url.includes("/glucose/"))
            return Promise.resolve({ status: 200, data: { data: glucoseRows } });
        if (url.includes("/weight/"))
            return Promise.resolve({ status: 200, data: { data: weightRows } });
        return Promise.resolve({ status: 200, data: { data: [] } });
    });
});

const urlsFor = (fragment: string) =>
    get.mock.calls.map((c) => String(c[0])).filter((u) => u.includes(fragment));

describe("cross-page request dedup", () => {
    /**
     * Both default to 7 days, so /dashboard -> /glucose used to fetch the same
     * payload twice. A staleTime-fresh entry now satisfies the second mount.
     */
    it("serves /glucose from the window /dashboard already fetched", async () => {
        // A single client, standing in for the one the (Dashboard) layout holds
        // across navigation.
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false, staleTime: 60_000 } },
        });

        const dashboard = renderWithProviders(<DiabetesDashboard />, { queryClient });
        await waitFor(() =>
            expect(urlsFor("/api/glucose/get/7").length).toBe(1)
        );
        dashboard.unmount();

        renderWithProviders(<GlucosePage />, { queryClient });
        await waitFor(() =>
            expect(screen.getAllByText(/110/).length).toBeGreaterThan(0)
        );

        expect(urlsFor("/api/glucose/get/7")).toHaveLength(1);
        expect(urlsFor("/api/weight/get/7")).toHaveLength(1);
    });

    it("issues one request when two pages mount against the same window at once", async () => {
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false, staleTime: 60_000 } },
        });

        renderWithProviders(
            <>
                <WeightPage />
                <DiabetesDashboard />
            </>,
            { queryClient }
        );

        await waitFor(() =>
            expect(urlsFor("/api/weight/get/7").length).toBeGreaterThan(0)
        );
        await waitFor(() =>
            expect(urlsFor("/api/glucose/get/7").length).toBeGreaterThan(0)
        );

        // In flight at the same moment: React Query collapses them to one.
        expect(urlsFor("/api/weight/get/7")).toHaveLength(1);
    });

    it("refetches a window the cache has never seen", async () => {
        const queryClient = makeTestQueryClient();
        queryClient.setQueryData(qk.list("glucose", 7), glucoseRows);

        renderWithProviders(<GlucosePage />, { queryClient });

        await waitFor(() =>
            expect(screen.getAllByText(/110/).length).toBeGreaterThan(0)
        );
        // The 30-day window is a different key, so it is not served from the
        // 7-day entry.
        expect(urlsFor("/api/glucose/get/30")).toHaveLength(0);
    });
});
