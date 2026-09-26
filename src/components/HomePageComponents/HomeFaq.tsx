import { ChevronDown } from "lucide-react";
import { eyebrow, h2, wrap } from "./styles";

export const HOME_FAQ = [
    {
        q: "Is my health data private?",
        a: "Every reading, dose, tag and measurement is encrypted with AES-256 before it’s stored, and every request is checked against your account, so other users can’t see your entries. The encryption key is held on FitDose’s servers: that protects your data if the database is ever exposed, but it isn’t end-to-end encryption.",
    },
    {
        q: "What happens when the free trial ends?",
        a: "Your account moves to the Free plan automatically. Nothing is charged — we never asked for a card — and every entry stays exactly where it is. You can keep logging, charting the last 30 days and exporting everything; longer history and tag filters come back whenever you upgrade.",
    },
    {
        q: "What can I log?",
        a: "Blood glucose, tagged by when you took it — fasting, before or after a meal, before or after exercise, random or other. Insulin doses by type and units. Weight. And seven body measurements: arms, chest, abdomen, waist, hips, thighs and calves.",
    },
    {
        q: "Can I use mmol/L?",
        a: "Not yet. FitDose records glucose in mg/dL. To convert, divide by 18 — for example, 126 mg/dL is 7.0 mmol/L.",
    },
    {
        q: "Does it connect to my meter or CGM?",
        a: "No. You type each reading in yourself. Tags and your saved insulin types keep that quick.",
    },
    {
        q: "Does FitDose give dosing advice?",
        a: "No. FitDose records what you log and shows it back to you clearly. Always follow your care team’s advice about doses.",
    },
    {
        q: "Can I use it on my phone?",
        a: "Yes. FitDose runs in any browser and installs to your home screen like an app, with shortcuts straight to each log form.",
    },
    {
        q: "Can I get my data out, or delete it?",
        a: "Anytime. Export everything as CSV, JSON or a PDF from your profile. If you delete your account, every entry is deleted with it.",
    },
];

export default function HomeFaq() {
    return (
        <section id="faq" className="pb-[72px] md:pb-24">
            <div className={wrap}>
                <div className="flex flex-col items-center gap-3.5 text-center">
                    <div className={eyebrow}>FAQ</div>
                    <h2 className={h2}>Questions, answered</h2>
                </div>
                <div className="mx-auto mt-11 flex max-w-[820px] flex-col">
                    {HOME_FAQ.map(({ q, a }, i) => (
                        <details key={q} open={i === 0} className="group border-t border-brand-line-strong last:border-b">
                            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 py-[22px] text-lg font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-brand-lavender [&::-webkit-details-marker]:hidden">
                                {q}
                                <ChevronDown
                                    className="h-5 w-5 shrink-0 text-brand-muted transition-transform group-open:rotate-180 motion-reduce:transition-none"
                                    aria-hidden="true"
                                />
                            </summary>
                            <p className="max-w-[68ch] text-pretty pb-6 pr-12 text-base leading-relaxed text-brand-body">{a}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
