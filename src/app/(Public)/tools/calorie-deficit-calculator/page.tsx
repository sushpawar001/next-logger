import EnergyCalculator from "@/components/EnergyCalculator";
import ReferenceTable from "@/components/tools/ReferenceTable";
import ToolPageShell from "@/components/tools/ToolPageShell";
import {
    ActivityFactorTable,
    ENERGY_FORMULA,
} from "@/components/tools/energyContent";
import { CALORIE_FLOOR, KCAL_PER_KG, PACES } from "@/lib/calculators/energy";
import { kgToLb } from "@/lib/units/body";
import { buildToolMetadata } from "@/lib/tools/metadata";
import type { Faq } from "@/lib/tools/jsonLd";

export const dynamic = "force-static";

export const metadata = buildToolMetadata("calorie-deficit-calculator");

const FAQS: Faq[] = [
    {
        q: "What is a calorie deficit?",
        a: "A calorie deficit means eating fewer calories than your body uses in a day (your TDEE). Your body makes up the difference from stored energy, which over time shows up as weight loss.",
    },
    {
        q: "How big a deficit should I aim for?",
        a: "Around 500 calories a day, which works out to roughly 0.5 kg (1 lb) a week, is a common starting point. Many guidelines suggest losing no more than about 0.5 to 1 kg (1 to 2 lb) a week; bigger deficits are harder to stick to and risk more muscle loss.",
    },
    {
        q: "Where does the 7,700 calories per kilogram figure come from?",
        a: "It is the approximate energy stored in a kilogram of body fat tissue, about 3,500 calories per pound. It is a useful first estimate, but real weight loss slows over time as your body gets lighter and adapts, which models such as the NIH Body Weight Planner account for.",
    },
    {
        q: "What is the minimum I should eat?",
        a: "Without medical supervision, common guidance is not to go below about 1,200 calories a day for women or 1,500 for men. The calculator warns you if a target falls below that.",
    },
    {
        q: "Why has my weight loss slowed down?",
        a: "As you lose weight your TDEE falls, so the same intake becomes a smaller deficit. Water shifts can also hide fat loss for a week or two. Recalculate after every few kilograms and judge progress by the trend over several weeks.",
    },
    {
        q: "How can I keep muscle while in a deficit?",
        a: "Eating enough protein and doing regular strength training both help preserve muscle while you lose fat. A slower pace also makes it easier to hold on to lean mass.",
    },
];

const paceRows = PACES.map((pace) => [
    `${pace} kg (${kgToLb(pace).toFixed(1)} lb)`,
    `${Math.round((pace * KCAL_PER_KG) / 7).toLocaleString("en-US")} kcal`,
]);

export default function CalorieDeficitCalculatorPage() {
    return (
        <ToolPageShell
            slug="calorie-deficit-calculator"
            intro={
                <p>
                    Work out a daily calorie target to lose weight at the pace
                    you choose, starting from your total daily energy
                    expenditure. All calculations run in your browser and
                    nothing is stored.
                </p>
            }
            faqs={FAQS}
            formula={{
                formula: [
                    ...ENERGY_FORMULA.formula,
                    `Daily deficit = weekly loss (kg) × ${KCAL_PER_KG.toLocaleString("en-US")} ÷ 7`,
                    "Target = TDEE − daily deficit",
                ],
                sources: [
                    ...ENERGY_FORMULA.sources,
                    {
                        label: "NIH Body Weight Planner",
                        href: "https://www.niddk.nih.gov/bwp",
                    },
                ],
            }}
            reference={
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReferenceTable
                        title="Weekly loss and daily deficit"
                        description={`Based on about ${KCAL_PER_KG.toLocaleString("en-US")} calories per kilogram of body weight. Targets are not set below ${CALORIE_FLOOR.female.toLocaleString("en-US")} kcal for women or ${CALORIE_FLOOR.male.toLocaleString("en-US")} kcal for men without a warning.`}
                        columns={["Weekly loss", "Daily deficit"]}
                        rows={paceRows}
                    />
                    <ActivityFactorTable />
                </div>
            }
        >
            <EnergyCalculator variant="deficit" />
        </ToolPageShell>
    );
}
