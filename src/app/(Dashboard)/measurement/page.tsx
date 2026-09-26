"use client";
import MeasurementAdd from "@/components/DashboardInputs/MeasurementAdd";
import { useQuickLog } from "@/hooks/use-quick-log";
import { useState } from "react";
import notify from "@/helpers/notify";
import { useEntries } from "@/hooks/queries/useEntries";
import { EMPTY_ROWS } from "@/lib/query/keys";
import { useDeleteEntry } from "@/hooks/queries/useEntryMutations";
import formatDate from "@/helpers/formatDate";
import Link from "next/link";
import { Pencil } from "lucide-react";
import PopUpModal from "@/components/PopUpModal";
import MeasurementChartRecharts, {
    MEASUREMENT_FIELDS,
    type MeasurementField,
} from "@/components/Charts/RechartComponents/MeasurementChartRecharts";
import DataPeriodSelectCard from "@/components/DataPeriodSelectCard";
import TagFilterCard from "@/components/TagFilterCard";
import { filterByTags } from "@/helpers/tagFilterHelpers";
import MeasurementPageSkeleton2 from "@/components/MeasurementPageSkeleton2";
import {
    PageHeader,
    Panel,
    PanelHead,
    PanelSub,
    PanelTitle,
} from "@/components/app-ui/layout";
import { Delta, Reading, TagPill } from "@/components/app-ui/data";
import { AppButton, Chip, iconButton } from "@/components/app-ui/controls";
import {
    LogEntryButton,
    LogEntryCta,
    LogEntryDialog,
    useLogEntryDialog,
} from "@/components/app-ui/LogEntryDialog";
import {
    cm,
    dayLabel,
    fieldLabel,
    filledCount,
    formatChange,
    previewFields,
    summariseFields,
} from "@/components/measurement/measurementSummary";
import { cn } from "@/lib/utils";

const HISTORY_PAGE = 8;

