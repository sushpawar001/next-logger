"use client";
/**
 * Buttons, segmented controls, chips and form fields for the (Dashboard)
 * pages (A1 design, docs/designs/app/pages/assets/fitdose.css).
 */
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronDown } from "lucide-react";
import { MotionConfig, motion } from "motion/react";
import { cn } from "@/lib/utils";

export const appButton = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-transparent text-sm font-semibold no-underline transition duration-150 ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-lavender disabled:pointer-events-none disabled:opacity-60 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                primary:
                    "bg-brand-aubergine text-brand-cream hover:bg-brand-aubergine-hover hover:shadow-[0_6px_16px_-6px_rgb(74_52_112/55%)]",
                secondary: "bg-brand-oat text-brand-ink hover:bg-[#DED3C1]",
                outline:
                    "border-border bg-white text-brand-ink hover:bg-brand-cream",
                "danger-outline":
                    "border-border bg-white text-status-low hover:bg-status-low-bg",
                danger: "bg-status-low text-brand-cream hover:bg-status-low/90",
                ghost: "text-brand-muted hover:bg-brand-cream hover:text-brand-ink",
            },
            size: {
                md: "h-10 px-4",
                lg: "h-12 px-5 text-[15px]",
                field: "h-11 px-4",
            },
            block: { true: "w-full" },
        },
        defaultVariants: { variant: "primary", size: "md" },
    }
);

export interface AppButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof appButton> {
    asChild?: boolean;
}

export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
    ({ className, variant, size, block, asChild = false, type, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                ref={ref}
                className={cn(appButton({ variant, size, block }), className)}
                // A bare <button> inside a form submits it; make that explicit.
                {...(asChild ? {} : { type: type ?? "button" })}
                {...props}
            />
        );
    }
);
AppButton.displayName = "AppButton";

export const iconButton = cva(
    "inline-grid place-items-center rounded-lg border-0 bg-transparent transition duration-150 ease-out active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-lavender disabled:opacity-50 [&_svg]:h-4 [&_svg]:w-4",
    {
        variants: {
            tone: {
                default: "text-brand-muted hover:bg-brand-cream hover:text-brand-ink",
                danger: "text-status-low hover:bg-status-low-bg",
            },
            size: { md: "h-10 w-10", sm: "h-[34px] w-[34px]" },
        },
        defaultVariants: { tone: "default", size: "md" },
    }
);

/** Requires an accessible name: pass `aria-label`. */
export const IconButton = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> &
        VariantProps<typeof iconButton> & { asChild?: boolean; "aria-label": string }
>(({ className, tone, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
        <Comp
            ref={ref}
            className={cn(iconButton({ tone, size }), className)}
            {...(asChild ? {} : { type: type ?? "button" })}
            {...props}
        />
    );
});
IconButton.displayName = "IconButton";

export type SegmentOption<V extends string | number> = {
    value: V;
    label: React.ReactNode;
};

/**
 * One choice from a few, as toggle buttons (aria-pressed) on an Oat track.
 * Scrolls sideways rather than wrapping when space runs out.
 */
export function Segmented<V extends string | number>({
    options,
    value,
    onChange,
    label,
    size = "md",
    fill = false,
    className,
}: {
    options: readonly SegmentOption<V>[];
    value: V;
    onChange: (value: V) => void;
    /** Accessible name for the group. */
    label: string;
    size?: "md" | "lg";
    fill?: boolean;
    className?: string;
}) {
    // Scopes the sliding pill to this control, so two on a page don't swap pills.
    const pillId = `segment-pill-${React.useId()}`;
    return (
        <div
            role="group"
            aria-label={label}
            className={cn(
                "max-w-full overflow-x-auto rounded-lg bg-brand-oat p-1 [scrollbar-width:none]",
                fill ? "flex" : "inline-flex",
                className
            )}
        >
            <MotionConfig reducedMotion="user">
                {options.map((o) => {
                    const active = o.value === value;
                    return (
                        <button
                            key={String(o.value)}
                            type="button"
                            aria-pressed={active}
                            onClick={() => onChange(o.value)}
                            className={cn(
                                "relative flex-none whitespace-nowrap rounded-md border-0 bg-transparent text-[13px] font-semibold transition-colors duration-200 active:scale-95",
                                size === "lg" ? "h-8 px-[18px]" : "h-7 px-3.5",
                                fill && "flex-1",
                                active
                                    ? "text-brand-aubergine"
                                    : "text-brand-ink hover:text-brand-aubergine"
                            )}
                        >
                            {/* The white pill slides between options rather than jumping. */}
                            {active && (
                                <motion.span
                                    layoutId={pillId}
                                    aria-hidden="true"
                                    className="absolute inset-0 rounded-md bg-white shadow-[0_1px_2px_rgb(36_26_51/8%)]"
                                    transition={{ type: "spring", bounce: 0.18, duration: 0.4 }}
                                />
                            )}
                            <span className="relative">{o.label}</span>
                        </button>
                    );
                })}
            </MotionConfig>
        </div>
    );
}

