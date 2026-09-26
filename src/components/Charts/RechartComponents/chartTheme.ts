/**
 * Recharts styling for the A1 design (docs/designs/app/pages/assets/charts.js).
 *
 * - The glucose target band is shaded Oat; only points outside it take a
 *   status colour.
 * - Bolus is always Aubergine and basal always Lavender.
 * - Weight's 7-day average is the Lavender main line; single weigh-ins sit
 *   behind it as a thin Aubergine line with small dots.
 */
import { glucoseStatus } from "@/helpers/glucoseStatus";

export const CHART = {
    ink: "#241A33",
    aubergine: "#4A3470",
    lavender: "#8E78C4",
    oat: "#E8DFD0",
    cream: "#FAF7F2",
    muted: "#6E5A99",
    grid: "#E8DFD0",
    border: "#DDD3C2",
    in: "#2E7D5B",
    high: "#9A6412",
    low: "#C0392B",
    bolus: "#4A3470",
    basal: "#8E78C4",
} as const;

/** Series colours when there is no semantic mapping (e.g. several insulin types). */
export const SERIES = [CHART.aubergine, CHART.lavender, CHART.ink, "#B9A9DC", "#6E5A99"];

export const axisProps = {
    axisLine: false,
    tickLine: false,
    tick: { fontSize: 12, fill: CHART.muted },
    tickMargin: 8,
} as const;

export const gridProps = {
    stroke: CHART.grid,
    strokeDasharray: "0",
    vertical: false,
} as const;

export const tooltipBoxStyle = {
    background: "#FFFFFF",
    border: `1px solid ${CHART.border}`,
    borderRadius: 8,
    padding: "8px 12px",
    boxShadow: "0 4px 12px rgb(36 26 51 / 10%)",
    fontSize: 13,
    color: CHART.ink,
} as const;

/** Dot colour for a glucose reading: in-range points stay Aubergine. */
export function statusColor(value: number) {
    const status = glucoseStatus(value);
    return status === "in" ? CHART.aubergine : CHART[status];
}
