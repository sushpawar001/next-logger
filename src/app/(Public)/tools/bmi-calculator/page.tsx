import React from "react";
import BMICalculator from "@/components/BMICalculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// export const revalidate = 60 * 60 * 24;
import ToolPageShell from "@/components/tools/ToolPageShell";
import { buildToolMetadata } from "@/lib/tools/metadata";
import type { Faq } from "@/lib/tools/jsonLd";

export const dynamic = "force-static";

export const metadata = buildToolMetadata("bmi-calculator");

const FAQS: Faq[] = [
    {
        q: "What is a healthy BMI?",
        a: "For most adults, the World Health Organization classes a BMI of 18.5 to 24.9 as a healthy weight. Below 18.5 is underweight, 25 to 29.9 is overweight and 30 or above is obesity.",
    },
    {
        q: "How is BMI calculated?",
        a: "BMI is your weight in kilograms divided by your height in metres squared. With pounds and inches, multiply your weight by 703 and divide by your height in inches squared. The calculator accepts either unit system.",
    },
    {
        q: "Is BMI accurate for muscular people and athletes?",
        a: "Not always. BMI cannot tell muscle from fat, so people with a lot of muscle can be classed as overweight while carrying little fat. A waist measurement or a body-fat estimate adds useful context.",
    },
    {
        q: "Are BMI ranges different for Asian adults?",
        a: "Some national guidelines for Asian populations, including India’s, use lower cut-offs, often 23 for overweight and 25 for obesity, because health risks rise at a lower BMI. This calculator shows the standard WHO categories.",
    },
    {
        q: "Can children and teenagers use this calculator?",
        a: "The adult categories do not apply under 20. A child’s BMI is interpreted with age- and sex-specific growth-chart percentiles; the percentile table on this page shows how those categories are defined.",
    },
    {
        q: "Does BMI measure body fat?",
        a: "No. BMI is a screening measure based only on height and weight. Two people with the same BMI can have very different amounts of body fat and different fat distribution.",
    },
];

export default function BMICalculatorPage() {
    return (
        <ToolPageShell
            slug="bmi-calculator"
            intro={<p>Calculate your Body Mass Index (BMI) to assess your weight status. All calculations are performed locally and your data is never stored or transmitted.</p>}
            faqs={FAQS}
            formula={{
                formula: [
                    "BMI = weight (kg) ÷ height (m)²",
                    "BMI = 703 × weight (lb) ÷ height (in)²",
                ],
                sources: [
                    {
                        label: "WHO: Obesity and overweight",
                        href: "https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight",
                    },
                    {
                        label: "CDC: Adult BMI calculator",
                        href: "https://www.cdc.gov/bmi/adult-calculator/index.html",
                    },
                ],
            }}
            reference={
                <>
                    {/* BMI Reference Tables */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Adults BMI Table */}
                        <Card className="border border-border shadow-md">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                    BMI Table for Adults
                                </CardTitle>
                                <p className="text-sm text-gray-600">
                                    This is the World Health Organization&apos;s (WHO)
                                    recommended body weight based on BMI values for
                                    adults. It is used for both men and women, age 20 or
                                    older.
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
                                                    BMI Range - kg/m²
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border border-gray-200 px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-red-50 text-red-700 border-red-200"
                                                    >
                                                        Severe Thinness
                                                    </Badge>
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                    &lt; 16
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-200 px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-orange-50 text-orange-700 border-orange-200"
                                                    >
                                                        Moderate Thinness
                                                    </Badge>
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                    16 - 17
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-200 px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-yellow-50 text-yellow-700 border-yellow-200"
                                                    >
                                                        Mild Thinness
                                                    </Badge>
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                    17 - 18.5
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-200 px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-green-50 text-green-700 border-green-200"
                                                    >
                                                        Normal
                                                    </Badge>
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                    18.5 - 25
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-200 px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-yellow-50 text-yellow-700 border-yellow-200"
                                                    >
                                                        Overweight
                                                    </Badge>
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                    25 - 30
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-200 px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-orange-50 text-orange-700 border-orange-200"
                                                    >
                                                        Obese Class I
                                                    </Badge>
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                    30 - 35
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-200 px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-red-50 text-red-700 border-red-200"
                                                    >
                                                        Obese Class II
                                                    </Badge>
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                    35 - 40
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-200 px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-red-50 text-red-700 border-red-200"
                                                    >
                                                        Obese Class III
                                                    </Badge>
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                    &gt; 40
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Children and Teens BMI Table */}
                        <Card className="border border-border shadow-md">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                    BMI Table for Children and Teens, Age 2-20
                                </CardTitle>
                                <p className="text-sm text-gray-600">
                                    The Centers for Disease Control and Prevention (CDC)
                                    recommends BMI categorization for children and teens
                                    between age 2 and 20.
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">
                                                    Category
                                                </th>
                                                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">
                                                    Percentile Range
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border border-gray-200 px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-blue-50 text-blue-700 border-blue-200"
                                                    >
                                                        Underweight
                                                    </Badge>
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                    &lt; 5%
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-200 px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-green-50 text-green-700 border-green-200"
                                                    >
                                                        Healthy Weight
                                                    </Badge>
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                    5% - 85%
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-200 px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-yellow-50 text-yellow-700 border-yellow-200"
                                                    >
                                                        At Risk of Overweight
                                                    </Badge>
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                    85% - 95%
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-200 px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-red-50 text-red-700 border-red-200"
                                                    >
                                                        Overweight
                                                    </Badge>
                                                </td>
                                                <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                                    &gt; 95%
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-semibold text-blue-900 mb-2 text-sm">
                                        Important Note:
                                    </h4>
                                    <p className="text-xs text-blue-800">
                                        For children and teens, BMI is age and
                                        sex-specific and is often referred to as
                                        BMI-for-age. The percentile indicates how a
                                        child&apos;s BMI compares to other children of
                                        the same age and sex. Consult with a healthcare
                                        provider for proper interpretation of BMI
                                        results for children and adolescents.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            }
        >
            <BMICalculator />
        </ToolPageShell>
    );
}
