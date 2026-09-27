import { CorrectionFactorCalculator } from "@/components/DosingCalculators";
import ReferenceTable from "@/components/tools/ReferenceTable";
import ToolPageShell from "@/components/tools/ToolPageShell";
import { DOSING_SOURCES } from "@/components/tools/dosingContent";
import { correctionFactor } from "@/lib/calculators/insulinDosing";
import { roundTo } from "@/lib/units/glucose";
import { buildToolMetadata } from "@/lib/tools/metadata";
import type { Faq } from "@/lib/tools/jsonLd";

export const dynamic = "force-static";

export const metadata = buildToolMetadata("insulin-sensitivity-factor-calculator");

const FAQS: Faq[] = [
    {
        q: "What is an insulin sensitivity factor?",
        a: "The insulin sensitivity factor (ISF), also called the correction factor, is how much one unit of mealtime insulin is expected to lower your blood glucose. It is used to work out a correction dose when you are above target.",
    },
    {
        q: "What is the 1800 rule?",
        a: "Divide 1800 by your total daily insulin dose to estimate how many mg/dL one unit of rapid-acting insulin will lower your glucose. For example, with 40 units a day, 1800 ÷ 40 = 45 mg/dL per unit.",
    },
    {
        q: "When is the 1500 rule used?",
        a: "The 1500 rule is generally used with regular (short-acting) insulin or for people who are more insulin resistant. It gives a smaller drop per unit than the 1800 rule for the same total daily dose.",
    },
    {
        q: "What is the 100 rule for mmol/L?",
        a: "In mmol/L, divide 100 by your total daily dose. It is the 1800 rule converted: 1800 ÷ 18 is 100. With 32 units a day, one unit lowers glucose by about 3 mmol/L.",
    },
    {
        q: "What counts as my total daily dose?",
        a: "Add up all the insulin you take in a typical day: long-acting (basal) plus every mealtime and correction dose. Averaging over several days gives a steadier figure.",
    },
    {
        q: "Should I change my doses based on this?",
        a: "No. These rules give a starting estimate that care teams then adjust from your readings, and your own factor can differ a lot. Use the result to understand your settings or discuss them, not to change doses on your own.",
    },
];

const rows = [20, 30, 40, 50, 60, 80].map((tdd) => {
    const rapid = correctionFactor(tdd, "rapid")!;
    const regular = correctionFactor(tdd, "regular")!;
    return [
        `${tdd} units`,
        `${roundTo(rapid.mgdl)} mg/dL (${roundTo(rapid.mmol, 1).toFixed(1)} mmol/L)`,
        `${roundTo(regular.mgdl)} mg/dL (${roundTo(regular.mmol, 1).toFixed(1)} mmol/L)`,
    ];
});

export default function InsulinSensitivityFactorPage() {
    return (
        <ToolPageShell
            slug="insulin-sensitivity-factor-calculator"
            intro={
                <p>
                    Estimate how far one unit of insulin lowers your blood sugar
                    from your total daily dose, using the 1800 or 1500 rule. For
                    education only: your real correction factor comes from your
                    diabetes care team. Nothing you enter is stored.
                </p>
            }
            faqs={FAQS}
            disclaimer="diabetes"
            formula={{
                formula: [
                    "Rapid-acting: correction factor (mg/dL per unit) = 1800 ÷ total daily dose",
                    "Regular insulin: correction factor (mg/dL per unit) = 1500 ÷ total daily dose",
                    "mmol/L per unit = mg/dL per unit ÷ 18.016 (about 100 ÷ total daily dose)",
                ],
                sources: [DOSING_SOURCES.rules, DOSING_SOURCES.hundredRule],
            }}
            reference={
                <ReferenceTable
                    title="Correction factor by total daily dose"
                    description="Rule-of-thumb estimates for common daily doses."
                    columns={["Total daily dose", "1800 rule (rapid-acting)", "1500 rule (regular)"]}
                    rows={rows}
                />
            }
        >
            <CorrectionFactorCalculator />
        </ToolPageShell>
    );
}
