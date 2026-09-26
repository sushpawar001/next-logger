import dayjs from "dayjs";
import { insulinKind } from "@/helpers/insulinKind";
import { cn } from "@/lib/utils";

type Dose = { _id?: string; name: string; units: number; createdAt: string | Date };

const TICKS = [0, 6, 12, 18, 24];

/**
 * Today's doses on a 24-hour axis: one bar per dose, height by units, bolus
 * Aubergine and basal Lavender. Plain HTML so labels keep their size at any
 * width.
 */
export default function DoseStrip({
    doses,
    className,
}: {
    doses: Dose[];
    className?: string;
}) {
    const max = Math.max(1, ...doses.map((d) => Number(d.units) || 0));
    const label = doses.length
        ? `Doses today: ${doses
              .map(
                  (d) =>
                      `${d.name} ${d.units} IU at ${dayjs(d.createdAt).format("HH:mm")}`
              )
              .join(", ")}`
        : "No doses logged today";

    return (
        <div className={cn("flex min-h-[150px] flex-col", className)} role="img" aria-label={label}>
            <div className="relative flex-1 border-b border-border">
                {doses.length === 0 && (
                    <p className="absolute inset-0 grid place-items-center text-[13px] text-brand-muted">
                        No doses logged today
                    </p>
                )}
                {doses.map((d, i) => {
                    const t = dayjs(d.createdAt);
                    const hour = t.hour() + t.minute() / 60;
                    const units = Number(d.units) || 0;
                    const basal = insulinKind(d.name) === "basal";
                    return (
                        <div
                            key={d._id ?? i}
                            className="absolute bottom-0 flex -translate-x-1/2 flex-col items-center"
                            style={{ left: `${(hour / 24) * 100}%`, height: "100%" }}
                        >
                            <span className="mt-auto mb-1 text-xs font-semibold tabular-nums text-brand-ink">
                                {units}
                            </span>
                            <span
                                className={cn(
                                    "w-2 rounded-t",
                                    basal ? "bg-brand-lavender" : "bg-brand-aubergine"
                                )}
                                style={{ height: `${Math.max(8, (units / max) * 70)}%` }}
                            />
                        </div>
                    );
                })}
            </div>
            <div className="relative mt-1.5 h-4 text-xs text-brand-muted tabular-nums" aria-hidden="true">
                {TICKS.map((h) => (
                    <span
                        key={h}
                        className={cn(
                            "absolute",
                            h === 0 ? "left-0" : h === 24 ? "right-0" : "-translate-x-1/2"
                        )}
                        style={h > 0 && h < 24 ? { left: `${(h / 24) * 100}%` } : undefined}
                    >
                        {String(h).padStart(2, "0")}
                    </span>
                ))}
            </div>
        </div>
    );
}
