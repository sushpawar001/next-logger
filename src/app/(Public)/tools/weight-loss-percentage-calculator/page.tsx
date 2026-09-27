import WeightLossCalculator from "@/components/WeightLossCalculator";
import ReferenceTable from "@/components/tools/ReferenceTable";
import ToolPageShell from "@/components/tools/ToolPageShell";
import { buildToolMetadata } from "@/lib/tools/metadata";
import type { Faq } from "@/lib/tools/jsonLd";

export const dynamic = "force-static";

export const metadata = buildToolMetadata("weight-loss-percentage-calculator");

const FAQS: Faq[] = [
    {
        q: "How do I calculate weight loss percentage?",
        a: "Subtract your current weight from your starting weight, divide by your starting weight and multiply by 100. For example, going from 90 kg to 85.5 kg is a loss of 4.5 kg, which is 5% of your starting weight.",
    },
    {
        q: "Why does percentage matter more than kilograms or pounds?",
        a: "The same number of kilograms means more for a lighter person than a heavier one. Percentage puts everyone on the same scale, which is why health research and doctors usually talk about losing a percentage of body weight.",
    },
    {
        q: "Is 5% weight loss meaningful?",
        a: "Yes. Even modest weight loss can improve blood pressure, cholesterol and blood sugar, and the CDC uses 5% as its example. The NIDDK suggests losing 5% of your body weight over about six months as a good first goal.",
    },
    {
        q: "What is a safe rate of weight loss?",
        a: "The CDC notes that people who lose about 1 to 2 lb (0.5 to 1 kg) a week are more likely to keep the weight off than people who lose it faster.",
    },
    {
        q: "How accurate is the projected goal date?",
        a: "It assumes your average rate so far continues. In practice loss usually slows as you get lighter, and day-to-day water changes add noise, so treat the date as a rough guide and look at the trend over several weeks.",
    },
];

export default function WeightLossPercentageCalculatorPage() {
    return (
        <ToolPageShell
            slug="weight-loss-percentage-calculator"
            intro={
                <p>
                    Enter your starting and current weight to see the percentage
                    you have lost. Add a goal and a start date to see your
                    progress, your weekly rate and a projected goal date. All
                    calculations run in your browser and nothing is stored.
                </p>
            }
            faqs={FAQS}
            formula={{
                formula: [
                    "Weight lost (%) = (start − current) ÷ start × 100",
                    "Progress to goal (%) = (start − current) ÷ (start − goal) × 100",
                    "Weekly rate = (start − current) ÷ weeks since the start date",
                ],
                sources: [
                    {
                        label: "CDC: Steps for losing weight",
                        href: "https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html",
                    },
                    {
                        label: "NIDDK: Treatment for overweight and obesity",
                        href: "https://www.niddk.nih.gov/health-information/weight-management/adult-overweight-obesity/treatment",
                    },
                ],
            }}
            reference={
                <ReferenceTable
                    title="5% and 10% milestones"
                    description="The weight to reach for each milestone from a few starting weights."
                    columns={["Starting weight", "5% lost", "10% lost"]}
                    rows={[70, 80, 90, 100, 110, 120].map((kg) => [
                        `${kg} kg (${(kg / 0.45359237).toFixed(0)} lb)`,
                        `${(kg * 0.95).toFixed(1)} kg`,
                        `${(kg * 0.9).toFixed(1)} kg`,
                    ])}
                />
            }
        >
            <WeightLossCalculator />
        </ToolPageShell>
    );
}
