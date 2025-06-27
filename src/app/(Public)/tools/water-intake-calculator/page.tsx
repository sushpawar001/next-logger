import React from "react";
import WaterIntakeCalculator from "@/components/WaterIntakeCalculator";
import CopyUrlButton from "@/components/CopyUrlButton";

export const dynamic = "force-static";

export default function WaterIntakePage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-4 md:mb-8">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-xl md:text-3xl font-bold text-gray-900">
                        Daily Water Intake Calculator
                    </h1>
                    <CopyUrlButton showEncouragement={true} />
                </div>
                <p className="text-gray-600 text-sm md:text-base">
                    Calculate your optimal daily water intake based on your age,
                    gender, weight, height, and activity level. All calculations
                    are performed locally and your data is never stored or
                    transmitted.
                </p>
            </div>
            <WaterIntakeCalculator />
        </div>
    );
}

export async function generateMetadata() {
    return {
        title: "Daily Water Intake Calculator | FitDose",
        description:
            "Calculate your optimal daily water intake based on your personal factors and activity level.",
    };
}
