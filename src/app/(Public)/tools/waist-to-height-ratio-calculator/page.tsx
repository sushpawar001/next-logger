import WhtrCalculator from "@/components/WhtrCalculator";
import ReferenceTable from "@/components/tools/ReferenceTable";
import ToolPageShell from "@/components/tools/ToolPageShell";
import { WHTR_BANDS } from "@/lib/calculators/whtr";
import { buildToolMetadata } from "@/lib/tools/metadata";
import type { Faq } from "@/lib/tools/jsonLd";

export const dynamic = "force-static";

export const metadata = buildToolMetadata("waist-to-height-ratio-calculator");

const FAQS: Faq[] = [
    {
        q: "What is a healthy waist-to-height ratio?",
        a: "A ratio from 0.4 up to 0.49 is considered healthy. The simple rule is to keep your waist to less than half your height. From 0.5 to 0.59 indicates increased health risk, and 0.6 or more indicates high risk.",
    },
    {
        q: "Why use waist-to-height ratio as well as BMI?",
        a: "BMI does not show where fat is stored. Fat around the middle is more closely linked with type 2 diabetes and heart disease, and waist-to-height ratio captures it. NICE recommends measuring it alongside BMI for adults with a BMI under 35.",
    },
    {
        q: "How do I measure my waist?",
        a: "Find the point midway between your lowest rib and the top of your hip bone, roughly in line with your belly button. Breathe out normally, keep the tape level and snug without pulling it tight, and measure against bare skin.",
    },
    {
        q: "Does the same ratio apply to men and women?",
        a: "Yes. NICE applies the same boundaries to adults of both sexes and all ethnicities with a BMI under 35, including people with high muscle mass. Because the ratio scales with height, it works for tall and short people alike.",
    },
    {
        q: "What does a ratio below 0.4 mean?",
        a: "A very low ratio can suggest you are underweight. It is flagged as 'take care' rather than as a health risk category; check your BMI too and talk to a professional if you are concerned.",
    },
    {
        q: "How is it different from waist-to-hip ratio?",
        a: "Waist-to-hip ratio compares your waist with your hips and uses different thresholds for men and women. Waist-to-height ratio compares your waist with your height and uses one set of thresholds for everyone.",
    },
];

const bandRows = WHTR_BANDS.map((band) => [band.range, band.label]);

export default function WaistToHeightRatioCalculatorPage() {
    return (
        <ToolPageShell
            slug="waist-to-height-ratio-calculator"
            intro={
                <p>
                    Divide your waist by your height to see whether your waist is
                    under half your height, and where you sit against the NICE
                    health-risk ranges. All calculations run in your browser and
                    nothing is stored.
                </p>
            }
            faqs={FAQS}
            formula={{
                formula: [
                    "Waist-to-height ratio = waist ÷ height (same units)",
                    "Healthy waist limit = height ÷ 2",
                ],
                sources: [
                    {
                        label: "NICE NG246: Identifying and assessing central adiposity",
                        href: "https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity",
                    },
                    {
                        label: "Ashwell, Open Obesity Journal 2011 (0.4 boundary)",
                        href: "https://benthamopen.com/contents/pdf/TOOBESJ/TOOBESJ-3-78.pdf",
                    },
                ],
            }}
            reference={
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReferenceTable
                        title="Waist-to-height ratio ranges"
                        description="For adults with a BMI under 35."
                        columns={["Ratio", "Meaning"]}
                        rows={bandRows}
                    />
                    <ReferenceTable
                        title="Waist limits by height"
                        description="The waist size that keeps your ratio below 0.5."
                        columns={["Height", "Keep waist under"]}
                        rows={[150, 160, 170, 180, 190].map((cm) => [
                            `${cm} cm (${(cm / 2.54).toFixed(0)} in)`,
                            `${cm / 2} cm (${(cm / 2 / 2.54).toFixed(1)} in)`,
                        ])}
                    />
                </div>
            }
        >
            <WhtrCalculator />
        </ToolPageShell>
    );
}
