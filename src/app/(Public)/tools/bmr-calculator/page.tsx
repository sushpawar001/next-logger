import React from "react";
import BMRCalculator from "@/components/BMRCalculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-static";

export default function BMRCalculatorPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-4 md:mb-8">
                <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">
                    Basal Metabolic Rate (BMR) Calculator
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                    Calculate your Basal Metabolic Rate using the Mifflin-St
                    Jeor Equation and estimate your daily calorie needs based on
                    activity levels. All calculations are performed locally and
                    your data is never stored or transmitted.
                </p>
            </div>
            <BMRCalculator />

            {/* BMR Reference Information */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Activity Level Reference Table */}
                <Card className="border border-purple-100 shadow">
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
                                    <tr>
                                        <td className="border border-gray-200 px-4 py-3">
                                            <Badge
                                                variant="outline"
                                                className="bg-gray-50 text-gray-700 border-gray-200"
                                            >
                                                Sedentary
                                            </Badge>
                                        </td>
                                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                            1.2
                                        </td>
                                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                            Little or no exercise
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-200 px-4 py-3">
                                            <Badge
                                                variant="outline"
                                                className="bg-blue-50 text-blue-700 border-blue-200"
                                            >
                                                Lightly Active
                                            </Badge>
                                        </td>
                                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                            1.375
                                        </td>
                                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                            Exercise 1-3 times/week
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-200 px-4 py-3">
                                            <Badge
                                                variant="outline"
                                                className="bg-green-50 text-green-700 border-green-200"
                                            >
                                                Moderately Active
                                            </Badge>
                                        </td>
                                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                            1.465
                                        </td>
                                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                            Exercise 4-5 times/week
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-200 px-4 py-3">
                                            <Badge
                                                variant="outline"
                                                className="bg-yellow-50 text-yellow-700 border-yellow-200"
                                            >
                                                Very Active
                                            </Badge>
                                        </td>
                                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                            1.55
                                        </td>
                                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                            Daily exercise or intense exercise
                                            3-4 times/week
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-200 px-4 py-3">
                                            <Badge
                                                variant="outline"
                                                className="bg-orange-50 text-orange-700 border-orange-200"
                                            >
                                                Extremely Active
                                            </Badge>
                                        </td>
                                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                            1.725
                                        </td>
                                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                            Intense exercise 6-7 times/week
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-200 px-4 py-3">
                                            <Badge
                                                variant="outline"
                                                className="bg-red-50 text-red-700 border-red-200"
                                            >
                                                Extra Active
                                            </Badge>
                                        </td>
                                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                            1.9
                                        </td>
                                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                                            Very intense exercise daily, or
                                            physical job
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* BMR Formula Reference */}
                <Card className="border border-purple-100 shadow">
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
        </div>
    );
}

export async function generateMetadata() {
    return {
        title: "BMR Calculator | FitDose",
        description:
            "Calculate your Basal Metabolic Rate (BMR) to estimate your daily calorie needs based on activity levels.",
    };
}