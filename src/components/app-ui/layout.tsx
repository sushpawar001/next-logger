/**
 * Page structure for the (Dashboard) pages, from the A1 "Hero Reading" design
 * (docs/designs/app/pages/assets/fitdose.css). Desktop styles start at `lg`
 * (960px), where the sidebar stops being a drawer.
 */
import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Small uppercase label above readings and section titles. */
export function Eyebrow({
    className,
    ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
    return (
        <span
            className={cn(
                "block text-xs font-semibold uppercase tracking-[0.13em] text-brand-muted",
                className
            )}
            {...props}
        />
    );
}

export function PageHeader({
    eyebrow,
    title,
    subtitle,
    actions,
    breadcrumb,
    className,
}: {
    eyebrow?: ReactNode;
    title: ReactNode;
    subtitle?: ReactNode;
    actions?: ReactNode;
    breadcrumb?: ReactNode;
    className?: string;
}) {
    return (
        <header className={cn("mb-4 lg:mb-6", className)}>
            {breadcrumb && (
                <div className="mb-3 flex items-center gap-2 text-sm text-brand-muted">
                    {breadcrumb}
                </div>
            )}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    {eyebrow && <Eyebrow className="mb-1.5">{eyebrow}</Eyebrow>}
                    <h1 className="text-[26px] font-semibold leading-[1.2] tracking-[-0.013em] text-brand-ink lg:text-[30px]">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="mt-1 text-sm text-brand-muted">
                            {subtitle}
                        </p>
                    )}
                </div>
                {actions && (
                    <div className="flex flex-wrap items-center gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </header>
    );
}

/** The A1 card: white, 16px radius, hairline border. `oat` is the tinted variant. */
export function Panel<T extends ElementType = "section">({
    as,
    tone = "white",
    className,
    ...props
}: {
    as?: T;
    tone?: "white" | "oat";
    className?: string;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className">) {
    const Comp = (as ?? "section") as ElementType;
    return (
        <Comp
            className={cn(
                "min-w-0 rounded-2xl border p-5 lg:p-6",
                tone === "oat"
                    ? "border-brand-oat bg-brand-oat"
                    : "border-border bg-white",
                className
            )}
            {...props}
        />
    );
}

export function PanelHead({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "mb-4 flex flex-wrap items-start justify-between gap-3",
                className
            )}
            {...props}
        />
    );
}

export function PanelTitle({
    className,
    size = "md",
    ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { size?: "sm" | "md" }) {
    return (
        <h2
            className={cn(
                "font-semibold leading-[1.3] text-brand-ink",
                size === "sm" ? "text-base" : "text-lg",
                className
            )}
            {...props}
        />
    );
}

export function PanelSub({
    className,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={cn("mt-0.5 text-[13px] text-brand-muted", className)}
            {...props}
        />
    );
}

/**
 * The page's primary action, pinned to the bottom of the screen below `lg`.
 * Pair it with a desktop copy in the PageHeader marked `hidden lg:inline-flex`.
 */
export function MobileCta({ children }: { children: ReactNode }) {
    return (
        <>
            {/* Keeps the last card clear of the fixed bar. */}
            <div className="h-20 lg:hidden" aria-hidden="true" />
            <div className="fixed inset-x-0 bottom-0 z-20 animate-in slide-in-from-bottom fill-mode-both duration-300 ease-out border-t border-border bg-white px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] lg:hidden">
                {children}
            </div>
        </>
    );
}
