"use client";
import Link from "next/link";
import { createSerializer, useQueryStates } from "nuqs";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CalculatorLayout from "@/components/tools/CalculatorLayout";
import {
    BodyStatsFields,
    bodyStatsParams,
    useBodyStatsParams,
} from "@/components/tools/BodyStatsFields";
import { ChoiceGroup, NumberField } from "@/components/tools/fields";
import ToolCta from "@/components/tools/ToolCta";
import PrivacyNotice from "./PrivacyNotice";
import {
    ACTIVITY_FACTORS,
    ACTIVITY_LABELS,
    validateInputs,
} from "@/lib/calculators/bmr";
import {
    ACTIVITY_LEVELS,
    deficitPlan,
    deficitTable,
    energyNeeds,
    maintenancePlan,
    weeksToGoal,
    type EnergyResult,
    type Pace,
} from "@/lib/calculators/energy";
import { kgToLb, lbToKg } from "@/lib/units/body";
import { energyParams } from "@/lib/tools/params";
import type { FormData } from "@/lib/calculators/bmr";

export type EnergyVariant = "tdee" | "deficit" | "maintenance";

const SLUG: Record<EnergyVariant, string> = {
    tdee: "tdee-calculator",
    deficit: "calorie-deficit-calculator",
    maintenance: "maintenance-calorie-calculator",
};

const LINKS: { variant: EnergyVariant | "bmr"; label: string; href: string }[] = [
    { variant: "tdee", label: "TDEE", href: "/tools/tdee-calculator" },
    { variant: "deficit", label: "Calorie deficit", href: "/tools/calorie-deficit-calculator" },
    { variant: "maintenance", label: "Maintenance calories", href: "/tools/maintenance-calorie-calculator" },
    { variant: "bmr", label: "BMR", href: "/tools/bmr-calculator" },
];

// Carries the visitor's numbers to the sibling calculators, which read the
// same URL keys.
const serialize = createSerializer({ ...bodyStatsParams, ...energyParams });

const kcal = (value: number) => `${Math.round(value).toLocaleString("en-US")} kcal`;

const paceLabel = (pace: Pace) =>
    `${pace} kg (${kgToLb(pace).toFixed(1)} lb) a week`;

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

