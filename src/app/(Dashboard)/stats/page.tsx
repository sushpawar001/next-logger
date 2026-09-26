"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUp, Check, Info, Loader2 } from "lucide-react";
import { useEntries, useEntryRange } from "@/hooks/queries/useEntries";
import { EMPTY_ROWS } from "@/lib/query/keys";
import { glucose, weight, insulin } from "@/types/models";
import {
    countDistinctDays,
    getDailyInsulinValues,
    getHba1cPrecise,
    summarize,
} from "@/helpers/statsHelpers";
import { timeInRange } from "@/helpers/glucoseStatus";
import { filterByTags } from "@/helpers/tagFilterHelpers";
import { GLUCOSE_TARGET } from "@/constants/constants";
import { StatsTableCard, type StatRow } from "@/components/StatsTableCard";
import DataPeriodSelectCard, { ALL_DAYS } from "@/components/DataPeriodSelectCard";
import TagFilterCard from "@/components/TagFilterCard";
import { SERIES } from "@/components/Charts/RechartComponents/chartTheme";
import { Eyebrow, PageHeader, Panel, PanelHead, PanelTitle } from "@/components/app-ui/layout";
import { Reading, Stat, TimeInRangeBar } from "@/components/app-ui/data";

/** Roughly three months of readings before an HbA1c estimate means much. */
const HBA1C_DAYS_NEEDED = 90;

function periodPhrase(days: number) {
    if (days >= ALL_DAYS) return "All time";
    if (days === 365) return "The last year";
    return `The last ${days} days`;
}

function TirRow({
    label,
    split,
    count,
}: {
    label: string;
    split: ReturnType<typeof timeInRange>;
    count: number;
}) {
    return (
        <div>
            <div className="flex justify-between text-[13px]">
                <span className="text-brand-muted">{label}</span>
                <strong className="text-[15px] tabular-nums">
                    {count > 0 ? `${split.in}%` : "—"}
                </strong>
            </div>
            <TimeInRangeBar
                split={count > 0 ? split : { low: 0, in: 0, high: 0 }}
                showLegend={false}
                className="mt-2"
            />
        </div>
    );
}

