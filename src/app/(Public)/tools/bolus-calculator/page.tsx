import { BolusCalculator } from "@/components/DosingCalculators";
import ReferenceTable from "@/components/tools/ReferenceTable";
import ToolPageShell from "@/components/tools/ToolPageShell";
import { DOSING_SOURCES } from "@/components/tools/dosingContent";
import { buildToolMetadata } from "@/lib/tools/metadata";
import type { Faq } from "@/lib/tools/jsonLd";

export const dynamic = "force-static";

export const metadata = buildToolMetadata("bolus-calculator");

const FAQS: Faq[] = [
    {
        q: "How is a mealtime bolus worked out?",
        a: "It has two parts. The meal dose is the grams of carbohydrate divided by your insulin-to-carb ratio. The correction dose is your current glucose minus your target, divided by your correction factor. The two are added together.",
    },
    {
        q: "What is insulin on board?",
        a: "Insulin on board is insulin from earlier doses that is still working. Counting it avoids 'stacking' doses. This calculator only uses it to reduce the correction part, never the meal dose, because the earlier insulin was already meant to bring a high down.",
    },
    {
        q: "What happens if I'm below my target?",
        a: "The correction becomes negative and reduces the meal dose. If your reading is below 70 mg/dL (3.9 mmol/L) the calculator shows no dose at all: treat the low first.",
    },
    {
        q: "How do I treat a low?",
        a: "The ADA's 15-15 rule: have 15 g of fast-acting carbohydrate, wait 15 minutes and recheck. If you are still below 70 mg/dL, have another 15 g. Young children usually need less; follow your care plan.",
    },
    {
        q: "Why is the result not a whole number?",
        a: "The maths gives an exact figure, but most pens and syringes dose in half or whole units. How to round, up or down, is something to agree with your care team.",
    },
    {
        q: "Where do my ratio and correction factor come from?",
        a: "From your diabetes care team, ideally. The insulin-to-carb ratio and correction factor calculators on this site show common rules of thumb for starting estimates.",
    },
];

export default function BolusCalculatorPage() {
    return (
        <ToolPageShell
            slug="bolus-calculator"
            intro={
                <p>
                    See how a mealtime insulin dose is worked out from the carbs
                    you eat, your insulin-to-carb ratio, your current reading,
                    your target and your correction factor. For education only:
                    always follow the plan your care team gave you. Nothing you
                    enter is stored.
                </p>
            }
            faqs={FAQS}
            disclaimer="diabetes"
            formula={{
                formula: [
                    "Meal dose = carbohydrate (g) ÷ insulin-to-carb ratio",
                    "Correction dose = (current glucose − target) ÷ correction factor",
                    "Total = meal dose + correction dose − insulin on board (applied to a positive correction only)",
                ],
                sources: [
                    DOSING_SOURCES.bolus,
                    DOSING_SOURCES.onBoard,
                    DOSING_SOURCES.lows,
                ],
            }}
            reference={
                <ReferenceTable
                    title="Worked example"
                    description="60 g of carbs, ratio 1:10, glucose 200 mg/dL, target 120 mg/dL, correction factor 40 mg/dL per unit, no insulin on board."
                    columns={["Step", "Working", "Units"]}
                    rows={[
                        ["Meal dose", "60 ÷ 10", "6.0"],
                        ["Correction dose", "(200 − 120) ÷ 40", "2.0"],
                        ["Total", "6.0 + 2.0", "8.0"],
                    ]}
                />
            }
        >
            <BolusCalculator />
        </ToolPageShell>
    );
}
