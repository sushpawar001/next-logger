import BodyFatCalculator from "@/components/BodyFatCalculator";
import ReferenceTable from "@/components/tools/ReferenceTable";
import ToolPageShell from "@/components/tools/ToolPageShell";
import { BODY_FAT_CATEGORIES } from "@/lib/calculators/bodyFat";
import { buildToolMetadata } from "@/lib/tools/metadata";
import type { Faq } from "@/lib/tools/jsonLd";

export const dynamic = "force-static";

export const metadata = buildToolMetadata("body-fat-calculator");

const FAQS: Faq[] = [
    {
        q: "How accurate is the US Navy body fat method?",
        a: "For most people it lands within a few percentage points of lab methods such as DEXA. Accuracy depends heavily on measuring the same way each time, and it is less reliable for very lean or very muscular people.",
    },
    {
        q: "Why do women need a hip measurement?",
        a: "Women typically store more fat around the hips and thighs, so the women's equation adds the hip circumference to the waist to capture it. The men's equation uses waist and neck only.",
    },
    {
        q: "How do I measure my neck, waist and hips?",
        a: "Measure your neck just below the larynx (Adam's apple), with the tape sloping slightly down at the front. Men measure the waist at the navel; women at the narrowest point. Measure hips around the widest part of the buttocks. Stand relaxed and don't pull the tape tight.",
    },
    {
        q: "What is a healthy body fat percentage?",
        a: "Using the American Council on Exercise categories, the fitness range is 14–17% for men and 21–24% for women, and average is 18–24% for men and 25–31% for women. Men need at least about 2% and women about 10% essential fat.",
    },
    {
        q: "Is body fat percentage better than BMI?",
        a: "It tells you more about composition. BMI uses only height and weight, so it cannot separate muscle from fat. Body fat percentage estimates how much of your weight is fat, which is why the two can disagree for muscular people.",
    },
    {
        q: "How often should I measure?",
        a: "Every two to four weeks is enough to see a trend. Measure at the same time of day, ideally in the morning before eating, and track the trend rather than any single result.",
    },
];

const categoryRows = BODY_FAT_CATEGORIES.male
    .filter((band) => band.category !== "belowEssential")
    .map((band) => {
        const female = BODY_FAT_CATEGORIES.female.find(
            (b) => b.category === band.category
        )!;
        return [band.label, female.range, band.range];
    });

export default function BodyFatCalculatorPage() {
    return (
        <ToolPageShell
            slug="body-fat-calculator"
            intro={
                <p>
                    Estimate your body fat percentage from your height and a few
                    tape measurements using the US Navy method. Works in
                    centimetres or inches. All calculations run in your browser
                    and nothing is stored.
                </p>
            }
            faqs={FAQS}
            formula={{
                formula: [
                    "Men: %BF = 495 ÷ (1.0324 − 0.19077 × log10(waist − neck) + 0.15456 × log10(height)) − 450",
                    "Women: %BF = 495 ÷ (1.29579 − 0.35004 × log10(waist + hip − neck) + 0.22100 × log10(height)) − 450",
                    "All measurements in centimetres",
                ],
                sources: [
                    {
                        label: "Hodgdon & Beckett 1984, NHRC report 84-11 (men)",
                        href: "https://apps.dtic.mil/sti/citations/ADA143890",
                    },
                    {
                        label: "Hodgdon & Beckett 1984, NHRC report 84-29 (women)",
                        href: "https://apps.dtic.mil/sti/citations/ADA146456",
                    },
                ],
            }}
            reference={
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReferenceTable
                        title="Body fat percentage chart"
                        description="Categories used by the American Council on Exercise."
                        columns={["Category", "Women", "Men"]}
                        rows={categoryRows}
                    />
                    <ReferenceTable
                        title="How to measure"
                        description="Use a flexible tape, keep it level and snug without compressing the skin."
                        columns={["Site", "Where"]}
                        rows={[
                            ["Neck", "Just below the larynx, tape sloping slightly down at the front"],
                            ["Waist (men)", "Horizontally at the navel"],
                            ["Waist (women)", "At the narrowest point of the waist"],
                            ["Hips (women)", "Around the widest part of the buttocks"],
                            ["Height", "Standing straight, without shoes"],
                        ]}
                    />
                </div>
            }
        >
            <BodyFatCalculator />
        </ToolPageShell>
    );
}
