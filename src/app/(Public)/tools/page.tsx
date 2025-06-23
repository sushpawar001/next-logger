import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Activity, Target, Ruler } from "lucide-react";
import CopyUrlButton from "@/components/CopyUrlButton";

export const dynamic = "force-static";

const tools = [
    {
        title: "BMI Calculator",
        description:
            "Calculate your Body Mass Index (BMI) to assess your weight status and health risk categories.",
        href: "/tools/bmi-calculator",
        icon: Calculator,
        features: [
            "Adult BMI classification",
            "Children & teens BMI",
            "WHO standards",
            "Health risk assessment",
        ],
        color: "bg-blue-50 border-blue-200",
        textColor: "text-blue-900",
        badgeColor: "bg-blue-100 text-blue-800",
    },
    {
        title: "BMR Calculator",
        description:
            "Calculate your Basal Metabolic Rate and daily calorie needs based on activity levels using the Mifflin-St Jeor Equation.",
        href: "/tools/bmr-calculator",
        icon: Activity,
        features: [
            "Mifflin-St Jeor formula",
            "Activity level multipliers",
            "Daily calorie needs",
            "Gender-specific calculations",
        ],
        color: "bg-green-50 border-green-200",
        textColor: "text-green-900",
        badgeColor: "bg-green-100 text-green-800",
    },
    {
        title: "Ideal Weight Calculator",
        description:
            "Calculate your ideal body weight using multiple established formulas and methods.",
        href: "/tools/ideal-weight-calculator",
        icon: Target,
        features: [
            "Multiple formulas",
            "Height-based calculation",
            "Frame size consideration",
            "Personalized ranges",
        ],
        color: "bg-purple-50 border-purple-200",
        textColor: "text-purple-900",
        badgeColor: "bg-purple-100 text-purple-800",
    },
    {
        title: "WHR Calculator",
        description:
            "Calculate your Waist-to-Hip Ratio to assess body fat distribution and cardiovascular risk.",
        href: "/tools/whr-calculator",
        icon: Ruler,
        features: [
            "Cardiovascular risk assessment",
            "Gender-specific ranges",
            "WHO standards",
            "Body fat distribution",
        ],
        color: "bg-orange-50 border-orange-200",
        textColor: "text-orange-900",
        badgeColor: "bg-orange-100 text-orange-800",
    },
];

export default function ToolsPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-xl md:text-3xl font-bold text-gray-900">
                        Health & Fitness Tools
                    </h1>
                    <CopyUrlButton showEncouragement={true} />
                </div>
                <p className="text-gray-600 text-sm md:text-base">
                    Access our comprehensive collection of health and fitness
                    calculators. All calculations are performed locally and your
                    data is never stored or transmitted.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tools.map((tool, index) => {
                    const IconComponent = tool.icon;
                    return (
                        <Link href={tool.href} key={index} className="block">
                            <Card className="border-purple-100 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-gradient-to-br from-[#5E4AE3] to-[#7C3AED]">
                                            <IconComponent className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-semibold text-gray-900">
                                                {tool.title}
                                            </CardTitle>
                                            <Badge
                                                variant="outline"
                                                className="mt-1 text-xs"
                                            >
                                                Free Tool
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 text-sm mb-4">
                                        {tool.description}
                                    </p>
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                            Features:
                                        </h4>
                                        <ul className="space-y-1">
                                            {tool.features.map(
                                                (feature, featureIndex) => (
                                                    <li
                                                        key={featureIndex}
                                                        className="text-xs text-gray-600 flex items-center gap-2"
                                                    >
                                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                        {feature}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {/* Information Section */}
            <div className="mt-12">
                <Card className="border-purple-100 bg-gray-50">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                            About Our Tools
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Calculator className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">
                                    Accurate Calculations
                                </h3>
                                <p className="text-sm text-gray-600">
                                    All tools use scientifically validated
                                    formulas and WHO standards for reliable
                                    results.
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Activity className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">
                                    Privacy First
                                </h3>
                                <p className="text-sm text-gray-600">
                                    All calculations happen locally in your
                                    browser. We never store or transmit your
                                    personal data.
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Target className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">
                                    Comprehensive
                                </h3>
                                <p className="text-sm text-gray-600">
                                    From basic BMI to advanced metabolic
                                    calculations, we cover all your health
                                    assessment needs.
                                </p>
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
        title: "Health & Fitness Tools | FitDose",
        description:
            "Access our comprehensive collection of health and fitness calculators including BMI, BMR, Ideal Weight, and WHR calculators.",
    };
}
