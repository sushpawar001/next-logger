import type { ReactNode } from "react";
import { Delta } from "@/components/app-ui/data";
import { Panel, PanelHead, PanelSub, PanelTitle } from "@/components/app-ui/layout";
import { DataTable, DataTableWrap } from "@/components/app-ui/table";
import { cn } from "@/lib/utils";

export interface StatRow {
    label: ReactNode;
    current: number | null;
    /** Omit for a metric without a previous period; null means "no data then". */
    previous?: number | null;
    /** Decimal places to show. */
    decimals?: number;
    /** Appended to values, e.g. "%". */
    suffix?: string;
    /** Appended to the change, e.g. " pts" for percentages. */
    changeSuffix?: string;
}

const DASH = "—";

function format(value: number | null | undefined, decimals = 0, suffix = "") {
    if (value === null || value === undefined || !Number.isFinite(value)) return DASH;
    return `${value.toFixed(decimals)}${suffix}`;
}

/**
 * Period-over-period statistics: Metric · Previous · Current · Change.
 * Changes are neutral arrows in muted text — a lower average isn't "good"
 * and a higher one isn't "bad" (brand-guidelines.md, voice).
 */
export function StatsTableCard({
    title,
    subtitle,
    rows,
    metricLabel = "Metric",
    previousLabel = "Previous",
    currentLabel = "Current",
    note,
    className,
}: {
    title: ReactNode;
    subtitle?: ReactNode;
    rows: StatRow[];
    metricLabel?: string;
    previousLabel?: string;
    currentLabel?: string;
    /** Small print under the table, e.g. "All values in kg." */
    note?: ReactNode;
    className?: string;
}) {
    const hasPrevious = rows.some((r) => r.previous !== undefined);

    return (
        <Panel className={className}>
            <PanelHead>
                <div>
                    <PanelTitle>{title}</PanelTitle>
                    {subtitle && <PanelSub>{subtitle}</PanelSub>}
                </div>
            </PanelHead>
            <DataTableWrap>
                <DataTable>
                    <thead>
                        <tr>
                            <th>{metricLabel}</th>
                            {hasPrevious && <th className="text-right!">{previousLabel}</th>}
                            <th className={cn("text-right!", !hasPrevious && "pr-0!")}>
                                {currentLabel}
                            </th>
                            {hasPrevious && <th className="pr-0! text-right!">Change</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => {
                            const decimals = row.decimals ?? 0;
                            const change =
                                row.previous != null && row.current != null
                                    ? Number(
                                          (row.current - row.previous).toFixed(decimals)
                                      )
                                    : null;
                            return (
                                <tr key={i}>
                                    <td>{row.label}</td>
                                    {hasPrevious && (
                                        <td className="text-right tabular-nums text-brand-muted">
                                            {format(row.previous, decimals, row.suffix)}
                                        </td>
                                    )}
                                    <td
                                        className={cn(
                                            "text-right tabular-nums",
                                            !hasPrevious && "pr-0!"
                                        )}
                                    >
                                        <strong>
                                            {format(row.current, decimals, row.suffix)}
                                        </strong>
                                    </td>
                                    {hasPrevious && (
                                        <td className="pr-0! text-right">
                                            {change === null ? (
                                                <span className="text-brand-muted">{DASH}</span>
                                            ) : (
                                                <Delta value={change} diagonal>
                                                    {change > 0 ? "+" : change < 0 ? "−" : ""}
                                                    {Math.abs(change).toFixed(decimals)}
                                                    {row.changeSuffix ?? ""}
                                                </Delta>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </DataTable>
            </DataTableWrap>
            {note && <p className="mt-3 text-xs text-brand-muted">{note}</p>}
        </Panel>
    );
}
