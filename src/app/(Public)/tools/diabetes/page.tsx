import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import CopyUrlButton from "@/components/CopyUrlButton";
import JsonLd from "@/components/tools/JsonLd";
import ReferenceTable from "@/components/tools/ReferenceTable";
import ToolCta from "@/components/tools/ToolCta";
import ToolDisclaimer from "@/components/tools/ToolDisclaimer";
import ToolFaq from "@/components/tools/ToolFaq";
import { A1C_CATEGORIES } from "@/lib/calculators/a1c";
import { FASTING, HYPO } from "@/lib/calculators/bloodSugar";
import { formatGlucosePair } from "@/lib/units/glucose";
import { hubGraph, type Faq } from "@/lib/tools/jsonLd";
import { buildHubMetadata } from "@/lib/tools/metadata";
import { getHub, getTool, TOOLS, type ToolDef } from "@/lib/tools/registry";

export const dynamic = "force-static";

export const metadata = buildHubMetadata("diabetes");

const hub = getHub("diabetes");
const diabetesTools = (TOOLS as readonly ToolDef[]).filter(
    (tool) => tool.cluster === "diabetes"
);

/** Each section names the tools it shows; every diabetes tool appears once. */
const SECTIONS: { title: string; blurb: string; slugs: string[]; dosing?: boolean }[] = [
    {
        title: "Understand your numbers",
        blurb: "Convert between units and see what a reading or lab result means.",
        slugs: ["a1c-calculator", "blood-sugar-converter", "gmi-calculator"],
    },
    {
        title: "Insulin dosing rules of thumb",
        blurb: "Education-only tools that show how common dosing rules work. Your own settings come from your care team.",
        slugs: [
            "insulin-sensitivity-factor-calculator",
            "insulin-to-carb-ratio-calculator",
            "bolus-calculator",
        ],
        dosing: true,
    },
];

const FAQS: Faq[] = [
    {
        q: "Which calculator should I use?",
        a: "To understand a lab result, use the A1c calculator. To switch a reading between mg/dL and mmol/L, use the blood sugar converter. If you have a list of readings or a CGM export, the GMI and time in range calculator summarises them. The insulin tools explain dosing rules and are for education only.",
    },
    {
        q: "What is the difference between A1c, eAG and GMI?",
        a: "A1c is a lab blood test reflecting roughly the past three months. eAG (estimated average glucose) converts an A1c into an average glucose. GMI works the other way, estimating an A1c from the average of your glucose readings, and was designed for CGM data.",
    },
    {
        q: "Should I use mg/dL or mmol/L?",
        a: "Use whichever your meter and care team use. The US and India mostly use mg/dL; the UK, Canada, Australia and much of Europe use mmol/L. Every diabetes calculator here shows both.",
    },
    {
        q: "Are these calculators medical advice?",
        a: "No. They explain widely used formulas and published thresholds so you can understand your numbers and talk to your care team. They cannot diagnose diabetes and must not be used to change medication or insulin on your own.",
    },
    {
        q: "Is anything I enter stored?",
        a: "No. The calculators run in your browser. Values you type are kept only in the page address so a result can be shared or bookmarked; nothing is sent to or saved on FitDose's servers.",
    },
    {
        q: "How can I track my numbers over time?",
        a: "A single calculation is a snapshot. A FitDose account lets you log glucose, insulin doses, weight and measurements, and shows estimated A1c, time in range and trends from your own readings.",
    },
];

const mg = (mgdl: number) => {
    const pair = formatGlucosePair(mgdl);
    return `${pair.mgdl} mg/dL (${pair.mmol.toFixed(1)} mmol/L)`;
};

const KEY_NUMBERS: [string, string][] = [
    ["Normal fasting glucose", `Below ${mg(FASTING.prediabetes)}`],
    ["Prediabetes (fasting)", `${mg(FASTING.prediabetes)} to ${mg(FASTING.diabetes - 1)}`],
    ["Diabetes range (fasting)", `${mg(FASTING.diabetes)} or higher`],
    ["Normal A1c", A1C_CATEGORIES.normal.range],
    ["Prediabetes A1c", A1C_CATEGORIES.prediabetes.range],
    ["Diabetes range A1c", A1C_CATEGORIES.diabetes.range],
    ["Low blood sugar (level 1)", `Below ${mg(HYPO.level1)}`],
    ["Serious low (level 2)", `Below ${mg(HYPO.level2)}`],
    ["Time in range target (70–180 mg/dL)", "More than 70% of the time"],
];

