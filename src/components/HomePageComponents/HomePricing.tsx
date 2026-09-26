"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { btnLight, btnSecondary, card, eyebrow, h2, lead, wrap } from "./styles";

type Period = "month" | "year";

export const PREMIUM_PRICE: Record<Period, { amount: string; suffix: string }> = {
    month: { amount: "$5", suffix: "/ month" },
    // Twelve months at $5 would be $60: yearly billing gives two months free.
    year: { amount: "$50", suffix: "/ year · 2 months free" },
};

const FREE_FEATURES = [
    "Log glucose, insulin, weight and measurements",
    "Charts and stats for the last 7, 14 or 30 days",
    "Export everything as CSV, JSON or PDF",
];

const PREMIUM_FEATURES = ["Everything in Free", "Charts and stats for 90 days, a year or all time", "Filter readings by tag"];

function FeatureList({ items, dark }: { items: string[]; dark?: boolean }) {
    return (
        <ul className={`m-0 flex list-none flex-col gap-3 p-0 text-base ${dark ? "text-brand-cream" : "text-brand-body"}`}>
            {items.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                    <Check
                        className={`mt-0.5 h-[18px] w-[18px] shrink-0 ${dark ? "text-brand-lavender-light" : "text-brand-aubergine"}`}
                        aria-hidden="true"
                    />
                    {f}
                </li>
            ))}
        </ul>
    );
}

export default function HomePricing() {
    const [period, setPeriod] = useState<Period>("month");
    const price = PREMIUM_PRICE[period];

    return (
        <section id="pricing" className="py-[72px] md:py-24">
            <div className={wrap}>
                <div className="flex flex-col items-center gap-3.5 text-center">
                    <div className={eyebrow}>Pricing</div>
                    <h2 className={h2}>Free to log. $5 a month for more.</h2>
                    <p className={lead}>Every account starts with 30 days of Premium. No card needed.</p>
                    <div className="mt-2.5 flex items-center gap-3 text-[15px] font-semibold text-brand-body">
                        <span id="premium-billing-label">Premium billing</span>
                        <div
                            role="group"
                            aria-labelledby="premium-billing-label"
                            className="inline-flex rounded-xl border border-brand-line-strong bg-brand-tint p-1"
                        >
                            {(["month", "year"] as const).map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    aria-pressed={period === p}
                                    onClick={() => setPeriod(p)}
                                    className="min-h-11 rounded-[9px] px-5 text-[15px] font-semibold text-brand-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-lavender aria-pressed:bg-white aria-pressed:text-brand-ink aria-pressed:shadow-[inset_0_0_0_1.5px_#6E5A99]"
                                >
                                    {p === "month" ? "Monthly" : "Yearly"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mx-auto mt-11 grid max-w-[880px] gap-6 md:grid-cols-2">
                    <div className={`${card} flex flex-col gap-[18px] p-9`}>
                        <div className="flex min-h-7 items-center justify-between">
                            <h3 className="text-lg font-semibold">Free</h3>
                        </div>
                        <div className="text-5xl font-bold tracking-[-0.03em] tabular-nums">
                            $0<small className="ml-1.5 text-base font-medium tracking-normal text-brand-muted">/ month</small>
                        </div>
                        <FeatureList items={FREE_FEATURES} />
                        <Link href="/signup" className={`${btnSecondary} mt-auto`}>
                            Start free
                        </Link>
                    </div>
                    <div className="flex flex-col gap-[18px] rounded-[20px] bg-brand-aubergine p-9 text-brand-cream">
                        <div className="flex min-h-7 items-center justify-between">
                            <h3 className="text-lg font-semibold">Premium</h3>
                            <span className="rounded-full bg-brand-cream px-3 py-1 text-[13px] font-bold text-brand-aubergine">30 days free</span>
                        </div>
                        <div aria-live="polite" className="text-5xl font-bold tracking-[-0.03em] tabular-nums">
                            {price.amount}
                            <small className="ml-1.5 text-base font-medium tracking-normal text-brand-on-dark">{price.suffix}</small>
                        </div>
                        <FeatureList items={PREMIUM_FEATURES} dark />
                        <Link href="/signup" className={`${btnLight} mt-auto`}>
                            Start free
                        </Link>
                    </div>
                </div>
                <p className="mt-5 text-pretty text-center text-[15px] text-brand-body">
                    When the 30 days end, you move to Free automatically. Nothing is charged and none of your entries are deleted.
                </p>
            </div>
        </section>
    );
}
