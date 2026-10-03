"use client";
import React, { useMemo, useState } from "react";
import formatDate from "@/helpers/formatDate";
import notify from "@/helpers/notify";
import { useEntries } from "@/hooks/queries/useEntries";
import { EMPTY_ROWS } from "@/lib/query/keys";
import { useDeleteEntry } from "@/hooks/queries/useEntryMutations";
import Link from "next/link";
import WeightAdd from "@/components/DashboardInputs/WeightAdd";
import { useQuickLog } from "@/hooks/use-quick-log";
import WeightChartRecharts from "@/components/Charts/RechartComponents/WeightChartRecharts";
import PopUpModal from "@/components/PopUpModal";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import DataPeriodSelectCard, { ALL_DAYS } from "@/components/DataPeriodSelectCard";
import TagFilterCard from "@/components/TagFilterCard";
import { filterByTags } from "@/helpers/tagFilterHelpers";
import { Pencil } from "lucide-react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
    Eyebrow,
    PageHeader,
    Panel,
    PanelHead,
    PanelSub,
    PanelTitle,
} from "@/components/app-ui/layout";
import { Delta, LegendItem, Reading, Stat } from "@/components/app-ui/data";
import { AppButton, IconButton } from "@/components/app-ui/controls";
import {
    LogEntryButton,
    LogEntryCta,
    LogEntryDialog,
    useLogEntryDialog,
} from "@/components/app-ui/LogEntryDialog";

/** 7 days of weight is mostly noise, so the page opens on a month. */
const DEFAULT_DAYS = 30;
const PAGE_SIZE = 10;

const kg = (n: number) => (Math.round(n * 10) / 10).toString();

/** "+0.3", "−0.2" (true minus sign) or "0". */
const signed = (n: number) => {
    const r = Math.round(n * 10) / 10;
    if (r === 0) return "0";
    return r > 0 ? `+${r}` : `−${Math.abs(r)}`;
};

