/**
 * The A1 history table: uppercase eyebrow headers, hairline rows, no zebra.
 * Wrap in <DataTableWrap> so it scrolls sideways inside a Panel on phones.
 */
import { cn } from "@/lib/utils";

export function DataTableWrap({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("-mx-5 overflow-x-auto px-5 lg:-mx-6 lg:px-6", className)}
            {...props}
        />
    );
}

export function DataTable({
    className,
    ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
    return (
        <table
            className={cn(
                "w-full border-collapse text-[15px] text-brand-ink",
                // Header cells
                "[&_th]:border-b [&_th]:border-border [&_th]:pt-0 [&_th]:pr-3 [&_th]:pb-3 [&_th]:pl-0 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.13em] [&_th]:whitespace-nowrap [&_th]:text-brand-muted",
                // Body cells
                "[&_td]:border-t [&_td]:border-border [&_td]:py-2.5 [&_td]:pr-3 [&_td]:pl-0 [&_td]:align-middle [&_td]:whitespace-nowrap [&_tbody_tr:first-child_td]:border-t-0",
                // Rows light up under the pointer, so the eye can follow a row to its actions
                "[&_tbody_tr]:transition-colors [&_tbody_tr]:duration-150 [&_tbody_tr:hover]:bg-brand-cream",
                className
            )}
            {...props}
        />
    );
}

/** Right-aligned, shrink-to-fit cell for row actions. */
export const actionsCell = "w-[1%] pr-0! text-right";
