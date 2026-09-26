import Link from "next/link";
import { ArrowRight, Check, Lock, Smartphone, Syringe } from "lucide-react";
import { btnPrimary, btnSecondary, card, eyebrow, exampleLabel, iconSm, lead, tile, wrap } from "./styles";

// Sample 14-day series drawn in the chart's own units: viewBox "-8 -52 496 194",
// y = (220 - mg/dL) * 0.889. The 70–140 mg/dL band matches the real glucose chart.
const POINTS =
    "0,103.1 36.9,69.3 73.8,90.7 110.8,110.2 147.7,79.1 184.6,48.9 221.5,87.1 258.5,98.7 295.4,28.4 332.3,82.7 369.2,94.2 406.2,107.6 443.1,88 480,96";

const TRUST = [
    { Icon: Lock, text: "Encrypted before it’s stored" },
    { Icon: Check, text: "30 days of Premium free, no card needed" },
    { Icon: Smartphone, text: "Works on any phone, installs like an app" },
];

function GlucoseCard() {
    return (
        <div
            role="img"
            aria-label="Example FitDose glucose card: a fasting reading of 112 mg/dL, a 14-day chart with 70–140 mg/dL shaded, one after-meal reading of 188 mg/dL above the shaded band, and summaries of the 14-day average, today’s insulin and weight"
            className="pointer-events-none relative w-full max-w-[600px] select-none md:pb-14 xl:max-w-none xl:pl-10"
        >
            <div className={exampleLabel}>Example · sample data</div>
            <div className={`${card} flex flex-col gap-4 p-5 shadow-[0_24px_48px_-24px_rgba(36,26,51,0.18)] md:p-7`}>
                <div className="flex items-center justify-between">
                    <div className="text-base font-semibold">Glucose</div>
                    <div className="flex gap-0.5 rounded-[10px] bg-brand-tint p-1 text-[13px] font-semibold">
                        <span className="rounded-[7px] px-2.5 py-1.5 text-brand-muted">7d</span>
                        <span className="rounded-[7px] bg-white px-2.5 py-1.5 text-brand-ink">14d</span>
                        <span className="rounded-[7px] px-2.5 py-1.5 text-brand-muted">30d</span>
                        <span className="rounded-[7px] px-2.5 py-1.5 text-brand-muted">90d</span>
                    </div>
                </div>
                <div className="flex items-end gap-3">
                    <div className="text-5xl font-bold leading-none tracking-[-0.03em] tabular-nums md:text-6xl">112</div>
                    <div className="pb-2 text-lg font-medium text-brand-muted">mg/dL</div>
                    <span className="mb-2.5 ml-auto rounded-full bg-brand-tint px-3 py-1 text-[13px] font-semibold text-brand-aubergine">
                        Fasting
                    </span>
                </div>
                <div className="-mt-1.5 text-sm text-brand-muted">Today, 07:30</div>

                <div className="relative pl-[34px]">
                    <svg viewBox="-8 -52 496 194" className="block h-auto w-full overflow-visible" aria-hidden="true" focusable="false">
                        <rect x="-8" y="71.1" width="496" height="62.2" fill="#E8DFD0" fillOpacity="0.6" />
                        <line x1="-8" x2="488" y1="71.1" y2="71.1" stroke="#8E78C4" strokeDasharray="4 4" />
                        <line x1="-8" x2="488" y1="133.3" y2="133.3" stroke="#8E78C4" strokeDasharray="4 4" />
                        <polyline fill="none" stroke="#4A3470" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={POINTS} />
                        <circle cx="295.4" cy="28.4" r="6" fill="#4A3470" stroke="#fff" strokeWidth="2.5" />
                        <circle cx="480" cy="96" r="6" fill="#4A3470" stroke="#fff" strokeWidth="2.5" />
                    </svg>
                    <span className="absolute left-0 w-7 text-right text-xs font-medium leading-[14px] text-brand-muted" style={{ top: "calc(63.4% - 7px)" }}>
                        140
                    </span>
                    <span className="absolute left-0 w-7 text-right text-xs font-medium leading-[14px] text-brand-muted" style={{ top: "calc(95.5% - 7px)" }}>
                        70
                    </span>
                    <span
                        className="absolute whitespace-nowrap rounded-lg bg-brand-ink px-3 py-2 text-[13px] leading-snug text-brand-cream tabular-nums"
                        style={{ left: "calc(34px + (100% - 34px) * 0.612)", top: "calc(41.4% - 12px)", transform: "translate(-50%, -100%)" }}
                    >
                        188 mg/dL
                        <span className="block text-xs text-brand-on-dark">Tue 13:10 · After meal</span>
                    </span>
                </div>
                <div className="mt-1.5 flex justify-between pl-[34px] text-xs text-brand-muted">
                    <span>14 days ago</span>
                    <span className="inline-flex items-center gap-1.5">
                        <i className="inline-block h-2 w-3.5 border-y border-dashed border-brand-lavender bg-brand-oat/60" />
                        70–140 mg/dL shaded
                    </span>
                    <span>Today</span>
                </div>

                <div className="grid grid-cols-3 gap-2 md:gap-2.5">
                    {[
                        { k: "Average", v: "125", u: "mg/dL", d: "↓ 6 vs prior 14d" },
                        { k: "Insulin today", v: "6", u: "IU", d: "1 dose" },
                        { k: "Weight", v: "72.4", u: "kg", d: "↓ 0.6 kg in 30d" },
                    ].map((m) => (
                        <div key={m.k} className="flex flex-col gap-1 rounded-[14px] bg-brand-cream px-3 py-2.5 md:px-4 md:py-3.5">
                            <div className="truncate text-[13px] font-medium text-brand-muted">{m.k}</div>
                            <div className="whitespace-nowrap text-[17px] font-bold tabular-nums md:text-xl">
                                {m.v} <small className="text-[13px] font-medium text-brand-muted">{m.u}</small>
                            </div>
                            <div className="hidden truncate text-[13px] text-brand-body md:block">{m.d}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div
                className={`${card} relative mx-4 -mt-4 flex items-center gap-3.5 px-[18px] py-4 shadow-[0_18px_36px_-18px_rgba(36,26,51,0.25)] md:absolute md:bottom-0 md:left-0 md:mx-0 md:mt-0 md:w-[310px]`}
            >
                <div className={tile}>
                    <Syringe className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                    <div className="text-[15px] font-semibold">Rapid-acting · 6 IU</div>
                    <div className="text-sm text-brand-muted">Logged at 08:05 · Before meal</div>
                </div>
            </div>
        </div>
    );
}

export default function HomeHero() {
    return (
        <div className="pb-6 pt-12">
            <div className={`${wrap} grid items-center gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] xl:gap-16`}>
                <div className="flex flex-col gap-6">
                    <div className={eyebrow}>For Type 1 and Type 2 diabetes</div>
                    <h1 className="text-balance text-[38px] font-bold leading-[1.05] tracking-[-0.02em] md:text-[50px] 2xl:text-[60px]">
                        A calm, private log for glucose, insulin and weight.
                    </h1>
                    <p className={lead}>
                        Log a reading in a few taps. FitDose charts it, works out your averages and compares them with the
                        period before. Export a PDF whenever you need one for your doctor.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3">
                        <Link href="/signup" className={btnPrimary}>
                            Start free <ArrowRight className={iconSm} aria-hidden="true" />
                        </Link>
                        <a href="#features" className={btnSecondary}>
                            See how it works
                        </a>
                    </div>
                    <ul className="flex flex-col gap-2.5 text-[15px] text-brand-body">
                        {TRUST.map(({ Icon, text }) => (
                            <li key={text} className="flex items-center gap-2.5">
                                <Icon className={`${iconSm} text-brand-aubergine`} aria-hidden="true" />
                                {text}
                            </li>
                        ))}
                    </ul>
                </div>
                <GlucoseCard />
            </div>
        </div>
    );
}