const HUB_CTA = {
    heading: "Track the numbers behind these calculations",
    body: "Log glucose readings and insulin doses in FitDose and see estimated A1c, time in range and trends from your own data.",
    label: "Start logging free",
};

function ToolCard({ tool }: { tool: ToolDef }) {
    const Icon = tool.icon;
    return (
        <Link
            href={tool.href}
            className="group flex h-full flex-col gap-3 rounded-lg border border-border bg-white p-5 transition-colors hover:border-primary"
        >
            <span className="flex items-center gap-3">
                <span className="rounded-md bg-primary/10 p-2 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-base font-semibold text-gray-900">
                    {tool.title}
                </span>
            </span>
            <span className="text-sm text-gray-600">{tool.description}</span>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary">
                Open calculator
                <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                />
            </span>
        </Link>
    );
}

export default function DiabetesHubPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <nav aria-label="Breadcrumb" className="mb-3 text-xs text-gray-500">
                <ol className="flex flex-wrap items-center gap-1">
                    <li className="flex items-center gap-1">
                        <Link href="/" className="hover:text-gray-900">Home</Link>
                        <span aria-hidden="true">/</span>
                    </li>
                    <li className="flex items-center gap-1">
                        <Link href="/tools" className="hover:text-gray-900">Tools</Link>
                        <span aria-hidden="true">/</span>
                    </li>
                    <li aria-current="page" className="text-gray-700">
                        {hub.title}
                    </li>
                </ol>
            </nav>
            <div className="mb-8">
                <div className="flex items-center justify-between gap-3 mb-2">
                    <h1 className="text-xl md:text-3xl font-bold text-gray-900">
                        {hub.h1}
                    </h1>
                    <CopyUrlButton showEncouragement={true} />
                </div>
                <p className="text-gray-600 text-sm md:text-base max-w-3xl">
                    Free calculators for people living with diabetes and the
                    people who support them: understand an A1c result, convert
                    between mg/dL and mmol/L, summarise your readings, and see
                    how common insulin dosing rules work. Every calculation runs
                    in your browser and nothing is stored.
                </p>
            </div>

            <div className="space-y-10">
                {SECTIONS.map((section) => (
                    <section key={section.title} aria-labelledby={`${section.title}-heading`}>
                        <h2
                            id={`${section.title}-heading`}
                            className="text-lg md:text-xl font-semibold text-gray-900"
                        >
                            {section.title}
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">{section.blurb}</p>
                        {section.dosing && (
                            <p className="mb-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                                These tools ask you to confirm you understand
                                they are for education before showing a result.
                                Never change your insulin doses without your
                                care team.
                            </p>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {section.slugs.map((slug) => (
                                <ToolCard key={slug} tool={getTool(slug)} />
                            ))}
                        </div>
                    </section>
                ))}

                <section aria-labelledby="weight-heading">
                    <h2 id="weight-heading" className="text-lg md:text-xl font-semibold text-gray-900">
                        Weight and body shape
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Fat around the middle is closely linked with type 2
                        diabetes, and even modest weight loss can improve blood
                        sugar. These tools help you keep an eye on both.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {hub.alsoUseful.map((slug) => (
                            <ToolCard key={slug} tool={getTool(slug)} />
                        ))}
                    </div>
                </section>

                <ReferenceTable
                    title="Key diabetes numbers at a glance"
                    description="Published thresholds for adults from the American Diabetes Association and the International Consensus on Time in Range. Diagnosis needs confirmed lab tests; targets are set individually."
                    columns={["Measure", "Value"]}
                    rows={KEY_NUMBERS}
                />

                <div className="max-w-xl">
                    <ToolCta slug="diabetes" cta={HUB_CTA} />
                </div>
            </div>

            <ToolDisclaimer variant="diabetes" />
            <ToolFaq faqs={FAQS} />
            <JsonLd data={hubGraph(hub, diabetesTools, FAQS)} />
        </div>
    );
}
