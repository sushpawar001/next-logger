/**
 * Shared class strings for the homepage sections, from the approved design in
 * docs/designs/homepage-a1-refined.html. Colours come from the `brand` palette
 * in tailwind.config.js (Aubergine & Oat) — not `secondary`, which is a legacy gray.
 *
 * Breakpoints are tailgrids' (md 720 / lg 960 / xl 1140), which replace
 * Tailwind's defaults app-wide.
 */

export const wrap = "mx-auto w-full max-w-[1280px] px-5 md:px-12";

export const eyebrow =
    "text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted";

export const h2 =
    "text-balance text-[30px] font-bold leading-[1.1] tracking-[-0.01em] text-brand-ink md:text-[42px]";

export const lead =
    "max-w-[60ch] text-pretty text-[17px] leading-relaxed text-brand-body md:text-[19px]";

const focusRing =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px]";

const btnBase = `inline-flex h-[52px] items-center justify-center gap-2.5 rounded-lg px-6 text-base font-semibold transition-colors ${focusRing}`;

export const btnPrimary = `${btnBase} bg-brand-aubergine text-brand-cream hover:bg-brand-aubergine-hover focus-visible:outline-brand-lavender`;

export const btnSecondary = `${btnBase} bg-brand-oat text-brand-ink hover:bg-brand-line-strong focus-visible:outline-brand-lavender`;

/** On an Aubergine surface (the Premium card): cream fill, cream focus ring. */
export const btnLight = `${btnBase} bg-brand-cream text-brand-aubergine hover:bg-white focus-visible:outline-brand-cream`;

export const btnSmall = "h-11 px-[18px] text-[15px]";

export const textLink = `inline-flex min-h-11 items-center rounded-lg ${focusRing} focus-visible:outline-brand-lavender`;

export const card = "rounded-[20px] border border-brand-line bg-white";

export const tile =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand-aubergine";

export const iconSm = "h-[18px] w-[18px] shrink-0";
export const icon = "h-5 w-5 shrink-0";

/** Small caption above the illustrative product mock-ups. */
export const exampleLabel = "mb-2.5 text-[13px] font-medium text-brand-muted";
