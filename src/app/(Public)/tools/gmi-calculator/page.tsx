import GmiCalculator from "@/components/GmiCalculator";
import ReferenceTable from "@/components/tools/ReferenceTable";
import ToolPageShell from "@/components/tools/ToolPageShell";
import { TIR_BANDS, TIR_TARGETS } from "@/lib/calculators/glycemic";
import { buildToolMetadata } from "@/lib/tools/metadata";
import type { Faq } from "@/lib/tools/jsonLd";

export const dynamic = "force-static";

export const metadata = buildToolMetadata("gmi-calculator");

const FAQS: Faq[] = [
    {
        q: "What is the Glucose Management Indicator (GMI)?",
        a: "GMI estimates what your A1c would be from your average glucose, using a formula derived from continuous glucose monitor (CGM) data. It replaced the term 'estimated A1c' in CGM reports in 2018 because it can differ from a lab A1c.",
    },
    {
        q: "Why is my GMI different from my lab A1c?",
        a: "A lab A1c is also affected by how long your red blood cells live and other individual factors, so the two often differ by a few tenths of a percent or more. Neither is wrong: they measure different things, and the gap tends to be consistent for each person.",
    },
    {
        q: "What is time in range?",
        a: "Time in range (TIR) is the share of readings between 70 and 180 mg/dL (3.9 to 10.0 mmol/L). The international consensus suggests most adults with diabetes aim for more than 70% of the time in range, which is roughly equivalent to an A1c of about 7%.",
    },
    {
        q: "What are the time in range targets?",
        a: "For most adults with type 1 or type 2 diabetes: more than 70% in range, less than 4% below 70 mg/dL, less than 1% below 54 mg/dL, less than 25% above 180 mg/dL and less than 5% above 250 mg/dL. Targets are more cautious for older or high-risk adults and differ in pregnancy.",
    },
    {
        q: "What does the CV (coefficient of variation) mean?",
        a: "CV is the standard deviation of your readings divided by the mean, as a percentage. It measures how much your glucose swings. A CV of 36% or less is considered stable; higher values are linked with more frequent lows.",
    },
    {
        q: "How much data do I need?",
        a: "The consensus recommends at least 14 days of CGM data with the sensor worn at least 70% of the time. Finger-prick readings can still show a pattern, but they miss the times you don't test, so treat the result as a rough guide.",
    },
];

const bandRows = TIR_BANDS.map((band) => [band.label, band.mgdl, band.mmol]);
const targetRows = TIR_TARGETS.map((target) => [target.label, target.goal]);

export default function GmiCalculatorPage() {
    return (
        <ToolPageShell
            slug="gmi-calculator"
            intro={
                <p>
                    Paste a list of glucose readings, or enter your average, to
                    get your Glucose Management Indicator, time in range and
                    glucose variability, compared with the international CGM
                    targets. All calculations run in your browser and nothing is
                    stored.
                </p>
            }
            faqs={FAQS}
            disclaimer="diabetes"
            formula={{
                formula: [
                    "GMI (%) = 3.31 + 0.02392 × mean glucose (mg/dL)",
                    "CV (%) = standard deviation ÷ mean × 100",
                    "Time in range = readings in 70–180 mg/dL ÷ all readings × 100",
                ],
                sources: [
                    {
                        label: "Bergenstal et al., Diabetes Care 2018 (GMI)",
                        href: "https://pubmed.ncbi.nlm.nih.gov/30224348/",
                    },
                    {
                        label: "Battelino et al., Diabetes Care 2019 (Time in Range consensus)",
                        href: "https://pubmed.ncbi.nlm.nih.gov/31177185/",
                    },
                ],
            }}
            reference={
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReferenceTable
                        title="Glucose ranges"
                        description="The five ranges used in CGM reports."
                        columns={["Range", "mg/dL", "mmol/L"]}
                        rows={bandRows}
                    />
                    <ReferenceTable
                        title="Time in range targets"
                        description="International consensus targets for most adults with type 1 or type 2 diabetes."
                        columns={["Measure", "Goal"]}
                        rows={targetRows}
                    />
                </div>
            }
        >
            <GmiCalculator />
        </ToolPageShell>
    );
}
