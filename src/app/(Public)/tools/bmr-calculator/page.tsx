import React from "react";
import BMRCalculator from "@/components/BMRCalculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ACTIVITY_FACTORS } from "@/lib/calculators/bmr";

// Multipliers are read from ACTIVITY_FACTORS so this table cannot drift from
// the calculator.
const ACTIVITY_ROWS: {
    key: keyof typeof ACTIVITY_FACTORS;
    name: string;
    badgeClass: string;
    description: string;
}[] = [
    {
        key: "sedentary",
        name: "Sedentary",
        badgeClass: "bg-gray-50 text-gray-700 border-gray-200",
        description: "Little or no exercise",
    },
    {
        key: "light",
        name: "Lightly Active",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
        description: "Exercise 1-3 times/week",
    },
    {
        key: "moderate",
        name: "Moderately Active",
        badgeClass: "bg-green-50 text-green-700 border-green-200",
        description: "Exercise 4-5 times/week",
    },
    {
        key: "active",
        name: "Very Active",
        badgeClass: "bg-yellow-50 text-yellow-700 border-yellow-200",
        description: "Daily exercise or intense exercise 3-4 times/week",
    },
    {
        key: "veryActive",
        name: "Extremely Active",
        badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
        description: "Intense exercise 6-7 times/week",
    },
    {
        key: "extraActive",
        name: "Extra Active",
        badgeClass: "bg-red-50 text-red-700 border-red-200",
        description: "Very intense exercise daily, or physical job",
    },
];
import ToolPageShell from "@/components/tools/ToolPageShell";
import { buildToolMetadata } from "@/lib/tools/metadata";
import type { Faq } from "@/lib/tools/jsonLd";

export const dynamic = "force-static";

export const metadata = buildToolMetadata("bmr-calculator");

const FAQS: Faq[] = [
    {
        q: "What is the difference between BMR and TDEE?",
        a: "BMR (basal metabolic rate) is the energy your body uses at complete rest. TDEE (total daily energy expenditure) adds everything you do on top: walking, exercise and digesting food. TDEE is BMR multiplied by an activity factor.",
    },
    {
        q: "Which BMR formula does this calculator use?",
        a: "It uses the Mifflin-St Jeor equation, published in 1990. Comparison studies have found it the most reliable of the common prediction equations for healthy adults.",
    },
    {
        q: "Why does BMR go down with age?",
        a: "The equation subtracts 5 calories a day for each year of age, reflecting the gradual loss of lean tissue and a lower metabolic rate as people get older.",
    },
    {
        q: "How accurate is a BMR estimate?",
        a: "Prediction equations land within about 10% of a measured value for most people, but individuals can differ by more. Treat the number as a starting point and adjust it based on how your weight actually changes.",
    },
    {
        q: "Which activity level should I pick?",
        a: "Choose the level that matches your typical week, not your best one. If you are unsure, pick the lower option: overestimating activity is the most common reason calorie targets don’t work.",
    },
    {
        q: "Should I eat less than my BMR to lose weight?",
        a: "Usually there is no need. Weight loss comes from eating below your total daily energy expenditure, and a moderate deficit from that number is easier to sustain than eating below your resting needs.",
    },
];

export default function BMRCalculatorPage() {
    return (
        <ToolPageShell
            slug="bmr-calculator"
            intro={<p>Calculate your Basal Metabolic Rate using the Mifflin-St Jeor Equation and estimate your daily calorie needs based on activity levels. All calculations are performed locally and your data is never stored or transmitted.</p>}
            faqs={FAQS}
            formula={{
                formula: [
                    "Men: BMR = 10 × weight (kg) + 6.25 × height (cm) − 5 × age + 5",
                    "Women: BMR = 10 × weight (kg) + 6.25 × height (cm) − 5 × age − 161",
                    "Daily calories = BMR × activity factor (1.2 to 1.9)",
                ],
                sources: [
                    {
                        label: "Mifflin et al., Am J Clin Nutr 1990",
                        href: "https://pubmed.ncbi.nlm.nih.gov/2305711/",
                    },
                    {
                        label: "Frankenfield et al., J Am Diet Assoc 2005",
                        href: "https://pubmed.ncbi.nlm.nih.gov/15883556/",
                    },
                ],
            }}
            reference={
                <>
                    {/* BMR Reference Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Activity Level Reference Table */}
                        <Card className="border border-border shadow-md">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                    Activity Level Reference
                                </CardTitle>
                                <p className="text-sm text-gray-600">
                                    Physical Activity Level (PAL) multipliers used to
                                    estimate daily calorie needs based on your activity
                                    level.
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">
                                                    Activity Level
                                                </th>
                                                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">
                                                    Multiplier
                                                </th>
                                                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">
                                                    Description
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ACTIVITY_ROWS.map((row) => (
                                                <tr key={row.key}>
                                                    <td className="border border-gray-200 px-4 py-3">
                                                        <Badge
                                                            variant="outline"
                                                            className={row.badgeClass}
                                                        >
                                                            {row.name}
                                                        </Badge>
                                                    </td>
                                                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                        {ACTIVITY_FACTORS[row.key]}
                                                    </td>
                                                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                        {row.description}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* BMR Formula Reference */}
                        <Card className="border border-border shadow-md">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                    Mifflin-St Jeor Equation
                                </CardTitle>
                                <p className="text-sm text-gray-600">
                                    The most accurate BMR formula for healthy adults,
                                    developed by Mifflin et al. in 1990.
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <h4 className="font-semibold text-blue-900 mb-2 text-sm">
                                            For Men:
                                        </h4>
                                        <p className="text-sm text-blue-800 font-mono">
                                            BMR = (10 × W) + (6.25 × H) - (5 × A) + 5
                                        </p>
                                    </div>

                                    <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
                                        <h4 className="font-semibold text-pink-900 mb-2 text-sm">
                                            For Women:
                                        </h4>
                                        <p className="text-sm text-pink-800 font-mono">
                                            BMR = (10 × W) + (6.25 × H) - (5 × A) - 161
                                        </p>
                                    </div>

                                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                                            Where:
                                        </h4>
                                        <ul className="text-xs text-gray-700 space-y-1">
                                            <li>
                                                • <strong>W</strong> = Body weight in
                                                kilograms (kg)
                                            </li>
                                            <li>
                                                • <strong>H</strong> = Body height in
                                                centimeters (cm)
                                            </li>
                                            <li>
                                                • <strong>A</strong> = Age in years
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <h4 className="font-semibold text-yellow-900 mb-2 text-sm">
                                            Important Notes:
                                        </h4>
                                        <ul className="text-xs text-yellow-800 space-y-1">
                                            <li>
                                                • BMR represents calories burned at
                                                complete rest
                                            </li>
                                            <li>
                                                • Actual calorie needs vary based on
                                                activity level
                                            </li>
                                            <li>
                                                • Consult healthcare professionals for
                                                personalized advice
                                            </li>
                                            <li>
                                                • BMR decreases with age and increases
                                                with muscle mass
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            }
        >
            <BMRCalculator />
        </ToolPageShell>
    );
}
