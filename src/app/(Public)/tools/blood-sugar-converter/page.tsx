import BloodSugarConverter from "@/components/BloodSugarConverter";
import ReferenceTable from "@/components/tools/ReferenceTable";
import ToolPageShell from "@/components/tools/ToolPageShell";
import { conversionRows, rangeRows } from "@/lib/calculators/bloodSugar";
import { buildToolMetadata } from "@/lib/tools/metadata";
import type { Faq } from "@/lib/tools/jsonLd";

export const dynamic = "force-static";

export const metadata = buildToolMetadata("blood-sugar-converter");

const FAQS: Faq[] = [
    {
        q: "Why are there two units for blood sugar?",
        a: "mg/dL measures glucose by weight (milligrams per decilitre) and mmol/L measures it by number of molecules (millimoles per litre). The US and India mostly use mg/dL, while the UK, Canada, Australia and much of Europe use mmol/L. They describe the same reading.",
    },
    {
        q: "How do I convert mg/dL to mmol/L?",
        a: "Divide by about 18. The exact factor is 18.016, which comes from the molar mass of glucose (180.16 g/mol). To go the other way, multiply mmol/L by 18.016. For example, 126 mg/dL is 7.0 mmol/L.",
    },
    {
        q: "What is a normal fasting blood sugar?",
        a: "Below 100 mg/dL (5.6 mmol/L) is normal after at least eight hours without food. 100 to 125 mg/dL (5.6 to 6.9 mmol/L) is the prediabetes range, and 126 mg/dL (7.0 mmol/L) or higher on repeat testing is in the diabetes range.",
    },
    {
        q: "What counts as low blood sugar?",
        a: "The ADA defines level 1 hypoglycaemia as below 70 mg/dL (3.9 mmol/L) and level 2 as below 54 mg/dL (3.0 mmol/L). Level 2 needs prompt action. Anyone who uses insulin or sulfonylureas should follow the plan agreed with their care team.",
    },
    {
        q: "What should blood sugar be after eating?",
        a: "In a glucose tolerance test, a level below 140 mg/dL (7.8 mmol/L) two hours after the glucose drink is normal, 140 to 199 mg/dL is the prediabetes range and 200 mg/dL (11.1 mmol/L) or higher is the diabetes range. Everyday meals vary, so treat this as a guide.",
    },
    {
        q: "What target range do people with diabetes use?",
        a: "A common target for time in range is 70 to 180 mg/dL (3.9 to 10.0 mmol/L), the range FitDose charts readings against. Individual targets can differ, so use the one your care team has set for you.",
    },
    {
        q: "How does this relate to A1c?",
        a: "A single reading is a moment in time, while A1c reflects your average over about three months. Use the A1c calculator to turn an A1c result into an estimated average glucose in either unit.",
    },
];

const conversionTableRows = conversionRows().map((row) => [
    row.mgdl,
    row.mmol.toFixed(1),
]);

const rangeTableRows = rangeRows().map((row) => [
    row.reading,
    row.mgdl,
    row.mmol,
]);

export default function BloodSugarConverterPage() {
    return (
        <ToolPageShell
            slug="blood-sugar-converter"
            intro={
                <p>
                    Convert a blood glucose reading between mg/dL and mmol/L and
                    see where it sits against fasting, after-meal and low blood
                    sugar ranges. All calculations run in your browser and
                    nothing is stored.
                </p>
            }
            faqs={FAQS}
            disclaimer="diabetes"
            formula={{
                formula: [
                    "mmol/L = mg/dL ÷ 18.016",
                    "mg/dL = mmol/L × 18.016",
                ],
                sources: [
                    {
                        label: "ADA Standards of Care 2026: Glycemic Goals and Hypoglycemia",
                        href: "https://diabetesjournals.org/care/article/49/Supplement_1/S132/163927/6-Glycemic-Goals-Hypoglycemia-and-Hyperglycemic",
                    },
                    {
                        label: "ADA Standards of Care 2026: Diagnosis and Classification",
                        href: "https://diabetesjournals.org/care/article/49/Supplement_1/S27/163926/2-Diagnosis-and-Classification-of-Diabetes",
                    },
                    {
                        label: "PubChem: D-Glucose (molar mass)",
                        href: "https://pubchem.ncbi.nlm.nih.gov/compound/5793",
                    },
                ],
            }}
            reference={
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReferenceTable
                        title="Blood sugar ranges"
                        description="ADA thresholds in both units. Fasting and 2-hour values are diagnostic ranges, confirmed by repeat testing."
                        columns={["Reading", "mg/dL", "mmol/L"]}
                        rows={rangeTableRows}
                    />
                    <ReferenceTable
                        title="mg/dL to mmol/L chart"
                        description="Common readings converted at 18.016 mg/dL per mmol/L."
                        columns={["mg/dL", "mmol/L"]}
                        rows={conversionTableRows}
                    />
                </div>
            }
        >
            <BloodSugarConverter />
        </ToolPageShell>
    );
}
