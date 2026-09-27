import LoadCalc from "@/components/LoadCalc";
import ReferenceTable from "@/components/tools/ReferenceTable";
import ToolPageShell from "@/components/tools/ToolPageShell";
import { buildToolMetadata } from "@/lib/tools/metadata";
import type { Faq } from "@/lib/tools/jsonLd";

export const dynamic = "force-static";

export const metadata = buildToolMetadata("plate-calculator");

const FAQS: Faq[] = [
    {
        q: "How do I use the plate calculator?",
        a: "Enter the total weight you want to lift and the weight of your bar, then tick the plate sizes you have. The calculator shows which plates go on each side and draws the loaded bar. Your plate selection is remembered on this device.",
    },
    {
        q: "Does the total include the bar?",
        a: "Yes. The target is the total weight lifted: the bar plus two identical sides. The calculator subtracts the bar and splits the rest evenly between the two sides.",
    },
    {
        q: "How much does a barbell weigh?",
        a: "A men's Olympic bar weighs 20 kg and a women's Olympic bar 15 kg. Training and technique bars are often 10 kg or lighter, and fixed or standard bars vary, so check yours and enter its weight.",
    },
    {
        q: "Do collars count towards the weight?",
        a: "Competition collars weigh 2.5 kg each, which matters for exact totals; add 5 kg to the bar weight if you use them. Light spring clips can usually be ignored.",
    },
    {
        q: "What if I can't make the exact weight with my plates?",
        a: "The calculator never loads more than the target. If your plates can't make the exact total, it loads the closest weight below it and tells you the result isn't exact.",
    },
    {
        q: "What is the difference between Robust and Greedy mode?",
        a: "Robust mode first tries to build each side from sets of the same plate, so the bar is easy to load and read. Greedy mode always takes the largest plate that still fits, which usually means fewer plates.",
    },
];

export default function PlateCalculatorPage() {
    return (
        <ToolPageShell
            slug="plate-calculator"
            intro={
                <p>
                    Enter a target weight and your bar weight to see exactly
                    which plates to load on each side, using the plates you have.
                    All calculations run in your browser.
                </p>
            }
            faqs={FAQS}
            formula={{
                formula: [
                    "Weight per side = (target − bar weight) ÷ 2",
                    "Total = bar weight + 2 × plates per side",
                ],
                sources: [],
            }}
            reference={
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReferenceTable
                        title="Olympic plate colours"
                        description="The IWF colour code used on competition bumper plates."
                        columns={["Plate", "Colour"]}
                        rows={[
                            ["25 kg", "Red"],
                            ["20 kg", "Blue"],
                            ["15 kg", "Yellow"],
                            ["10 kg", "Green"],
                            ["5 kg", "White"],
                            ["2.5 kg", "Red (change plate)"],
                            ["2 kg", "Blue (change plate)"],
                            ["1.5 kg", "Yellow (change plate)"],
                            ["1 kg", "Green (change plate)"],
                            ["0.5 kg", "White (change plate)"],
                        ]}
                    />
                    <ReferenceTable
                        title="Common bar weights"
                        description="Weigh your own bar if you are unsure."
                        columns={["Bar", "Weight"]}
                        rows={[
                            ["Men's Olympic bar", "20 kg"],
                            ["Women's Olympic bar", "15 kg"],
                            ["Technique / training bar", "Often 10 kg or less"],
                            ["Competition collars (pair)", "5 kg"],
                        ]}
                    />
                </div>
            }
        >
            <LoadCalc cta />
        </ToolPageShell>
    );
}
