"use client";
import { useQueryStates } from "nuqs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CalculatorLayout from "@/components/tools/CalculatorLayout";
import { ChoiceGroup, NumberField } from "@/components/tools/fields";
import ToolCta from "@/components/tools/ToolCta";
import PrivacyNotice from "./PrivacyNotice";
import {
    estimateOneRepMax,
    MAX_REPS,
    RELIABLE_REPS,
    trainingLoads,
} from "@/lib/calculators/oneRepMax";
import { oneRepMaxParams } from "@/lib/tools/params";

export default function OneRepMaxCalculator() {
    const [params, setParams] = useQueryStates(oneRepMaxParams);
    const { unit, weight, reps } = params;

    const result =
        weight && reps ? estimateOneRepMax(parseFloat(weight), Number(reps)) : null;
    const hint =
        weight && reps && !result
            ? `Enter a weight above zero and a whole number of reps from 1 to ${MAX_REPS}.`
            : undefined;
    const fmt = (value: number) => `${value.toFixed(1)} ${unit}`;

    const form = (
        <Card className="border border-border shadow-md">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                    Your set
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <ChoiceGroup
                    name="unit"
                    label="Unit"
                    value={unit}
                    options={[
                        { value: "kg", label: "Kilograms" },
                        { value: "lb", label: "Pounds" },
                    ]}
                    onChange={(next) => setParams({ unit: next })}
                />
                <NumberField
                    id="weight"
                    label="Weight lifted"
                    value={weight}
                    onChange={(next) => setParams({ weight: next })}
                    unit={unit}
                    placeholder={unit === "kg" ? "e.g. 100" : "e.g. 225"}
                />
                <NumberField
                    id="reps"
                    label="Reps completed"
                    value={reps}
                    onChange={(next) => setParams({ reps: next })}
                    placeholder="e.g. 5"
                    min={1}
                    max={MAX_REPS}
                    step={1}
                    hint={hint}
                />
                <p className="text-xs text-gray-500">
                    Use a set taken close to failure with good form. Sets of{" "}
                    {RELIABLE_REPS} reps or fewer give the best estimate.
                </p>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setParams({ weight: null, reps: null })}
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
                    Estimated one rep max
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-lg bg-accent/40 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                        1RM (average)
                    </p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                        {fmt(result.average)}
                    </p>
                </div>
                {!result.reliable && (
                    <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                        Estimates from more than {RELIABLE_REPS} reps are less
                        reliable. A heavier set of 3 to 6 reps gives a better
                        figure.
                    </p>
                )}
                <table className="w-full text-sm">
                    <caption className="sr-only">Estimate by formula</caption>
                    <tbody>
                        {(
                            [
                                ["Epley", result.epley],
                                ["Brzycki", result.brzycki],
                                ["Lombardi", result.lombardi],
                            ] as const
                        ).map(([name, value]) => (
                            <tr key={name} className="border-b border-border last:border-b-0">
                                <th scope="row" className="py-1.5 text-left font-normal text-gray-700">
                                    {name}
                                </th>
                                <td className="py-1.5 text-right font-semibold text-gray-900">
                                    {fmt(value)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div>
                    <p className="text-sm font-medium text-gray-900">
                        Training loads
                    </p>
                    <table className="mt-1 w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-600">
                                <th scope="col" className="py-1 font-medium">% of 1RM</th>
                                <th scope="col" className="py-1 font-medium">Load</th>
                                <th scope="col" className="py-1 text-right font-medium">Typical reps</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trainingLoads(result.average).map((row) => (
                                <tr key={row.percent} className="border-t border-border">
                                    <td className="py-1">{row.percent}%</td>
                                    <td className="py-1 font-semibold text-gray-900">{fmt(row.load)}</td>
                                    <td className="py-1 text-right">{row.reps}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <ToolCta slug="one-rep-max-calculator" />
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <PrivacyNotice />
            <CalculatorLayout
                form={form}
                result={resultCard || null}
                emptyMessage="Enter the weight you lifted and how many reps you did."
            />
        </div>
    );
}
