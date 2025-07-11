import React from "react";
import WHRCalculator from "@/components/WHRCalculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CopyUrlButton from "@/components/CopyUrlButton";

export const dynamic = "force-static";

export default function WHRCalculatorPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-4 md:mb-8">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-xl md:text-3xl font-bold text-gray-900">
                        Waist-to-Hip Ratio (WHR) Calculator
                    </h1>
                    <CopyUrlButton showEncouragement={true} />
                </div>
                <p className="text-gray-600 text-sm md:text-base">
                    Calculate your Waist-to-Hip Ratio (WHR) to assess your body
                    fat distribution and cardiovascular risk. All calculations
                    are performed locally and your data is never stored or
                    transmitted.
                </p>
            </div>
            <WHRCalculator />

            {/* WHR Reference Tables */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Male WHR Table */}
                <Card className="border border-purple-100 shadow-md">
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
                <Card className="border border-purple-100 shadow-md">
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
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                        <span>
                                            Stand with your feet shoulder-width
                                            apart
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                        <span>
                                            Find the narrowest part of your
                                            waist (usually at the navel level)
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                        <span>
                                            Wrap the tape measure around your
                                            waist without compressing the skin
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
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
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                        <span>
                                            Stand with your feet together
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                        <span>
                                            Find the widest part of your
                                            hips/buttocks
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                        <span>
                                            Wrap the tape measure around your
                                            hips at this point
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
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
        </div>
    );
}

export async function generateMetadata() {
    return {
        title: "WHR Calculator | FitDose",
        description:
            "Calculate your Waist-to-Hip Ratio (WHR) to assess your body fat distribution and cardiovascular risk.",
    };
}
