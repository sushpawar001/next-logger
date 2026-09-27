import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Activity, Target } from "lucide-react";
import CopyUrlButton from "@/components/CopyUrlButton";
import { hubForCluster, TOOLS, toolsByCluster } from "@/lib/tools/registry";
import { buildIndexMetadata } from "@/lib/tools/metadata";
import { itemListLd } from "@/lib/tools/jsonLd";
import JsonLd from "@/components/tools/JsonLd";

export const dynamic = "force-static";

export const metadata = buildIndexMetadata();

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

            <div className="space-y-10">
                {toolsByCluster().map((cluster) => (
                    <section
                        key={cluster.id}
                        id={cluster.id}
                        aria-labelledby={`${cluster.id}-heading`}
                        className="scroll-mt-20"
                    >
                        <h2
                            id={`${cluster.id}-heading`}
                            className="text-lg md:text-xl font-semibold text-gray-900"
                        >
                            {cluster.label}
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">
                            {cluster.blurb}
                            {hubForCluster(cluster.id) && (
                                <>
                                    {" "}
                                    <Link
                                        href={hubForCluster(cluster.id)!.href}
                                        className="font-medium text-primary hover:underline"
                                    >
                                        Read the {cluster.label.toLowerCase()} guide
                                    </Link>
                                </>
                            )}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {cluster.tools.map((tool) => {
                                const IconComponent = tool.icon;
                                return (
                                    <Link
                                        href={tool.href}
                                        key={tool.slug}
                                        className="block"
                                    >
                                        <Card className="h-full border-border shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
                                            <CardHeader>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-primary">
                                                        <IconComponent className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {tool.title}
                                                        </h3>
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
                                                            (feature) => (
                                                                <li
                                                                    key={feature}
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
                    </section>
                ))}
            </div>

            {/* Information Section */}
            <div className="mt-12">
                <Card className="border-border bg-gray-50">
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
            <JsonLd data={itemListLd(TOOLS)} />
        </div>
    );
}
