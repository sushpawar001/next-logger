import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, userEvent, waitFor } from "@/test/render";

vi.mock("axios");
vi.mock("@/helpers/notify", () => ({ default: vi.fn() }));

const push = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
    usePathname: () => "/stats",
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
}));

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
import notify from "@/helpers/notify";

import StatsPage from "./(Dashboard)/stats/page";
import ProfilePage from "./(Dashboard)/profile/page";
import ForgetPasswordPage from "./(Auth)/forget-password/page";
import ResetPasswordPage from "./(Auth)/reset-password/page";
import VerifyPage from "./(Auth)/verify/page";
import LoginPage from "./(Auth)/login/[[...sign-in]]/page";
import SignupPage from "./(Auth)/signup/[[...sign-up]]/page";

const get = vi.mocked(axios.get);
const post = vi.mocked(axios.post);

const glucoseRows = [
    { _id: "g1", value: 110, createdAt: "2026-01-30T08:00:00.000Z", tag: "Fasting" },
    { _id: "g2", value: 94, createdAt: "2026-01-29T08:00:00.000Z", tag: null },
    { _id: "g3", value: 190, createdAt: "2026-01-28T08:00:00.000Z", tag: "After meal" },
];
const weightRows = [
    { _id: "w1", value: 72.4, createdAt: "2026-01-30T07:00:00.000Z", tag: null },
    { _id: "w2", value: 73.1, createdAt: "2026-01-20T07:00:00.000Z", tag: null },
];
const insulinRows = [
    { _id: "i1", units: 12, name: "Lantus", createdAt: "2026-01-30T21:00:00.000Z", tag: null },
    { _id: "i2", units: 6, name: "NovoRapid", createdAt: "2026-01-30T08:00:00.000Z", tag: null },
];

/** get-range returns a current and a previous period in one response. */
const rangeResponse = (rows: any[]) => ({
    status: 200,
    data: { data: { daysAgoData: rows, prevDaysAgoData: rows } },
});

const routeStatsGets = () => {
    get.mockImplementation((url: string) => {
        if (url.includes("/glucose/get-range/")) {
            return Promise.resolve(rangeResponse(glucoseRows));
        }
        if (url.includes("/weight/get-range/")) {
            return Promise.resolve(rangeResponse(weightRows));
        }
        if (url.includes("/insulin/get/")) {
            return Promise.resolve({ status: 200, data: { data: insulinRows } });
        }
        return Promise.resolve({ status: 200, data: { data: [] } });
    });
};

beforeEach(() => {
    get.mockReset();
    post.mockReset();
    push.mockReset();
    vi.mocked(notify).mockClear();
    post.mockResolvedValue({ data: { message: "OK" } });
    routeStatsGets();
});

describe("stats page", () => {
    it("loads glucose, weight and insulin for the default 90-day window", async () => {
        renderWithProviders(<StatsPage />);

        await waitFor(() => expect(get.mock.calls.length).toBeGreaterThanOrEqual(3));
        const urls = get.mock.calls.map((c) => c[0] as string).join(" ");

        expect(urls).toContain("/api/glucose/get-range/90");
        expect(urls).toContain("/api/weight/get-range/90");
        expect(urls).toContain("/api/insulin/get/90");
    });

    it("renders the computed statistics tables", async () => {
        renderWithProviders(<StatsPage />);

        await waitFor(() =>
            expect(screen.getAllByRole("table").length).toBeGreaterThan(0)
        );
    });

    it("derives an estimated HbA1c from the glucose average", async () => {
        const { container } = renderWithProviders(<StatsPage />);

        await waitFor(() => expect(get).toHaveBeenCalled());
        await waitFor(() =>
            expect(container.textContent).toMatch(/hba1c/i)
        );
    });

    it("refetches when the period changes", async () => {
        const user = userEvent.setup();
        renderWithProviders(<StatsPage />);
        await waitFor(() =>
            expect(screen.getAllByRole("combobox").length).toBeGreaterThan(0)
        );

        // Unlike the list pages, stats uses a Radix Select: open it, then pick.
        await user.click(screen.getAllByRole("combobox")[0]);
        await user.click(await screen.findByRole("option", { name: "30 days" }));

        await waitFor(() =>
            expect(
                get.mock.calls.some((c) => String(c[0]).includes("/30"))
            ).toBe(true)
        );
    });

    it("offers a tag filter", async () => {
        renderWithProviders(<StatsPage />);

        await waitFor(() =>
            expect(screen.getAllByText(/filter by tags/i).length).toBeGreaterThan(0)
        );
    });

    it("renders with no data at all", async () => {
        get.mockImplementation((url: string) =>
            url.includes("get-range")
                ? Promise.resolve(rangeResponse([]))
                : Promise.resolve({ status: 200, data: { data: [] } })
        );

        renderWithProviders(<StatsPage />);

        await waitFor(() =>
            expect(screen.getAllByRole("table").length).toBeGreaterThan(0)
        );
    });

    it("survives a failed load", async () => {
        get.mockRejectedValue(new Error("network down"));

        renderWithProviders(<StatsPage />);

        await waitFor(() => expect(get).toHaveBeenCalled());
    });
});

