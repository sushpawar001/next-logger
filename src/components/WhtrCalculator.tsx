"use client";
import { useQueryStates } from "nuqs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CalculatorLayout from "@/components/tools/CalculatorLayout";
import { ChoiceGroup, NumberField } from "@/components/tools/fields";
import ToolCta from "@/components/tools/ToolCta";
import PrivacyNotice from "./PrivacyNotice";
import {
    classifyWhtr,
    healthyWaistLimit,
    waistToHeight,
    type WhtrCategory,
} from "@/lib/calculators/whtr";
import { whtrParams } from "@/lib/tools/params";

const CATEGORY_STYLE: Record<WhtrCategory, string> = {
    low: "bg-yellow-50 text-yellow-700 border-yellow-200",
    healthy: "bg-green-50 text-green-700 border-green-200",
    increased: "bg-yellow-50 text-yellow-700 border-yellow-200",
    high: "bg-red-50 text-red-700 border-red-200",
};

export default function WhtrCalculator() {
    const [params, setParams] = useQueryStates(whtrParams);
    const { units, waist, height } = params;
    const unit = units === "metric" ? "cm" : "in";

    const heightValue = parseFloat(height);
    const ratio =
        waist && height ? waistToHeight(parseFloat(waist), heightValue) : null;
    const band = ratio === null ? null : classifyWhtr(ratio);
    const hint =
        waist && height && ratio === null
            ? "Check the measurements: waist and height must use the same unit."
            : undefined;

    const form = (
        <Card className="border border-border shadow-md">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                    Your measurements
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <ChoiceGroup
                    name="units"
                    label="Units"
                    value={units}
                    options={[
                        { value: "metric", label: "Centimetres" },
                        { value: "imperial", label: "Inches" },
                    ]}
                    onChange={(next) => setParams({ units: next })}
                />
                <NumberField
                    id="waist"
                    label="Waist"
                    value={waist}
                    onChange={(next) => setParams({ waist: next })}
                    unit={unit}
                    placeholder={unit === "cm" ? "e.g. 84" : "e.g. 33"}
                    hint={hint}
                />
                <NumberField
                    id="height"
                    label="Height"
                    value={height}
                    onChange={(next) => setParams({ height: next })}
                    unit={unit}
                    placeholder={unit === "cm" ? "e.g. 172" : "e.g. 68"}
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setParams({ waist: null, height: null })}
                >
                    Clear
                </Button>
            </CardContent>
        </Card>
    );

    const result = ratio !== null && band && (
        <Card className="border border-border shadow-md">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                    Your results
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-lg bg-accent/40 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                        Waist-to-height ratio
                    </p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                        {ratio.toFixed(2)}
                    </p>
                </div>
                <div>
                    <Badge variant="outline" className={CATEGORY_STYLE[band.category]}>
                        {band.label}
                    </Badge>
                </div>
                <p className="text-sm text-gray-700">
                    To keep your ratio below 0.5, aim for a waist under{" "}
                    <strong>
                        {healthyWaistLimit(heightValue).toFixed(1)} {unit}
                    </strong>
                    .
                </p>
                <ToolCta slug="waist-to-height-ratio-calculator" />
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <PrivacyNotice />
            <CalculatorLayout
                form={form}
                result={result || null}
                emptyMessage="Enter your waist and height to see your waist-to-height ratio."
            />
        </div>
    );
}
