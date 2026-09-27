import {
    Calculator,
    Droplet,
    Flame,
    GlassWater,
    Ruler,
    Target,
    type LucideIcon,
} from "lucide-react";

/**
 * Single source of truth for the public /tools calculators. The tools index,
 * the public sidebar, the landing-page grid, the sitemap, page metadata and
 * JSON-LD all read from here, so adding a tool means adding an entry here plus
 * its page folder under src/app/(Public)/tools (a test enforces the parity).
 *
 * Client components import this module, so keep it to light data: FAQ copy,
 * formulas and sources live with each page instead.
 */

export type ToolCluster = "diabetes" | "body" | "energy" | "strength";

export const CLUSTERS: { id: ToolCluster; label: string; blurb: string }[] = [
    {
        id: "diabetes",
        label: "Diabetes",
        blurb: "Blood sugar and A1c conversions for people living with diabetes.",
    },
    {
        id: "body",
        label: "Body composition",
        blurb: "Weight, shape and body-fat measures and what they mean.",
    },
    {
        id: "energy",
        label: "Energy & nutrition",
        blurb: "Calorie and hydration needs based on your body and activity.",
    },
    {
        id: "strength",
        label: "Strength",
        blurb: "Tools for loading the bar and planning lifts.",
    },
];

export interface ToolDef {
    /** Folder name under src/app/(Public)/tools. */
    slug: string;
    href: `/tools/${string}`;
    /** Short name for cards, breadcrumbs and JSON-LD. */
    title: string;
    /** The page's visible heading. */
    h1: string;
    /** Label for the sidebar and landing grid. */
    shortName: string;
    /** One-sentence card copy. */
    description: string;
    features: string[];
    /** Full <title>, used as-is (no template). At most 60 characters. */
    metaTitle: string;
    /** 120-160 characters. */
    metaDescription: string;
    icon: LucideIcon;
    cluster: ToolCluster;
    /** Search terms the page targets. For content planning only; not emitted. */
    keywords: string[];
    /** Slugs of 2-4 related tools, linked at the foot of the page. */
    related: string[];
    /** Signup prompt shown under a calculated result. */
    cta: { heading: string; body: string; label: string };
    /** ISO date the content was last checked; bump when it changes. */
    lastReviewed: string;
    /** Present when the tool appears on the landing page grid. */
    home?: { order: number; body: string };
}

