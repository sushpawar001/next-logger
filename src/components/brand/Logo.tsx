import Image from "next/image";

/**
 * The FitDose logo, rendered from the final exported SVGs in `public/brand/svg`
 * (see `scripts/brand/README.md` for which file to use where).
 *
 * Next.js serves `.svg` sources unoptimised with the default loader (unless
 * `dangerouslyAllowSVG` is set, which it is not), so these are plain static
 * files; `next/image` just reserves the right box to avoid layout shift.
 *
 * Brand rules (docs/designs/brand-guidelines.md §7): the wordmark must be at
 * least 80px wide on screen, the icon at least 16px.
 */

export type LogoVariant =
    | "wordmark"
    | "mark"
    | "icon"
    | "lockup-horizontal"
    | "lockup-stacked";

export type LogoTone = "default" | "reversed" | "mono-ink" | "mono-cream";

/** Which colourways actually exist on disk for each variant. */
type TonesFor = {
    wordmark: LogoTone;
    mark: LogoTone;
    icon: "default";
    "lockup-horizontal": "default" | "reversed";
    "lockup-stacked": "default" | "reversed";
};

const FILES: { [V in LogoVariant]: Record<TonesFor[V], string> } = {
    wordmark: {
        default: "/brand/svg/fitdose-wordmark.svg",
        reversed: "/brand/svg/fitdose-wordmark-reversed.svg",
        "mono-ink": "/brand/svg/fitdose-wordmark-mono-ink.svg",
        "mono-cream": "/brand/svg/fitdose-wordmark-mono-cream.svg",
    },
    mark: {
        default: "/brand/svg/fitdose-mark.svg",
        reversed: "/brand/svg/fitdose-mark-reversed.svg",
        "mono-ink": "/brand/svg/fitdose-mark-mono-ink.svg",
        "mono-cream": "/brand/svg/fitdose-mark-mono-cream.svg",
    },
    icon: {
        default: "/brand/svg/fitdose-app-icon.svg",
    },
    "lockup-horizontal": {
        default: "/brand/svg/fitdose-lockup-horizontal.svg",
        reversed: "/brand/svg/fitdose-lockup-horizontal-reversed.svg",
    },
    "lockup-stacked": {
        default: "/brand/svg/fitdose-lockup-stacked.svg",
        reversed: "/brand/svg/fitdose-lockup-stacked-reversed.svg",
    },
};

/** width / height, taken from each SVG's viewBox. */
export const LOGO_ASPECT_RATIOS: Record<LogoVariant, number> = {
    wordmark: 3354.51 / 865.63,
    mark: 960 / 1220,
    icon: 144 / 144,
    "lockup-horizontal": 4631.34 / 1069.48,
    "lockup-stacked": 3354.51 / 2825.95,
};

type VariantProps = {
    [V in LogoVariant]: { variant: V; tone?: TonesFor[V] };
}[LogoVariant];

export type LogoProps = VariantProps & {
    /** Rendered height in px; width follows the variant's aspect ratio. */
    height?: number;
    className?: string;
    /** Preload it (above-the-fold placements such as the landing hero). */
    priority?: boolean;
};

export function logoSrc(variant: LogoVariant, tone: LogoTone = "default") {
    return (FILES[variant] as Partial<Record<LogoTone, string>>)[tone];
}

export default function Logo({
    variant,
    tone = "default",
    height = 28,
    className,
    priority = false,
}: LogoProps) {
    const width = Math.round(height * LOGO_ASPECT_RATIOS[variant]);

    return (
        <Image
            src={logoSrc(variant, tone)}
            alt="FitDose"
            width={width}
            height={height}
            priority={priority}
            className={className}
        />
    );
}
