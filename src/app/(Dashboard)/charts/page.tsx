"use client";
import type { ReactNode } from "react";
import { useState } from "react";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import AdvInsulinChartSeparateRecharts from "@/components/Charts/RechartComponents/AdvInsulinChartSeparateRecharts";
import AdvWeightChartRecharts from "@/components/Charts/RechartComponents/AdvWeightChartRecharts";
import GlucoseDailyRangeChart from "@/components/Charts/RechartComponents/GlucoseDailyRangeChart";
import DataPeriodSelectCard from "@/components/DataPeriodSelectCard";
import TagFilterCard from "@/components/TagFilterCard";
import { PageHeader, Panel, PanelHead, PanelSub, PanelTitle } from "@/components/app-ui/layout";
import { Reading } from "@/components/app-ui/data";
import { useEntries } from "@/hooks/queries/useEntries";
import { EMPTY_ROWS } from "@/lib/query/keys";
import { filterByTags } from "@/helpers/tagFilterHelpers";

function periodLabel(days: number) {
    if (days >= 365 * 100) return "all time";
    if (days === 365) return "the last year";
    return `the last ${days} days`;
}

function ChartBody({
    pending,
    className,
    children,
}: {
    pending: boolean;
    className: string;
    children: ReactNode;
}) {
    return (
        <div className={className}>
            {pending ? (
                <div className="grid h-full place-items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-brand-muted" />
                </div>
            ) : (
                children
            )}
        </div>
    );
}

/**
 * The analysis view: one period and one tag filter drive every chart. It is
 * read-only, so there is no primary button competing with the charts.
 */
export default function ChartPage() {
    const [daysOfData, setDaysOfData] = useState(90);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Three independent queries rather than one Promise.all, so a slow insulin
    // fetch no longer blanks the glucose and weight charts beside it. Same three
    // requests as before -- no extra fan-out.
    const glucoseQuery = useEntries("glucose", daysOfData);
    const weightQuery = useEntries("weight", daysOfData);
    const insulinQuery = useEntries("insulin", daysOfData);

    const glucoseData = glucoseQuery.data ?? EMPTY_ROWS;
    const weightData = weightQuery.data ?? EMPTY_ROWS;
    const insulinData = insulinQuery.data ?? EMPTY_ROWS;

    const filteredGlucoseData = filterByTags(glucoseData, selectedTags);
    const filteredWeightData = filterByTags(weightData, selectedTags);
    const filteredInsulinData = filterByTags(insulinData, selectedTags);

    // Rows arrive newest first.
    const latestWeight: number | undefined = filteredWeightData[0]?.value;
    const period = periodLabel(daysOfData);

    return (
        <>
            <PageHeader
                title="Charts"
                subtitle="Compare your metrics over time."
            />

            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-6 lg:gap-y-4">
                <DataPeriodSelectCard
                    daysOfData={daysOfData}
                    changeDaysOfData={(e) => setDaysOfData(parseInt(e.target.value))}
                />
                <TagFilterCard
                    selectedTags={selectedTags}
                    onTagsChange={setSelectedTags}
                />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-5 lg:grid-cols-12 lg:gap-5">
                <Panel aria-labelledby="range-title" className="lg:col-span-12">
                    <PanelHead>
                        <div>
                            <PanelTitle id="range-title">
                                Glucose · daily range
                            </PanelTitle>
                            <PanelSub>
                                Bar = lowest to highest reading that day · dot =
                                daily average
                            </PanelSub>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-brand-muted">
                            <span className="inline-flex items-center gap-1.5">
                                <span
                                    aria-hidden="true"
                                    className="inline-block h-3.5 w-2.5 rounded-[5px] bg-brand-lavender/45"
                                />
                                Range and average
                            </span>
                            <span className="inline-flex items-center gap-1 font-semibold text-status-high">
                                <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.8} aria-hidden="true" />
                                High
                            </span>
                            <span className="inline-flex items-center gap-1 font-semibold text-status-low">
                                <ArrowDown className="h-3.5 w-3.5" strokeWidth={2.8} aria-hidden="true" />
                                Low
                            </span>
                        </div>
                    </PanelHead>
                    <ChartBody pending={glucoseQuery.isPending} className="h-[280px]">
                        <GlucoseDailyRangeChart data={filteredGlucoseData} />
                    </ChartBody>
                </Panel>

                <Panel aria-labelledby="insulin-title" className="lg:col-span-6">
                    <PanelHead>
                        <div>
                            <PanelTitle id="insulin-title">Insulin by type</PanelTitle>
                            <PanelSub>Daily units, {period}</PanelSub>
                        </div>
                    </PanelHead>
                    <ChartBody pending={insulinQuery.isPending} className="min-h-[120px]">
                        <AdvInsulinChartSeparateRecharts
                            fetch={false}
                            data={filteredInsulinData}
                            days={daysOfData}
                        />
                    </ChartBody>
                </Panel>

                <Panel aria-labelledby="weight-title" className="lg:col-span-6">
                    <PanelHead>
                        <div>
                            <PanelTitle id="weight-title">Weight</PanelTitle>
                            <PanelSub>Weigh-ins with a moving average</PanelSub>
                        </div>
                        {latestWeight !== undefined && (
                            <Reading value={latestWeight} unit="kg" size="xs" />
                        )}
                    </PanelHead>
                    <ChartBody pending={weightQuery.isPending} className="h-[268px]">
                        <AdvWeightChartRecharts
                            fetch={false}
                            data={filteredWeightData}
                            days={daysOfData}
                        />
                    </ChartBody>
                </Panel>
            </div>
        </>
    );
}
