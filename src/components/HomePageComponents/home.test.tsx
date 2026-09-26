import { describe, expect, it } from "vitest";
import { renderWithProviders, screen, userEvent, within } from "@/test/render";

import HomePage from "@/app/page";
import { HOME_FAQ } from "./HomeFaq";
import { HOME_TOOLS } from "./HomeTools";
import { PREMIUM_PRICE } from "./HomePricing";

/**
 * The homepage is the acquisition funnel: every CTA must land on a real route,
 * the interactive bits (billing switch, mobile menu) must work from the
 * keyboard, and no draft placeholder copy may ship.
 */

describe("homepage content", () => {
    it("leads with the diabetes-specific headline", () => {
        renderWithProviders(<HomePage />);

        expect(
            screen.getByRole("heading", { level: 1, name: /calm, private log for glucose, insulin and weight/i })
        ).toBeInTheDocument();
    });

    it("ships no placeholder copy", () => {
        const { container } = renderWithProviders(<HomePage />);

        expect(container.textContent).not.toMatch(/PLACEHOLDER|\[[A-Z][^\]]*\]/);
    });

    it("labels the product mock-ups as examples for assistive tech", () => {
        renderWithProviders(<HomePage />);

        expect(screen.getByRole("img", { name: /example fitdose glucose card/i })).toBeInTheDocument();
        expect(screen.getByRole("figure", { name: /glucose statistics for the last 14 days/i })).toBeInTheDocument();
        expect(screen.getByRole("img", { name: /what the database holds/i })).toBeInTheDocument();
    });

    it("offers a skip link to a focusable main region", () => {
        renderWithProviders(<HomePage />);

        expect(screen.getByRole("link", { name: /skip to content/i })).toHaveAttribute("href", "#main");
        expect(screen.getByRole("main")).toHaveAttribute("tabindex", "-1");
    });
});

describe("homepage calls to action", () => {
    it("sends every sign-up CTA to /signup and Log in to /login", () => {
        renderWithProviders(<HomePage />);

        const signups = [
            ...screen.getAllByRole("link", { name: /^start free/i }),
            screen.getByRole("link", { name: /create your account/i }),
        ];
        expect(signups.length).toBeGreaterThanOrEqual(4);
        for (const link of signups) expect(link).toHaveAttribute("href", "/signup");

        expect(screen.getByRole("link", { name: /^log in$/i })).toHaveAttribute("href", "/login");
    });

    it("links each free calculator to its page", () => {
        renderWithProviders(<HomePage />);

        const tools = within(document.getElementById("tools")!);
        for (const tool of HOME_TOOLS) {
            expect(tools.getByRole("link", { name: new RegExp(`^${tool.name}`) })).toHaveAttribute("href", tool.href);
        }
        expect(tools.getByRole("link", { name: /all tools/i })).toHaveAttribute("href", "/tools");
    });

    it("points the footer at the real legal and contact pages", () => {
        renderWithProviders(<HomePage />);

        const footer = within(screen.getByRole("navigation", { name: "Footer" }));
        expect(footer.getByRole("link", { name: /privacy policy/i })).toHaveAttribute("href", "/privacy-policy");
        expect(footer.getByRole("link", { name: /terms of service/i })).toHaveAttribute("href", "/terms-service");
        expect(footer.getByRole("link", { name: /contact/i })).toHaveAttribute("href", "/contact-us");
        expect(screen.getByText(/doesn’t give medical or dosing advice/i)).toBeInTheDocument();
    });
});

describe("pricing billing switch", () => {
    it("starts on monthly and switches Premium to the yearly price", async () => {
        const user = userEvent.setup();
        const { container } = renderWithProviders(<HomePage />);

        // The Premium price is the live region, so the change is announced.
        const premiumPrice = container.querySelector('#pricing [aria-live="polite"]')!;
        const monthly = screen.getByRole("button", { name: "Monthly" });
        const yearly = screen.getByRole("button", { name: "Yearly" });
        expect(monthly).toHaveAttribute("aria-pressed", "true");
        expect(yearly).toHaveAttribute("aria-pressed", "false");
        expect(premiumPrice).toHaveTextContent(PREMIUM_PRICE.month.amount + PREMIUM_PRICE.month.suffix);

        await user.click(yearly);

        expect(yearly).toHaveAttribute("aria-pressed", "true");
        expect(monthly).toHaveAttribute("aria-pressed", "false");
        expect(premiumPrice).toHaveTextContent(PREMIUM_PRICE.year.amount + PREMIUM_PRICE.year.suffix);

        await user.click(monthly);
        expect(premiumPrice).toHaveTextContent(PREMIUM_PRICE.month.amount + PREMIUM_PRICE.month.suffix);
    });

    it("names the switch so it is clearly about Premium", () => {
        renderWithProviders(<HomePage />);

        expect(screen.getByRole("group", { name: "Premium billing" })).toBeInTheDocument();
    });
});

describe("mobile menu", () => {
    it("opens, moves focus in, and closes on Escape returning focus", async () => {
        const user = userEvent.setup();
        renderWithProviders(<HomePage />);

        const button = screen.getByRole("button", { name: "Menu" });
        const menu = document.getElementById("home-mobile-nav")!;
        expect(button).toHaveAttribute("aria-expanded", "false");
        expect(menu).toHaveAttribute("hidden");

        await user.click(button);
        expect(button).toHaveAttribute("aria-expanded", "true");
        expect(menu).not.toHaveAttribute("hidden");
        expect(within(menu).getAllByRole("link")[0]).toHaveFocus();

        await user.keyboard("{Escape}");
        expect(button).toHaveAttribute("aria-expanded", "false");
        expect(button).toHaveFocus();
    });

    it("closes after choosing a section", async () => {
        const user = userEvent.setup();
        renderWithProviders(<HomePage />);

        const button = screen.getByRole("button", { name: "Menu" });
        await user.click(button);
        await user.click(within(document.getElementById("home-mobile-nav")!).getByRole("link", { name: "Pricing" }));

        expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("ignores other keys while open", async () => {
        const user = userEvent.setup();
        renderWithProviders(<HomePage />);

        const button = screen.getByRole("button", { name: "Menu" });
        await user.click(button);
        await user.keyboard("a");

        expect(button).toHaveAttribute("aria-expanded", "true");
    });
});

describe("FAQ", () => {
    it("renders every question as a disclosure, first one open", () => {
        const { container } = renderWithProviders(<HomePage />);

        const items = container.querySelectorAll("#faq details");
        expect(items).toHaveLength(HOME_FAQ.length);
        expect(items[0]).toHaveAttribute("open");
        expect(items[1]).not.toHaveAttribute("open");
    });

    it("is honest that the encryption key is server-held", () => {
        renderWithProviders(<HomePage />);

        expect(screen.getByText(/isn’t end-to-end encryption/i)).toBeInTheDocument();
    });
});