export default function Stats() {
    const [daysOfData, setDaysOfData] = useState(90);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Same three requests as before. The glucose and weight ranges carry the
    // current and preceding window together, which is what the
    // period-over-period figures below compare. Insulin has no /get-range/,
    // so it is shown for the current period only.
    const glucoseRange = useEntryRange<glucose>("glucose", daysOfData);
    const weightRange = useEntryRange<weight>("weight", daysOfData);
    const insulinQuery = useEntries<insulin>("insulin", daysOfData);

    const glucoseData = glucoseRange.data?.current ?? (EMPTY_ROWS as glucose[]);
    const glucoseDataOld = glucoseRange.data?.previous ?? (EMPTY_ROWS as glucose[]);
    const weightData = weightRange.data?.current ?? (EMPTY_ROWS as weight[]);
    const weightDataOld = weightRange.data?.previous ?? (EMPTY_ROWS as weight[]);
    const insulinData = insulinQuery.data ?? (EMPTY_ROWS as insulin[]);

    const isLoading =
        glucoseRange.isPending || weightRange.isPending || insulinQuery.isPending;

    // Encrypted values can't be aggregated in MongoDB, so all of this is JS.
    const stats = useMemo(() => {
        const g = filterByTags(glucoseData, selectedTags);
        const gOld = filterByTags(glucoseDataOld, selectedTags);
        const w = filterByTags(weightData, selectedTags);
        const wOld = filterByTags(weightDataOld, selectedTags);
        const ins = filterByTags(insulinData, selectedTags);

        const gValues = g.map((d) => d.value);
        const gOldValues = gOld.map((d) => d.value);

        const byType = new Map<string, insulin[]>();
        for (const row of ins) {
            byType.set(row.name, [...(byType.get(row.name) ?? []), row]);
        }
        const dailyAvg = (rows: insulin[]) =>
            summarize(getDailyInsulinValues(rows)).avg;

        return {
            glucose: summarize(gValues),
            glucoseOld: summarize(gOldValues),
            tir: timeInRange(gValues),
            tirOld: timeInRange(gOldValues),
            glucoseDays: countDistinctDays(g),
            weight: summarize(w.map((d) => d.value)),
            weightOld: summarize(wOld.map((d) => d.value)),
            insulinTypes: [...byType.entries()].map(([name, rows]) => ({
                name,
                perDay: dailyAvg(rows),
            })),
            insulinTotalPerDay: ins.length ? dailyAvg(ins) : null,
        };
    }, [
        glucoseData,
        glucoseDataOld,
        weightData,
        weightDataOld,
        insulinData,
        selectedTags,
    ]);

    const hasGlucose = stats.glucose.count > 0;
    const hasOldGlucose = stats.glucoseOld.count > 0;
    const hba1c = hasGlucose ? getHba1cPrecise(stats.glucose.avg) : null;
    const daysCollected = Math.min(stats.glucoseDays, HBA1C_DAYS_NEEDED);
    const daysToGo = HBA1C_DAYS_NEEDED - daysCollected;
    const period = periodPhrase(daysOfData);
    const oldOrNull = (v: number | null) => (hasOldGlucose ? v : null);

    const glucoseRows: StatRow[] = [
        { label: "Average", previous: stats.glucoseOld.avg, current: stats.glucose.avg },
        { label: "Highest", previous: stats.glucoseOld.max, current: stats.glucose.max },
        { label: "Lowest", previous: stats.glucoseOld.min, current: stats.glucose.min },
        { label: "Readings", previous: stats.glucoseOld.count, current: stats.glucose.count },
        {
            label: "In range",
            previous: oldOrNull(stats.tirOld.in),
            current: hasGlucose ? stats.tir.in : null,
            suffix: "%",
            changeSuffix: " pts",
        },
        {
            label: "Above range",
            previous: oldOrNull(stats.tirOld.high),
            current: hasGlucose ? stats.tir.high : null,
            suffix: "%",
            changeSuffix: " pts",
        },
        {
            label: "Below range",
            previous: oldOrNull(stats.tirOld.low),
            current: hasGlucose ? stats.tir.low : null,
            suffix: "%",
            changeSuffix: " pts",
        },
    ];

    const weightRows: StatRow[] = [
        { label: "Average", previous: stats.weightOld.avg, current: stats.weight.avg, decimals: 1 },
        { label: "Highest", previous: stats.weightOld.max, current: stats.weight.max, decimals: 1 },
        { label: "Lowest", previous: stats.weightOld.min, current: stats.weight.min, decimals: 1 },
        { label: "Weigh-ins", previous: stats.weightOld.count, current: stats.weight.count },
    ];

    const insulinRows: StatRow[] = [
        ...stats.insulinTypes.map((t, idx) => ({
            label: (
                <span className="inline-flex items-center gap-2">
                    <span
                        aria-hidden="true"
                        className="inline-block h-[18px] w-1.5 rounded-[3px]"
                        style={{ background: SERIES[idx % SERIES.length] }}
                    />
                    {t.name}
                </span>
            ),
            current: t.perDay,
            decimals: 1,
        })),
        { label: "Total", current: stats.insulinTotalPerDay, decimals: 1 },
    ];

    return (
        <>
            <PageHeader
                title="Stats"
                subtitle="This period compared with the one before it."
                actions={
                    <DataPeriodSelectCard
                        daysOfData={daysOfData}
                        changeDaysOfData={(e) => setDaysOfData(parseInt(e.target.value))}
                    />
                }
            />

            <TagFilterCard selectedTags={selectedTags} onTagsChange={setSelectedTags} />

            {isLoading ? (
                <div className="grid h-64 place-items-center" role="status">
                    <Loader2 className="h-6 w-6 animate-spin text-brand-muted" />
                    <span className="sr-only">Loading</span>
                </div>
            ) : (
                <>
                    <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-5 lg:grid-cols-12 lg:gap-5">
                        <Panel aria-labelledby="a1c-label" className="lg:col-span-8">
                            <div className="grid h-full grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
                                <div className="flex flex-col pb-5 lg:pr-7 lg:pb-0">
                                    <Eyebrow id="a1c-label">Estimated HbA1c</Eyebrow>
                                    <Reading
                                        value={hba1c ?? "—"}
                                        unit={hba1c !== null ? "%" : undefined}
                                        size="lg"
                                        className="mt-4"
                                    />
                                    <p className="mt-4 text-sm">
                                        {hasGlucose
                                            ? `Based on your average glucose of ${Math.round(stats.glucose.avg)} mg/dL.`
                                            : "Log glucose readings to see an estimate."}
                                    </p>
                                    <p className="mt-1 text-[13px] text-brand-muted">
                                        It becomes reliable after about 3 months of
                                        readings.
                                    </p>
                                </div>
                                <div className="flex flex-col border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-7">
                                    <Stat label="Data collected">
                                        <Reading
                                            value={daysCollected}
                                            unit={`of ${HBA1C_DAYS_NEEDED} days`}
                                            size="sm"
                                        />
                                    </Stat>
                                    <div
                                        className="mt-4 h-2.5 overflow-hidden rounded-[5px] bg-brand-oat"
                                        role="progressbar"
                                        aria-label="Days of data"
                                        aria-valuemin={0}
                                        aria-valuemax={HBA1C_DAYS_NEEDED}
                                        aria-valuenow={daysCollected}
                                    >
                                        <span
                                            className="block h-full rounded-[5px] bg-brand-aubergine"
                                            style={{
                                                width: `${(daysCollected / HBA1C_DAYS_NEEDED) * 100}%`,
                                            }}
                                        />
                                    </div>
                                    <p className="mt-3 text-[13px] text-brand-muted">
                                        {daysToGo > 0
                                            ? daysOfData < HBA1C_DAYS_NEEDED
                                                ? "Days with readings in this period. Choose 90 days or more to see the full picture."
                                                : `Keep logging for ${daysToGo} more ${daysToGo === 1 ? "day" : "days"}.`
                                            : "Enough data for a steadier estimate."}
                                    </p>
                                </div>
                            </div>
                        </Panel>

                        <Panel aria-labelledby="tir-title" className="lg:col-span-4">
                            <PanelHead>
                                <PanelTitle id="tir-title">Time in range</PanelTitle>
                            </PanelHead>
                            <div className="space-y-4">
                                <TirRow
                                    label="This period"
                                    split={stats.tir}
                                    count={stats.glucose.count}
                                />
                                <TirRow
                                    label="Previous period"
                                    split={stats.tirOld}
                                    count={stats.glucoseOld.count}
                                />
                            </div>
                            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-semibold">
                                <span className="inline-flex items-center gap-1 text-status-low">
                                    <ArrowDown className="h-[13px] w-[13px]" strokeWidth={2.8} aria-hidden="true" />
                                    Low
                                </span>
                                <span className="inline-flex items-center gap-1 text-status-in">
                                    <Check className="h-[13px] w-[13px]" strokeWidth={2.8} aria-hidden="true" />
                                    In range
                                </span>
                                <span className="inline-flex items-center gap-1 text-status-high">
                                    <ArrowUp className="h-[13px] w-[13px]" strokeWidth={2.8} aria-hidden="true" />
                                    High
                                </span>
                            </div>
                            <p className="mt-2 text-xs text-brand-muted">
                                Target {GLUCOSE_TARGET.low}–{GLUCOSE_TARGET.high} mg/dL
                            </p>
                        </Panel>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-5 lg:grid-cols-12 lg:gap-5">
                        <div className="flex flex-col gap-4 lg:col-span-8 lg:gap-5">
                            <StatsTableCard
                                title="Glucose"
                                subtitle={`${period} compared with the period before · values in mg/dL`}
                                rows={glucoseRows}
                            />

                            <Panel
                                as="aside"
                                aria-label="About the HbA1c estimate"
                                className="flex gap-3.5"
                            >
                                <Info
                                    className="mt-0.5 h-5 w-5 flex-none text-brand-aubergine"
                                    aria-hidden="true"
                                />
                                <div>
                                    <strong>
                                        Estimated HbA1c is not a lab result.
                                    </strong>
                                    <p className="mt-1 text-[13px] text-brand-muted">
                                        It is based on your average glucose levels.
                                        Share your exported data with your care team
                                        and compare it with your next blood test.
                                    </p>
                                    <Link
                                        href="/profile#export"
                                        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-aubergine no-underline"
                                    >
                                        Export data
                                        <ArrowRight className="icon-nudge h-4 w-4" aria-hidden="true" />
                                    </Link>
                                </div>
                            </Panel>
                        </div>

                        <div className="flex flex-col gap-4 lg:col-span-4 lg:gap-5">
                            <StatsTableCard
                                title="Weight"
                                rows={weightRows}
                                previousLabel="Before"
                                currentLabel="Now"
                                note="All values in kg."
                            />
                            <StatsTableCard
                                title="Insulin"
                                rows={insulinRows}
                                metricLabel="Per day"
                                currentLabel="Now"
                                note="Average units per day on days with a dose."
                            />
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
