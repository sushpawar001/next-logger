import EnergyCalculator from "@/components/EnergyCalculator";
import ReferenceTable from "@/components/tools/ReferenceTable";
import ToolPageShell from "@/components/tools/ToolPageShell";
import {
    ActivityFactorTable,
    ENERGY_FORMULA,
} from "@/components/tools/energyContent";
import { buildToolMetadata } from "@/lib/tools/metadata";
import type { Faq } from "@/lib/tools/jsonLd";

export const dynamic = "force-static";

export const metadata = buildToolMetadata("maintenance-calorie-calculator");

const FAQS: Faq[] = [
    {
        q: "What are maintenance calories?",
        a: "Maintenance calories are the number of calories that keeps your weight steady: what you eat matches what you burn. It is the same thing as your total daily energy expenditure (TDEE).",
    },
    {
        q: "How do I find my true maintenance?",
        a: "Start from this estimate, eat roughly the same amount each day for two to three weeks and weigh yourself regularly. If your weight trend is flat, that intake is your real maintenance; if it drifts up or down, adjust by about 100 to 200 calories and repeat.",
    },
    {
        q: "Why does my maintenance change?",
        a: "It moves with your body weight, muscle mass, activity and age. After losing or gaining a few kilograms, or changing how active you are, recalculate.",
    },
    {
        q: "How many calories should I add to gain muscle?",
        a: "A small surplus of around 250 calories a day, combined with strength training, is a common way to gain with less fat than a larger surplus.",
    },
    {
        q: "What is reverse dieting?",
        a: "Reverse dieting means raising calories gradually after a diet, in steps of about 100 calories a week, until you reach maintenance. It helps you find your new maintenance without a sudden jump in intake.",
    },
];

export default function MaintenanceCalorieCalculatorPage() {
    return (
        <ToolPageShell
            slug="maintenance-calorie-calculator"
            intro={
                <p>
                    Estimate how many calories you need to keep your weight
                    steady, with targets for a lean gain or a steady loss. All
                    calculations run in your browser and nothing is stored.
                </p>
            }
            faqs={FAQS}
            formula={{
                formula: [
                    ...ENERGY_FORMULA.formula,
                    "Maintenance range = TDEE ± 100 kcal",
                ],
                sources: ENERGY_FORMULA.sources,
            }}
            reference={
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReferenceTable
                        title="Adjusting from maintenance"
                        description="Common starting points; adjust based on your weight trend."
                        columns={["Goal", "Daily calories"]}
                        rows={[
                            ["Keep weight steady", "Maintenance ± 100"],
                            ["Lean muscle gain", "Maintenance + 250"],
                            ["Steady fat loss", "Maintenance − 500"],
                            ["Reverse diet", "+100 a week until maintenance"],
                        ]}
                    />
                    <ActivityFactorTable />
                </div>
            }
        >
            <EnergyCalculator variant="maintenance" />
        </ToolPageShell>
    );
}
