"use client";
import { useQueryStates } from "nuqs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CalculatorLayout from "@/components/tools/CalculatorLayout";
import DosingGate from "@/components/tools/DosingGate";
import { ChoiceGroup, NumberField } from "@/components/tools/fields";
import ToolCta from "@/components/tools/ToolCta";
import PrivacyNotice from "./PrivacyNotice";
import {
    bolusDose,
    carbRatio,
    correctionFactor,
    TDD_BOUNDS,
    type InsulinKind,
} from "@/lib/calculators/insulinDosing";
import { GLUCOSE_UNIT_LABEL, roundTo } from "@/lib/units/glucose";
import {
    bolusParams,
    carbRatioParams,
    correctionFactorParams,
    GLUCOSE_UNIT_OPTIONS,
} from "@/lib/tools/params";

const INSULIN_OPTIONS: readonly { value: InsulinKind; label: string }[] = [
    { value: "rapid", label: "Rapid-acting (e.g. lispro, aspart)" },
    { value: "regular", label: "Regular / short-acting" },
];

const tddHint = (tdd: string, valid: boolean) =>
    tdd !== "" && !valid
        ? `Enter a total daily dose between ${TDD_BOUNDS.min} and ${TDD_BOUNDS.max} units.`
        : undefined;

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
    return (
        <div className="rounded-lg bg-accent/40 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                {label}
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
            {sub && <p className="text-sm text-gray-600">{sub}</p>}
        </div>
    );
}

function TddFields({
    tdd,
    insulin,
    valid,
    onChange,
}: {
    tdd: string;
    insulin: InsulinKind;
    valid: boolean;
    onChange: (next: { tdd?: string | null; insulin?: InsulinKind }) => void;
}) {
    return (
        <Card className="border border-border shadow-md">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                    Your insulin
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <NumberField
                    id="tdd"
                    label="Total daily insulin dose (basal + all boluses)"
                    value={tdd}
                    onChange={(next) => onChange({ tdd: next })}
                    unit="units"
                    placeholder="e.g. 40"
                    hint={tddHint(tdd, valid)}
                />
                <ChoiceGroup
                    name="insulin"
                    label="Mealtime insulin type"
                    value={insulin}
                    layout="column"
                    options={INSULIN_OPTIONS}
                    onChange={(next) => onChange({ insulin: next })}
                />
                <Button type="button" variant="outline" onClick={() => onChange({ tdd: null })}>
                    Clear
                </Button>
            </CardContent>
        </Card>
    );
}

export function CorrectionFactorCalculator() {
    const [{ tdd, insulin }, setParams] = useQueryStates(correctionFactorParams);
    const cf = tdd ? correctionFactor(parseFloat(tdd), insulin) : null;

    const result = cf && (
        <Card className="border border-border shadow-md">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                    Estimated correction factor
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <Stat label="mg/dL per unit" value={roundTo(cf.mgdl).toString()} />
                    <Stat label="mmol/L per unit" value={roundTo(cf.mmol, 1).toFixed(1)} />
                </div>
                <p className="text-sm text-gray-700">
                    By the {cf.rule} rule, one unit of {insulin === "rapid" ? "rapid-acting" : "regular"}{" "}
                    insulin would lower blood glucose by about{" "}
                    <strong>{roundTo(cf.mgdl)} mg/dL ({roundTo(cf.mmol, 1).toFixed(1)} mmol/L)</strong>.
                </p>
                <p className="text-xs text-gray-500">
                    A starting estimate only. Your care team adjusts it using
                    your own readings.
                </p>
                <ToolCta slug="insulin-sensitivity-factor-calculator" />
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <PrivacyNotice />
            <DosingGate>
                <CalculatorLayout
                    form={
                        <TddFields
                            tdd={tdd}
                            insulin={insulin}
                            valid={cf !== null}
                            onChange={setParams}
                        />
                    }
                    result={result || null}
                    emptyMessage="Enter your total daily insulin dose to estimate your correction factor."
                />
            </DosingGate>
        </div>
    );
}

export function CarbRatioCalculator() {
    const [{ tdd, insulin }, setParams] = useQueryStates(carbRatioParams);
    const icr = tdd ? carbRatio(parseFloat(tdd), insulin) : null;

    const result = icr && (
        <Card className="border border-border shadow-md">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                    Estimated insulin-to-carb ratio
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Stat
                    label="Ratio"
                    value={`1 : ${roundTo(icr.grams)}`}
                    sub={`1 unit for about ${roundTo(icr.grams)} g of carbohydrate`}
                />
                <p className="text-sm text-gray-700">
                    By the {icr.rule} rule, one unit of{" "}
                    {insulin === "rapid" ? "rapid-acting" : "regular"} insulin
                    would cover about <strong>{roundTo(icr.grams, 1)} g</strong>{" "}
                    of carbohydrate.
                </p>
                <p className="text-xs text-gray-500">
                    Ratios often differ between breakfast, lunch and dinner.
                    Your care team fine-tunes them from your readings.
                </p>
                <ToolCta slug="insulin-to-carb-ratio-calculator" />
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <PrivacyNotice />
            <DosingGate>
                <CalculatorLayout
                    form={
                        <TddFields
                            tdd={tdd}
                            insulin={insulin}
                            valid={icr !== null}
                            onChange={setParams}
                        />
                    }
                    result={result || null}
                    emptyMessage="Enter your total daily insulin dose to estimate your insulin-to-carb ratio."
                />
            </DosingGate>
        </div>
    );
}