function Rows({ rows }: { rows: [string, string][] }) {
    return (
        <table className="w-full border-collapse text-sm">
            <tbody>
                {rows.map(([label, value]) => (
                    <tr key={label} className="border-b border-border last:border-b-0">
                        <th scope="row" className="py-2 pr-3 text-left font-normal text-gray-700">
                            {label}
                        </th>
                        <td className="py-2 text-right font-semibold text-gray-900">
                            {value}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function TdeeResult({ result, activity }: { result: EnergyResult; activity: keyof typeof ACTIVITY_LABELS }) {
    return (
        <>
            <div className="grid grid-cols-2 gap-3">
                <Stat label="TDEE" value={kcal(result.tdee)} sub="per day at your activity level" />
                <Stat label="BMR" value={kcal(result.bmr)} sub="per day at rest" />
            </div>
            <p className="text-sm text-gray-600">
                Activity: {ACTIVITY_LABELS[activity]}
            </p>
            <Rows
                rows={ACTIVITY_LEVELS.map((level) => [
                    ACTIVITY_LABELS[level],
                    kcal(energyNeedsFor(result.bmr, level)),
                ])}
            />
        </>
    );
}

// TDEE for another activity level from an already-computed BMR.
const energyNeedsFor = (bmr: number, level: keyof typeof ACTIVITY_FACTORS) =>
    bmr * ACTIVITY_FACTORS[level];

function DeficitResult({
    result,
    form,
    pace,
    goalWeight,
}: {
    result: EnergyResult;
    form: FormData;
    pace: Pace;
    goalWeight: string;
}) {
    const plan = deficitPlan(result.tdee, form.gender, pace);
    const toKg = (v: number) => (form.weightUnit === "kg" ? v : lbToKg(v));
    const weeks = goalWeight
        ? weeksToGoal(toKg(parseFloat(form.weight)), toKg(parseFloat(goalWeight)), pace)
        : null;

    return (
        <>
            <div className="grid grid-cols-2 gap-3">
                <Stat label="Eat about" value={kcal(plan.target)} sub={`per day to lose ${paceLabel(pace)}`} />
                <Stat label="Maintenance" value={kcal(result.tdee)} sub={`deficit of ${kcal(plan.dailyDeficit)}`} />
            </div>
            {plan.belowFloor && (
                <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    This is below {kcal(plan.floor)} a day, a common minimum
                    without medical supervision. Choose a slower pace, or be more
                    active to widen the gap instead.
                </p>
            )}
            {weeks !== null && (
                <p className="text-sm text-gray-700">
                    At this pace you would reach your goal weight in about{" "}
                    <strong>{weeks} weeks</strong>. Real progress slows as you
                    lose weight, so recalculate every few weeks.
                </p>
            )}
            <Rows
                rows={deficitTable(result.tdee, form.gender).map((row) => [
                    `Lose ${paceLabel(row.pace)}`,
                    kcal(row.target),
                ])}
            />
        </>
    );
}

function MaintenanceResult({ result }: { result: EnergyResult }) {
    const plan = maintenancePlan(result.tdee);
    return (
        <>
            <Stat
                label="Maintenance calories"
                value={`${Math.round(plan.low).toLocaleString("en-US")}–${kcal(plan.high)}`}
                sub="per day to keep your weight steady"
            />
            <Rows
                rows={[
                    ["Maintain weight", `${Math.round(plan.low).toLocaleString("en-US")}–${kcal(plan.high)}`],
                    ["Lean gain (+250)", kcal(plan.leanGain)],
                    ["Steady loss (−500)", kcal(plan.cut)],
                ]}
            />
        </>
    );
}

export default function EnergyCalculator({ variant }: { variant: EnergyVariant }) {
    const { formData, setField, clear } = useBodyStatsParams();
    const [energy, setEnergy] = useQueryStates(energyParams);
    const { activity, goalWeight } = energy;
    const pace = parseFloat(energy.pace) as Pace;

    const result = energyNeeds(formData, activity);
    const filled = Boolean(
        formData.age &&
            formData.weight &&
            (formData.heightUnit === "cm" ? formData.heightCm : formData.heightFeet)
    );
    const errors = filled && !result ? validateInputs(formData) : [];
    const query = serialize({ ...formData, ...energy });

    const form = (
        <Card className="border border-border shadow-md">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                    Enter your information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <BodyStatsFields formData={formData} onChange={setField} />
                <ChoiceGroup
                    name="activity"
                    label="Activity level"
                    value={activity}
                    layout="column"
                    options={ACTIVITY_LEVELS.map((level) => ({
                        value: level,
                        label: ACTIVITY_LABELS[level],
                    }))}
                    onChange={(next) => setEnergy({ activity: next })}
                />
                {variant === "deficit" && (
                    <>
                        <ChoiceGroup
                            name="pace"
                            label="How fast do you want to lose weight?"
                            value={energy.pace}
                            layout="column"
                            options={(["0.25", "0.5", "0.75", "1"] as const).map((p) => ({
                                value: p,
                                label: paceLabel(parseFloat(p) as Pace),
                            }))}
                            onChange={(next) => setEnergy({ pace: next })}
                        />
                        <NumberField
                            id="goal-weight"
                            label="Goal weight (optional)"
                            value={goalWeight}
                            onChange={(next) => setEnergy({ goalWeight: next })}
                            unit={formData.weightUnit === "kg" ? "kg" : "lbs"}
                        />
                    </>
                )}
                {errors.length > 0 && (
                    <ul className="space-y-1 text-sm text-red-600">
                        {errors.map((error) => (
                            <li key={error}>{error}</li>
                        ))}
                    </ul>
                )}
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        clear();
                        setEnergy({ goalWeight: null });
                    }}
                >
                    Clear
                </Button>
            </CardContent>
        </Card>
    );

    const resultCard = result && (
        <Card className="border border-border shadow-md">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                    Your results
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {variant === "tdee" && <TdeeResult result={result} activity={activity} />}
                {variant === "deficit" && (
                    <DeficitResult
                        result={result}
                        form={formData}
                        pace={pace}
                        goalWeight={goalWeight}
                    />
                )}
                {variant === "maintenance" && <MaintenanceResult result={result} />}
                <nav aria-label="Continue with these numbers" className="text-sm">
                    <p className="font-medium text-gray-700">
                        Continue with these numbers:
                    </p>
                    <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                        {LINKS.filter((link) => link.variant !== variant).map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={`${link.href}${query}`}
                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                >
                                    {link.label}
                                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <ToolCta slug={SLUG[variant]} />
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <PrivacyNotice />
            <CalculatorLayout
                form={form}
                result={resultCard || null}
                emptyMessage="Enter your age, height and weight to see your daily calorie needs."
            />
        </div>
    );
}
