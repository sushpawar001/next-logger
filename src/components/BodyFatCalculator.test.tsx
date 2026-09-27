import { describe, expect, it } from "vitest";
import { renderWithProviders, screen, userEvent } from "@/test/render";
import { getTool } from "@/lib/tools/registry";
import BodyFatCalculator from "./BodyFatCalculator";

const { cta } = getTool("body-fat-calculator");

describe("BodyFatCalculator", () => {
    it("shows an empty state and no signup prompt before any input", () => {
        renderWithProviders(<BodyFatCalculator />);

        expect(screen.getByText(/enter your height, neck and waist/i)).toBeInTheDocument();
        expect(screen.queryByText(cta.heading)).not.toBeInTheDocument();
    });

    it("estimates body fat for a man from the URL", () => {
        renderWithProviders(<BodyFatCalculator />, {
            searchParams: "?height=178&neck=38&waist=86",
        });

        expect(screen.getByText("17.2%")).toBeInTheDocument();
        expect(screen.getByText("Fitness")).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: new RegExp(cta.label) })
        ).toHaveAttribute("href", "/signup");
    });

    it("asks women for a hip measurement before calculating", () => {
        renderWithProviders(<BodyFatCalculator />, {
            searchParams: "?gender=female&height=165&neck=33&waist=76",
        });

        expect(screen.getByLabelText("Hips")).toBeInTheDocument();
        expect(screen.queryByText(/estimated body fat/i)).not.toBeInTheDocument();
    });

    it("estimates body fat for a woman", () => {
        renderWithProviders(<BodyFatCalculator />, {
            searchParams: "?gender=female&height=165&neck=33&waist=76&hip=100",
        });

        expect(screen.getByText("29.9%")).toBeInTheDocument();
        expect(screen.getByText("Average")).toBeInTheDocument();
    });

    it("works in inches and shows fat and lean mass in pounds", () => {
        // 178 cm, 38 cm, 86 cm expressed in inches.
        renderWithProviders(<BodyFatCalculator />, {
            searchParams:
                "?units=imperial&height=70.0787&neck=14.9606&waist=33.8583&weight=180",
        });

        expect(screen.getByText("17.2%")).toBeInTheDocument();
        expect(screen.getByText("31.0 lb")).toBeInTheDocument();
        expect(screen.getByText("149.0 lb")).toBeInTheDocument();
    });

    it("explains measurements that give no plausible result", () => {
        renderWithProviders(<BodyFatCalculator />, {
            searchParams: "?height=180&neck=40&waist=38",
        });

        expect(screen.getByText(/waist is larger than your neck/i)).toBeInTheDocument();
    });

    it("writes inputs to the URL", async () => {
        const user = userEvent.setup();
        const updates: string[] = [];
        renderWithProviders(<BodyFatCalculator />, {
            onUrlUpdate: (e) => updates.push(e.queryString),
        });

        await user.type(screen.getByLabelText("Waist"), "8");

        expect(updates.join(" ")).toContain("waist=8");
    });
});
