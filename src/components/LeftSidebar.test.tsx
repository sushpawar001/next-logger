import { describe, expect, it, vi } from "vitest";
import { makeTestQueryClient, renderWithProviders, screen } from "@/test/render";
import { qk } from "@/lib/query/keys";
import type { SubscriptionInfo } from "@/hooks/queries/useReferenceData";
import { SidebarProvider } from "@/components/ui/sidebar";

vi.mock("@/lib/pwa", () => ({
    isStandalone: vi.fn(() => false),
    isIosDevice: vi.fn(() => false),
    isIosSafari: vi.fn(() => false),
    isMobileDevice: vi.fn(() => true),
    trackPwaEvent: vi.fn(),
}));

import LeftSidebar from "./LeftSidebar";

/**
 * The only component in the app that touches Clerk directly. `@clerk/nextjs` is
 * stubbed globally in setup.jsdom.tsx so <Show when="signed-in"> renders
 * deterministically (signed in).
 */
const renderSidebar = () =>
    renderWithProviders(
        <SidebarProvider>
            <LeftSidebar />
        </SidebarProvider>
    );

describe("LeftSidebar", () => {
    it("renders the app name linking to the dashboard", () => {
        renderSidebar();

        const hrefs = screen
            .getAllByRole("link")
            .map((a) => a.getAttribute("href"));

        expect(hrefs).toContain("/dashboard");
        expect(
            screen.getByRole("img", { name: "FitDose" }).closest("a")
        ).toHaveAttribute("href", "/dashboard");
    });

    it.each([
        ["/glucose"],
        ["/insulin"],
        ["/weight"],
        ["/measurement"],
        ["/charts"],
        ["/stats"],
        ["/profile"],
    ])("links to %s", (href) => {
        renderSidebar();

        const hrefs = screen
            .getAllByRole("link")
            .map((a) => a.getAttribute("href"));

        expect(hrefs).toContain(href);
    });

    it("labels every navigation entry", () => {
        renderSidebar();

        for (const label of [
            /glucose/i,
            /insulin/i,
            /weight/i,
            /measurement/i,
            /chart/i,
            /stat/i,
        ]) {
            expect(screen.getAllByText(label).length).toBeGreaterThan(0);
        }
    });

    it("renders the signed-in account controls", () => {
        const { container } = renderSidebar();

        // <Show when="signed-in"> renders its children; "signed-out" renders nothing.
        expect(container.textContent!.length).toBeGreaterThan(0);
    });

    it("requires a SidebarProvider", () => {
        expect(() => renderWithProviders(<LeftSidebar />)).toThrow(
            /useSidebar must be used within a SidebarProvider/
        );
    });

    it("hides the install action once the app is installed", async () => {
        const { isStandalone } = await import("@/lib/pwa");
        vi.mocked(isStandalone).mockReturnValue(true);

        const { container } = renderSidebar();

        expect(container.textContent).not.toMatch(/install app/i);
    });

    it("renders without an install path available", () => {
        const { container } = renderSidebar();

        expect(container.textContent).not.toMatch(/install app/i);
    });
});

describe("LeftSidebar navigation state", () => {
    it("marks the current page", () => {
        // setup.jsdom.tsx stubs usePathname() as "/dashboard".
        renderSidebar();

        expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
            "aria-current",
            "page"
        );
        expect(screen.getByRole("link", { name: "Glucose" })).not.toHaveAttribute(
            "aria-current"
        );
    });

    it("groups the links under Overview, Log and More", () => {
        renderSidebar();

        for (const group of ["Overview", "Log", "More"]) {
            expect(screen.getByText(group)).toBeInTheDocument();
        }
    });

    it("links the plate calculator", () => {
        renderSidebar();

        expect(
            screen.getByRole("link", { name: "Plate calculator" })
        ).toHaveAttribute("href", "/load");
    });
});

describe("LeftSidebar trial card", () => {
    const renderWithPlan = (plan: SubscriptionInfo) => {
        const queryClient = makeTestQueryClient();
        queryClient.setQueryData(qk.subscription(), plan);
        return renderWithProviders(
            <SidebarProvider>
                <LeftSidebar />
            </SidebarProvider>,
            { queryClient }
        );
    };

    it("shows the days left and progress during the trial", () => {
        renderWithPlan({
            subscriptionPlan: "trial",
            subscriptionEndDate: "Fri Oct 16 2026",
            remainingDays: 18,
        });

        expect(screen.getByText("18 days left")).toBeInTheDocument();
        expect(
            screen.getByRole("progressbar", { name: "Trial used" })
        ).toHaveAttribute("aria-valuenow", "12");
        expect(screen.getByRole("link", { name: /see plans/i })).toHaveAttribute(
            "href",
            "/profile"
        );
    });

    it("says when the trial has ended", () => {
        renderWithPlan({
            subscriptionPlan: "trial",
            subscriptionEndDate: "Fri Sep 18 2026",
            remainingDays: -3,
        });

        expect(screen.getByText("Trial ended")).toBeInTheDocument();
    });

    it("is hidden on Premium", () => {
        renderWithPlan({
            subscriptionPlan: "premium",
            subscriptionEndDate: "Fri Sep 17 2027",
            remainingDays: 356,
        });

        expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
        expect(screen.getByText("Premium")).toBeInTheDocument();
    });
});
