import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, userEvent, waitFor } from "@/test/render";

vi.mock("axios");

vi.mock("recharts", async (importOriginal) => {
    const actual = await importOriginal<typeof import("recharts")>();
    return {
        ...actual,
        ResponsiveContainer: ({ children }: any) => (
            <div data-testid="chart-container">{children}</div>
        ),
    };
});

import axios from "axios";
import ChartsPage from "./(Dashboard)/charts/page";

const get = vi.mocked(axios.get);

const rows: Record<string, any[]> = {
    glucose: [
        { _id: "g1", value: 110, createdAt: "2026-01-30T08:00:00.000Z", tag: "Fasting" },
        { _id: "g2", value: 190, createdAt: "2026-01-30T12:00:00.000Z", tag: null },
    ],
    weight: [
        { _id: "w1", value: 72.4, createdAt: "2026-01-30T07:00:00.000Z", tag: "Fasting" },
        { _id: "w2", value: 72.9, createdAt: "2026-01-29T07:00:00.000Z", tag: null },
    ],
    insulin: [
        { _id: "i1", units: 12, name: "Lantus", createdAt: "2026-01-30T21:00:00.000Z", tag: null },
        { _id: "i2", units: 6, name: "NovoRapid", createdAt: "2026-01-30T08:00:00.000Z", tag: "Fasting" },
    ],
};

beforeEach(() => {
    get.mockReset();
    get.mockImplementation((url: string) => {
        const key = Object.keys(rows).find((k) => url.includes(`/${k}/`));
        return Promise.resolve({ status: 200, data: { data: key ? rows[key] : [] } });
    });
});

describe("charts page (A1)", () => {
    it("is read-only: a title and no primary action", async () => {
        renderWithProviders(<ChartsPage />);

        expect(screen.getByRole("heading", { level: 1, name: "Charts" })).toBeInTheDocument();
        await waitFor(() => expect(get).toHaveBeenCalled());
        expect(screen.queryByRole("button", { name: /^log/i })).not.toBeInTheDocument();
    });

    it("draws glucose as a daily range, insulin by type and weight", async () => {
        renderWithProviders(<ChartsPage />);

        expect(
            screen.getByRole("heading", { name: "Glucose · daily range" })
        ).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Insulin by type" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Weight" })).toBeInTheDocument();

        // One small chart per insulin type.
        expect(await screen.findByText("Lantus")).toBeInTheDocument();
        expect(screen.getByText("NovoRapid")).toBeInTheDocument();
        expect(screen.getByText("avg 12 IU/day")).toBeInTheDocument();
    });

    it("shows the latest weight beside its chart", async () => {
        renderWithProviders(<ChartsPage />);

        expect(await screen.findByText("72.4")).toBeInTheDocument();
    });

    it("drives every chart from one period control", async () => {
        const user = userEvent.setup();
        renderWithProviders(<ChartsPage />);
        await waitFor(() => expect(get).toHaveBeenCalledTimes(3));

        await user.click(screen.getByRole("button", { name: "30 days" }));

        await waitFor(() => {
            const urls = get.mock.calls.map((c) => String(c[0]));
            expect(urls).toContain("/api/glucose/get/30");
            expect(urls).toContain("/api/weight/get/30");
            expect(urls).toContain("/api/insulin/get/30");
        });
    });

    it("filters every chart by tag", async () => {
        const user = userEvent.setup();
        renderWithProviders(<ChartsPage />);
        expect(await screen.findByText("Lantus")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Fasting" }));

        // Lantus has no tag, so only the Fasting NovoRapid dose remains.
        await waitFor(() => expect(screen.queryByText("Lantus")).not.toBeInTheDocument());
        expect(screen.getByText("NovoRapid")).toBeInTheDocument();
    });
});
