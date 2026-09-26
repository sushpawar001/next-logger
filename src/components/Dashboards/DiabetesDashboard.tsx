"use client";
/**
 * /dashboard, from docs/designs/app/pages/00b-dashboard-glucose-weight.html:
 * glucose and weight heroes side by side, the glucose trend with this week's
 * summary and a quick log, and today's entries.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { useUser } from "@clerk/nextjs";
import { ArrowRight, Download, Droplets, Loader2, Plus, Syringe, Weight } from "lucide-react";
import type { glucose, insulin, weight } from "@/types/models";
import { useEntries } from "@/hooks/queries/useEntries";
import { EMPTY_ROWS } from "@/lib/query/keys";
import { timeInRange } from "@/helpers/glucoseStatus";
import DataPeriodSelectCard from "@/components/DataPeriodSelectCard";
import { Eyebrow, MobileCta, PageHeader, Panel, PanelHead, PanelSub, PanelTitle } from "@/components/app-ui/layout";
import { Delta, LegendItem, Reading, StatusBadge, TimeInRangeBar, TypeIcon } from "@/components/app-ui/data";
import { AppButton } from "@/components/app-ui/controls";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CHART } from "@/components/Charts/RechartComponents/chartTheme";
import { GlucoseLineChart, WeightTrendChart } from "./DashboardCharts";
import QuickLog from "./QuickLog";
import {
    average,
    estimateHba1c,
    greeting,
    isSameLocalDay,
    latest,
    relativeFromNow,
    timeOf,
    todayEntries,
    toLocal,
    unitsByName,
} from "./dashboardData";

// 7 days is every list page's default, so /glucose and /insulin open from cache.
const WEEK = 7;
// Weight is a trend, not a verdict: 7 days of it is mostly noise.
const WEIGHT_DAYS = 30;
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const fmt = (n: number, digits = 0) =>
    Number.isInteger(n) || digits === 0 ? String(Math.round(n)) : n.toFixed(digits);

function ChartLoading() {
    return (
        <div className="grid h-full place-items-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand-muted" aria-label="Loading" />
        </div>
    );
}

function CardLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-aubergine no-underline"
        >
            {children}
            <ArrowRight className="icon-nudge h-3.5 w-3.5" aria-hidden="true" />
        </Link>
    );
}

function GlucoseHero({ rows, isPending }: { rows: readonly glucose[]; isPending: boolean }) {
    const last = latest(rows);
    // Stable for the render: the chart domain is today, midnight to midnight.
    const [now] = useState(() => Date.now());
    const dayStart = toLocal(now).startOf("day").valueOf();
    const hours = [0, 6, 12, 18, 24].map((h) => dayStart + h * HOUR);

    return (
        <Panel aria-labelledby="g-label" className="lg:col-span-6">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <Eyebrow id="g-label">Latest glucose</Eyebrow>
                    {last ? (
                        <Reading value={fmt(last.value)} unit="mg/dL" size="lg" className="mt-3" />
                    ) : (
                        <p className="mt-3 text-sm text-brand-muted">
                            {isPending ? "Loading…" : "No readings in the last 7 days."}
                        </p>
                    )}
                </div>
                {last && (
                    <div className="flex flex-col items-end gap-2">
                        <StatusBadge value={last.value} />
                        <span className="text-[13px] text-brand-muted">
                            {[last.tag, relativeFromNow(last.createdAt)].filter(Boolean).join(" · ")}
                        </span>
                    </div>
                )}
            </div>
            <div className="mt-2 mb-1 flex items-baseline justify-between">
                <span className="text-[13px] font-semibold">Today</span>
                <CardLink href="/glucose">Glucose log</CardLink>
            </div>
            <div className="h-[180px]" aria-label="Today's glucose readings">
                {isPending ? (
                    <ChartLoading />
                ) : (
                    <GlucoseLineChart
                        rows={rows}
                        domain={[dayStart, dayStart + DAY]}
                        ticks={hours}
                        tickFormat={(t) => toLocal(t).format("HH")}
                        now={now}
                    />
                )}
            </div>
        </Panel>
    );
}

function WeightHero({ rows, isPending }: { rows: readonly weight[]; isPending: boolean }) {
    const last = latest(rows);
    const first = useMemo(() => {
        let oldest: weight | undefined;
        for (const r of rows) {
            if (r.createdAt && (!oldest || +new Date(r.createdAt) < +new Date(oldest.createdAt!))) oldest = r;
        }
        return oldest;
    }, [rows]);
    const change = last && first && last !== first ? Number(last.value) - Number(first.value) : null;

    return (
        <Panel aria-labelledby="w-label" className="lg:col-span-6">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <Eyebrow id="w-label">Current weight</Eyebrow>
                    {last ? (
                        <Reading value={fmt(Number(last.value), 1)} unit="kg" size="lg" className="mt-3" />
                    ) : (
                        <p className="mt-3 text-sm text-brand-muted">
                            {isPending ? "Loading…" : "No weigh-ins in the last 30 days."}
                        </p>
                    )}
                </div>
                {last && (
                    <div className="flex flex-col items-end gap-2">
                        {/* Neutral change: muted arrow, never red or green. */}
                        {change !== null && (
                            <Delta value={change} diagonal className="text-sm">
                                {change === 0
                                    ? "No change in 30 days"
                                    : `${Math.abs(change).toFixed(1)} kg in 30 days`}
                            </Delta>
                        )}
                        <span className="text-[13px] text-brand-muted">
                            {[last.tag, toLocal(last.createdAt).format("D MMM, HH:mm")].filter(Boolean).join(" · ")}
                        </span>
                    </div>
                )}
            </div>
            <div className="mt-2 mb-1 flex items-baseline justify-between gap-3">
                <span className="flex flex-wrap gap-x-4 gap-y-1">
                    <LegendItem swatch={<span className="h-[3px] w-[18px] rounded-sm" style={{ background: CHART.lavender }} />}>
                        7-day average
                    </LegendItem>
                    <LegendItem swatch={<span className="h-2 w-2 rounded-full border-[1.5px] border-brand-aubergine" />}>
                        Weigh-in
                    </LegendItem>
                </span>
                <CardLink href="/weight">Weight log</CardLink>
            </div>
            <div className="h-[180px]" aria-label="Weight over the last 30 days">
                {isPending ? <ChartLoading /> : <WeightTrendChart rows={rows} />}
            </div>
        </Panel>
    );
}

