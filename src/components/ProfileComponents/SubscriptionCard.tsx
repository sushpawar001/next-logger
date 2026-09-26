"use client";

import { Check, Sparkles } from "lucide-react";
import { Eyebrow } from "@/components/app-ui/layout";
import { AppButton } from "@/components/app-ui/controls";
import { cn } from "@/lib/utils";

const TRIAL_DAYS = 30;

/** Kept in step with PREMIUM_FEATURES on the homepage pricing section. */
const PREMIUM_FEATURES = [
    "Charts and stats for 90 days, a year or all time",
    "Filter readings by tag",
    "Everything in Free, including CSV, JSON and PDF exports",
];

interface SubscriptionCardProps {
    subscriptionPlan: "trial" | "premium" | "free";
    remainingDays: number;
    subscriptionEndDate: string;
    className?: string;
}

export function SubscriptionCard({
    subscriptionPlan,
    remainingDays,
    subscriptionEndDate,
    className,
}: SubscriptionCardProps) {
    const left = Math.max(0, remainingDays ?? 0);
    const isPremium = subscriptionPlan === "premium";
    const isTrial = subscriptionPlan === "trial";
    const trialEnded = isTrial && left === 0;

    const planName = isPremium
        ? "Premium"
        : isTrial
          ? trialEnded
              ? "Trial ended"
              : "Free trial"
          : "Free";
    const used = Math.min(TRIAL_DAYS, TRIAL_DAYS - left);

    return (
        <section
            aria-labelledby="plan-title"
            className={cn(
                "min-w-0 overflow-hidden rounded-2xl border border-border bg-white",
                className
            )}
        >
            <div className="bg-brand-oat p-5 lg:p-6">
                <Eyebrow className="text-brand-ink">Your plan</Eyebrow>
                <div className="mt-1.5 flex items-baseline justify-between gap-3">
                    <h2 id="plan-title" className="text-2xl font-semibold text-brand-ink">
                        {planName}
                    </h2>
                    {subscriptionPlan !== "free" && !trialEnded && (
                        <span className="text-[13px] text-brand-ink">
                            {left} {left === 1 ? "day" : "days"} left
                        </span>
                    )}
                </div>
                {isTrial && (
                    <div
                        className="mt-3 h-2 overflow-hidden rounded-full bg-white"
                        role="progressbar"
                        aria-label="Trial used"
                        aria-valuemin={0}
                        aria-valuemax={TRIAL_DAYS}
                        aria-valuenow={used}
                    >
                        <span
                            className="block h-full rounded-full bg-brand-aubergine"
                            style={{ width: `${(used / TRIAL_DAYS) * 100}%` }}
                        />
                    </div>
                )}
                {subscriptionPlan !== "free" && (
                    <p className="mt-3 text-[13px] text-brand-ink">
                        {isPremium ? "Renews" : trialEnded ? "Ended" : "Ends"} on{" "}
                        {subscriptionEndDate}
                    </p>
                )}
            </div>
            <div className="p-5 lg:px-6 lg:pb-6">
                <p className="mb-2.5 text-sm font-semibold text-brand-ink">
                    {isPremium || (isTrial && !trialEnded)
                        ? "Premium keeps everything you have now:"
                        : "Premium adds:"}
                </p>
                <ul className="grid gap-2 text-sm text-brand-ink">
                    {PREMIUM_FEATURES.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                            <Check
                                className="mt-0.5 h-4 w-4 flex-none text-brand-aubergine"
                                strokeWidth={2.6}
                                aria-hidden="true"
                            />
                            {f}
                        </li>
                    ))}
                </ul>
                {/* The page's one primary action. Payments are not wired up yet. */}
                <AppButton size="lg" block className="mt-5">
                    <Sparkles aria-hidden="true" />
                    {isPremium ? "Renew Premium" : "Upgrade to Premium"}
                </AppButton>
            </div>
        </section>
    );
}
