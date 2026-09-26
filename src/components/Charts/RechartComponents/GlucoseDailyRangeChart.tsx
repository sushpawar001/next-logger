import { useMemo } from "react";
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Line,
    ReferenceArea,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import dayjs from "dayjs";
import { GLUCOSE_TARGET } from "@/constants/constants";
import { dailyRanges } from "@/helpers/statsHelpers";
import { CHART, axisProps, gridProps, tooltipBoxStyle } from "./chartTheme";

/** A dot drawn only where the series has a value (days with a high or low). */
const StatusDot =
    (fill: string) =>
    // eslint-disable-next-line react/display-name
    (props: any) => {
        const { cx, cy, value, index } = props;
        if (cx == null || cy == null || value == null) return <g key={index} />;
        return (
            <circle
                key={index}
                cx={cx}
                cy={cy}
                r={4}
                fill={fill}
                stroke="#FFFFFF"
                strokeWidth={1.5}
            />
        );
    };

const RangeTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div style={tooltipBoxStyle}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>
                {dayjs(d.day).format("ddd D MMM")}
            </div>
            <div style={{ color: CHART.muted, fontVariantNumeric: "tabular-nums" }}>
                Average <strong style={{ color: CHART.ink }}>{Math.round(d.avg)}</strong>
                {" · "}
                {d.min}–{d.max} mg/dL
            </div>
            <div style={{ color: CHART.muted }}>
                {d.count} {d.count === 1 ? "reading" : "readings"}
            </div>
        </div>
    );
};

/**
 * One bar per day from the lowest to the highest reading, with a dot for the
 * average. Days that went above or below the target range get a status dot
 * at that end; everything else stays in brand colours.
 */
export default function GlucoseDailyRangeChart({
    data,
}: {
    data: { createdAt?: string | number | Date; value: number }[];
}) {
    const chartData = useMemo(
        () =>
            dailyRanges(data).map((r) => ({
                ...r,
                label: dayjs(r.day).format("D MMM"),
                range: [r.min, r.max],
                highDot: r.max > GLUCOSE_TARGET.high ? r.max : null,
                lowDot: r.min < GLUCOSE_TARGET.low ? r.min : null,
            })),
        [data]
    );

    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
                <CartesianGrid {...gridProps} />
                <ReferenceArea
                    y1={GLUCOSE_TARGET.low}
                    y2={GLUCOSE_TARGET.high}
                    fill={CHART.oat}
                    fillOpacity={0.6}
                    ifOverflow="extendDomain"
                />
                <XAxis {...axisProps} dataKey="label" minTickGap={12} />
                <YAxis {...axisProps} width={36} domain={[40, "auto"]} />
                <Tooltip content={<RangeTooltip />} cursor={{ fill: CHART.cream }} />
                <Bar
                    dataKey="range"
                    name="Range"
                    fill={CHART.lavender}
                    fillOpacity={0.45}
                    radius={9}
                    maxBarSize={18}
                    isAnimationActive={false}
                />
                <Line
                    dataKey="avg"
                    name="Average"
                    stroke="none"
                    dot={{ r: 4.5, fill: CHART.aubergine, stroke: CHART.aubergine }}
                    activeDot={false}
                    isAnimationActive={false}
                />
                <Line
                    dataKey="highDot"
                    name="High"
                    stroke="none"
                    dot={StatusDot(CHART.high)}
                    activeDot={false}
                    isAnimationActive={false}
                />
                <Line
                    dataKey="lowDot"
                    name="Low"
                    stroke="none"
                    dot={StatusDot(CHART.low)}
                    activeDot={false}
                    isAnimationActive={false}
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
}
