import React from "react";
import WaterIntakeCalculator from "@/components/WaterIntakeCalculator";
import ToolPageShell from "@/components/tools/ToolPageShell";
import { buildToolMetadata } from "@/lib/tools/metadata";
import type { Faq } from "@/lib/tools/jsonLd";

export const dynamic = "force-static";

export const metadata = buildToolMetadata("water-intake-calculator");

const FAQS: Faq[] = [
    {
        q: "How much water should I drink a day?",
        a: "It depends on your size, activity and surroundings. European guidance suggests an adequate total water intake of about 2.0 litres a day for women and 2.5 litres for men, from drinks and food combined; this calculator personalises that estimate.",
    },
    {
        q: "Does coffee or tea count towards my water intake?",
        a: "Yes. Tea, coffee and other drinks contribute to your daily fluid. Moderate amounts of caffeine do not cause enough extra fluid loss to cancel that out.",
    },
    {
        q: "Does food count?",
        a: "Food typically provides around a fifth of total water intake, more if you eat a lot of fruit, vegetables and soups. The figure here is for drinks, so a very water-rich diet may need a little less.",
    },
    {
        q: "How much extra should I drink when exercising?",
        a: "Add fluid to replace what you sweat, especially in hot weather. The activity setting adds up to 2 litres a day; after long or intense sessions, thirst and the colour of your urine are good guides.",
    },
    {
        q: "Can you drink too much water?",
        a: "Yes, although it is rare. Drinking very large amounts in a short time can dilute the sodium in your blood. Spread intake through the day, and if you have kidney or heart conditions follow your doctor’s fluid advice.",
    },
];

export default function WaterIntakePage() {
    return (
        <ToolPageShell
            slug="water-intake-calculator"
            intro={<p>Calculate your optimal daily water intake based on your age, gender, weight, height, and activity level. All calculations are performed locally and your data is never stored or transmitted.</p>}
            faqs={FAQS}
            formula={{
                formula: [
                    "Base (L) = weight (kg) × 32 ml ÷ 1000, adjusted for sex and age (+1 ml per kg for men, +2 under 18, −2 over 65)",
                    "Height adjustment: +1% for every cm above 170 cm",
                    "Total = base + activity allowance (0 to 2.0 L)",
                ],
                sources: [
                    {
                        label: "EFSA: Dietary Reference Values for water (2010)",
                        href: "https://doi.org/10.2903/j.efsa.2010.1459",
                    },
                ],
            }}
        >
            <WaterIntakeCalculator />
        </ToolPageShell>
    );
}
