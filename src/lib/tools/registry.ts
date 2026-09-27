import {
    ArrowRightLeft,
    Calculator,
    ChartLine,
    Crosshair,
    Droplet,
    Dumbbell,
    Flame,
    Gauge,
    GlassWater,
    MoveVertical,
    Percent,
    Ruler,
    Scale,
    Syringe,
    Target,
    TrendingDown,
    Wheat,
    Zap,
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
        related: [
            "blood-sugar-converter",
            "gmi-calculator",
            "bmi-calculator",
        ],
        cta: {
            heading: "See your estimated A1c from your own readings",
            body: "Log your glucose readings in FitDose and your dashboard estimates your A1c and time in range automatically as the readings build up.",
            label: "Start logging free",
        },
        lastReviewed: "2026-09-27",
    },
    {
        slug: "blood-sugar-converter",
        href: "/tools/blood-sugar-converter",
        title: "Blood Sugar Converter",
        h1: "Blood Sugar Converter: mg/dL to mmol/L",
        shortName: "Blood sugar",
        description:
            "Convert blood glucose between mg/dL and mmol/L and see where a reading sits against standard ranges.",
        features: [
            "mg/dL to mmol/L and back",
            "Fasting and after-meal ranges",
            "Low blood sugar levels",
            "Conversion chart",
        ],
        metaTitle: "Blood Sugar Converter: mg/dL to mmol/L | FitDose",
        metaDescription:
            "Convert blood glucose between mg/dL and mmol/L instantly and check a reading against fasting, after-meal and low blood sugar ranges.",
        icon: ArrowRightLeft,
        cluster: "diabetes",
        keywords: [
            "mg/dl to mmol/l",
            "mmol to mg/dl",
            "blood sugar converter",
            "blood sugar chart",
        ],
        related: ["a1c-calculator", "bmi-calculator", "water-intake-calculator"],
        cta: {
            heading: "Keep every reading in one place",
            body: "FitDose keeps your glucose readings, insulin and weight together, with charts against a 70–180 mg/dL target range.",
            label: "Start logging free",
        },
        lastReviewed: "2026-09-27",
    },
    {
        slug: "body-fat-calculator",
        href: "/tools/body-fat-calculator",
        title: "Body Fat Calculator",
        h1: "Body Fat Calculator (US Navy Method)",
        shortName: "Body fat",
        description:
            "Estimate your body fat percentage from a few tape measurements with the US Navy method.",
        features: [
            "US Navy tape method",
            "ACE body fat categories",
            "Fat and lean mass",
            "Centimetres or inches",
        ],
        metaTitle: "Body Fat Calculator: US Navy Tape Method | FitDose",
        metaDescription:
            "Estimate your body fat percentage from height, neck, waist and hip measurements using the US Navy method, in centimetres or inches.",
        icon: Percent,
        cluster: "body",
        keywords: [
            "body fat calculator",
            "navy body fat calculator",
            "body fat percentage calculator",
        ],
        related: ["bmi-calculator", "whr-calculator", "ideal-weight-calculator"],
        cta: {
            heading: "Watch your shape change over time",
            body: "Log your waist, hips and five other measurements in FitDose to see body composition change, not just the number on the scale.",
            label: "Start tracking free",
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
        related: [
            "body-fat-calculator",
            "whr-calculator",
            "ideal-weight-calculator",
            "bmr-calculator",
        ],
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
        related: [
            "tdee-calculator",
            "water-intake-calculator",
            "bmi-calculator",
        ],
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
        related: [
            "body-fat-calculator",
            "bmi-calculator",
            "ideal-weight-calculator",
        ],
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
    {
        slug: "tdee-calculator",
        href: "/tools/tdee-calculator",
        title: "TDEE Calculator",
        h1: "TDEE Calculator: Total Daily Energy Expenditure",
        shortName: "TDEE",
        description:
            "Work out how many calories you burn in a day from your body stats and activity level.",
        features: [
            "Mifflin-St Jeor BMR",
            "Six activity levels",
            "Calories for every level",
            "Metric or imperial",
        ],
        metaTitle: "TDEE Calculator: Total Daily Energy Expenditure | FitDose",
        metaDescription:
            "Calculate your total daily energy expenditure (TDEE) from age, sex, height, weight and activity level with the Mifflin-St Jeor equation.",
        icon: Zap,
        cluster: "energy",
        keywords: ["tdee calculator", "tdee", "total daily energy expenditure"],
        related: [
            "calorie-deficit-calculator",
            "maintenance-calorie-calculator",
            "bmr-calculator",
        ],
        cta: {
            heading: "Check your TDEE against real life",
            body: "Log your weight weekly in FitDose. If it holds steady at this intake you have found your real TDEE; if not, the trend shows which way to adjust.",
            label: "Start tracking free",
        },
        lastReviewed: "2026-09-27",
    },
    {
        slug: "calorie-deficit-calculator",
        href: "/tools/calorie-deficit-calculator",
        title: "Calorie Deficit Calculator",
        h1: "Calorie Deficit Calculator for Weight Loss",
        shortName: "Calorie deficit",
        description:
            "Find a daily calorie target for losing weight at a pace you choose, with a safe-minimum check.",
        features: [
            "Targets for four weekly paces",
            "Minimum calorie check",
            "Weeks to your goal weight",
            "Based on your TDEE",
        ],
        metaTitle: "Calorie Deficit Calculator for Weight Loss | FitDose",
        metaDescription:
            "Find how many calories to eat to lose 0.25 to 1 kg a week, based on your TDEE, with a safe minimum check and weeks to your goal weight.",
        icon: TrendingDown,
        cluster: "energy",
        keywords: [
            "calorie deficit calculator",
            "how many calories to lose weight",
            "weight loss calorie calculator",
        ],
        related: [
            "tdee-calculator",
            "maintenance-calorie-calculator",
            "body-fat-calculator",
        ],
        cta: {
            heading: "See whether the deficit is working",
            body: "Log your weight in FitDose and the trend shows whether you are losing at the pace you planned, so you can adjust early.",
            label: "Start tracking free",
        },
        lastReviewed: "2026-09-27",
    },
    {
        slug: "maintenance-calorie-calculator",
        href: "/tools/maintenance-calorie-calculator",
        title: "Maintenance Calorie Calculator",
        h1: "Maintenance Calorie Calculator",
        shortName: "Maintenance",
        description:
            "Estimate the calories you need to keep your weight steady, plus lean-gain and steady-loss targets.",
        features: [
            "Maintenance range",
            "Lean-gain target",
            "Steady-loss target",
            "Six activity levels",
        ],
        metaTitle: "Maintenance Calorie Calculator: Keep Weight Steady | FitDose",
        metaDescription:
            "Estimate the calories you need to maintain your current weight, plus targets for a lean gain or a steady loss, from your body stats and activity.",
        icon: Scale,
        cluster: "energy",
        keywords: [
            "maintenance calorie calculator",
            "maintenance calories",
            "calories to maintain weight",
        ],
        related: [
            "tdee-calculator",
            "calorie-deficit-calculator",
            "bmr-calculator",
        ],
        cta: {
            heading: "Find your real maintenance",
            body: "Log your weight in FitDose for two to three weeks at a steady intake. If the trend is flat, that intake is your true maintenance.",
            label: "Start tracking free",
        },
        lastReviewed: "2026-09-27",
    },
    {
        slug: "plate-calculator",
        href: "/tools/plate-calculator",
        title: "Plate Calculator",
        h1: "Barbell Plate Calculator",
        shortName: "Plate calculator",
        description:
            "See which plates to load on each side of the bar for a target weight, using the plates you have.",
        features: [
            "Plates per side",
            "Choose your own plates",
            "Any bar weight",
            "Colour-coded plates",
        ],
        metaTitle: "Barbell Plate Calculator: What to Load Per Side | FitDose",
        metaDescription:
            "Enter a target weight and your bar weight to see which plates to load on each side of the barbell, using only the plates you have.",
        icon: Dumbbell,
        cluster: "strength",
        keywords: [
            "plate calculator",
            "barbell calculator",
            "barbell plate calculator",
        ],
        related: ["tdee-calculator", "body-fat-calculator", "bmi-calculator"],
        cta: {
            heading: "Track your body alongside your training",
            body: "Log bodyweight and measurements in FitDose to see how your training changes your shape over time.",
            label: "Start tracking free",
        },
        lastReviewed: "2026-09-27",
    },
    {
        slug: "gmi-calculator",
        href: "/tools/gmi-calculator",
        title: "GMI & Time in Range Calculator",
        h1: "GMI and Time in Range Calculator",
        shortName: "GMI & time in range",
        description:
            "Turn glucose readings into a Glucose Management Indicator, time in range and variability, checked against CGM targets.",
        features: [
            "Glucose Management Indicator",
            "Five-band time in range",
            "Glucose variability (CV)",
            "International CGM targets",
        ],
        metaTitle: "GMI & Time in Range Calculator (CGM Targets) | FitDose",
        metaDescription:
            "Paste glucose readings or enter your average to get your GMI, time in range and variability, compared with the international CGM targets.",
        icon: Gauge,
        cluster: "diabetes",
        keywords: [
            "gmi calculator",
            "glucose management indicator",
            "time in range calculator",
            "cgm time in range",
        ],
        related: ["a1c-calculator", "blood-sugar-converter", "bmi-calculator"],
        cta: {
            heading: "Get time in range from your own log",
            body: "Log glucose readings in FitDose and your stats page shows estimated A1c and time in range for any period, without pasting anything.",
            label: "Start logging free",
        },
        lastReviewed: "2026-09-27",
    },
    {
        slug: "waist-to-height-ratio-calculator",
        href: "/tools/waist-to-height-ratio-calculator",
        title: "Waist-to-Height Ratio Calculator",
        h1: "Waist-to-Height Ratio Calculator",
        shortName: "Waist-to-height",
        description:
            "Check whether your waist is under half your height, the simple measure NICE recommends alongside BMI.",
        features: [
            "Waist-to-height ratio",
            "NICE health-risk ranges",
            "Your healthy waist limit",
            "Centimetres or inches",
        ],
        metaTitle: "Waist-to-Height Ratio Calculator (NICE Ranges) | FitDose",
        metaDescription:
            "Check your waist-to-height ratio in centimetres or inches and see whether your waist is under half your height, using NICE health-risk ranges.",
        icon: MoveVertical,
        cluster: "body",
        keywords: [
            "waist to height ratio calculator",
            "waist to height ratio",
            "whtr calculator",
        ],
        related: ["whr-calculator", "body-fat-calculator", "bmi-calculator"],
        cta: {
            heading: "Watch your waist, not just the scale",
            body: "Log your waist and six other measurements in FitDose to see your body shape change over time.",
            label: "Start tracking free",
        },
        lastReviewed: "2026-09-27",
    },
    {
        slug: "weight-loss-percentage-calculator",
        href: "/tools/weight-loss-percentage-calculator",
        title: "Weight Loss Percentage Calculator",
        h1: "Weight Loss Percentage and Goal Date Calculator",
        shortName: "Weight loss %",
        description:
            "See what percentage of your body weight you have lost, your weekly rate and when you could reach your goal.",
        features: [
            "Percentage of weight lost",
            "Progress towards your goal",
            "Average weekly rate",
            "Projected goal date",
        ],
        metaTitle: "Weight Loss Percentage Calculator & Goal Date | FitDose",
        metaDescription:
            "Work out the percentage of body weight you have lost, your progress to goal, your weekly rate and a projected goal date, in kilograms or pounds.",
        icon: ChartLine,
        cluster: "body",
        keywords: [
            "weight loss percentage calculator",
            "weight loss calculator",
            "goal weight date calculator",
        ],
        related: [
            "calorie-deficit-calculator",
            "tdee-calculator",
            "bmi-calculator",
        ],
        cta: {
            heading: "Let FitDose track this for you",
            body: "Log your weigh-ins and FitDose charts your trend, averages and progress automatically, with no numbers to re-enter.",
            label: "Start tracking free",
        },
        lastReviewed: "2026-09-27",
    },
    {
        slug: "insulin-sensitivity-factor-calculator",
        href: "/tools/insulin-sensitivity-factor-calculator",
        title: "Insulin Sensitivity Factor Calculator",
        h1: "Insulin Sensitivity Factor (Correction Factor) Calculator",
        shortName: "Correction factor",
        description:
            "Estimate how far one unit of insulin lowers your blood sugar with the 1800 or 1500 rule, in mg/dL and mmol/L.",
        features: [
            "1800 and 1500 rules",
            "mg/dL and mmol/L",
            "Rapid-acting or regular insulin",
            "Education-only safeguards",
        ],
        metaTitle: "Insulin Sensitivity Factor Calculator (1800 Rule) | FitDose",
        metaDescription:
            "Estimate your insulin sensitivity (correction) factor from your total daily dose with the 1800 or 1500 rule, in mg/dL and mmol/L. For education.",
        icon: Crosshair,
        cluster: "diabetes",
        keywords: [
            "insulin sensitivity factor calculator",
            "correction factor calculator",
            "1800 rule",
        ],
        related: [
            "insulin-to-carb-ratio-calculator",
            "bolus-calculator",
            "blood-sugar-converter",
        ],
        cta: {
            heading: "Keep a record to review with your care team",
            body: "Log insulin doses next to your glucose readings in FitDose, then export or print them before your next appointment.",
            label: "Start logging free",
        },
        lastReviewed: "2026-09-27",
    },
    {
        slug: "insulin-to-carb-ratio-calculator",
        href: "/tools/insulin-to-carb-ratio-calculator",
        title: "Insulin-to-Carb Ratio Calculator",
        h1: "Insulin-to-Carb Ratio Calculator",
        shortName: "Carb ratio",
        description:
            "Estimate how many grams of carbohydrate one unit of insulin covers with the 500 or 450 rule.",
        features: [
            "500 and 450 rules",
            "Grams per unit",
            "Rapid-acting or regular insulin",
            "Education-only safeguards",
        ],
        metaTitle: "Insulin-to-Carb Ratio Calculator (500 Rule) | FitDose",
        metaDescription:
            "Estimate your insulin-to-carbohydrate ratio from your total daily insulin dose with the 500 or 450 rule, in grams per unit. For education only.",
        icon: Wheat,
        cluster: "diabetes",
        keywords: [
            "insulin to carb ratio calculator",
            "carb ratio calculator",
            "500 rule insulin",
        ],
        related: [
            "insulin-sensitivity-factor-calculator",
            "bolus-calculator",
            "a1c-calculator",
        ],
        cta: {
            heading: "Keep a record to review with your care team",
            body: "Log insulin doses next to your glucose readings in FitDose, then export or print them before your next appointment.",
            label: "Start logging free",
        },
        lastReviewed: "2026-09-27",
    },
    {
        slug: "bolus-calculator",
        href: "/tools/bolus-calculator",
        title: "Bolus Insulin Calculator",
        h1: "Bolus Insulin Calculator: Meal and Correction Dose",
        shortName: "Bolus",
        description:
            "See how a mealtime insulin dose is worked out from carbs, your ratio, your reading and your correction factor.",
        features: [
            "Meal plus correction dose",
            "Insulin on board",
            "mg/dL or mmol/L",
            "Stops at low readings",
        ],
        metaTitle: "Bolus Insulin Calculator: Meal + Correction Dose | FitDose",
        metaDescription:
            "See how a mealtime insulin dose is worked out from carbs, your carb ratio, current glucose, target and correction factor. For education only.",
        icon: Syringe,
        cluster: "diabetes",
        keywords: [
            "bolus calculator",
            "insulin dose calculator",
            "mealtime insulin calculator",
        ],
        related: [
            "insulin-to-carb-ratio-calculator",
            "insulin-sensitivity-factor-calculator",
            "blood-sugar-converter",
        ],
        cta: {
            heading: "Keep a record to review with your care team",
            body: "Log insulin doses next to your glucose readings in FitDose, then export or print them before your next appointment.",
            label: "Start logging free",
        },
        lastReviewed: "2026-09-27",
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

/**
 * Cluster landing pages under /tools. Each lives in its own folder beside the
 * tools (the parity test counts both) and anchors its cluster: tool
 * breadcrumbs and "all ... tools" links point at it.
 */
export interface HubDef {
    slug: string;
    href: `/tools/${string}`;
    cluster: ToolCluster;
    /** Short name for breadcrumbs. */
    title: string;
    h1: string;
    metaTitle: string;
    metaDescription: string;
    /** Tools from other clusters worth linking from the hub. */
    alsoUseful: string[];
    lastReviewed: string;
}

export const HUBS: HubDef[] = [
    {
        slug: "diabetes",
        href: "/tools/diabetes",
        cluster: "diabetes",
        title: "Diabetes",
        h1: "Diabetes Calculators",
        metaTitle: "Diabetes Calculators: A1c, Blood Sugar & Insulin | FitDose",
        metaDescription:
            "Free diabetes calculators: A1c to average glucose, mg/dL to mmol/L, GMI and time in range, plus education-only insulin dosing tools.",
        alsoUseful: [
            "waist-to-height-ratio-calculator",
            "weight-loss-percentage-calculator",
            "bmi-calculator",
        ],
        lastReviewed: "2026-09-27",
    },
];

export function getHub(slug: string): HubDef {
    const hub = HUBS.find((h) => h.slug === slug);
    if (!hub) throw new Error(`Unknown hub slug: ${slug}`);
    return hub;
}

export function hubForCluster(cluster: ToolCluster): HubDef | undefined {
    return HUBS.find((h) => h.cluster === cluster);
}
