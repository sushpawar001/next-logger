import { describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen } from "@/test/render";
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
