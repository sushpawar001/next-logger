import React from "react";
import IdealWeightCalculator from "@/components/IdealWeightCalculator";
import ToolPageShell from "@/components/tools/ToolPageShell";
import { buildToolMetadata } from "@/lib/tools/metadata";
import type { Faq } from "@/lib/tools/jsonLd";

export const dynamic = "force-static";

export const metadata = buildToolMetadata("ideal-weight-calculator");

const FAQS: Faq[] = [
    {
        q: "Which ideal weight formula is the most accurate?",
        a: "None of them is definitive. Devine, Robinson, Miller and Hamwi were each fitted to different data, some originally for estimating drug doses, so it is more useful to look at the range they give together than at any single number.",
    },
    {
        q: "Why do the formulas give different answers?",
        a: "Each starts from a base weight at 5 feet and adds a fixed amount per extra inch, but the base and the increment differ. The gap between them widens the taller you are.",
    },
    {
        q: "Do these formulas account for muscle or body frame?",
        a: "No. They use only height and sex, so a muscular or large-framed person can be healthy well above these figures. BMI range, waist measurement and body-fat estimates give a fuller picture.",
    },
    {
        q: "What if I am shorter than 5 feet?",
        a: "The formulas were designed for heights of 5 feet and above. For shorter heights this calculator uses each formula’s 5-foot base weight rather than extrapolating below it.",
    },
    {
        q: "How does ideal weight compare with a healthy BMI range?",
        a: "A healthy BMI of 18.5 to 24.9 covers a wider band of weights for a given height. The ideal weight formulas usually fall inside that band, near its middle or lower half.",
    },
];

export default function IdealWeightPage() {
    return (
        <ToolPageShell
            slug="ideal-weight-calculator"
            intro={<p>Calculate your ideal body weight using multiple established formulas. All calculations are performed locally and your data is never stored or transmitted.</p>}
            faqs={FAQS}
            formula={{
                formula: [
                    "Devine: men 50 kg + 2.3 kg per inch over 5 ft; women 45.5 kg + 2.3 kg per inch",
                    "Robinson: men 52 kg + 1.9 kg per inch; women 49 kg + 1.7 kg per inch",
                    "Miller: men 56.2 kg + 1.41 kg per inch; women 53.1 kg + 1.36 kg per inch",
                    "Hamwi: men 48 kg + 2.7 kg per inch; women 45.5 kg + 2.2 kg per inch",
                ],
                sources: [
                    {
                        label: "Pai & Paloucek, Ann Pharmacother 2000",
                        href: "https://pubmed.ncbi.nlm.nih.gov/10981254/",
                    },
                ],
            }}
        >
            <IdealWeightCalculator />
        </ToolPageShell>
    );
}
