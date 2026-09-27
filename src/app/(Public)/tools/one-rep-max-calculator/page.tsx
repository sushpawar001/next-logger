import OneRepMaxCalculator from "@/components/OneRepMaxCalculator";
import ReferenceTable from "@/components/tools/ReferenceTable";
import ToolPageShell from "@/components/tools/ToolPageShell";
import { NSCA_LOAD_CHART } from "@/lib/calculators/oneRepMax";
import { buildToolMetadata } from "@/lib/tools/metadata";
import type { Faq } from "@/lib/tools/jsonLd";

export const dynamic = "force-static";

export const metadata = buildToolMetadata("one-rep-max-calculator");

const FAQS: Faq[] = [
    {
        q: "What is a one rep max?",
        a: "Your one rep max (1RM) is the heaviest weight you can lift once with good form for a given exercise. Coaches use it to set training loads as a percentage, such as 80% of 1RM.",
    },
    {
        q: "How is 1RM estimated from reps?",
        a: "Formulas such as Epley, Brzycki and Lombardi scale up the weight you lifted based on how many reps you completed. They agree closely at low reps and drift apart as reps increase, so this calculator shows all three and their average.",
    },
    {
        q: "How many reps should I use?",
        a: "Ten or fewer. Research comparing sets of 5, 10 and 20 reps found the 5-rep set predicted 1RM best, and recommended not using more than 10 reps. A hard set of 3 to 6 reps is a good choice.",
    },
    {
        q: "Is an estimated 1RM as good as testing it?",
        a: "It is usually close, and far safer than attempting a true maximum. Accuracy varies by exercise and training experience, so treat the result as a guide and adjust loads based on how sessions feel.",
    },
    {
        q: "How do I use 1RM to plan training?",
        a: "Pick a percentage for the rep range you want: around 85 to 95% for heavy sets of 2 to 6, 70 to 80% for sets of 8 to 12. The table shows the loads the NSCA chart pairs with each rep count.",
    },
    {
        q: "Should I test my 1RM directly?",
        a: "Only with experience, a proper warm-up and a spotter or safety bars. For most people an estimate from a hard set of a few reps is enough.",
    },
];

const chartRows = NSCA_LOAD_CHART.map((row) => [row.reps, `${row.percent}%`]);

export default function OneRepMaxCalculatorPage() {
    return (
        <ToolPageShell
            slug="one-rep-max-calculator"
            intro={
                <p>
                    Estimate the most you could lift for a single rep from a set
                    of up to 12 reps, and see the training loads for every rep
                    range. Works in kilograms or pounds. All calculations run in
                    your browser and nothing is stored.
                </p>
            }
            faqs={FAQS}
            formula={{
                formula: [
                    "Epley (1985): 1RM = weight × (1 + reps ÷ 30)",
                    "Brzycki (1993): 1RM = weight × 36 ÷ (37 − reps)",
                    "Lombardi (1989): 1RM = weight × reps^0.10",
                ],
                sources: [
                    {
                        label: "Brzycki, JOPERD 1993",
                        href: "https://doi.org/10.1080/07303084.1993.10606684",
                    },
                    {
                        label: "LeSuer et al., J Strength Cond Res 1997",
                        href: "https://doi.org/10.1519/00124278-199711000-00001",
                    },
                    {
                        label: "Reynolds et al., J Strength Cond Res 2006",
                        href: "https://pubmed.ncbi.nlm.nih.gov/16937972/",
                    },
                    {
                        label: "NSCA Training Load Chart",
                        href: "https://www.nsca.com/contentassets/61d813865e264c6e852cadfe247eae52/nsca_training_load_chart.pdf",
                    },
                ],
            }}
            reference={
                <ReferenceTable
                    title="Reps and percentage of 1RM"
                    description="How many reps are typically possible at each percentage of your one rep max, from the NSCA Training Load Chart."
                    columns={["Reps", "% of 1RM"]}
                    rows={chartRows}
                />
            }
        >
            <OneRepMaxCalculator />
        </ToolPageShell>
    );
}
