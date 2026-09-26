"use client";
import { useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { ArrowRight, Pencil } from "lucide-react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import notify from "@/helpers/notify";
import { filterByTags } from "@/helpers/tagFilterHelpers";
import { insulinKind, splitUnits } from "@/helpers/insulinKind";
import { useEntries } from "@/hooks/queries/useEntries";
import { useUserInsulins } from "@/hooks/queries/useReferenceData";
import { useDeleteEntry } from "@/hooks/queries/useEntryMutations";
import { useQuickLog } from "@/hooks/use-quick-log";
import { EMPTY_ROWS } from "@/lib/query/keys";
import { cn } from "@/lib/utils";
import InsulinAdd from "@/components/DashboardInputs/InsulinAdd";
import InsulinChartRecharts, {
    dailyInsulinTotals,
} from "@/components/Charts/RechartComponents/InsulinChartRecharts";
import DoseStrip from "@/components/InsulinComponents/DoseStrip";
import PopUpModal from "@/components/PopUpModal";
import DataPeriodSelectCard from "@/components/DataPeriodSelectCard";
import TagFilterCard from "@/components/TagFilterCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import {
    Eyebrow,
    PageHeader,
    Panel,
    PanelHead,
    PanelTitle,
} from "@/components/app-ui/layout";
import { LegendItem, Reading, TagPill } from "@/components/app-ui/data";
import { IconButton } from "@/components/app-ui/controls";
import { DataTable, DataTableWrap, actionsCell } from "@/components/app-ui/table";
import {
    LogEntryButton,
    LogEntryCta,
    LogEntryDialog,
    useLogEntryDialog,
} from "@/components/app-ui/LogEntryDialog";

type insulinEntryType = {
    _id: string;
    user: string;
    name: string;
    createdAt: string;
    units: number;
    tag: string;
};

/** A short vertical bar in the insulin's kind colour. */
function KindMark({ name, tall = false }: { name: string; tall?: boolean }) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "inline-block w-1.5 flex-none rounded-[3px] align-middle",
                tall ? "h-[30px]" : "h-[18px]",
                insulinKind(name) === "basal"
                    ? "bg-brand-lavender"
                    : "bg-brand-aubergine"
            )}
        />
    );
}

function Swatch({ className }: { className: string }) {
    return (
        <span
            aria-hidden="true"
            className={cn("inline-block h-2.5 w-2.5 flex-none rounded-[2px]", className)}
        />
    );
}

