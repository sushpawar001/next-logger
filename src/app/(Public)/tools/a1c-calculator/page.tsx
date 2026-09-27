import A1cCalculator from "@/components/A1cCalculator";
import ReferenceTable from "@/components/tools/ReferenceTable";
import ToolPageShell from "@/components/tools/ToolPageShell";
import { A1C_CATEGORIES, a1cReferenceRows } from "@/lib/calculators/a1c";
import { buildToolMetadata } from "@/lib/tools/metadata";
import type { Faq } from "@/lib/tools/jsonLd";

export const dynamic = "force-static";

export const metadata = buildToolMetadata("a1c-calculator");

const FAQS: Faq[] = [
    {
        q: "What is HbA1c?",
        a: "HbA1c (A1c) measures the share of haemoglobin in your red blood cells that has glucose attached. Because red blood cells live for around three months, it reflects your average blood sugar over roughly the past two to three months rather than a single moment.",
    },
    {
        q: "How is estimated average glucose (eAG) calculated?",
        a: "This calculator uses the formula from the A1c-Derived Average Glucose (ADAG) study: eAG in mg/dL equals 28.7 × A1c − 46.7. The study compared lab A1c results with frequent glucose monitoring in several hundred adults with and without diabetes.",
    },
    {
        q: "What is the difference between % and mmol/mol?",
        a: "They are two scales for the same test. The percentage (NGSP/DCCT) unit is used in the US and India, while the UK and many other countries report A1c in mmol/mol (IFCC). For example, 7.0% is 53 mmol/mol.",
    },
    {
        q: "What is a normal A1c?",
        a: "The American Diabetes Association uses below 5.7% as normal, 5.7% to 6.4% as prediabetes and 6.5% or above as the diabetes range. A diagnosis normally needs a second abnormal result, so one reading on its own is not a diagnosis.",
    },
    {
        q: "Why doesn’t my meter average match my lab A1c?",
        a: "Finger-prick averages depend on when you test, so they can miss highs after meals or lows overnight. A1c can also read higher or lower than your true average with anaemia, recent blood loss or transfusion, pregnancy, kidney disease or some haemoglobin variants.",
    },
    {
        q: "What A1c should I aim for?",
        a: "For many adults with diabetes the ADA suggests an A1c below 7%, but targets are set individually and can be higher or lower depending on age, other conditions and the risk of low blood sugar. Agree your own target with your care team.",
    },
    {
        q: "How often should A1c be checked?",
        a: "The ADA recommends testing at least twice a year when you are meeting your goals, and about every three months when treatment has changed or you are not yet at target.",
    },
];

const chartRows = a1cReferenceRows().map((row) => [
    `${row.pct.toFixed(1)}%`,
    row.mmolMol,
    row.eagMgdl,
    row.eagMmol.toFixed(1),
]);

const categoryRows = Object.values(A1C_CATEGORIES).map((category) => [
    category.label,
    category.range,
]);

export default function A1cCalculatorPage() {
    return (
        <ToolPageShell
            slug="a1c-calculator"
            intro={
                <p>
                    Convert an HbA1c result into your estimated average blood
                    glucose, or estimate A1c from an average reading. Results are
                    shown in both mg/dL and mmol/L. All calculations run in your
                    browser and nothing is stored.
                </p>
            }
            faqs={FAQS}
            disclaimer="diabetes"
            formula={{
                formula: [
                    "eAG (mg/dL) = 28.7 × A1c (%) − 46.7",
                    "eAG (mmol/L) = eAG (mg/dL) ÷ 18.016",
                    "A1c (%) = 0.09148 × A1c (mmol/mol) + 2.152",
                ],
                sources: [
                    {
                        label: "Nathan et al., Diabetes Care 2008 (ADAG)",
                        href: "https://pubmed.ncbi.nlm.nih.gov/18540046/",
                    },
                    {
                        label: "ADA Standards of Care 2026: Diagnosis and Classification",
                        href: "https://diabetesjournals.org/care/article/49/Supplement_1/S27/163926/2-Diagnosis-and-Classification-of-Diabetes",
                    },
                    {
                        label: "NGSP: IFCC and NGSP units",
                        href: "https://ngsp.org/ifccngsp.asp",
                    },
                ],
            }}
            reference={
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReferenceTable
                        title="A1c to average glucose chart"
                        description="Estimated average glucose for common A1c values, from the ADAG formula."
                        columns={["A1c (%)", "mmol/mol", "eAG mg/dL", "eAG mmol/L"]}
                        rows={chartRows}
                    />
                    <ReferenceTable
                        title="A1c ranges"
                        description="American Diabetes Association diagnostic ranges for adults."
                        columns={["Category", "A1c"]}
                        rows={categoryRows}
                    />
                </div>
            }
        >
            <A1cCalculator />
        </ToolPageShell>
    );
}
