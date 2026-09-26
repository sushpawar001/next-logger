"use client";
import { Segmented } from "@/components/app-ui/controls";

/** "All" is a very large window rather than a separate endpoint. */
export const ALL_DAYS = 365 * 100;

const PERIODS = [
    { value: 7, label: "7 days", short: "7d" },
    { value: 14, label: "14 days", short: "14d" },
    { value: 30, label: "30 days", short: "30d" },
    { value: 90, label: "90 days", short: "90d" },
    { value: 365, label: "1 year", short: "1y" },
    { value: ALL_DAYS, label: "All", short: "All" },
] as const;

/**
 * The period selector shared by every (Dashboard) page, as a segmented
 * control. The callback still receives an event-shaped object so callers can
 * keep their `parseInt(event.target.value)` handlers.
 */
export default function DataPeriodSelectCard({
    daysOfData,
    changeDaysOfData,
    className = "",
    periods,
    short = false,
}: {
    daysOfData: number;
    changeDaysOfData: (event: { target: { value: string } }) => void;
    className?: string;
    /** Limit the choices, e.g. `[7, 14, 30, 90]` on a dashboard card. */
    periods?: readonly number[];
    /** Compact labels ("7d") for use inside a card header. */
    short?: boolean;
}) {
    const options = PERIODS.filter(
        (p) => !periods || periods.includes(p.value)
    ).map((p) => ({ value: p.value as number, label: short ? p.short : p.label }));

    return (
        <Segmented
            label="Period"
            options={options}
            value={daysOfData}
            onChange={(value) => changeDaysOfData({ target: { value: String(value) } })}
            className={className}
        />
    );
}