/** A toggle chip. Pressed chips turn Oat and show a check. */
export const Chip = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
        pressed: boolean;
        /** Rendered before the label, e.g. an insulin colour dot. */
        leading?: React.ReactNode;
        /** Single-choice groups use radio semantics instead of aria-pressed. */
        radio?: boolean;
    }
>(({ pressed, leading, radio = false, className, children, type, ...props }, ref) => (
    <button
        ref={ref}
        type={type ?? "button"}
        {...(radio
            ? { role: "radio", "aria-checked": pressed }
            : { "aria-pressed": pressed })}
        className={cn(
            "inline-flex h-8 flex-none items-center gap-1.5 whitespace-nowrap rounded-2xl border px-3.5 text-[13px] font-semibold transition duration-150 ease-out active:scale-95",
            pressed
                ? "border-brand-oat bg-brand-oat text-brand-aubergine"
                : "border-border bg-white text-brand-ink hover:bg-brand-cream",
            className
        )}
        {...props}
    >
        {pressed && (
            <Check className="-ml-0.5 h-4 w-4 animate-pop" strokeWidth={2.4} aria-hidden="true" />
        )}
        {leading}
        {children}
    </button>
));
Chip.displayName = "Chip";

/** A coloured dot for chips and legends (insulin types, series). */
export function Dot({ className, color }: { className?: string; color?: string }) {
    return (
        <span
            className={cn("h-2 w-2 flex-none rounded-full", className)}
            style={color ? { background: color } : undefined}
            aria-hidden="true"
        />
    );
}

export function Field({
    label,
    htmlFor,
    help,
    className,
    children,
}: {
    label: React.ReactNode;
    htmlFor?: string;
    help?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={cn("min-w-0", className)}>
            <label
                htmlFor={htmlFor}
                className="mb-1.5 block text-[13px] font-semibold text-brand-ink"
            >
                {label}
            </label>
            {children}
            {help && <p className="mt-1.5 text-[13px] text-brand-muted">{help}</p>}
        </div>
    );
}

/** The bordered box around an input: carries the focus ring, icons and suffix. */
export const inputShell =
    "flex h-11 items-center gap-2.5 rounded-lg border border-border bg-white px-3.5 text-brand-muted transition-[border-color,box-shadow] duration-150 hover:border-brand-lavender/50 focus-within:border-brand-lavender focus-within:shadow-[0_0_0_1px_var(--color-brand-lavender,#8E78C4)]";

/** The bare control inside `inputShell`. */
export const inputControl =
    "h-full min-w-0 flex-1 appearance-none border-0 bg-transparent! text-base font-medium tabular-nums text-brand-ink outline-hidden placeholder:text-brand-muted/70";

export const TextInput = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement> & {
        suffix?: React.ReactNode;
        leading?: React.ReactNode;
        shellClassName?: string;
    }
>(({ suffix, leading, shellClassName, className, ...props }, ref) => (
    <div className={cn(inputShell, shellClassName)}>
        {leading}
        <input ref={ref} className={cn(inputControl, className)} {...props} />
        {suffix && <span className="text-sm text-brand-muted">{suffix}</span>}
    </div>
));
TextInput.displayName = "TextInput";

export const SelectInput = React.forwardRef<
    HTMLSelectElement,
    React.SelectHTMLAttributes<HTMLSelectElement> & { shellClassName?: string }
>(({ shellClassName, className, children, ...props }, ref) => (
    <div className={cn(inputShell, shellClassName)}>
        <select
            ref={ref}
            className={cn(inputControl, "cursor-pointer", className)}
            {...props}
        >
            {children}
        </select>
        <ChevronDown className="pointer-events-none h-4 w-4 flex-none" aria-hidden="true" />
    </div>
));
SelectInput.displayName = "SelectInput";

/**
 * Pick at most one tag, as radio chips. Clicking the chosen chip clears it,
 * since tags are optional on every entry.
 */
export function TagPicker({
    value,
    onChange,
    tags,
    label = "Tag",
    id,
}: {
    value: string | null | undefined;
    onChange: (tag: string | null) => void;
    tags: readonly string[];
    label?: string;
    /** Prefix for the label id. */
    id: string;
}) {
    const labelId = `${id}-label`;
    return (
        <div className="min-w-0">
            <span id={labelId} className="mb-1.5 block text-[13px] font-semibold text-brand-ink">
                {label}
            </span>
            <div role="radiogroup" aria-labelledby={labelId} className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <Chip
                        key={tag}
                        radio
                        pressed={value === tag}
                        onClick={() => onChange(value === tag ? null : tag)}
                    >
                        {tag}
                    </Chip>
                ))}
            </div>
        </div>
    );
}