function GlucoseTrendCard() {
    const [days, setDays] = useState(WEEK);
    const { data = EMPTY_ROWS as glucose[], isPending } = useEntries<glucose>("glucose", days);
    const [now] = useState(() => Date.now());
    const start = toLocal(now).startOf("day").subtract(days - 1, "day").valueOf();
    const end = toLocal(now).endOf("day").valueOf();
    const step = days <= 7 ? 1 : days <= 14 ? 2 : days <= 30 ? 7 : 14;
    const ticks: number[] = [];
    for (let t = start; t <= end; t += step * DAY) ticks.push(t + DAY / 2);

    return (
        <Panel aria-labelledby="g-trend-title">
            <PanelHead>
                <div>
                    <PanelTitle id="g-trend-title">Glucose · last {days} days</PanelTitle>
                    <PanelSub>Target range 70–180 mg/dL</PanelSub>
                </div>
                <DataPeriodSelectCard
                    daysOfData={days}
                    changeDaysOfData={(e) => setDays(parseInt(e.target.value))}
                    periods={[7, 14, 30, 90]}
                    short
                />
            </PanelHead>
            <div className="h-[220px]" aria-label={`Glucose over the last ${days} days`}>
                {isPending ? (
                    <ChartLoading />
                ) : (
                    <GlucoseLineChart
                        rows={data}
                        domain={[start, end]}
                        ticks={ticks}
                        tickFormat={(t) => toLocal(t).format(days <= 7 ? "ddd" : "D MMM")}
                        dotRadius={days > 14 ? 2.5 : 3.5}
                    />
                )}
            </div>
        </Panel>
    );
}

