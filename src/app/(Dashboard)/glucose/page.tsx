"use client";
import GlucoseChartRecharts from "@/components/Charts/RechartComponents/GlucoseChartRecharts";
import GlucoseAdd from "@/components/DashboardInputs/GlucoseAdd";
import { useQuickLog } from "@/hooks/use-quick-log";
import DataPeriodSelectCard, { ALL_DAYS } from "@/components/DataPeriodSelectCard";
import TagFilterCard from "@/components/TagFilterCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import PopUpModal from "@/components/PopUpModal";
import notify from "@/helpers/notify";
import { filterByTags } from "@/helpers/tagFilterHelpers";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useEntries } from "@/hooks/queries/useEntries";
import { EMPTY_ROWS } from "@/lib/query/keys";
import { useDeleteEntry } from "@/hooks/queries/useEntryMutations";
import { entryTags, GLUCOSE_TARGET } from "@/constants/constants";
import type { glucose } from "@/types/models";
import {
    PageHeader,
    Panel,
    PanelHead,
    PanelTitle,
    Eyebrow,
} from "@/components/app-ui/layout";
import {
    HBar,
    Reading,
    Stat,
    StatusBadge,
    TagPill,
} from "@/components/app-ui/data";
import { AppButton, IconButton } from "@/components/app-ui/controls";
import { DataTable, DataTableWrap, actionsCell } from "@/components/app-ui/table";
import {
    LogEntryButton,
    LogEntryCta,
    LogEntryDialog,
    useLogEntryDialog,
} from "@/components/app-ui/LogEntryDialog";
import {
    averageByTag,
    dayLabel,
    dayTimeLabel,
    relativeLabel,
    summarise,
    timeLabel,
} from "@/components/glucose/glucoseSummary";

const PAGE_SIZE = 20;
/** Scale for the "Average by tag" bars, so a 165 average reads as three-quarters full. */
const TAG_BAR_MAX = 220;

const periodNote = (days: number) =>
    days >= ALL_DAYS ? "All time" : days === 365 ? "Last year" : `Last ${days} days`;

