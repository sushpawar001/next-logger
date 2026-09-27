import React from "react";
import WHRCalculator from "@/components/WHRCalculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ToolPageShell from "@/components/tools/ToolPageShell";
import { buildToolMetadata } from "@/lib/tools/metadata";
import type { Faq } from "@/lib/tools/jsonLd";

export const dynamic = "force-static";

export const metadata = buildToolMetadata("whr-calculator");

const FAQS: Faq[] = [
    {
        q: "How do I measure my waist and hips?",
        a: "Measure your waist midway between your lowest rib and the top of your hip bone, after breathing out normally. Measure your hips around the widest part of your buttocks. Keep the tape level and snug but not tight, and use the same units for both.",
    },
    {
        q: "What is a healthy waist-to-hip ratio?",
        a: "The WHO treats a ratio of 0.90 or more for men and 0.85 or more for women as the point where the risk of metabolic complications is substantially increased. Lower ratios are associated with lower risk.",
    },
    {
        q: "Why are the ranges different for men and women?",
        a: "Men and women store fat differently. Women naturally carry more on the hips and thighs, so the same ratio signals a different level of risk and the thresholds are set lower for women.",
    },
    {
        q: "Is waist-to-hip ratio better than BMI?",
        a: "They measure different things. BMI reflects overall size, while waist-to-hip ratio shows where fat is stored. Fat around the abdomen is more closely linked to heart disease and type 2 diabetes, so the two work well together.",
    },
    {
        q: "How often should I measure?",
        a: "Every two to four weeks is enough to see a trend. Measure at the same time of day, ideally in the morning before eating, so readings are comparable.",
    },
];

export default function WHRCalculatorPage() {
    return (
        <ToolPageShell
            slug="whr-calculator"
            intro={<p>Calculate your Waist-to-Hip Ratio (WHR) to assess your body fat distribution and cardiovascular risk. All calculations are performed locally and your data is never stored or transmitted.</p>}
            faqs={FAQS}
            formula={{
                formula: "WHR = waist circumference ÷ hip circumference",
                sources: [
                    {
                        label: "WHO: Waist circumference and waist-hip ratio",
                        href: "https://www.who.int/publications/i/item/9789241501491",
                    },
                ],
            }}
            reference={
                <>
                    {/* WHR Reference Tables */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Male WHR Table */}
                        <Card className="border border-border shadow-md">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                    WHR Table for Men
                                </CardTitle>
                                <p className="text-sm text-gray-600">
                                    World Health Organization (WHO) recommended WHR
                                    classifications for men. WHR is calculated as waist
                                    circumference divided by hip circumference.
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">
                                                    Classification
                                                </th>
                                                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">
                                                    WHR Range
                                                </th>
                                                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">
                                                    Risk Level
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border border-gray-200 px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-green-50 text-green-700 border-green-200"
                                                    >
                                                        Low Risk
                                                    </Badge>
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                    &lt; 0.9
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                    Low cardiovascular risk
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-200 px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-yellow-50 text-yellow-700 border-yellow-200"
                                                    >
                                                        Moderate Risk
                                                    </Badge>
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                    0.9 - 0.99
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                    Moderate cardiovascular risk
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-200 px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-red-50 text-red-700 border-red-200"
                                                    >
                                                        High Risk
                                                    </Badge>
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                    ≥ 1.0
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                    High cardiovascular risk
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Female WHR Table */}
                        <Card className="border border-border shadow-md">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                    WHR Table for Women
                                </CardTitle>
                                <p className="text-sm text-gray-600">
                                    World Health Organization (WHO) recommended WHR
                                    classifications for women. WHR is calculated as
                                    waist circumference divided by hip circumference.
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">
                                                    Classification
                                                </th>
                                                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">
                                                    WHR Range
                                                </th>
                                                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">
                                                    Risk Level
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border border-gray-200 px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-green-50 text-green-700 border-green-200"
                                                    >
                                                        Low Risk
                                                    </Badge>
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                    &lt; 0.8
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                    Low cardiovascular risk
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-200 px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-yellow-50 text-yellow-700 border-yellow-200"
                                                    >
                                                        Moderate Risk
                                                    </Badge>
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                    0.8 - 0.84
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                    Moderate cardiovascular risk
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-200 px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-red-50 text-red-700 border-red-200"
                                                    >
                                                        High Risk
                                                    </Badge>
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                    ≥ 0.85
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                    High cardiovascular risk
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Measurement Instructions */}
                    <div className="mt-8">
                        <Card className="border border-blue-200 bg-blue-50">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-blue-900">
                                    How to Measure WHR
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold text-blue-900 mb-3">
                                            Waist Measurement
                                        </h4>
                                        <ul className="space-y-2 text-sm text-blue-800">
                                            <li className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0"></span>
                                                <span>
                                                    Stand with your feet shoulder-width
                                                    apart
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0"></span>
                                                <span>
                                                    Find the narrowest part of your
                                                    waist (usually at the navel level)
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0"></span>
                                                <span>
                                                    Wrap the tape measure around your
                                                    waist without compressing the skin
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0"></span>
                                                <span>
                                                    Record the measurement in
                                                    centimeters or inches
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-blue-900 mb-3">
                                            Hip Measurement
                                        </h4>
                                        <ul className="space-y-2 text-sm text-blue-800">
                                            <li className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0"></span>
                                                <span>
                                                    Stand with your feet together
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0"></span>
                                                <span>
                                                    Find the widest part of your
                                                    hips/buttocks
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0"></span>
                                                <span>
                                                    Wrap the tape measure around your
                                                    hips at this point
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0"></span>
                                                <span>
                                                    Record the measurement in
                                                    centimeters or inches
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="mt-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
                                    <h4 className="font-semibold text-blue-900 mb-2 text-sm">
                                        Important Note:
                                    </h4>
                                    <p className="text-xs text-blue-800">
                                        WHR is a better indicator of cardiovascular risk
                                        than BMI alone because it measures body fat
                                        distribution. Abdominal obesity (high WHR) is
                                        associated with increased risk of heart disease,
                                        diabetes, and other health conditions. Always
                                        consult with a healthcare professional for
                                        personalized health assessments.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            }
        >
            <WHRCalculator />
        </ToolPageShell>
    );
}
