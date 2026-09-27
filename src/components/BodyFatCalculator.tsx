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
    classifyBodyFat,
    fatAndLeanMass,
    navyBodyFat,
    type BodyFatCategory,
} from "@/lib/calculators/bodyFat";
import { inToCm, kgToLb, lbToKg } from "@/lib/units/body";
import { bodyFatParams } from "@/lib/tools/params";

const CATEGORY_STYLE: Record<BodyFatCategory, string> = {
    belowEssential: "bg-red-50 text-red-700 border-red-200",
    essential: "bg-yellow-50 text-yellow-700 border-yellow-200",
    athletes: "bg-green-50 text-green-700 border-green-200",
    fitness: "bg-green-50 text-green-700 border-green-200",
    average: "bg-blue-50 text-blue-700 border-blue-200",
    obese: "bg-red-50 text-red-700 border-red-200",
};

export default function BodyFatCalculator() {
    const [params, setParams] = useQueryStates(bodyFatParams);
    const { gender, units, height, neck, waist, hip, weight } = params;
    const metric = units === "metric";
    const toCm = (v: string) =>
        metric ? parseFloat(v) : inToCm(parseFloat(v));

    const complete = Boolean(
        height && neck && waist && (gender === "male" || hip)
    );
    const pct = complete
        ? navyBodyFat({
              sex: gender,
              heightCm: toCm(height),
              neckCm: toCm(neck),
              waistCm: toCm(waist),
              hipCm: hip ? toCm(hip) : undefined,
          })
        : null;
    const band = pct === null ? null : classifyBodyFat(pct, gender);
    const weightKg = weight
        ? metric
            ? parseFloat(weight)
            : lbToKg(parseFloat(weight))
        : NaN;
    const mass =
        pct !== null && Number.isFinite(weightKg) && weightKg > 0
            ? fatAndLeanMass(pct, weightKg)
            : null;

    const hint =
        complete && pct === null
            ? "These measurements don't give a plausible result. Check that your waist is larger than your neck and the units are right."
            : undefined;

    const lengthUnit = metric ? "cm" : "in";
    const massLabel = (kg: number) =>
        metric
            ? `${kg.toFixed(1)} kg`
            : `${kgToLb(kg).toFixed(1)} lb`;

    const form = (
        <Card className="border border-border shadow-md">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                    Your measurements
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <ChoiceGroup
                    name="gender"
                    label="Sex"
                    value={gender}
                    options={[
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                    ]}
                    onChange={(next) => setParams({ gender: next })}
                />
                <ChoiceGroup
                    name="units"
                    label="Units"
                    value={units}
                    options={[
                        { value: "metric", label: "Centimetres / kg" },
                        { value: "imperial", label: "Inches / lb" },
                    ]}
                    onChange={(next) => setParams({ units: next })}
                />
                <NumberField
                    id="height"
                    label="Height"
                    value={height}
                    onChange={(next) => setParams({ height: next })}
                    unit={lengthUnit}
                    placeholder={metric ? "e.g. 175" : "e.g. 69"}
                />
                <NumberField
                    id="neck"
                    label="Neck"
                    value={neck}
                    onChange={(next) => setParams({ neck: next })}
                    unit={lengthUnit}
                    placeholder={metric ? "e.g. 38" : "e.g. 15"}
                />
                <NumberField
                    id="waist"
                    label="Waist"
                    value={waist}
                    onChange={(next) => setParams({ waist: next })}
                    unit={lengthUnit}
                    placeholder={metric ? "e.g. 85" : "e.g. 33.5"}
                    hint={hint}
                />
                {gender === "female" && (
                    <NumberField
                        id="hip"
                        label="Hips"
                        value={hip}
                        onChange={(next) => setParams({ hip: next })}
                        unit={lengthUnit}
                        placeholder={metric ? "e.g. 100" : "e.g. 39"}
                    />
                )}
                <NumberField
                    id="weight"
                    label="Weight (optional, for fat and lean mass)"
                    value={weight}
                    onChange={(next) => setParams({ weight: next })}
                    unit={metric ? "kg" : "lb"}
                    placeholder={metric ? "e.g. 78" : "e.g. 172"}
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                        setParams({
                            height: null,
                            neck: null,
                            waist: null,
                            hip: null,
                            weight: null,
                        })
                    }
                >
                    Clear
                </Button>
            </CardContent>
        </Card>
    );

    const result = pct !== null && band && (
        <Card className="border border-border shadow-md">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                    Your results
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-lg bg-accent/40 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                        Estimated body fat
                    </p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                        {pct.toFixed(1)}%
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge
                        variant="outline"
                        className={CATEGORY_STYLE[band.category]}
                    >
                        {band.label}
                    </Badge>
                    <span className="text-sm text-gray-600">
                        {band.range} for {gender === "male" ? "men" : "women"}
                    </span>
                </div>
                {mass && (
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-lg border border-border p-3">
                            <dt className="text-gray-600">Fat mass</dt>
                            <dd className="font-semibold text-gray-900">
                                {massLabel(mass.fatKg)}
                            </dd>
                        </div>
                        <div className="rounded-lg border border-border p-3">
                            <dt className="text-gray-600">Lean mass</dt>
                            <dd className="font-semibold text-gray-900">
                                {massLabel(mass.leanKg)}
                            </dd>
                        </div>
                    </dl>
                )}
                <p className="text-xs text-gray-500">
                    Tape-based estimates are typically within a few percentage
                    points of lab methods such as DEXA.
                </p>
                <ToolCta slug="body-fat-calculator" />
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <PrivacyNotice />
            <CalculatorLayout
                form={form}
                result={result || null}
                emptyMessage="Enter your height, neck and waist (and hips for women) to estimate your body fat."
            />
        </div>
    );
}
