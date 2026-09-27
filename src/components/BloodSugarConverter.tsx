"use client";
import { useMemo } from "react";
import { useQueryStates } from "nuqs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CalculatorLayout from "@/components/tools/CalculatorLayout";
import { ChoiceGroup, NumberField } from "@/components/tools/fields";
import ToolCta from "@/components/tools/ToolCta";
import PrivacyNotice from "./PrivacyNotice";
import {
    classifyGlucose,
    convertGlucose,
    type BandTone,
    type GlucoseContext,
} from "@/lib/calculators/bloodSugar";
import { GLUCOSE_UNIT_LABEL } from "@/lib/units/glucose";
import { bloodSugarParams, GLUCOSE_UNIT_OPTIONS } from "@/lib/tools/params";

const TONE_STYLE: Record<BandTone, string> = {
    green: "bg-green-50 text-green-700 border-green-200",
    amber: "bg-yellow-50 text-yellow-700 border-yellow-200",
    red: "bg-red-50 text-red-700 border-red-200",
};

const CONTEXT_OPTIONS: readonly { value: GlucoseContext; label: string }[] = [
    { value: "random", label: "Any time" },
    { value: "fasting", label: "Fasting" },
    { value: "postMeal", label: "2 hours after eating" },
];

export default function BloodSugarConverter() {
    const [params, setParams] = useQueryStates(bloodSugarParams);
    const { value, unit, context } = params;

    const converted = useMemo(
        () => (value === "" ? null : convertGlucose(parseFloat(value), unit)),
        [value, unit]
    );
    const band = converted
        ? classifyGlucose(converted.exactMgdl, context)
        : null;
    const hint =
        value !== "" && !converted
            ? unit === "mgdl"
                ? "Enter a reading between 10 and 1000 mg/dL."
                : "Enter a reading between 0.6 and 55.5 mmol/L."
            : undefined;

    const form = (
        <Card className="border border-border shadow-md">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                    Your reading
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <ChoiceGroup
                    name="unit"
                    label="Convert from"
                    value={unit}
                    options={GLUCOSE_UNIT_OPTIONS}
                    onChange={(next) => setParams({ unit: next })}
                />
                <NumberField
                    id="glucose-value"
                    label="Blood glucose"
                    value={value}
                    onChange={(next) => setParams({ value: next })}
                    unit={GLUCOSE_UNIT_LABEL[unit]}
                    placeholder={unit === "mgdl" ? "e.g. 126" : "e.g. 7.0"}
                    hint={hint}
                />
                <ChoiceGroup
                    name="context"
                    label="When was it taken?"
                    value={context}
                    options={CONTEXT_OPTIONS}
                    onChange={(next) => setParams({ context: next })}
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setParams({ value: null, context: null })}
                >
                    Clear
                </Button>
            </CardContent>
        </Card>
    );

    const result = converted && band && (
        <Card className="border border-border shadow-md">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                    Converted
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-accent/40 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                            mg/dL
                        </p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">
                            {converted.mgdl}
                        </p>
                    </div>
                    <div className="rounded-lg bg-accent/40 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                            mmol/L
                        </p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">
                            {converted.mmol.toFixed(1)}
                        </p>
                    </div>
                </div>
                <div>
                    <Badge variant="outline" className={TONE_STYLE[band.tone]}>
                        {band.label}
                    </Badge>
                </div>
                {(band.band === "hypoL1" || band.band === "hypoL2") && (
                    <p className="text-sm text-red-700">
                        This is low. If you have symptoms or use insulin or
                        sulfonylureas, treat it as your care team has advised.
                    </p>
                )}
                <ToolCta slug="blood-sugar-converter" />
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <PrivacyNotice />
            <CalculatorLayout
                form={form}
                result={result || null}
                emptyMessage="Enter a blood glucose reading to convert it."
            />
        </div>
    );
}
