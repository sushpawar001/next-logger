"use client";
import { useState } from "react";
import { useQueryStates } from "nuqs";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CalculatorLayout from "@/components/tools/CalculatorLayout";
import { ChoiceGroup, NumberField } from "@/components/tools/fields";
import ToolCta from "@/components/tools/ToolCta";
import PrivacyNotice from "./PrivacyNotice";
import {
    parseDateInput,
    weightLossProgress,
} from "@/lib/calculators/weightLoss";
import { weightLossParams } from "@/lib/tools/params";

// A projected goal date is a calendar day; show it without a time.
const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "long" });

export default function WeightLossCalculator() {
    const [params, setParams] = useQueryStates(weightLossParams);
    const { unit, start, current, goal, startDate } = params;
    // Fixed for the lifetime of the page so the result doesn't shift.
    const [today] = useState(() => new Date());

    const result =
        start && current
            ? weightLossProgress({
                  start: parseFloat(start),
                  current: parseFloat(current),
                  goal: goal ? parseFloat(goal) : NaN,
                  startDate: parseDateInput(startDate),
                  today,
              })
            : null;
    const fmt = (value: number) => `${value.toFixed(1)} ${unit}`;

    const form = (
        <Card className="border border-border shadow-md">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                    Your weights
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
                    id="start"
                    label="Starting weight"
                    value={start}
                    onChange={(next) => setParams({ start: next })}
                    unit={unit}
                    placeholder={unit === "kg" ? "e.g. 92" : "e.g. 203"}
                />
                <NumberField
                    id="current"
                    label="Current weight"
                    value={current}
                    onChange={(next) => setParams({ current: next })}
                    unit={unit}
                    placeholder={unit === "kg" ? "e.g. 86.5" : "e.g. 191"}
                />
                <NumberField
                    id="goal"
                    label="Goal weight (optional)"
                    value={goal}
                    onChange={(next) => setParams({ goal: next })}
                    unit={unit}
                    placeholder={unit === "kg" ? "e.g. 78" : "e.g. 172"}
                />
                <div className="space-y-2">
                    <Label
                        htmlFor="start-date"
                        className="block text-sm leading-6 font-medium text-gray-700"
                    >
                        Start date (optional, for your weekly rate)
                    </Label>
                    <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setParams({ startDate: e.target.value })}
                        className="border border-border focus:border-primary focus:ring-ring focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                        setParams({ start: null, current: null, goal: null, startDate: null })
                    }
                >
                    Clear
                </Button>
            </CardContent>
        </Card>
    );

    const lost = result && result.change >= 0;
    const resultCard = result && (
        <Card className="border border-border shadow-md">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                    Your progress
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-accent/40 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                            {lost ? "Lost" : "Gained"}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">
                            {Math.abs(result.percentLost).toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-600">
                            {fmt(Math.abs(result.change))}
                        </p>
                    </div>
                    {result.goalProgress !== null && (
                        <div className="rounded-lg bg-accent/40 p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                                Towards goal
                            </p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {Math.max(0, result.goalProgress).toFixed(0)}%
                            </p>
                            <p className="text-sm text-gray-600">
                                {fmt(result.remaining!)} to go
                            </p>
                        </div>
                    )}
                </div>
                {result.weeklyRate !== null && (
                    <p className="text-sm text-gray-700">
                        Average over {result.weeks!.toFixed(1)} weeks:{" "}
                        <strong>
                            {fmt(Math.abs(result.weeklyRate))}{" "}
                            {result.weeklyRate >= 0 ? "lost" : "gained"} a week
                        </strong>
                        .
                        {result.projectedGoalDate && (
                            <>
                                {" "}At that rate you would reach your goal around{" "}
                                <strong>{dateFormat.format(result.projectedGoalDate)}</strong>.
                            </>
                        )}
                    </p>
                )}
                <ul className="space-y-1 text-sm">
                    {result.milestones.map((m) => (
                        <li key={m.percent} className="flex items-center gap-2 text-gray-700">
                            {m.reached ? (
                                <Check className="h-4 w-4 text-green-600" aria-label="Reached" />
                            ) : (
                                <span className="inline-block h-4 w-4 rounded-full border border-gray-300" aria-label="Not yet" />
                            )}
                            {m.percent}% milestone: {fmt(m.weight)}
                        </li>
                    ))}
                </ul>
                <ToolCta slug="weight-loss-percentage-calculator" />
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <PrivacyNotice />
            <CalculatorLayout
                form={form}
                result={resultCard || null}
                emptyMessage="Enter your starting and current weight to see your progress."
            />
        </div>
    );
}
