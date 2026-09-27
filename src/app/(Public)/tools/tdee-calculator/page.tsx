import EnergyCalculator from "@/components/EnergyCalculator";
import ReferenceTable from "@/components/tools/ReferenceTable";
import ToolPageShell from "@/components/tools/ToolPageShell";
import {
    ActivityFactorTable,
    ENERGY_FORMULA,
} from "@/components/tools/energyContent";
import { buildToolMetadata } from "@/lib/tools/metadata";
import type { Faq } from "@/lib/tools/jsonLd";

export const dynamic = "force-static";

export const metadata = buildToolMetadata("tdee-calculator");

const FAQS: Faq[] = [
    {
        q: "What is TDEE?",
        a: "Total daily energy expenditure is the number of calories you burn in a day. It combines your basal metabolic rate (energy used at rest), the energy you spend moving and exercising, and the energy used to digest food.",
    },
    {
        q: "How is TDEE calculated?",
        a: "This calculator first estimates your BMR with the Mifflin-St Jeor equation, then multiplies it by an activity factor between 1.2 for a sedentary day and 1.9 for very intense daily exercise or a physical job.",
    },
    {
        q: "What is the difference between TDEE and BMR?",
        a: "BMR is what you would burn lying still all day. TDEE adds everything else you do, so it is always higher. TDEE is the number to use when planning how much to eat.",
    },
    {
        q: "How accurate is a TDEE calculator?",
        a: "The BMR equation is within about 10% for most people, and choosing the activity level is the bigger source of error. Use the result as a starting point, then adjust based on how your weight changes over two to three weeks.",
    },
    {
        q: "Which activity level should I choose?",
        a: "Pick the one that matches a typical week, not your most active one. People tend to overestimate activity, so if you are between two levels, choose the lower.",
    },
    {
        q: "How do I use my TDEE to lose or gain weight?",
        a: "Eat below your TDEE to lose weight and above it to gain. A deficit of about 500 calories a day is a common starting point for steady loss; the calorie deficit calculator works out targets for different paces.",
    },
    {
        q: "How often should I recalculate?",
        a: "Recalculate after every 4 to 5 kg (about 10 lb) of weight change, or if your activity changes, because a lighter body burns fewer calories.",
    },
];

export default function TdeeCalculatorPage() {
    return (
        <ToolPageShell
            slug="tdee-calculator"
            intro={
                <p>
                    Estimate how many calories you burn each day from your age,
                    sex, height, weight and activity level. All calculations run
                    in your browser and nothing is stored.
                </p>
            }
            faqs={FAQS}
            formula={ENERGY_FORMULA}
            reference={
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ActivityFactorTable />
                    <ReferenceTable
                        title="Where your calories go"
                        description="Typical shares of daily energy use for a moderately active adult."
                        columns={["Component", "Share of TDEE"]}
                        rows={[
                            ["Basal metabolic rate (at rest)", "About 60–70%"],
                            ["Everyday movement (NEAT)", "Varies widely"],
                            ["Planned exercise", "Varies widely"],
                            ["Digesting food (thermic effect)", "About 10%"],
                        ]}
                    />
                </div>
            }
        >
            <EnergyCalculator variant="tdee" />
        </ToolPageShell>
    );
}
