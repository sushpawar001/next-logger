"use client";
import { useMemo } from "react";
import { useQueryStates } from "nuqs";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import CalculatorLayout from "@/components/tools/CalculatorLayout";
import { ChoiceGroup, NumberField } from "@/components/tools/fields";
import ToolCta from "@/components/tools/ToolCta";
import PrivacyNotice from "./PrivacyNotice";
import {
    gmiFromMean,
    MAX_READINGS,
    parseReadings,
    summarizeReadings,
    TIR_BANDS,
    TIR_TARGETS,
    type GlycemicSummary,
    type TirBand,
} from "@/lib/calculators/glycemic";
import {
    formatGlucosePair,
    GLUCOSE_UNIT_LABEL,
    roundTo,
    toMgdl,
} from "@/lib/units/glucose";
import { GLUCOSE_UNIT_OPTIONS, gmiParams } from "@/lib/tools/params";

const BAND_COLOR: Record<TirBand, string> = {
    veryLow: "bg-red-700",
    low: "bg-red-400",
    inRange: "bg-green-500",
    high: "bg-amber-400",
    veryHigh: "bg-amber-600",
};

const pct = (value: number) => `${roundTo(value, 1).toFixed(1)}%`;

function GmiStat({ gmi, meanMgdl }: { gmi: number; meanMgdl: number }) {
    const mean = formatGlucosePair(meanMgdl);
    return (
        <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-accent/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                    GMI
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                    {roundTo(gmi, 1).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">estimated A1c</p>
            </div>
            <div className="rounded-lg bg-accent/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                    Mean glucose
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                    {mean.mgdl} mg/dL
                </p>
                <p className="text-sm text-gray-600">
                    {mean.mmol.toFixed(1)} mmol/L
                </p>
            </div>
        </div>
    );
}

function TimeInRange({ summary }: { summary: GlycemicSummary }) {
    return (
        <div className="space-y-3">
            <div
                className="flex h-4 w-full overflow-hidden rounded-full bg-gray-100"
                aria-hidden="true"
            >
                {TIR_BANDS.map(({ band }) => (
                    <div
                        key={band}
                        className={BAND_COLOR[band]}
                        style={{ width: `${summary.bands[band]}%` }}
                    />
                ))}
            </div>
            <table className="w-full text-sm">
                <caption className="sr-only">Time in each glucose range</caption>
                <tbody>
                    {TIR_BANDS.map(({ band, label, mgdl }) => (
                        <tr key={band} className="border-b border-border last:border-b-0">
                            <th scope="row" className="py-1.5 text-left font-normal text-gray-700">
                                <span
                                    className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${BAND_COLOR[band]}`}
                                    aria-hidden="true"
                                />
                                {label} ({mgdl} mg/dL)
                            </th>
                            <td className="py-1.5 text-right font-semibold text-gray-900">
                                {pct(summary.bands[band])}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                <p className="text-sm font-medium text-gray-900">
                    Against the international targets
                </p>
                <ul className="mt-1 space-y-1 text-sm">
                    {TIR_TARGETS.map(({ id, label, goal }) => {
                        const { value, met } = summary.targets[id];
                        return (
                            <li key={id} className="flex items-center gap-2">
                                {met ? (
                                    <Check className="h-4 w-4 text-green-600" aria-label="Target met" />
                                ) : (
                                    <X className="h-4 w-4 text-red-600" aria-label="Target not met" />
                                )}
                                <span className="text-gray-700">
                                    {label}: <strong>{pct(value)}</strong>{" "}
                                    <span className="text-gray-500">(goal: {goal})</span>
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

export default function GmiCalculator() {
    const [params, setParams] = useQueryStates(gmiParams);
    const { mode, readings, mean, unit } = params;

    const parsed = useMemo(() => parseReadings(readings, unit), [readings, unit]);
    const summary = useMemo(
        () => (mode === "readings" ? summarizeReadings(parsed.values) : null),
        [mode, parsed]
    );
    const meanMgdl = mode === "mean" && mean !== "" ? toMgdl(parseFloat(mean), unit) : NaN;
    const meanValid = Number.isFinite(meanMgdl) && meanMgdl >= 40 && meanMgdl <= 600;

    const readingsHint =
        mode === "readings" && readings !== "" && !summary
            ? "Enter at least two readings."
            : undefined;
    const meanHint =
        mode === "mean" && mean !== "" && !meanValid
            ? unit === "mgdl"
                ? "Enter an average between 40 and 600 mg/dL."
                : "Enter an average between 2.2 and 33.3 mmol/L."
            : undefined;

    const form = (
        <Card className="border border-border shadow-md">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                    Your glucose data
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <ChoiceGroup
                    name="mode"
                    label="I have"
                    value={mode}
                    options={[
                        { value: "readings", label: "A list of readings" },
                        { value: "mean", label: "My average glucose" },
                    ]}
                    onChange={(next) => setParams({ mode: next })}
                />
                <ChoiceGroup
                    name="unit"
                    label="Unit"
                    value={unit}
                    options={GLUCOSE_UNIT_OPTIONS}
                    onChange={(next) => setParams({ unit: next })}
                />
                {mode === "readings" ? (
                    <div className="space-y-2">
                        <Label
                            htmlFor="readings"
                            className="block text-sm leading-6 font-medium text-gray-700"
                        >
                            Readings ({GLUCOSE_UNIT_LABEL[unit]})
                        </Label>
                        <textarea
                            id="readings"
                            rows={6}
                            value={readings}
                            onChange={(e) => setParams({ readings: e.target.value })}
                            placeholder={unit === "mgdl" ? "e.g. 110, 145, 98, 182, 130" : "e.g. 6.1, 8.0, 5.4, 10.1, 7.2"}
                            aria-describedby="readings-help"
                            className="w-full rounded-md border border-border bg-white p-3 text-sm focus:border-primary focus:outline-hidden"
                        />
                        <p id="readings-help" className="text-xs text-gray-500">
                            Paste readings separated by commas, spaces or new
                            lines, up to {MAX_READINGS}. A CGM export over 14
                            days or more gives the most meaningful result.
                        </p>
                        {readingsHint && (
                            <p className="text-sm text-red-600">{readingsHint}</p>
                        )}
                        {parsed.skipped > 0 && (
                            <p className="text-sm text-amber-700">
                                Skipped {parsed.skipped} value
                                {parsed.skipped === 1 ? "" : "s"} that{" "}
                                {parsed.skipped === 1 ? "isn't" : "aren't"} a
                                plausible reading.
                            </p>
                        )}
                        {parsed.truncated && (
                            <p className="text-sm text-amber-700">
                                Only the first {MAX_READINGS} readings are used.
                            </p>
                        )}
                    </div>
                ) : (
                    <NumberField
                        id="mean"
                        label="Average glucose"
                        value={mean}
                        onChange={(next) => setParams({ mean: next })}
                        unit={GLUCOSE_UNIT_LABEL[unit]}
                        placeholder={unit === "mgdl" ? "e.g. 150" : "e.g. 8.3"}
                        hint={meanHint}
                    />
                )}
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setParams({ readings: null, mean: null })}
                >
                    Clear
                </Button>
            </CardContent>
        </Card>
    );

    const hasResult = summary !== null || meanValid;
    const result = hasResult && (
        <Card className="border border-border shadow-md">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                    Your results
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {summary ? (
                    <>
                        <GmiStat gmi={summary.gmi} meanMgdl={summary.meanMgdl} />
                        <p className="text-sm text-gray-600">
                            From {summary.count} readings. Variability (CV):{" "}
                            <strong>{pct(summary.cv)}</strong>.
                        </p>
                        <TimeInRange summary={summary} />
                    </>
                ) : (
                    <GmiStat gmi={gmiFromMean(meanMgdl)} meanMgdl={meanMgdl} />
                )}
                <p className="text-xs text-gray-500">
                    GMI was designed for continuous glucose monitor data.
                    Finger-prick readings cluster around meal and bed times, so
                    they can give a less representative average.
                </p>
                <ToolCta slug="gmi-calculator" />
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <PrivacyNotice />
            <CalculatorLayout
                form={form}
                result={result || null}
                emptyMessage="Paste your readings or enter an average glucose to see your GMI and time in range."
            />
        </div>
    );
}
