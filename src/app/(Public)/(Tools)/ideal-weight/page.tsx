import React from "react";
import IdealWeightCalculator from "@/components/IdealWeightCalculator";

export const dynamic = "force-static";

export default function IdealWeightPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-4 md:mb-8">
                <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">
                    Ideal Body Weight Calculator
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                    Calculate your ideal body weight using multiple established
                    formulas. All calculations are performed locally and your
                    data is never stored or transmitted.
                </p>
            </div>
            <IdealWeightCalculator />
        </div>
    );
}
