/**
 * Small pieces shared by the analysis charts on /charts: a tooltip in the A1
 * card style and a clickable legend entry that shows or hides a series.
 */
import dayjs from "dayjs";
import { CHART, tooltipBoxStyle } from "./chartTheme";

export function ChartTooltip({
    active,
    payload,
    label,
    dateFormat = "D MMM YYYY, HH:mm",
    unit,
}: any & { dateFormat?: string; unit?: string }) {
    if (!active || !payload || payload.length === 0) return null;
    return (
        <div style={tooltipBoxStyle}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>
                {dayjs(label).format(dateFormat)}
            </div>
            {payload
                .filter((item: any) => item.value !== null && item.value !== undefined)
                .map((item: any, idx: number) => (
                    <div
                        key={idx}
                        style={{ color: CHART.muted, fontVariantNumeric: "tabular-nums" }}
                    >
                        {item.name}:{" "}
                        <strong style={{ color: CHART.ink }}>
                            {typeof item.value === "number"
                                ? Math.round(item.value * 10) / 10
                                : item.value}
                            {unit ? ` ${unit}` : ""}
                        </strong>
                    </div>
                ))}
        </div>
    );
}

/**
 * A legend entry that toggles its series. The swatch is a short line so it
 * reads as the series it names; a hidden series fades and is struck through.
 */
export function SeriesToggle({
    label,
    color,
    visible,
    onToggle,
    thick = false,
}: {
    label: string;
    color: string;
    visible: boolean;
    onToggle: () => void;
    thick?: boolean;
}) {
    return (
        <span
            role="button"
            tabIndex={0}
            aria-pressed={visible}
            onClick={onToggle}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggle();
                }
            }}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                userSelect: "none",
                fontSize: 12,
                color: CHART.muted,
                opacity: visible ? 1 : 0.45,
                textDecoration: visible ? "none" : "line-through",
            }}
        >
            <span
                aria-hidden="true"
                style={{
                    display: "inline-block",
                    width: 18,
                    height: thick ? 3 : 2,
                    borderRadius: 2,
                    background: color,
                }}
            />
            {label}
        </span>
    );
}

/** Midnight-aligned ticks between two timestamps, thinned to at most `max`. */
export function dailyTicks(minTime?: number, maxTime?: number, max = 8): number[] {
    if (minTime === undefined || maxTime === undefined) return [];
    const ticks: number[] = [];
    let current = dayjs(minTime).startOf("day").valueOf();
    while (current <= maxTime) {
        if (current >= minTime) ticks.push(current);
        current = dayjs(current).add(1, "day").valueOf();
    }
    if (ticks.length <= max) return ticks;
    const step = Math.ceil(ticks.length / max);
    return ticks.filter((_, i) => i % step === 0);
}
