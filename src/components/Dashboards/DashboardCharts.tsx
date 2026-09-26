"use client";
/**
 * Dashboard-only charts, drawn to the A1 design
 * (docs/designs/app/pages/assets/charts.js): the glucose line over an Oat
 * target band, and weight as a 7-day average over single weigh-ins.
 */
import {
    ComposedChart,
    Line,
    ReferenceArea,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { GLUCOSE_TARGET } from "@/constants/constants";
import { glucoseStatus } from "@/helpers/glucoseStatus";
import {
    CHART,
    axisProps,
    tooltipBoxStyle,
} from "@/components/Charts/RechartComponents/chartTheme";
import { toLocal, weightTrend } from "./dashboardData";

type GlucosePoint = { t: number; value: number };

function GlucoseDot(props: any) {
    const { cx, cy, payload, r = 3.5 } = props;
    if (cx == null || cy == null || payload?.value == null) return null;
    const status = glucoseStatus(payload.value);
    if (status === "in") {
        return <circle cx={cx} cy={cy} r={r} fill="#FFFFFF" stroke={CHART.aubergine} strokeWidth={2} />;
    }
    return <circle cx={cx} cy={cy} r={r + 1.5} fill={CHART[status]} stroke="#FFFFFF" strokeWidth={2} />;
}

function GlucoseTip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const p: GlucosePoint = payload[0].payload;
    return (
        <div style={tooltipBoxStyle}>
            <div style={{ fontWeight: 600 }}>{p.value} mg/dL</div>
            <div style={{ color: CHART.muted }}>{toLocal(p.t).format("D MMM, HH:mm")}</div>
        </div>
    );
}

/**
 * Glucose readings on a time axis. In-range points are hollow Aubergine;
 * only lows and highs take a status colour.
 */
export function GlucoseLineChart({
    rows,
    domain,
    ticks,
    tickFormat,
    now,
    dotRadius = 3.5,
}: {
    rows: readonly { value: number; createdAt?: string | Date | number }[];
    domain: [number, number];
    ticks: number[];
    tickFormat: (t: number) => string;
    /** Draws a dashed "now" marker. */
    now?: number;
    dotRadius?: number;
}) {
    const data: GlucosePoint[] = rows
        .filter((r) => r.createdAt)
        .map((r) => ({ t: +new Date(r.createdAt!), value: Number(r.value) }))
        .filter((p) => p.t >= domain[0] && p.t <= domain[1])
        .sort((a, b) => a.t - b.t);
    const yMax = Math.max(260, ...data.map((p) => p.value + 20));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: 0 }}>
                <ReferenceArea
                    y1={GLUCOSE_TARGET.low}
                    y2={GLUCOSE_TARGET.high}
                    fill={CHART.oat}
                    fillOpacity={0.6}
                    stroke="none"
                />
                <XAxis
                    dataKey="t"
                    type="number"
                    domain={domain}
                    ticks={ticks}
                    tickFormatter={tickFormat}
                    {...axisProps}
                />
                <YAxis
                    domain={[30, yMax]}
                    ticks={[GLUCOSE_TARGET.low, GLUCOSE_TARGET.high]}
                    width={36}
                    {...axisProps}
                />
                {[GLUCOSE_TARGET.low, GLUCOSE_TARGET.high].map((y) => (
                    <ReferenceLine key={y} y={y} stroke={CHART.border} strokeDasharray="4 4" />
                ))}
                {now != null && (
                    <ReferenceLine
                        x={now}
                        stroke={CHART.muted}
                        strokeDasharray="3 4"
                        label={{ value: "now", position: "top", fill: CHART.muted, fontSize: 11 }}
                    />
                )}
                <Tooltip content={<GlucoseTip />} cursor={{ stroke: CHART.border }} />
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke={CHART.aubergine}
                    strokeWidth={2.5}
                    dot={<GlucoseDot r={dotRadius} />}
                    activeDot={false}
                    isAnimationActive={false}
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
}

function WeightTip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return (
        <div style={tooltipBoxStyle}>
            <div style={{ fontWeight: 600 }}>{p.value} kg</div>
            <div style={{ color: CHART.muted }}>7-day average {p.avg} kg</div>
            <div style={{ color: CHART.muted }}>{toLocal(p.t).format("D MMM, HH:mm")}</div>
        </div>
    );
}

/** Lavender 7-day average on top; single weigh-ins as a thin line with small dots behind it. */
export function WeightTrendChart({
    rows,
}: {
    rows: readonly { value: number; createdAt?: string | Date | number }[];
}) {
    const data = weightTrend(rows);
    const values = data.flatMap((p) => [p.value, p.avg]);
    const lo = values.length ? Math.floor(Math.min(...values) - 0.5) : 0;
    const hi = values.length ? Math.ceil(Math.max(...values) + 0.5) : 1;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: 0 }}>
                <XAxis
                    dataKey="t"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    tickFormatter={(t) => toLocal(t).format("D MMM")}
                    minTickGap={24}
                    {...axisProps}
                />
                <YAxis domain={[lo, hi]} width={36} tickCount={3} allowDecimals={false} {...axisProps} />
                <Tooltip content={<WeightTip />} cursor={{ stroke: CHART.border }} />
                <Line
                    type="linear"
                    dataKey="value"
                    stroke={CHART.aubergine}
                    strokeOpacity={0.35}
                    strokeWidth={1}
                    dot={{ r: 2.5, fill: "#FFFFFF", stroke: CHART.aubergine, strokeWidth: 1.5 }}
                    activeDot={false}
                    isAnimationActive={false}
                />
                <Line
                    type="monotone"
                    dataKey="avg"
                    stroke={CHART.lavender}
                    strokeWidth={3}
                    dot={false}
                    activeDot={false}
                    isAnimationActive={false}
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
}
