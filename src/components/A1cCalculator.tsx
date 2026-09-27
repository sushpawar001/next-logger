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
    A1C_CATEGORIES,
    resolveA1c,
    type A1cCategory,
    type A1cResult,
} from "@/lib/calculators/a1c";
import { GLUCOSE_UNIT_LABEL } from "@/lib/units/glucose";
import { a1cParams, GLUCOSE_UNIT_OPTIONS } from "@/lib/tools/params";

const CATEGORY_STYLE: Record<A1cCategory, string> = {
    normal: "bg-green-50 text-green-700 border-green-200",
    prediabetes: "bg-yellow-50 text-yellow-700 border-yellow-200",
    diabetes: "bg-red-50 text-red-700 border-red-200",
};

function A1cResultCard({ result }: { result: A1cResult }) {
    const category = A1C_CATEGORIES[result.category];
    return (
        <Card className="border border-border shadow-md">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                    Your results
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-accent/40 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                            A1c
                        </p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">
                            {result.pct.toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-600">
                            {result.mmolMol} mmol/mol
                        </p>
                    </div>
                    <div className="rounded-lg bg-accent/40 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                            Average glucose
                        </p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">
                            {result.eagMgdl} mg/dL
                        </p>
                        <p className="text-sm text-gray-600">
                            {result.eagMmol.toFixed(1)} mmol/L
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge
                        variant="outline"
                        className={CATEGORY_STYLE[result.category]}
                    >
                        {category.label}
                    </Badge>
                    <span className="text-sm text-gray-600">
                        {category.range} (ADA diagnostic range)
                    </span>
                </div>
                <p className="text-xs text-gray-500">
                    Estimated average glucose (eAG) is a population estimate.
                    A single A1c above 6.5% needs a repeat test to confirm a
                    diagnosis.
                </p>
                <ToolCta slug="a1c-calculator" />
            </CardContent>
        </Card>
    );
}

export default function A1cCalculator() {
    const [params, setParams] = useQueryStates(a1cParams);
    const { mode, a1c, a1cUnit, glucose, unit } = params;
    const result = useMemo(
        () => resolveA1c({ mode, a1c, a1cUnit, glucose, unit }),
        [mode, a1c, a1cUnit, glucose, unit]
    );
    const entered = mode === "a1c" ? a1c : glucose;
    const hint =
        entered !== "" && !result
            ? mode === "a1c"
                ? a1cUnit === "pct"
                    ? "Enter an A1c between 3% and 20%."
                    : "Enter an A1c between 9 and 195 mmol/mol."
                : "Enter an average glucose that corresponds to an A1c between 3% and 20%."
            : undefined;

    const form = (
        <Card className="border border-border shadow-md">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                    Convert
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <ChoiceGroup
                    name="mode"
                    label="I know my"
                    value={mode}
                    options={[
                        { value: "a1c", label: "A1c result" },
                        { value: "eag", label: "Average glucose" },
                    ]}
                    onChange={(next) => setParams({ mode: next })}
                />
                {mode === "a1c" ? (
                    <>
                        <ChoiceGroup
                            name="a1cUnit"
                            label="A1c unit"
                            value={a1cUnit}
                            options={[
                                { value: "pct", label: "% (NGSP)" },
                                { value: "mmolmol", label: "mmol/mol (IFCC)" },
                            ]}
                            onChange={(next) => setParams({ a1cUnit: next })}
                        />
                        <NumberField
                            id="a1c"
                            label="A1c"
                            value={a1c}
                            onChange={(next) => setParams({ a1c: next })}
                            unit={a1cUnit === "pct" ? "%" : "mmol/mol"}
                            placeholder={a1cUnit === "pct" ? "e.g. 7.0" : "e.g. 53"}
                            hint={hint}
                        />
                    </>
                ) : (
                    <>
                        <ChoiceGroup
                            name="unit"
                            label="Glucose unit"
                            value={unit}
                            options={GLUCOSE_UNIT_OPTIONS}
                            onChange={(next) => setParams({ unit: next })}
                        />
                        <NumberField
                            id="glucose"
                            label="Average blood glucose"
                            value={glucose}
                            onChange={(next) => setParams({ glucose: next })}
                            unit={GLUCOSE_UNIT_LABEL[unit]}
                            placeholder={unit === "mgdl" ? "e.g. 154" : "e.g. 8.6"}
                            hint={hint}
                        />
                    </>
                )}
                <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                        setParams({ a1c: null, glucose: null, mode: null })
                    }
                >
                    Clear
                </Button>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <PrivacyNotice />
            <CalculatorLayout
                form={form}
                result={result ? <A1cResultCard result={result} /> : null}
                emptyMessage="Enter an A1c or an average glucose to see both conversions."
            />
        </div>
    );
}