export default function InsulinPage() {
    const quickLog = useQuickLog();
    const logDialog = useLogEntryDialog(quickLog);
    const [daysOfData, setDaysOfData] = useState(7);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedInsulins, setSelectedInsulins] = useState<string[]>([]);
    const [parent] = useAutoAnimate({ duration: 400 });

    const {
        data: insulinData = EMPTY_ROWS as insulinEntryType[],
        isPending,
        isError,
    } = useEntries<insulinEntryType>("insulin", daysOfData);
    const { data: userInsulins = EMPTY_ROWS as { _id: string; name: string }[] } =
        useUserInsulins();
    const deleteEntry = useDeleteEntry("insulin");

    const changeDaysOfData = (event: { target: { value: string } }) => {
        setDaysOfData(parseInt(event.target.value));
    };

    const deleteData = async (id: string) => {
        try {
            await deleteEntry.mutateAsync(id);
            notify("Insulin data deleted!", "success");
        } catch (error) {
            notify("Could not delete that entry.", "error");
        }
    };

    if (isPending) {
        return <LoadingSkeleton />;
    }

    if (isError) {
        return (
            <div className="p-4 text-center text-status-low">
                Failed to load insulin data. Please try again later.
            </div>
        );
    }

    const filteredInsulinData = filterByTags(insulinData, selectedTags).filter(
        (entry) =>
            selectedInsulins.length === 0 || selectedInsulins.includes(entry.name)
    );

    // "Today" ignores the filters: it answers "how much have I taken today".
    const today = insulinData
        .filter((d) => dayjs(d.createdAt).isSame(dayjs(), "day"))
        .sort((a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf());
    const todaySplit = splitUnits(today);
    const lastDose = today[today.length - 1];
    const todayByName = (name: string) =>
        today.filter((d) => d.name === name).reduce((s, d) => s + Number(d.units), 0);

    const insulinNames = Array.from(
        new Set([...userInsulins.map((i) => i.name), ...insulinData.map((d) => d.name)])
    )
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));

    const dailyTotals = dailyInsulinTotals(filteredInsulinData);
    const dailyAverage = dailyTotals.length
        ? dailyTotals.reduce((s, d) => s + d.total, 0) / dailyTotals.length
        : 0;

    const pct = (n: number) =>
        todaySplit.total > 0 ? `${(n / todaySplit.total) * 100}%` : "0%";

    return (
        <>
            <PageHeader
                title="Insulin"
                subtitle="Doses logged, by insulin type."
                actions={
                    <LogEntryButton
                        label="Log dose"
                        onClick={() => logDialog.setOpen(true)}
                    />
                }
            />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
                <Panel className="lg:col-span-8" aria-labelledby="today-label">
                    <div className="grid h-full grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
                        <div className="flex min-w-0 flex-col pb-5 lg:pr-7 lg:pb-0">
                            <Eyebrow id="today-label">Today</Eyebrow>
                            <Reading
                                value={todaySplit.total}
                                unit="IU"
                                size="lg"
                                className="mt-4"
                            />
                            <div className="mt-5 flex h-2.5 gap-0.5" aria-hidden="true">
                                {todaySplit.bolus > 0 && (
                                    <span
                                        className="rounded-[5px] bg-brand-aubergine"
                                        style={{ width: pct(todaySplit.bolus) }}
                                    />
                                )}
                                {todaySplit.basal > 0 && (
                                    <span
                                        className="rounded-[5px] bg-brand-lavender"
                                        style={{ width: pct(todaySplit.basal) }}
                                    />
                                )}
                                {todaySplit.total === 0 && (
                                    <span className="w-full rounded-[5px] bg-brand-oat" />
                                )}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-brand-ink">
                                <span className="inline-flex items-center gap-1.5">
                                    <Swatch className="bg-brand-aubergine" />
                                    Bolus {todaySplit.bolus} IU
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Swatch className="bg-brand-lavender" />
                                    Basal {todaySplit.basal} IU
                                </span>
                            </div>
                            <p className="mt-auto pt-4 text-[13px] text-brand-muted">
                                {today.length === 0
                                    ? "No doses logged today"
                                    : `${today.length} ${today.length === 1 ? "dose" : "doses"} · last at ${dayjs(lastDose.createdAt).format("HH:mm")}`}
                            </p>
                        </div>
                        <div className="flex min-w-0 flex-col border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-7">
                            <h2 className="mb-2 text-sm font-semibold">Doses today</h2>
                            <DoseStrip doses={today} className="flex-1" />
                        </div>
                    </div>
                </Panel>

                <Panel className="lg:col-span-4" aria-labelledby="mine-title">
                    <PanelHead>
                        <PanelTitle id="mine-title">My insulins</PanelTitle>
                    </PanelHead>
                    {userInsulins.length === 0 ? (
                        <p className="text-sm text-brand-muted">
                            You haven&apos;t added any insulins yet.
                        </p>
                    ) : (
                        <ul className="m-0 list-none p-0">
                            {userInsulins.map((ins) => (
                                <li
                                    key={ins._id}
                                    className="flex items-center gap-3 border-t border-border py-2.5 first:border-t-0 first:pt-0 last:pb-0"
                                >
                                    <KindMark name={ins.name} tall />
                                    <div className="min-w-0 flex-1 leading-[1.35]">
                                        <div className="truncate text-[15px] font-semibold">
                                            {ins.name}
                                        </div>
                                        <div className="text-xs text-brand-muted">
                                            {insulinKind(ins.name) === "basal"
                                                ? "Basal"
                                                : "Bolus"}
                                        </div>
                                    </div>
                                    <strong className="text-[13px] tabular-nums">
                                        {todayByName(ins.name)} IU today
                                    </strong>
                                </li>
                            ))}
                        </ul>
                    )}
                    <Link
                        href="/profile"
                        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-aubergine no-underline"
                    >
                        Manage in Profile
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </Panel>
            </div>

            <div className="mt-4 flex flex-col gap-3 lg:mt-5 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-6 lg:gap-y-4">
                <DataPeriodSelectCard
                    daysOfData={daysOfData}
                    changeDaysOfData={changeDaysOfData}
                />
                {insulinNames.length > 0 && (
                    <TagFilterCard
                        selectedTags={selectedInsulins}
                        onTagsChange={setSelectedInsulins}
                        tags={insulinNames}
                        label="Filter by insulin"
                        title="Insulin"
                    />
                )}
                <TagFilterCard
                    selectedTags={selectedTags}
                    onTagsChange={setSelectedTags}
                />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-5 lg:grid-cols-12 lg:gap-5">
                <Panel className="lg:col-span-12" aria-labelledby="daily-title">
                    <PanelHead>
                        <PanelTitle size="sm" id="daily-title">
                            Daily total
                        </PanelTitle>
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                            <LegendItem swatch={<Swatch className="bg-brand-aubergine" />}>
                                Bolus
                            </LegendItem>
                            <LegendItem swatch={<Swatch className="bg-brand-lavender" />}>
                                Basal
                            </LegendItem>
                            {dailyAverage > 0 && (
                                <LegendItem
                                    swatch={
                                        <span
                                            aria-hidden="true"
                                            className="h-[3px] w-[18px] rounded-sm bg-[repeating-linear-gradient(90deg,var(--color-brand-lavender,#8E78C4)_0_6px,transparent_6px_10px)]"
                                        />
                                    }
                                >
                                    Average {dailyAverage.toFixed(1)} IU a day
                                </LegendItem>
                            )}
                        </div>
                    </PanelHead>
                    <div className="h-[220px]">
                        <InsulinChartRecharts
                            data={filteredInsulinData.map(
                                ({ units, name, createdAt }) => ({
                                    units,
                                    name,
                                    createdAt: new Date(createdAt),
                                })
                            )}
                            fetch={false}
                        />
                    </div>
                </Panel>

                <Panel className="lg:col-span-12" aria-labelledby="doses-title">
                    <PanelHead>
                        <PanelTitle id="doses-title">Doses</PanelTitle>
                        <span className="text-[13px] text-brand-muted">
                            Showing {filteredInsulinData.length} of {insulinData.length}
                        </span>
                    </PanelHead>
                    <DataTableWrap>
                        <DataTable>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Insulin</th>
                                    <th>Units</th>
                                    <th className="hidden lg:table-cell">Tag</th>
                                    <th className={actionsCell}>
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody ref={parent}>
                                {filteredInsulinData.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-8! text-center text-brand-muted"
                                        >
                                            {insulinData.length === 0
                                                ? "No insulin entries found for the selected period."
                                                : "No insulin entries match the selected filters."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredInsulinData.map((entry) => {
                                        const when = dayjs(entry.createdAt);
                                        return (
                                            <tr key={entry._id}>
                                                <td>{when.format("D MMM")}</td>
                                                <td className="tabular-nums text-brand-muted">
                                                    {when.format("HH:mm")}
                                                </td>
                                                <td>
                                                    <span className="inline-flex items-center gap-2">
                                                        <KindMark name={entry.name} />
                                                        {entry.name ?? "--"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Reading
                                                        value={entry.units}
                                                        unit="IU"
                                                        size="xxs"
                                                    />
                                                </td>
                                                <td className="hidden lg:table-cell">
                                                    {entry.tag ? (
                                                        <TagPill>{entry.tag}</TagPill>
                                                    ) : (
                                                        <span className="text-brand-muted">--</span>
                                                    )}
                                                </td>
                                                <td className={actionsCell}>
                                                    <span className="inline-flex items-center gap-1">
                                                        <IconButton
                                                            asChild
                                                            size="sm"
                                                            aria-label="Edit"
                                                        >
                                                            <Link href={`/insulin/${entry._id}`}>
                                                                <Pencil aria-hidden="true" />
                                                            </Link>
                                                        </IconButton>
                                                        <PopUpModal
                                                            delete={() => deleteData(entry._id)}
                                                            title="Delete this dose?"
                                                            description={`${entry.units} IU ${entry.name ?? ""} · ${when.format("D MMM, HH:mm")}`}
                                                        />
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </DataTable>
                    </DataTableWrap>
                </Panel>
            </div>

            <LogEntryCta label="Log dose" onClick={() => logDialog.setOpen(true)} />
            <LogEntryDialog
                open={logDialog.open}
                onOpenChange={logDialog.setOpen}
                title="Log insulin dose"
            >
                <InsulinAdd
                    autoFocus={quickLog}
                    onSaved={() => logDialog.setOpen(false)}
                />
            </LogEntryDialog>
        </>
    );
}