function StatStrip({ glucoseRows, todayInsulin }: { glucoseRows: readonly glucose[]; todayInsulin: insulin[] }) {
    const values = glucoseRows.map((g) => Number(g.value));
    const split = timeInRange(values);
    const avg = average(values);
    const insulinTotal = todayInsulin.reduce((a, b) => a + Number(b.units), 0);
    const byName = unitsByName(todayInsulin);

    return (
        <Panel
            aria-label="This week"
            className="grid grid-cols-2 p-0! lg:grid-cols-[1.4fr_1fr_1fr] [&>div]:min-w-0 [&>div]:px-5 [&>div]:py-4 lg:[&>div]:px-6 lg:[&>div]:py-5"
        >
            <div className="col-span-2 lg:col-span-1">
                <Eyebrow>Time in range · 7 days</Eyebrow>
                {values.length ? (
                    <>
                        <div className="mt-2 flex items-center gap-3.5">
                            <Reading value={`${split.in}%`} size="sm" />
                            <TimeInRangeBar split={split} showLegend={false} className="flex-1" />
                        </div>
                        {/* Legend only: the bar sits beside the percentage above. */}
                        <TimeInRangeBar split={split} className="[&>div:first-child]:hidden" />
                    </>
                ) : (
                    <p className="mt-2 text-[13px] text-brand-muted">No readings yet.</p>
                )}
            </div>
            <div className="border-t border-border lg:border-t-0 lg:border-l">
                <Eyebrow>Insulin today</Eyebrow>
                <Reading value={fmt(insulinTotal, 1)} unit="IU" size="sm" className="mt-2" />
                <p className="mt-2 truncate text-xs text-brand-muted">
                    {byName.length
                        ? byName.map(([name, u]) => `${name} ${fmt(u, 1)}`).join(" · ")
                        : "No doses logged"}
                </p>
            </div>
            <div className="border-t border-l border-border lg:border-t-0">
                <Eyebrow>7-day average</Eyebrow>
                {avg !== null ? (
                    <>
                        <Reading value={fmt(avg)} unit="mg/dL" size="sm" className="mt-2" />
                        <Link
                            href="/stats"
                            className="mt-2 inline-block text-xs font-semibold text-brand-aubergine no-underline"
                        >
                            Est. HbA1c {estimateHba1c(avg)}%
                        </Link>
                    </>
                ) : (
                    <p className="mt-2 text-[13px] text-brand-muted">No readings yet.</p>
                )}
            </div>
        </Panel>
    );
}

const KIND_ICON = { glucose: Droplets, insulin: Syringe, weight: Weight } as const;
const KIND_UNIT = { glucose: "mg/dL", insulin: "IU", weight: "kg" } as const;

function TodayList({ items, isPending }: { items: ReturnType<typeof todayEntries>; isPending: boolean }) {
    return (
        <Panel aria-labelledby="today-title" className="lg:col-span-4">
            <PanelHead>
                <div className="flex items-baseline gap-2.5">
                    <PanelTitle id="today-title">Today</PanelTitle>
                    <span className="text-[13px] text-brand-muted">
                        {items.length} {items.length === 1 ? "entry" : "entries"}
                    </span>
                </div>
            </PanelHead>
            {items.length === 0 ? (
                <p className="text-sm text-brand-muted">
                    {isPending ? "Loading…" : "Nothing logged yet today."}
                </p>
            ) : (
                <ul className="m-0 list-none p-0">
                    {items.map((item) => {
                        const Icon = KIND_ICON[item.kind];
                        const sub = [item.name, item.tag, timeOf(item.at)].filter(Boolean).join(" · ");
                        return (
                            <li
                                key={`${item.kind}-${item.id}`}
                                className="flex items-center gap-3 border-t border-border py-2.5 first:border-t-0 first:pt-0 last:pb-0"
                            >
                                <TypeIcon>
                                    <Icon aria-hidden="true" />
                                </TypeIcon>
                                <div className="min-w-0 flex-1 leading-[1.35]">
                                    <div className="text-[15px] font-semibold tabular-nums">
                                        {fmt(item.value, 1)} {KIND_UNIT[item.kind]}
                                    </div>
                                    <div className="truncate text-xs text-brand-muted">{sub}</div>
                                </div>
                                {item.kind === "glucose" && <StatusBadge value={item.value} />}
                            </li>
                        );
                    })}
                </ul>
            )}
        </Panel>
    );
}