export const TOOLS = [
    {
        slug: "a1c-calculator",
        href: "/tools/a1c-calculator",
        title: "A1c Calculator",
        h1: "A1c to Average Blood Sugar (eAG) Calculator",
        shortName: "A1c",
        description:
            "Convert an HbA1c result to estimated average glucose, or estimate A1c from your average blood sugar.",
        features: [
            "A1c to average glucose",
            "Average glucose to A1c",
            "% and mmol/mol",
            "mg/dL and mmol/L",
        ],
        metaTitle: "A1c Calculator: A1c to Average Blood Sugar (eAG) | FitDose",
        metaDescription:
            "Convert HbA1c to estimated average glucose (eAG) or back, in %, mmol/mol, mg/dL and mmol/L, with the ADAG formula and an A1c chart.",
        icon: Droplet,
        cluster: "diabetes",
        keywords: [
            "a1c calculator",
            "a1c to average glucose",
            "eag calculator",
            "a1c chart",
        ],
        related: ["bmi-calculator", "whr-calculator", "water-intake-calculator"],
        cta: {
            heading: "See your estimated A1c from your own readings",
            body: "Log your glucose readings in FitDose and your dashboard estimates your A1c and time in range automatically as the readings build up.",
            label: "Start logging free",
        },
        lastReviewed: "2026-09-27",
    },
    {
        slug: "bmi-calculator",
        href: "/tools/bmi-calculator",
        title: "BMI Calculator",
        h1: "Body Mass Index (BMI) Calculator",
        shortName: "BMI",
        description:
            "Calculate your Body Mass Index (BMI) to assess your weight status and health risk categories.",
        features: [
            "Adult BMI classification",
            "Children & teens BMI",
            "WHO standards",
            "Health risk assessment",
        ],
        metaTitle: "BMI Calculator: Check Your Body Mass Index | FitDose",
        metaDescription:
            "Free BMI calculator. Enter your height and weight in metric or imperial units to get your Body Mass Index and WHO weight category instantly.",
        icon: Calculator,
        cluster: "body",
        keywords: ["bmi calculator", "body mass index calculator"],
        related: ["whr-calculator", "ideal-weight-calculator", "bmr-calculator"],
        cta: {
            heading: "Track your weight, not just one BMI",
            body: "A single BMI is a snapshot. Log your weight in FitDose to see your trend, averages and progress over time.",
            label: "Start tracking free",
        },
        lastReviewed: "2026-09-27",
        home: { order: 1, body: "Where your weight sits for your height." },
    },
    {
        slug: "bmr-calculator",
        href: "/tools/bmr-calculator",
        title: "BMR Calculator",
        h1: "Basal Metabolic Rate (BMR) Calculator",
        shortName: "BMR",
        description:
            "Calculate your Basal Metabolic Rate and daily calorie needs based on activity levels using the Mifflin-St Jeor Equation.",
        features: [
            "Mifflin-St Jeor formula",
            "Activity level multipliers",
            "Daily calorie needs",
            "Gender-specific calculations",
        ],
        metaTitle: "BMR Calculator: Calories Burned at Rest | FitDose",
        metaDescription:
            "Work out your Basal Metabolic Rate with the Mifflin-St Jeor equation and see your daily calorie needs at six activity levels, in metric or imperial.",
        icon: Flame,
        cluster: "energy",
        keywords: ["bmr calculator", "basal metabolic rate calculator"],
        related: ["water-intake-calculator", "bmi-calculator", "ideal-weight-calculator"],
        cta: {
            heading: "See how your weight responds",
            body: "Calorie estimates are a starting point. Log your weight in FitDose and watch the trend to see what your body actually does.",
            label: "Start tracking free",
        },
        lastReviewed: "2026-09-27",
        home: { order: 2, body: "Calories your body uses at rest." },
    },
    {
        slug: "ideal-weight-calculator",
        href: "/tools/ideal-weight-calculator",
        title: "Ideal Weight Calculator",
        h1: "Ideal Body Weight Calculator",
        shortName: "Ideal weight",
        description:
            "Calculate your ideal body weight using multiple established formulas and methods.",
        features: [
            "Multiple formulas",
            "Height-based calculation",
            "Kilograms and pounds",
            "Personalized ranges",
        ],
        metaTitle: "Ideal Weight Calculator: 4 Formulas Compared | FitDose",
        metaDescription:
            "Estimate your ideal body weight from your height with the Devine, Robinson, Miller and Hamwi formulas, side by side, in kilograms and pounds.",
        icon: Target,
        cluster: "body",
        keywords: ["ideal weight calculator", "ideal body weight calculator"],
        related: ["bmi-calculator", "whr-calculator", "bmr-calculator"],
        cta: {
            heading: "Work towards your goal weight",
            body: "Log your weight in FitDose to see your trend and averages as you move towards the range that suits you.",
            label: "Start tracking free",
        },
        lastReviewed: "2026-09-27",
        home: { order: 3, body: "Healthy ranges from common formulas." },
    },
    {
        slug: "whr-calculator",
        href: "/tools/whr-calculator",
        title: "WHR Calculator",
        h1: "Waist-to-Hip Ratio (WHR) Calculator",
        shortName: "Waist-to-hip",
        description:
            "Calculate your Waist-to-Hip Ratio to assess body fat distribution and cardiovascular risk.",
        features: [
            "Cardiovascular risk assessment",
            "Gender-specific ranges",
            "WHO standards",
            "Body fat distribution",
        ],
        metaTitle: "Waist-to-Hip Ratio Calculator (WHO Ranges) | FitDose",
        metaDescription:
            "Calculate your waist-to-hip ratio in centimetres or inches and see where it falls against the WHO risk ranges for men and women.",
        icon: Ruler,
        cluster: "body",
        keywords: ["waist to hip ratio calculator", "whr calculator"],
        related: ["bmi-calculator", "ideal-weight-calculator", "water-intake-calculator"],
        cta: {
            heading: "Watch your waist and hips change",
            body: "Log waist, hip and five other measurements in FitDose to see body shape change even when the scale stalls.",
            label: "Start tracking free",
        },
        lastReviewed: "2026-09-27",
        home: { order: 4, body: "A quick read on fat distribution." },
    },
    {
        slug: "water-intake-calculator",
        href: "/tools/water-intake-calculator",
        title: "Water Intake Calculator",
        h1: "Daily Water Intake Calculator",
        shortName: "Water intake",
        description:
            "Estimate how much water to drink each day based on your weight, height and activity level.",
        features: [
            "Weight and height based",
            "Activity adjustment",
            "Metric or imperial input",
            "Litres, ounces and cups",
        ],
        metaTitle: "Water Intake Calculator: How Much to Drink | FitDose",
        metaDescription:
            "Estimate your daily water intake from your weight, height and activity level, with the answer shown in litres, ounces and cups per day.",
        icon: GlassWater,
        cluster: "energy",
        keywords: ["water intake calculator", "how much water should i drink"],
        related: ["bmr-calculator", "bmi-calculator", "whr-calculator"],
        cta: {
            heading: "Build a daily health habit",
            body: "FitDose keeps your weight, measurements, blood sugar and insulin in one private log you can check in seconds.",
            label: "Start tracking free",
        },
        lastReviewed: "2026-09-27",
        home: { order: 5, body: "How much to drink in a day." },
    },
] as const satisfies readonly ToolDef[];

export type ToolSlug = (typeof TOOLS)[number]["slug"];

export function getTool(slug: string): ToolDef {
    const tool = TOOLS.find((t) => t.slug === slug);
    if (!tool) throw new Error(`Unknown tool slug: ${slug}`);
    return tool;
}

/** Clusters that have at least one tool, each with its tools in registry order. */
export function toolsByCluster() {
    return CLUSTERS.map((cluster) => ({
        ...cluster,
        tools: TOOLS.filter((t) => t.cluster === cluster.id) as ToolDef[],
    })).filter((cluster) => cluster.tools.length > 0);
}

export function relatedTools(slug: string): ToolDef[] {
    return getTool(slug).related.map(getTool);
}

export function homeTools(): ToolDef[] {
    return (TOOLS as readonly ToolDef[])
        .filter((t) => t.home)
        .sort((a, b) => a.home!.order - b.home!.order);
}
