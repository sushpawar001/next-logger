import React from "react";
import BMICalculator from "@/components/BMICalculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-static";
// export const revalidate = 60 * 60 * 24;

export default function BMICalculatorPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-4 md:mb-8">
                <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">
                    Body Mass Index (BMI) Calculator
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                    Calculate your Body Mass Index (BMI) to assess your weight
                    status. All calculations are performed locally and your data
                    is never stored or transmitted.
                </p>
            </div>
            <BMICalculator />

            {/* BMI Reference Tables */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Adults BMI Table */}
                <Card className="border border-purple-100 shadow">
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
                <Card className="border border-purple-100 shadow">
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
        </div>
    );
}