function LogEntryChooser() {
    const [open, setOpen] = useState(false);
    const choices = [
        { href: "/glucose?quick=1", label: "Glucose", icon: Droplets },
        { href: "/insulin?quick=1", label: "Insulin", icon: Syringe },
        { href: "/weight?quick=1", label: "Weight", icon: Weight },
    ];
    return (
        <>
            <MobileCta>
                <AppButton size="lg" block onClick={() => setOpen(true)}>
                    <Plus className="icon-spin" aria-hidden="true" />
                    Log entry
                </AppButton>
            </MobileCta>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent aria-describedby={undefined}>
                    <div className="p-6">
                        <DialogTitle className="mb-4 pr-8">What would you like to log?</DialogTitle>
                        <ul className="m-0 grid list-none gap-2 p-0">
                            {choices.map(({ href, label, icon: Icon }) => (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        className="flex h-12 items-center gap-3 rounded-lg border border-border px-4 font-semibold text-brand-ink no-underline hover:bg-brand-cream"
                                    >
                                        <TypeIcon>
                                            <Icon aria-hidden="true" />
                                        </TypeIcon>
                                        {label}
                                        <ArrowRight className="icon-nudge ml-auto h-4 w-4 text-brand-muted" aria-hidden="true" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function DiabetesDashboard() {
    const { user } = useUser();
    const glucoseQuery = useEntries<glucose>("glucose", WEEK);
    const insulinQuery = useEntries<insulin>("insulin", WEEK);
    const weightQuery = useEntries<weight>("weight", WEIGHT_DAYS);

    const glucoseRows = glucoseQuery.data ?? (EMPTY_ROWS as glucose[]);
    const insulinRows = insulinQuery.data ?? (EMPTY_ROWS as insulin[]);
    const weightRows = weightQuery.data ?? (EMPTY_ROWS as weight[]);

    const today = useMemo(
        () => todayEntries({ glucose: glucoseRows, insulin: insulinRows as any, weight: weightRows }),
        [glucoseRows, insulinRows, weightRows]
    );
    const todayInsulin = useMemo(
        () => insulinRows.filter((r) => r.createdAt && isSameLocalDay(r.createdAt)),
        [insulinRows]
    );
    const lastInsulin = latest(insulinRows)?.name;

    const now = dayjs();
    const name = user?.firstName;
    const anyPending = glucoseQuery.isPending || insulinQuery.isPending || weightQuery.isPending;

    return (
        <>
            <PageHeader
                eyebrow={now.format("dddd, D MMMM")}
                title={name ? `${greeting(now)}, ${name}` : greeting(now)}
                actions={
                    <AppButton variant="secondary" asChild className="hidden lg:inline-flex">
                        <Link href="/profile">
                            <Download aria-hidden="true" />
                            Export
                        </Link>
                    </AppButton>
                }
            />

            {(glucoseQuery.isError || weightQuery.isError || insulinQuery.isError) && (
                <p role="alert" className="mb-4 rounded-lg bg-status-low-bg px-4 py-3 text-sm text-status-low">
                    Some of your data failed to load. Please try again later.
                </p>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
                <GlucoseHero rows={glucoseRows} isPending={glucoseQuery.isPending} />
                <WeightHero rows={weightRows} isPending={weightQuery.isPending} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-5 lg:grid-cols-12 lg:gap-5">
                <div className="flex min-w-0 flex-col gap-4 lg:col-span-8 lg:gap-5">
                    <GlucoseTrendCard />
                    <StatStrip glucoseRows={glucoseRows} todayInsulin={todayInsulin} />
                    <QuickLog lastInsulin={lastInsulin} className="hidden lg:block" />
                </div>
                <TodayList items={today} isPending={anyPending} />
            </div>

            <LogEntryChooser />
        </>
    );
}