export default function WeightPage() {
    const quickLog = useQuickLog();
    const dialog = useLogEntryDialog(quickLog);
    const [daysOfData, setDaysOfData] = useState(DEFAULT_DAYS);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [visible, setVisible] = useState(PAGE_SIZE);
    const [parent] = useAutoAnimate({ duration: 400 });

    const {
        data: weightData = EMPTY_ROWS,
        isPending,
        isError,
    } = useEntries("weight", daysOfData);
    const deleteEntry = useDeleteEntry("weight");

    const changeDaysOfData = (event) => {
        const daysInput = event.target.value;
        // parseInt matters here: this was the one page storing the raw string,
        // which would key the same window separately from every other page.
        setDaysOfData(parseInt(daysInput));
    };

    const deleteData = async (id) => {
        try {
            await deleteEntry.mutateAsync(id);
            notify("Weight data deleted!", "success");
        } catch (error) {
            notify("Could not delete that entry.", "error");
        }
    };

    // Filter data based on selected tags (newest first, as the API returns it)
    const filteredWeightData = useMemo(
        () => filterByTags(weightData, selectedTags),
        [weightData, selectedTags]
    );
    const { values, average, highest, lowest } = useMemo(() => {
        const values = filteredWeightData.map((w) => Number(w.value));
        return {
            values,
            average: values.length
                ? values.reduce((a, b) => a + b, 0) / values.length
                : 0,
            highest: values.length ? Math.max(...values) : 0,
            lowest: values.length ? Math.min(...values) : 0,
        };
    }, [filteredWeightData]);

    if (isPending) {
        return <LoadingSkeleton />;
    }

    if (isError) {
        return (
            <div className="p-4 text-center text-status-low">
                Failed to load weight data. Please try again later.
            </div>
        );
    }

    const latest = filteredWeightData[0];
    const oldest = filteredWeightData[filteredWeightData.length - 1];
    const change = latest && oldest ? Number(latest.value) - Number(oldest.value) : 0;
    const periodLabel =
        daysOfData === ALL_DAYS ? "in view" : `in ${daysOfData} days`;
    const averageLabel =
        daysOfData === ALL_DAYS ? "Average" : `${daysOfData}-day average`;

    const emptyMessage =
        weightData.length === 0
            ? "No weight entries found for the selected period."
            : "No weight entries match the selected tags.";

    return (
        <>
            <PageHeader
                title="Weight"
                subtitle="Your weigh-ins and the 7-day trend."
                actions={
                    <LogEntryButton
                        label="Log weight"
                        onClick={() => dialog.setOpen(true)}
                    />
                }
            />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
                <div className="flex min-w-0 flex-col gap-4 lg:col-span-8 lg:gap-5">
                    <Panel aria-labelledby="current-label">
                        <div className="grid grid-cols-1 lg:h-full lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
                            <div className="flex min-w-0 flex-col pb-5 lg:pr-7 lg:pb-0">
                                <Eyebrow id="current-label">Current weight</Eyebrow>
                                {latest ? (
                                    <>
                                        <Reading
                                            value={kg(Number(latest.value))}
                                            unit="kg"
                                            size="lg"
                                            className="mt-4"
                                        />
                                        {filteredWeightData.length > 1 && (
                                            // Neutral: a muted arrow, never red or green.
                                            <Delta
                                                value={change}
                                                diagonal
                                                className="mt-3.5 text-sm"
                                            >
                                                {kg(Math.abs(change))} kg {periodLabel}
                                            </Delta>
                                        )}
                                        <p className="mt-auto pt-4 text-[13px] text-brand-muted">
                                            Logged {formatDate(latest.createdAt)}
                                            {latest.tag ? ` · ${latest.tag}` : ""}
                                        </p>
                                    </>
                                ) : (
                                    <p className="mt-4 text-sm text-brand-muted">
                                        {emptyMessage}
                                    </p>
                                )}
                            </div>
                            <div className="grid min-w-0 grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-7">
                                <Stat label={averageLabel}>
                                    <Reading
                                        value={values.length ? kg(average) : "–"}
                                        unit={values.length ? "kg" : undefined}
                                        size="sm"
                                    />
                                </Stat>
                                <Stat label="Weigh-ins">
                                    <Reading value={values.length} size="sm" />
                                </Stat>
                                <Stat label="Highest">
                                    <Reading
                                        value={values.length ? kg(highest) : "–"}
                                        unit={values.length ? "kg" : undefined}
                                        size="sm"
                                    />
                                </Stat>
                                <Stat label="Lowest">
                                    <Reading
                                        value={values.length ? kg(lowest) : "–"}
                                        unit={values.length ? "kg" : undefined}
                                        size="sm"
                                    />
                                </Stat>
                            </div>
                        </div>
                    </Panel>

                    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-6 lg:gap-y-4">
                        <DataPeriodSelectCard
                            daysOfData={daysOfData}
                            changeDaysOfData={changeDaysOfData}
                            className="self-start"
                        />
                        <TagFilterCard
                            selectedTags={selectedTags}
                            onTagsChange={setSelectedTags}
                        />
                    </div>

                    <Panel aria-labelledby="trend-title">
                        <PanelHead>
                            <div>
                                <PanelTitle id="trend-title">Trend</PanelTitle>
                                <PanelSub>Daily weigh-ins with a 7-day average</PanelSub>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-2">
                                <LegendItem
                                    swatch={
                                        <span className="h-[3px] w-[18px] rounded-sm bg-brand-lavender" />
                                    }
                                >
                                    7-day average
                                </LegendItem>
                                <LegendItem
                                    swatch={
                                        <span className="h-2 w-2 rounded-full border-[1.5px] border-brand-aubergine" />
                                    }
                                >
                                    Weigh-in
                                </LegendItem>
                            </div>
                        </PanelHead>
                        <div className="h-[280px] lg:h-[360px]">
                            <WeightChartRecharts
                                data={filteredWeightData}
                                fetch={false}
                            />
                        </div>
                    </Panel>
                </div>

                <Panel aria-labelledby="entries-title" className="lg:col-span-4">
                    <PanelHead>
                        <PanelTitle id="entries-title">Entries</PanelTitle>
                        <span className="text-[13px] text-brand-muted">
                            {filteredWeightData.length} in view
                        </span>
                    </PanelHead>
                    {filteredWeightData.length === 0 ? (
                        <p className="py-8 text-center text-sm text-brand-muted">
                            {emptyMessage}
                        </p>
                    ) : (
                        <ul ref={parent} className="m-0 list-none p-0">
                            {filteredWeightData.slice(0, visible).map((entry, i) => {
                                // Change from the weigh-in before this one.
                                const previous = filteredWeightData[i + 1];
                                const diff = previous
                                    ? Number(entry.value) - Number(previous.value)
                                    : null;
                                const when = formatDate(entry.createdAt);
                                return (
                                    <li
                                        key={entry._id}
                                        className="flex items-center gap-2 border-t border-border py-2.5 first:border-t-0 first:pt-0 last:pb-0"
                                    >
                                        <div className="min-w-0 flex-1 leading-[1.35]">
                                            <Reading
                                                value={kg(Number(entry.value))}
                                                unit="kg"
                                                size="xs"
                                            />
                                            <div className="mt-1 truncate text-xs text-brand-muted">
                                                {when}
                                                {entry.tag ? ` · ${entry.tag}` : ""}
                                            </div>
                                        </div>
                                        {diff !== null && (
                                            <Delta value={Math.round(diff * 10) / 10} diagonal>
                                                {signed(diff)}
                                            </Delta>
                                        )}
                                        <IconButton
                                            asChild
                                            size="sm"
                                            aria-label={`Edit ${when}`}
                                        >
                                            <Link href={`/weight/${entry._id}`}>
                                                <Pencil aria-hidden="true" />
                                            </Link>
                                        </IconButton>
                                        <PopUpModal
                                            delete={() => deleteData(entry._id)}
                                            title="Delete this weigh-in?"
                                            description={`${kg(Number(entry.value))} kg${
                                                entry.tag ? ` · ${entry.tag}` : ""
                                            } · ${when}`}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                    {filteredWeightData.length > visible && (
                        <AppButton
                            variant="outline"
                            block
                            className="mt-4"
                            onClick={() => setVisible((v) => v + PAGE_SIZE)}
                        >
                            Load more
                        </AppButton>
                    )}
                </Panel>
            </div>

            <LogEntryDialog
                open={dialog.open}
                onOpenChange={dialog.setOpen}
                title="Log weight"
            >
                <WeightAdd
                    autoFocus={quickLog}
                    onSaved={() => dialog.setOpen(false)}
                />
            </LogEntryDialog>
            <LogEntryCta label="Log weight" onClick={() => dialog.setOpen(true)} />
        </>
    );
}
