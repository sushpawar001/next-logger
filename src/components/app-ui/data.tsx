/**
 * Readings, status and small data marks for the (Dashboard) pages (A1 design).
 *
 * Status colours are reserved for glucose readings. Everything else — weight
 * change, averages, insulin — stays neutral or brand-coloured, per the "no
 * judgement" rule in brand-guidelines.md.
 */
import type { ReactNode } from "react";
import { ArrowDown, ArrowDownRight, ArrowUp, ArrowUpRight, Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { glucoseStatus, type GlucoseStatus } from "@/helpers/glucoseStatus";

const READING_SIZES = {
    xl: "text-[64px] lg:text-[76px]",
    lg: "text-[48px] lg:text-[56px]",
    md: "text-[40px]",
    sm: "text-[28px]",
    xs: "text-xl",
    xxs: "text-base",
} as const;

/** A number with its unit: large tabular figures, the unit set smaller and muted. */
export function Reading({
    value,
    unit,
    size = "md",
    className,
}: {
    value: ReactNode;
    unit?: ReactNode;
    size?: keyof typeof READING_SIZES;
    className?: string;
}) {
    return (
        <span
            className={cn(
                "flex flex-wrap items-baseline gap-[0.12em] font-semibold leading-none tracking-[-0.02em] tabular-nums text-brand-ink",
                READING_SIZES[size],
                className
            )}
        >
            {value}
            {unit && (
                <span className="ml-[0.12em] text-[max(12px,0.38em)] font-medium tracking-normal text-brand-muted">
                    {unit}
                </span>
            )}
        </span>
    );
}

const STATUS_META: Record<
    GlucoseStatus,
    { label: string; icon: typeof Check; badge: string; text: string; fill: string }
> = {
    in: {
        label: "In range",
        icon: Check,
        badge: "bg-status-in-bg text-status-in",
        text: "text-status-in",
        fill: "bg-status-in",
    },
    high: {
        label: "High",
        icon: ArrowUp,
        badge: "bg-status-high-bg text-status-high",
        text: "text-status-high",
        fill: "bg-status-high",
    },
    // Low is the loudest: a solid badge.
    low: {
        label: "Low",
        icon: ArrowDown,
        badge: "bg-status-low text-brand-cream",
        text: "text-status-low",
        fill: "bg-status-low",
    },
};

/** Never colour alone: every status carries an icon and a label. */
export function StatusBadge({
    status,
    value,
    className,
}: {
    status?: GlucoseStatus;
    /** A glucose reading in mg/dL, classified against the target range. */
    value?: number;
    className?: string;
}) {
    const key = status ?? glucoseStatus(value ?? 0);
    const { label, icon: Icon, badge } = STATUS_META[key];
    return (
        <span
            className={cn(
                "inline-flex h-6 items-center gap-[5px] whitespace-nowrap rounded-xl px-2.5 text-[13px] font-semibold leading-none",
                badge,
                className
            )}
        >
            <Icon className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden="true" />
            {label}
        </span>
    );
}

/**
 * A neutral change: muted text and an arrow, never red or green. `invert`
 * isn't offered on purpose — up is not better or worse.
 */
export function Delta({
    value,
    children,
    diagonal = false,
    className,
}: {
    /** The signed change; only its sign picks the arrow. */
    value: number;
    children: ReactNode;
    /** Diagonal arrows read as a trend over time rather than a step. */
    diagonal?: boolean;
    className?: string;
}) {
    const Icon =
        value > 0
            ? diagonal
                ? ArrowUpRight
                : ArrowUp
            : value < 0
              ? diagonal
                  ? ArrowDownRight
                  : ArrowDown
              : Minus;
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 text-[13px] font-medium tabular-nums text-brand-muted",
                className
            )}
        >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {children}
        </span>
    );
}

/** An entry's tag, as a quiet Oat pill. */
export function TagPill({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <span
            className={cn(
                "inline-flex h-6 items-center whitespace-nowrap rounded-xl bg-brand-oat px-2.5 text-xs font-semibold text-brand-ink",
                className
            )}
        >
            {children}
        </span>
    );
}

/** The low / in / high split as one stacked bar, plus its labelled legend. */
export function TimeInRangeBar({
    split,
    showLegend = true,
    className,
}: {
    split: Record<GlucoseStatus, number>;
    showLegend?: boolean;
    className?: string;
}) {
    const order: GlucoseStatus[] = ["low", "in", "high"];
    return (
        <div className={className}>
            <div className="flex h-2.5 gap-0.5" aria-hidden="true">
                {order.map((k) =>
                    split[k] > 0 ? (
                        <span
                            key={k}
                            className={cn("rounded-[5px]", STATUS_META[k].fill)}
                            style={{ width: `${split[k]}%` }}
                        />
                    ) : null
                )}
            </div>
            {showLegend && (
                <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-semibold">
                    {order.map((k) => {
                        const { icon: Icon, text } = STATUS_META[k];
                        const label = k === "in" ? "In" : STATUS_META[k].label;
                        return (
                            <span key={k} className={cn("inline-flex items-center gap-1", text)}>
                                <Icon className="h-[13px] w-[13px]" strokeWidth={2.8} aria-hidden="true" />
                                {label} {split[k]}%
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/** A labelled horizontal bar, e.g. average per tag. Aubergine: it shows an average, not a status. */
export function HBar({
    label,
    value,
    max,
    display,
}: {
    label: ReactNode;
    value: number;
    max: number;
    display?: ReactNode;
}) {
    const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
    return (
        <div className="grid grid-cols-[96px_minmax(0,1fr)_40px] items-center gap-3 text-[13px] [&+&]:mt-3">
            <span className="truncate">{label}</span>
            <span className="h-3 overflow-hidden rounded-md bg-brand-oat">
                <span
                    className="block h-full rounded-md bg-brand-aubergine"
                    style={{ width: `${pct}%` }}
                />
            </span>
            <strong className="text-right text-sm tabular-nums">
                {display ?? value}
            </strong>
        </div>
    );
}

/** A small label over a reading, used in stat grids. */
export function Stat({
    label,
    children,
    className,
}: {
    label: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("min-w-0", className)}>
            <div className="mb-1.5 text-[13px] text-brand-muted">{label}</div>
            {children}
        </div>
    );
}

/** A round Oat icon holder for list rows. */
export function TypeIcon({ children }: { children: ReactNode }) {
    return (
        <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-brand-oat text-brand-aubergine [&_svg]:h-[18px] [&_svg]:w-[18px]">
            {children}
        </span>
    );
}

/** Legend swatch for a chart series. */
export function LegendItem({
    children,
    swatch,
}: {
    children: ReactNode;
    swatch: ReactNode;
}) {
    return (
        <span className="inline-flex items-center gap-1.5 text-xs text-brand-muted">
            {swatch}
            {children}
        </span>
    );
}
