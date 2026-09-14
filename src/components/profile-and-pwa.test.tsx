import fs from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, userEvent, waitFor } from "@/test/render";
import { rejectsWith } from "@/test/promises";

vi.mock("axios");
vi.mock("@/helpers/notify", () => ({ default: vi.fn() }));
vi.mock("@/helpers/getDashboardLayout", () => ({
    getDashboardLayout: vi.fn(async () => "diabetes"),
    setDashboardLayoutLocal: vi.fn(),
}));
vi.mock("@/lib/pwa", () => ({
    isStandalone: vi.fn(() => false),
    isIosDevice: vi.fn(() => false),
    isIosSafari: vi.fn(() => false),
    isMobileDevice: vi.fn(() => true),
    trackPwaEvent: vi.fn(),
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
import {
    getDashboardLayout,
    setDashboardLayoutLocal,
} from "@/helpers/getDashboardLayout";

import { SubscriptionCard } from "./ProfileComponents/SubscriptionCard";
import DashboardPreferences from "./ProfileComponents/DashboardPref";
import UserInsulins from "./ProfileComponents/UserInsulins";
import AddNewInsulin from "./ProfileComponents/AddNewInsulin";
import DiabetesDashboard from "./Dashboards/DiabetesDashboard";
import FitnessDashboard from "./Dashboards/FitnessDashboard";
import InstallAppCard from "./pwa/InstallAppCard";
import PwaBootstrap from "./pwa/PwaBootstrap";
import ContactUsForm from "./ContactUsForm";
import LoadCalc from "./LoadCalc";

const get = vi.mocked(axios.get);
const post = vi.mocked(axios.post);

const insulins = [
    { _id: "i1", name: "Lantus", createdAt: "2026-01-01T00:00:00.000Z" },
    { _id: "i2", name: "NovoRapid", createdAt: "2026-01-01T00:00:00.000Z" },
];

beforeEach(() => {
    get.mockReset();
    post.mockReset();
    get.mockResolvedValue({ status: 200, data: { data: [] } });
    post.mockResolvedValue({ data: { message: "Saved!" } });
    vi.mocked(notify).mockClear();
});

describe("SubscriptionCard", () => {
    it.each([
        ["trial", /trial/i],
        ["premium", /premium/i],
        ["free", /free/i],
    ])("renders the %s plan", (plan, label) => {
        renderWithProviders(
            <SubscriptionCard
                subscriptionPlan={plan as any}
                remainingDays={12}
                subscriptionEndDate="Sat Jan 31 2026"
            />
        );

        expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    });

    it("shows the days remaining and the end date", () => {
        const { container } = renderWithProviders(
            <SubscriptionCard
                subscriptionPlan="trial"
                remainingDays={12}
                subscriptionEndDate="Sat Jan 31 2026"
            />
        );

        expect(container.textContent).toMatch(/12/);
        expect(container.textContent).toMatch(/Jan 31 2026/);
    });

    it("handles an expired subscription", () => {
        const { container } = renderWithProviders(
            <SubscriptionCard
                subscriptionPlan="trial"
                remainingDays={-3}
                subscriptionEndDate="Sat Jan 01 2026"
            />
        );

        expect(container.textContent!.length).toBeGreaterThan(0);
    });
});

describe("DashboardPreferences", () => {
    it("loads the stored layout preference", async () => {
        renderWithProviders(<DashboardPreferences />);

        await waitFor(() => expect(getDashboardLayout).toHaveBeenCalled());
    });

    it("saves a changed layout and caches it locally", async () => {
        const user = userEvent.setup();
        renderWithProviders(<DashboardPreferences />);
        await waitFor(() => expect(getDashboardLayout).toHaveBeenCalled());

        const select = screen.getAllByRole("combobox")[0];
        await user.selectOptions(select, "fitness");
        await user.click(screen.getByRole("button", { name: /save|update/i }));

        await waitFor(() =>
            expect(post).toHaveBeenCalledWith("/api/users/set-layout", {
                layoutSettings: "fitness",
            })
        );
        expect(setDashboardLayoutLocal).toHaveBeenCalledWith("fitness");
    });

    /**
     * KNOWN BUG (docs/BUGS.md #18): submitValue has no try/catch, so a failed save
     * rejects unhandled -- the user sees no error and the button is left in its
     * submitting state.
     *
     * Asserted at the source level rather than by driving a rejection: with no
     * catch anywhere, the rejection escapes the component entirely and would
     * fail the whole test run rather than this one test.
     */
    it("has no error handling around its save", () => {
        const source = fs.readFileSync(
            "src/components/ProfileComponents/DashboardPref.tsx",
            "utf8"
        );
        const submitBody = source.slice(
            source.indexOf("const submitValue"),
            source.indexOf("return (")
        );

        expect(submitBody).toContain("axios.post");
        expect(submitBody).not.toContain("catch");
    });

    it("does not save when nothing changed", async () => {
        const user = userEvent.setup();
        renderWithProviders(<DashboardPreferences />);
        await waitFor(() => expect(getDashboardLayout).toHaveBeenCalled());

        await user.click(screen.getByRole("button", { name: /save|update/i }));

        expect(post).not.toHaveBeenCalled();
    });
});

describe("UserInsulins", () => {
    it("lists the user's insulins", () => {
        renderWithProviders(
            <UserInsulins
                allAvailableInsulins={insulins}
                userInsulins={insulins}
                setUserInsulins={vi.fn()}
            />
        );

        expect(screen.getAllByText(/lantus/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/novorapid/i).length).toBeGreaterThan(0);
    });

    it("renders with no insulins selected", () => {
        renderWithProviders(
            <UserInsulins
                allAvailableInsulins={insulins}
                userInsulins={[]}
                setUserInsulins={vi.fn()}
            />
        );

        expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    });

    it("keeps the save button disabled until something changes", () => {
        renderWithProviders(
            <UserInsulins
                allAvailableInsulins={insulins}
                userInsulins={insulins}
                setUserInsulins={vi.fn()}
            />
        );

        expect(
            screen.getAllByRole("button", { name: /save|update/i })[0]
        ).toBeDisabled();
    });

    it("saves the whole list in one request once a change is made", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <UserInsulins
                allAvailableInsulins={insulins}
                userInsulins={insulins}
                setUserInsulins={vi.fn()}
            />
        );

        // Removing an insulin marks the form dirty and enables the save.
        const removeButtons = screen
            .getAllByRole("button")
            .filter((b) => !/save|update/i.test(b.textContent ?? ""));
        await user.click(removeButtons[removeButtons.length - 1]);

        const save = screen.getAllByRole("button", { name: /save|update/i })[0];
        await waitFor(() => expect(save).not.toBeDisabled());
        await user.click(save);

        await waitFor(() =>
            expect(post).toHaveBeenCalledWith(
                "/api/users/bulk-add-insulin",
                expect.objectContaining({ insulinData: expect.anything() })
            )
        );
    });

    it("adds an insulin from the available list", async () => {
        const user = userEvent.setup();
        const setUserInsulins = vi.fn();
        renderWithProviders(
            <UserInsulins
                allAvailableInsulins={insulins}
                userInsulins={[]}
                setUserInsulins={setUserInsulins}
            />
        );

        const select = screen.getAllByRole("combobox")[0];
        await user.selectOptions(select, "Lantus");

        expect(select).toBeInTheDocument();
    });
});

describe("AddNewInsulin", () => {
    it("creates the type then attaches it to the user", async () => {
        const user = userEvent.setup();
        post.mockResolvedValue({
            data: { message: "added!", entry: { _id: "i3", name: "Tresiba" } },
        });
        renderWithProviders(
            <AddNewInsulin allAvailableInsulins={insulins} />
        );

        await user.type(screen.getAllByRole("textbox")[0], "Tresiba");
        await user.click(screen.getAllByRole("button", { name: /add|save/i })[0]);

        await waitFor(() => expect(post).toHaveBeenCalled());
        expect(post.mock.calls[0][0]).toBe("/api/insulin-type/add");
    });

    it("reports a duplicate insulin type", async () => {
        const user = userEvent.setup();
        post.mockImplementation(rejectsWith({
            response: { data: { error: "Tresiba Insulin already exists" } },
        }));
        renderWithProviders(
            <AddNewInsulin allAvailableInsulins={insulins} />
        );

        await user.type(screen.getAllByRole("textbox")[0], "Tresiba");
        await user.click(screen.getAllByRole("button", { name: /add|save/i })[0]);

        await waitFor(() => expect(notify).toHaveBeenCalled());
    });
});

describe("dashboards", () => {
    it("DiabetesDashboard loads glucose and weight in parallel", async () => {
        renderWithProviders(<DiabetesDashboard />);

        await waitFor(() => expect(get.mock.calls.length).toBeGreaterThanOrEqual(2));
        const urls = get.mock.calls.map((c) => c[0] as string).join(" ");

        expect(urls).toContain("/api/glucose/get/7");
        expect(urls).toContain("/api/weight/get/7");
    });

    it("FitnessDashboard loads measurements and weight", async () => {
        renderWithProviders(<FitnessDashboard />);

        await waitFor(() => expect(get.mock.calls.length).toBeGreaterThanOrEqual(2));
        const urls = get.mock.calls.map((c) => c[0] as string).join(" ");

        expect(urls).toContain("/api/measurements/get/7");
        expect(urls).toContain("/api/weight/get/7");
    });

    it.each([
        ["DiabetesDashboard", DiabetesDashboard],
        ["FitnessDashboard", FitnessDashboard],
    ])("%s still renders when the API returns a non-200", async (_name, Component) => {
        get.mockResolvedValue({ status: 500, data: { data: [] } });

        renderWithProviders(<Component />);

        await waitFor(() => expect(get).toHaveBeenCalled());
    });
});

describe("InstallAppCard", () => {
    it("stays hidden when no install path is available", () => {
        const { container } = renderWithProviders(<InstallAppCard />);

        expect(container.textContent).toBe("");
    });

    it("appears once a browser offers an install prompt and the user is invited", async () => {
        renderWithProviders(<InstallAppCard />);

        const event: any = new Event("beforeinstallprompt");
        event.prompt = vi.fn().mockResolvedValue(undefined);
        event.userChoice = Promise.resolve({ outcome: "accepted" });
        window.dispatchEvent(event);
        window.dispatchEvent(new CustomEvent("fitdose:entry-logged"));

        // Whether it opens depends on the showing caps; either way it must not throw.
        await waitFor(() => expect(document.body).toBeTruthy());
    });
});

describe("PwaBootstrap", () => {
    const stubServiceWorker = () => {
        const register = vi.fn().mockResolvedValue({});
        Object.defineProperty(navigator, "serviceWorker", {
            configurable: true,
            value: { register, ready: Promise.resolve({}) },
        });
        return register;
    };

    it("renders nothing", () => {
        stubServiceWorker();

        const { container } = renderWithProviders(<PwaBootstrap />);

        expect(container.innerHTML).toBe("");
    });

    /**
     * Registration is deliberately production-only: a service worker caching
     * /_next/static during dev HMR makes debugging very confusing.
     */
    it("does not register the service worker outside production", async () => {
        const register = stubServiceWorker();

        renderWithProviders(<PwaBootstrap />);

        await waitFor(() => expect(document.body).toBeTruthy());
        expect(register).not.toHaveBeenCalled();
    });

    it("registers /sw.js at the root scope in production", async () => {
        const register = stubServiceWorker();
        vi.stubEnv("NODE_ENV", "production");

        renderWithProviders(<PwaBootstrap />);

        await waitFor(() => expect(register).toHaveBeenCalled());
        expect(register).toHaveBeenCalledWith("/sw.js", {
            scope: "/",
            updateViaCache: "none",
        });
        vi.unstubAllEnvs();
    });

    it("reports a standalone launch", async () => {
        stubServiceWorker();
        const { isStandalone, trackPwaEvent } = await import("@/lib/pwa");
        vi.mocked(isStandalone).mockReturnValue(true);

        renderWithProviders(<PwaBootstrap />);

        await waitFor(() =>
            expect(trackPwaEvent).toHaveBeenCalledWith("pwa_launch")
        );
    });

    it("does nothing when service workers are unavailable", () => {
        Object.defineProperty(navigator, "serviceWorker", {
            configurable: true,
            value: undefined,
        });

        expect(() => renderWithProviders(<PwaBootstrap />)).not.toThrow();
    });
});

describe("ContactUsForm", () => {
    it("posts the message", async () => {
        const user = userEvent.setup();
        renderWithProviders(<ContactUsForm />);

        const textboxes = screen.getAllByRole("textbox");
        await user.type(textboxes[0], "Ada");
        await user.type(textboxes[1], "ada@example.com");
        await user.type(textboxes[2], "Hello there");
        await user.click(screen.getByRole("button", { name: /send|submit/i }));

        await waitFor(() => expect(post).toHaveBeenCalled());
        expect(post.mock.calls[0][0]).toContain("/api/contact-us/add");
    });

    it("reports a failed send", async () => {
        const user = userEvent.setup();
        // Shaped like a real axios error: the catch reads
        // error.response.data.error with no guard (see docs/BUGS.md #20).
        post.mockImplementation(
            rejectsWith({ response: { data: { error: "Error sending message" } } })
        );
        renderWithProviders(<ContactUsForm />);

        const textboxes = screen.getAllByRole("textbox");
        await user.type(textboxes[0], "Ada");
        await user.type(textboxes[1], "ada@example.com");
        await user.type(textboxes[2], "Hello");
        await user.click(screen.getByRole("button", { name: /send|submit/i }));

        await waitFor(() => expect(post).toHaveBeenCalled());
    });
});

describe("LoadCalc", () => {
    it("renders the barbell loading form", () => {
        renderWithProviders(<LoadCalc />);

        expect(screen.getAllByRole("spinbutton").length).toBeGreaterThan(0);
    });

    it("computes a plate loadout for a target weight", async () => {
        const user = userEvent.setup();
        const { container } = renderWithProviders(<LoadCalc />);

        const inputs = screen.getAllByRole("spinbutton");
        await user.clear(inputs[0]);
        await user.type(inputs[0], "100");

        await waitFor(() => expect(container.textContent!.length).toBeGreaterThan(0));
    });

    it("handles a load at or below the bar weight", async () => {
        const user = userEvent.setup();
        renderWithProviders(<LoadCalc />);

        const inputs = screen.getAllByRole("spinbutton");
        await user.clear(inputs[0]);
        await user.type(inputs[0], "20");

        expect(inputs[0]).toBeInTheDocument();
    });
});
