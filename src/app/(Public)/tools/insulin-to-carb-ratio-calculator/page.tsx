import { CarbRatioCalculator } from "@/components/DosingCalculators";
import ReferenceTable from "@/components/tools/ReferenceTable";
import ToolPageShell from "@/components/tools/ToolPageShell";
import { DOSING_SOURCES } from "@/components/tools/dosingContent";
import { carbRatio } from "@/lib/calculators/insulinDosing";
import { roundTo } from "@/lib/units/glucose";
import { buildToolMetadata } from "@/lib/tools/metadata";
import type { Faq } from "@/lib/tools/jsonLd";

export const dynamic = "force-static";

export const metadata = buildToolMetadata("insulin-to-carb-ratio-calculator");

const FAQS: Faq[] = [
    {
        q: "What is an insulin-to-carb ratio?",
        a: "It is how many grams of carbohydrate one unit of mealtime insulin covers. A ratio of 1:10 means one unit for every 10 g of carbs, so a 60 g meal would need 6 units before any correction.",
    },
    {
        q: "What is the 500 rule?",
        a: "Divide 500 by your total daily insulin dose to estimate how many grams of carbohydrate one unit of rapid-acting insulin covers. With 50 units a day, 500 ÷ 50 = 10 g per unit.",
    },
    {
        q: "What is the 450 rule?",
        a: "Some diabetes educators find that dividing 450 rather than 500 by the total daily dose works better for regular (short-acting) insulin or for people who are more insulin resistant.",
    },
    {
        q: "Why might my ratio differ at different meals?",
        a: "Many people are more insulin resistant in the morning, so breakfast often needs a stronger ratio (fewer grams per unit) than lunch or dinner. Care teams commonly set separate ratios for each meal.",
    },
    {
        q: "How accurate is the estimate?",
        a: "It is a starting point. Care teams refine ratios by comparing readings before and a few hours after meals with known carbohydrate. Don't change your ratio without talking to them.",
    },
];

const rows = [20, 30, 40, 50, 60, 80].map((tdd) => [
    `${tdd} units`,
    `1 : ${roundTo(carbRatio(tdd, "rapid")!.grams)}`,
    `1 : ${roundTo(carbRatio(tdd, "regular")!.grams)}`,
]);

export default function InsulinToCarbRatioPage() {
    return (
        <ToolPageShell
            slug="insulin-to-carb-ratio-calculator"
            intro={
                <p>
                    Estimate how many grams of carbohydrate one unit of insulin
                    covers, from your total daily dose, using the 500 or 450
                    rule. For education only: your real ratios come from your
                    diabetes care team. Nothing you enter is stored.
                </p>
            }
            faqs={FAQS}
            disclaimer="diabetes"
            formula={{
                formula: [
                    "Rapid-acting: grams of carbohydrate per unit = 500 ÷ total daily dose",
                    "Regular insulin: grams of carbohydrate per unit = 450 ÷ total daily dose",
                ],
                sources: [DOSING_SOURCES.rules],
            }}
            reference={
                <ReferenceTable
                    title="Carb ratio by total daily dose"
                    description="Rule-of-thumb estimates, as units : grams of carbohydrate."
                    columns={["Total daily dose", "500 rule (rapid-acting)", "450 rule (regular)"]}
                    rows={rows}
                />
            }
        >
            <CarbRatioCalculator />
        </ToolPageShell>
    );
}