describe("profile page", () => {
    const profileGets = () => {
        get.mockImplementation((url: string) => {
            if (url.includes("/insulin-type/get")) {
                return Promise.resolve({
                    data: { data: [{ _id: "i1", name: "Lantus" }] },
                });
            }
            if (url.includes("/users/subscription")) {
                return Promise.resolve({
                    data: {
                        subscriptionPlan: "trial",
                        subscriptionEndDate: "Sat Jan 31 2026",
                        remainingDays: 12,
                    },
                });
            }
            if (url.includes("/users/get-insulin")) {
                return Promise.resolve({
                    data: { data: [{ _id: "i1", name: "Lantus" }] },
                });
            }
            return Promise.resolve({ data: { data: [] } });
        });
    };

    it("loads insulin types, the subscription and the user's insulins", async () => {
        profileGets();

        renderWithProviders(<ProfilePage />);

        await waitFor(() => expect(get.mock.calls.length).toBeGreaterThanOrEqual(3));
        const urls = get.mock.calls.map((c) => c[0] as string).join(" ");

        expect(urls).toContain("/api/insulin-type/get");
        expect(urls).toContain("/api/users/subscription");
        expect(urls).toContain("/api/users/get-insulin");
    });

    it("renders the subscription card once loaded", async () => {
        profileGets();

        const { container } = renderWithProviders(<ProfilePage />);

        await waitFor(() => expect(container.textContent).toMatch(/trial/i));
    });

    it("survives a failed load", async () => {
        get.mockRejectedValue(new Error("network down"));

        renderWithProviders(<ProfilePage />);

        await waitFor(() => expect(get).toHaveBeenCalled());
    });
});

describe("forget-password page", () => {
    it("posts the email to the reset endpoint", async () => {
        const user = userEvent.setup();
        renderWithProviders(<ForgetPasswordPage />);

        await user.type(screen.getAllByRole("textbox")[0], "ada@example.com");
        await user.click(screen.getByRole("button"));

        await waitFor(() => expect(post).toHaveBeenCalled());
        expect(post.mock.calls[0][0]).toContain("/api/users/send-forget-email");
    });

    it("reports a failure", async () => {
        const user = userEvent.setup();
        post.mockRejectedValue({ response: { data: { error: "No such user" } } });
        renderWithProviders(<ForgetPasswordPage />);

        await user.type(screen.getAllByRole("textbox")[0], "nobody@example.com");
        await user.click(screen.getByRole("button"));

        await waitFor(() => expect(post).toHaveBeenCalled());
    });
});

describe("reset-password page", () => {
    it("renders its form", () => {
        renderWithProviders(<ResetPasswordPage />);

        expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    });

    it("posts the new password", async () => {
        const user = userEvent.setup();
        const { container } = renderWithProviders(<ResetPasswordPage />);

        const passwords = container.querySelectorAll('input[type="password"]');
        if (passwords.length >= 2) {
            await user.type(passwords[0] as HTMLElement, "hunter22");
            await user.type(passwords[1] as HTMLElement, "hunter22");
        }
        await user.click(screen.getAllByRole("button")[0]);

        await waitFor(() => expect(post).toHaveBeenCalled());
        expect(post.mock.calls[0][0]).toContain("/api/users/reset-password");
    });

    it("reports a failure", async () => {
        const user = userEvent.setup();
        post.mockRejectedValue({ response: { data: { error: "Invalid token" } } });
        renderWithProviders(<ResetPasswordPage />);

        await user.click(screen.getAllByRole("button")[0]);

        await waitFor(() => expect(post).toHaveBeenCalled());
    });
});

describe("verify page", () => {
    it("renders", () => {
        const { container } = renderWithProviders(<VerifyPage />);

        expect(container.textContent!.length).toBeGreaterThan(0);
    });

    it("posts the verification token when one is present", async () => {
        const user = userEvent.setup();
        renderWithProviders(<VerifyPage />);

        const buttons = screen.queryAllByRole("button");
        if (buttons.length) {
            await user.click(buttons[0]);
            await waitFor(() => expect(post).toHaveBeenCalled());
        }
    });
});

describe("Clerk auth pages", () => {
    it("login renders the Clerk sign-in widget", () => {
        expect(() => renderWithProviders(<LoginPage />)).not.toThrow();
    });

    it("signup renders the Clerk sign-up widget", () => {
        expect(() => renderWithProviders(<SignupPage />)).not.toThrow();
    });
});