export default function GlucosePage() {
    const quickLog = useQuickLog();
    const dialog = useLogEntryDialog(quickLog);
    const [daysOfData, setDaysOfData] = useState(7);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [visible, setVisible] = useState(PAGE_SIZE);
    const [parent] = useAutoAnimate({ duration: 400 });

    const {
        data: glucoseData = EMPTY_ROWS as glucose[],
        isPending,
        isError,
    } = useEntries<glucose>("glucose", daysOfData);
    const deleteEntry = useDeleteEntry("glucose");

    const changeDaysOfData = (event: { target: { value: string } }) => {
        setDaysOfData(parseInt(event.target.value));
        setVisible(PAGE_SIZE);
    };

    const deleteData = async (id) => {
        try {
            await deleteEntry.mutateAsync(id);
            notify("Glucose data deleted!", "success");
        } catch (error) {
            notify("Could not delete that entry.", "error");
        }
    };

    const openLog = () => dialog.setOpen(true);
    const logDialog = (
        <>
            <LogEntryDialog
                open={dialog.open}
                onOpenChange={dialog.setOpen}
                title="Log glucose"
            >
                <GlucoseAdd
                    autoFocus={dialog.open}
                    onSaved={() => dialog.setOpen(false)}
                />
            </LogEntryDialog>
            <LogEntryCta label="Log glucose" onClick={openLog} />
        </>
    );
    const header = (
        <PageHeader
            title="Glucose"
            subtitle="Every reading you have logged, newest first."
            actions={<LogEntryButton label="Log glucose" onClick={openLog} />}
        />
    );

    // isPending, not isFetching: with keepPreviousData a period change keeps the
    // previous window on screen instead of blanking the page behind a skeleton.
    if (isPending) {
        return <LoadingSkeleton />;
    }

    if (isError) {
        return (
            <>
                {header}
                <Panel role="alert" className="text-center text-brand-ink">
                    Failed to load glucose data. Please try again later.
                </Panel>
                {logDialog}
            </>
        );
    }

    // Filter data based on selected tags
    const filteredGlucoseData = filterByTags(glucoseData, selectedTags);
    const latest = glucoseData[0];
    const summary = summarise(glucoseData);
    const byTag = averageByTag(glucoseData, entryTags);
    const tagBarMax = Math.max(TAG_BAR_MAX, ...byTag.map((t) => t.average));
    const shown = filteredGlucoseData.slice(0, visible);

    return (
        <>
            {header}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
                <Panel aria-labelledby="latest-label" className="lg:col-span-8">
                    <div className="grid h-full grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
                        <div className="flex min-w-0 flex-col pb-5 lg:pr-7 lg:pb-0">
                            <Eyebrow id="latest-label">Latest reading</Eyebrow>
                            {latest ? (
                                <>
                                    <Reading
                                        value={latest.value}
                                        unit="mg/dL"
                                        size="lg"
                                        className="mt-4"
                                    />
                                    <div className="mt-3.5 flex flex-wrap items-center gap-3 text-[13px] text-brand-muted">
                                        <StatusBadge value={Number(latest.value)} />
                                        <span>
                                            {latest.tag ? `${latest.tag} · ` : ""}
                                            {relativeLabel(latest.createdAt)}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <p className="mt-4 text-sm text-brand-muted">
                                    No readings in this period yet. Log one to
                                    see it here.
                                </p>
                            )}
                        </div>
                        <div className="flex min-w-0 flex-col border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-7">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                                <Stat label="Average">
                                    <Reading
                                        value={summary.average ?? "–"}
                                        unit={summary.average != null ? "mg/dL" : undefined}
                                        size="sm"
                                    />
                                </Stat>
                                <Stat label="Readings">
                                    <Reading value={summary.count} size="sm" />
                                </Stat>
                                <Stat label="Highest">
                                    <Reading
                                        value={summary.highest ?? "–"}
                                        unit={summary.highest != null ? "mg/dL" : undefined}
                                        size="sm"
                                    />
                                </Stat>
                                <Stat label="Lowest">
                                    <Reading
                                        value={summary.lowest ?? "–"}
                                        unit={summary.lowest != null ? "mg/dL" : undefined}
                                        size="sm"
                                    />
                                </Stat>
                            </div>
                            <p className="mt-auto pt-4 text-xs text-brand-muted">
                                {periodNote(daysOfData)}
                            </p>
                        </div>
                    </div>
                </Panel>

                <Panel aria-labelledby="bytag-title" className="lg:col-span-4">
                    <PanelHead>
                        <PanelTitle id="bytag-title">Average by tag</PanelTitle>
                    </PanelHead>
                    {byTag.length === 0 ? (
                        <p className="text-sm text-brand-muted">
                            Tag your readings (fasting, after meal…) to compare
                            them here.
                        </p>
                    ) : (
                        <>
                            {byTag.map((t) => (
                                <HBar
                                    key={t.tag}
                                    label={t.tag}
                                    value={t.average}
                                    max={tagBarMax}
                                />
                            ))}
                            <p className="mt-3.5 text-xs text-brand-muted">
                                Averages in mg/dL.
                            </p>
                        </>
                    )}
                </Panel>
            </div>

            <div className="mt-4 flex flex-col items-stretch gap-3 lg:mt-5 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-6 lg:gap-y-4">
                <DataPeriodSelectCard
                    daysOfData={daysOfData}
                    changeDaysOfData={changeDaysOfData}
                />
                <TagFilterCard
                    selectedTags={selectedTags}
                    onTagsChange={(tags) => {
                        setSelectedTags(tags);
                        setVisible(PAGE_SIZE);
                    }}
                />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-5 lg:gap-5">
                <Panel aria-label="Glucose chart">
                    <p className="mb-2 text-[13px] text-brand-muted">
                        Target range {GLUCOSE_TARGET.low}–{GLUCOSE_TARGET.high}{" "}
                        mg/dL
                    </p>
                    <div className="h-56 lg:h-64">
                        <GlucoseChartRecharts
                            data={filteredGlucoseData}
                            fetch={false}
                            dotRadius={filteredGlucoseData.length > 60 ? 2 : 3.5}
                        />
                    </div>
                </Panel>

                <Panel aria-labelledby="history-title">
                    <PanelHead>
                        <PanelTitle id="history-title">History</PanelTitle>
                        {filteredGlucoseData.length > 0 && (
                            <span className="text-[13px] text-brand-muted">
                                Showing {shown.length} of{" "}
                                {filteredGlucoseData.length}
                            </span>
                        )}
                    </PanelHead>
                    <DataTableWrap>
                        <DataTable>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Reading</th>
                                    <th className="hidden lg:table-cell">Tag</th>
                                    <th>Status</th>
                                    <th className={actionsCell}>
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody ref={parent}>
                                {filteredGlucoseData.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-8! text-center text-brand-muted"
                                        >
                                            {glucoseData.length === 0
                                                ? "No glucose entries found for the selected period."
                                                : "No glucose entries match the selected tags."}
                                        </td>
                                    </tr>
                                ) : (
                                    shown.map((entry) => (
                                        <tr key={entry._id}>
                                            <td>{dayLabel(entry.createdAt)}</td>
                                            <td className="tabular-nums text-brand-muted">
                                                {timeLabel(entry.createdAt)}
                                            </td>
                                            <td>
                                                <Reading
                                                    value={entry.value}
                                                    unit="mg/dL"
                                                    size="xxs"
                                                    className="inline-flex"
                                                />
                                            </td>
                                            <td className="hidden lg:table-cell">
                                                {entry.tag ? (
                                                    <TagPill>{entry.tag}</TagPill>
                                                ) : (
                                                    <span className="text-brand-muted">–</span>
                                                )}
                                            </td>
                                            <td>
                                                <StatusBadge value={Number(entry.value)} />
                                            </td>
                                            <td className={actionsCell}>
                                                <span className="inline-flex items-center">
                                                    <IconButton
                                                        asChild
                                                        size="sm"
                                                        aria-label="Edit"
                                                    >
                                                        <Link href={`/glucose/${entry._id}`}>
                                                            <Pencil aria-hidden="true" />
                                                        </Link>
                                                    </IconButton>
                                                    <PopUpModal
                                                        delete={() => {
                                                            deleteData(entry._id);
                                                        }}
                                                        title="Delete this reading?"
                                                        description={
                                                            <>
                                                                {entry.value} mg/dL
                                                                {entry.tag ? ` · ${entry.tag}` : ""}
                                                                {" · "}
                                                                {dayTimeLabel(entry.createdAt)}
                                                                <br />
                                                                This can&apos;t be undone.
                                                            </>
                                                        }
                                                    />
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </DataTable>
                    </DataTableWrap>
                    {filteredGlucoseData.length > visible && (
                        <div className="mt-4 text-center">
                            <AppButton
                                variant="outline"
                                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                            >
                                Load more
                            </AppButton>
                        </div>
                    )}
                </Panel>
            </div>

            {logDialog}
        </>
    );
}