export function BolusCalculator() {
    const [params, setParams] = useQueryStates(bolusParams);
    const { unit, carbs, ratio, glucose, target, sensitivity, onBoard } = params;
    const label = GLUCOSE_UNIT_LABEL[unit];
    const filled = carbs !== "" && ratio && glucose && target && sensitivity;

    const dose = filled
        ? bolusDose({
              carbs: parseFloat(carbs),
              carbRatio: parseFloat(ratio),
              glucose: parseFloat(glucose),
              target: parseFloat(target),
              sensitivity: parseFloat(sensitivity),
              onBoard: onBoard ? parseFloat(onBoard) : 0,
              unit,
          })
        : null;
    const units = (n: number) => `${roundTo(n, 1).toFixed(1)} units`;

    const form = (
        <Card className="border border-border shadow-md">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                    Your settings and meal
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <ChoiceGroup
                    name="unit"
                    label="Glucose unit"
                    value={unit}
                    options={GLUCOSE_UNIT_OPTIONS}
                    onChange={(next) => setParams({ unit: next })}
                />
                <NumberField
                    id="carbs"
                    label="Carbohydrate in the meal"
                    value={carbs}
                    onChange={(next) => setParams({ carbs: next })}
                    unit="g"
                    placeholder="e.g. 60"
                />
                <NumberField
                    id="ratio"
                    label="Insulin-to-carb ratio (grams per unit)"
                    value={ratio}
                    onChange={(next) => setParams({ ratio: next })}
                    unit="g"
                    placeholder="e.g. 10"
                />
                <NumberField
                    id="glucose"
                    label="Current blood glucose"
                    value={glucose}
                    onChange={(next) => setParams({ glucose: next })}
                    unit={label}
                    placeholder={unit === "mgdl" ? "e.g. 180" : "e.g. 10.0"}
                />
                <NumberField
                    id="target"
                    label="Target blood glucose"
                    value={target}
                    onChange={(next) => setParams({ target: next })}
                    unit={label}
                    placeholder={unit === "mgdl" ? "e.g. 120" : "e.g. 6.5"}
                />
                <NumberField
                    id="sensitivity"
                    label="Correction factor (drop per unit)"
                    value={sensitivity}
                    onChange={(next) => setParams({ sensitivity: next })}
                    unit={label}
                    placeholder={unit === "mgdl" ? "e.g. 45" : "e.g. 2.5"}
                />
                <NumberField
                    id="onBoard"
                    label="Insulin on board (optional)"
                    value={onBoard}
                    onChange={(next) => setParams({ onBoard: next })}
                    unit="units"
                    placeholder="e.g. 1.5"
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                        setParams({ carbs: null, glucose: null, onBoard: null })
                    }
                >
                    Clear meal
                </Button>
            </CardContent>
        </Card>
    );

    let result = null;
    if (dose?.status === "low") {
        result = (
            <Card className="border-2 border-red-300 bg-red-50 shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-red-900">
                        Your blood sugar is low
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-red-900">
                    <p>
                        This reading is below 70 mg/dL (3.9 mmol/L), so no
                        insulin dose is shown. Treat the low first.
                    </p>
                    <p>
                        The ADA&apos;s 15-15 rule: have 15 g of fast-acting
                        carbohydrate, wait 15 minutes and recheck. Repeat if you
                        are still below 70 mg/dL, and follow your care plan.
                    </p>
                </CardContent>
            </Card>
        );
    } else if (dose?.status === "ok") {
        result = (
            <Card className="border border-border shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                        Estimated mealtime dose
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Stat label="Total" value={units(dose.total)} />
                    <table className="w-full text-sm">
                        <tbody>
                            <tr className="border-b border-border">
                                <th scope="row" className="py-1.5 text-left font-normal text-gray-700">
                                    Meal dose ({carbs} g ÷ {ratio})
                                </th>
                                <td className="py-1.5 text-right font-semibold">{units(dose.meal)}</td>
                            </tr>
                            <tr className="border-b border-border">
                                <th scope="row" className="py-1.5 text-left font-normal text-gray-700">
                                    Correction ({glucose} − {target}) ÷ {sensitivity}
                                </th>
                                <td className="py-1.5 text-right font-semibold">{units(dose.correction)}</td>
                            </tr>
                            {dose.onBoardUsed > 0 && (
                                <tr>
                                    <th scope="row" className="py-1.5 text-left font-normal text-gray-700">
                                        Minus insulin on board
                                    </th>
                                    <td className="py-1.5 text-right font-semibold">
                                        −{units(dose.onBoardUsed)}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <p className="text-xs text-gray-500">
                        Pens and syringes usually dose in half or whole units.
                        Check any dose against the plan your care team gave you.
                    </p>
                    <ToolCta slug="bolus-calculator" />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <PrivacyNotice />
            <DosingGate>
                <CalculatorLayout
                    form={form}
                    result={result}
                    emptyMessage="Enter your meal, reading and settings to see the estimated dose."
                />
            </DosingGate>
        </div>
    );
}