export default function MeasurementsPage() {
    const quickLog = useQuickLog();
    const log = useLogEntryDialog(quickLog);
    const [daysOfData, setDaysOfData] = useState(30);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [field, setField] = useState<MeasurementField>("waist");
    const [historyLimit, setHistoryLimit] = useState(HISTORY_PAGE);

    const {
        data: measurementData = EMPTY_ROWS,
        isPending,
        isError,
    } = useEntries("measurements", daysOfData);
    const deleteEntry = useDeleteEntry("measurements");

    const changeDaysOfData = (event: { target: { value: string } }) => {
        setDaysOfData(parseInt(event.target.value));
    };

    const deleteData = async (id) => {
        try {
            await deleteEntry.mutateAsync(id);
            notify("Measurements data deleted!", "success");
        } catch (error) {
            notify("Could not delete that entry.", "error");
        }
    };

    const filtered = filterByTags(measurementData, selectedTags);

    if (isPending) {
        return <MeasurementPageSkeleton2 />;
    }

    if (isError) {
        return (
            <Panel className="text-center text-status-low">
                Failed to load measurement data. Please try again later.
            </Panel>
        );
    }

    const summaries = summariseFields(filtered);
    const lastMeasured = filtered[0]?.createdAt;
    const charted = filtered.filter((r) => cm(r[field]) !== null).length;
    const history = filtered.slice(0, historyLimit);

    return (
        <>
            <PageHeader
                title="Measurements"
                subtitle={
                    lastMeasured
                        ? `Body circumferences in cm. Last measured ${dayLabel(lastMeasured)}.`
                        : "Body circumferences in cm."
                }
                actions={
                    <LogEntryButton
                        label="Log measurements"
                        onClick={() => log.setOpen(true)}
                    />
                }
            />

            <div className="mb-4 flex flex-col gap-3 lg:mb-5 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-6 lg:gap-y-4">
                <DataPeriodSelectCard
                    daysOfData={daysOfData}
                    changeDaysOfData={changeDaysOfData}
                />
                <TagFilterCard
                    selectedTags={selectedTags}
                    onTagsChange={setSelectedTags}
                />
            </div>

            {/* The seven fields from MeasurementAdd; choosing one switches the chart. */}
            <Panel className="p-2 lg:p-2" aria-label="Latest measurements">
                <div
                    role="group"
                    aria-label="Choose a measurement to chart"
                    className="grid grid-cols-2 gap-1 lg:grid-cols-7 lg:gap-0"
                >
                    {summaries.map((s) => {
                        const pressed = s.field === field;
                        return (
                            <button
                                key={s.field}
                                type="button"
                                aria-pressed={pressed}
                                onClick={() => setField(s.field)}
                                className={cn(
                                    "relative block rounded-xl p-4 text-left transition-colors last:col-span-2 lg:last:col-span-1",
                                    // Hairline dividers between cells on desktop,
                                    // dropped around the selected one.
                                    "lg:[&+&]:before:absolute lg:[&+&]:before:top-4 lg:[&+&]:before:bottom-4 lg:[&+&]:before:left-0 lg:[&+&]:before:w-px lg:[&+&]:before:bg-border",
                                    "aria-pressed:before:hidden [[aria-pressed=true]+&]:before:hidden",
                                    pressed ? "bg-brand-oat" : "hover:bg-brand-cream"
                                )}
                            >
                                <span
                                    className={cn(
                                        "block text-xs font-semibold uppercase tracking-[0.13em]",
                                        pressed ? "text-brand-ink" : "text-brand-muted"
                                    )}
                                >
                                    {fieldLabel(s.field)}
                                </span>
                                <Reading
                                    size="sm"
                                    className="my-2.5"
                                    value={s.latest !== null ? s.latest.toFixed(1) : "—"}
                                    unit={s.latest !== null ? "cm" : undefined}
                                />
                                {s.change !== null ? (
                                    <Delta value={s.change} diagonal>
                                        {formatChange(s.change)}
                                    </Delta>
                                ) : (
                                    <span className="text-[13px] text-brand-muted">
                                        No change yet
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </Panel>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-5 lg:grid-cols-12 lg:gap-5">
                <Panel className="lg:col-span-8" aria-labelledby="measure-chart-title">
                    <PanelHead>
                        <div>
                            <PanelTitle id="measure-chart-title">
                                {fieldLabel(field)} over time
                            </PanelTitle>
                            <PanelSub>
                                {charted} {charted === 1 ? "measurement" : "measurements"}
                            </PanelSub>
                        </div>
                    </PanelHead>
                    <div
                        role="radiogroup"
                        aria-label="Measurement"
                        className="-mx-5 mb-4 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0"
                    >
                        {MEASUREMENT_FIELDS.map((f) => (
                            <Chip
                                key={f}
                                radio
                                pressed={f === field}
                                onClick={() => setField(f)}
                            >
                                {fieldLabel(f)}
                            </Chip>
                        ))}
                    </div>
                    <div className="h-[280px] lg:h-[360px]">
                        <MeasurementChartRecharts
                            data={filtered}
                            fetch={false}
                            field={field}
                        />
                    </div>
                </Panel>

                <Panel className="lg:col-span-4" aria-labelledby="measure-history-title">
                    <PanelHead>
                        <PanelTitle id="measure-history-title">History</PanelTitle>
                        {filtered.length > 0 && (
                            <span className="text-[13px] text-brand-muted">
                                {filtered.length}{" "}
                                {filtered.length === 1 ? "session" : "sessions"}
                            </span>
                        )}
                    </PanelHead>
                    {filtered.length === 0 ? (
                        <p className="py-8 text-center text-sm text-brand-muted">
                            {measurementData.length === 0
                                ? "No measurement entries found for the selected period."
                                : "No measurement entries match the selected tags."}
                        </p>
                    ) : (
                        <ul className="m-0 list-none p-0">
                            {history.map((entry) => {
                                const day = dayLabel(entry.createdAt);
                                const filled = filledCount(entry);
                                return (
                                    <li
                                        key={entry._id}
                                        className="border-t border-border py-3 first:border-t-0 first:pt-0 last:pb-0"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <strong className="text-[15px]">{day}</strong>
                                                {entry.tag && <TagPill>{entry.tag}</TagPill>}
                                            </div>
                                            <span className="inline-flex items-center gap-1">
                                                <span className="text-xs text-brand-muted">
                                                    {filled} of 7
                                                </span>
                                                <Link
                                                    href={`/measurement/${entry._id}`}
                                                    aria-label={`Edit ${day}`}
                                                    className={iconButton({ size: "sm" })}
                                                >
                                                    <Pencil aria-hidden="true" />
                                                </Link>
                                                <PopUpModal
                                                    delete={() => deleteData(entry._id)}
                                                    title="Delete these measurements?"
                                                    description={`All ${filled} measurements from ${formatDate(entry.createdAt)}.`}
                                                />
                                            </span>
                                        </div>
                                        <div className="mt-2 grid grid-cols-3 gap-3">
                                            {previewFields(field).map((f) => {
                                                const v = cm(entry[f]);
                                                return (
                                                    <div key={f} className="min-w-0">
                                                        <div className="text-xs text-brand-muted">
                                                            {fieldLabel(f)}
                                                        </div>
                                                        <strong
                                                            className={cn(
                                                                "text-sm tabular-nums",
                                                                v === null && "text-brand-muted"
                                                            )}
                                                        >
                                                            {v !== null ? `${v.toFixed(1)} cm` : "—"}
                                                        </strong>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                    {filtered.length > historyLimit && (
                        <div className="mt-4 text-center">
                            <AppButton
                                variant="outline"
                                onClick={() => setHistoryLimit((n) => n + HISTORY_PAGE)}
                            >
                                Show more
                            </AppButton>
                        </div>
                    )}
                </Panel>
            </div>

            <LogEntryCta label="Log measurements" onClick={() => log.setOpen(true)} />
            <LogEntryDialog
                open={log.open}
                onOpenChange={log.setOpen}
                title="Log measurements"
            >
                <MeasurementAdd
                    autoFocus={quickLog}
                    onSaved={() => log.setOpen(false)}
                />
            </LogEntryDialog>
        </>
    );
}
