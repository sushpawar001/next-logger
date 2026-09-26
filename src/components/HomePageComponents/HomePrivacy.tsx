import { Download, Lock, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { eyebrow, h2, lead, wrap } from "./styles";

const POINTS = [
    { Icon: Lock, title: "AES-256, field by field", body: "Readings, doses, tags and measurements are encrypted individually at rest." },
    { Icon: Shield, title: "Kept to your account", body: "Every request is checked against your account, so no other user can open your entries." },
    { Icon: Download, title: "Leave with everything", body: "Export it all anytime. Delete your account and every entry goes with it." },
];

export default function HomePrivacy() {
    return (
        <div id="privacy" className={wrap}>
            <div className="grid items-center gap-10 rounded-3xl bg-brand-ink px-6 py-12 text-brand-cream md:rounded-[32px] md:px-12 md:py-16 lg:grid-cols-2 lg:gap-16 xl:px-[72px] xl:py-[88px]">
                <div className="flex flex-col gap-5">
                    <div className={cn(eyebrow, "text-brand-lavender-light")}>Privacy</div>
                    <h2 className={cn(h2, "text-brand-cream")}>Your health data is encrypted before it’s stored.</h2>
                    <p className={cn(lead, "text-brand-on-dark")}>
                        Numbers like these deserve more than a password. FitDose protects each value on its own, not just the
                        database around it.
                    </p>
                </div>

                <div
                    role="img"
                    aria-label="What you see: glucose 112 mg/dL, fasting. Each field is encrypted on its own with AES-256-GCM. What the database holds: long unreadable encrypted values for the reading and its tag."
                    className="flex flex-col gap-3"
                >
                    <div className="flex flex-col gap-2 rounded-2xl border border-brand-cream bg-brand-cream px-5 py-[18px] text-brand-ink">
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">What you see</div>
                        <div className="flex items-end gap-3">
                            <div className="text-[44px] font-bold leading-none tracking-[-0.03em] tabular-nums">112</div>
                            <div className="pb-1.5 text-lg font-medium text-brand-muted">mg/dL</div>
                            <span className="mb-1.5 ml-auto rounded-full bg-brand-tint px-3 py-1 text-[13px] font-semibold text-brand-aubergine">Fasting</span>
                        </div>
                    </div>
                    <div className="inline-flex items-center gap-2 self-center rounded-full border border-dashed border-brand-night-line px-3.5 py-1.5 text-[13px] font-semibold tracking-[0.04em] text-brand-lavender-light">
                        <Lock className="h-4 w-4" aria-hidden="true" />
                        AES-256-GCM · each field on its own
                    </div>
                    <div className="flex flex-col gap-2 rounded-2xl border border-brand-night-line px-5 py-[18px]">
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-lavender-light">What the database holds</div>
                        <div className="break-all font-mono text-sm leading-[1.7] text-brand-on-dark">
                            <span className="line-clamp-2">
                                <span className="text-brand-lavender-light">value:</span>{" "}
                                {'{"encrypted":"9f3c1a7be04b52d8c6a1","iv":"4f0d8e12a17e3b90c2d1e6f7","tag":"e17f5b0c9a2d4e8f6b3a1c7d9e2f0a4b"}'}
                            </span>
                            <span className="mt-1.5 line-clamp-2">
                                <span className="text-brand-lavender-light">tag:</span>{" "}
                                {'{"encrypted":"b7e1c04f5a","iv":"a2c9e417b03d6f58e1b2c3d4","tag":"5c1d8b3e0f7a2c9d4e6b1a8f3c5d7e90"}'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-7 border-t border-brand-night-line pt-8 md:grid-cols-3 md:gap-8 lg:col-span-2 lg:pt-10">
                    {POINTS.map(({ Icon, title, body }) => (
                        <div key={title}>
                            <span className="inline-flex rounded-xl bg-brand-night-line p-2.5 text-brand-lavender-light">
                                <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
                            </span>
                            <h3 className="mb-1.5 mt-3.5 text-balance text-lg font-semibold">{title}</h3>
                            <p className="text-pretty text-base leading-normal text-brand-on-dark">{body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
