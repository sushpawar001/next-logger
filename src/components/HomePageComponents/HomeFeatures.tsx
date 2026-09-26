import { Download, LineChart, Smartphone, Tag, TrendingDown, Zap } from "lucide-react";
import { card, exampleLabel, eyebrow, h2, icon, lead, tile, wrap } from "./styles";

const FEATURES = [
    { Icon: LineChart, title: "Look back a week or a year", body: "Switch between 7, 14, 30, 90 and 365 days, or everything you’ve ever logged." },
    { Icon: TrendingDown, title: "See how this fortnight compares", body: "Averages and ranges side by side with the period before, so change is easy to spot." },
    { Icon: Tag, title: "See after-meal readings on their own", body: "Fasting, before or after meals, before or after exercise — look at one at a time." },
    { Icon: Smartphone, title: "Log straight from your home screen", body: "Install FitDose like an app and jump straight into any log form." },
    { Icon: Zap, title: "Your insulins, ready to pick", body: "Add the insulin types you use once, and logging a dose becomes a quick pick." },
    { Icon: Download, title: "Bring a tidy PDF to your appointment", body: "Download everything as CSV, JSON or a tidy PDF for your next appointment." },
];

// Sample stats (mg/dL) for the illustrative comparison card.
const STATS = [
    { stat: "Mean", now: 125, before: 131, change: "↓ 6" },
    { stat: "Median", now: 120, before: 124, change: "↓ 4" },
    { stat: "Lowest", now: 96, before: 88, change: "↑ 8" },
    { stat: "Highest", now: 188, before: 204, change: "↓ 16" },
];

function CompareCard() {
    return (
        <div className="lg:ml-6 xl:ml-10">
            <div className={exampleLabel}>Example · sample data</div>
            <figure
                aria-label="Example: glucose statistics for the last 14 days compared with the 14 days before"
                className={`${card} m-0 flex flex-col gap-5 p-6 md:p-8`}
            >
                <figcaption className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-lg font-semibold">Glucose · last 14 days</div>
                        <div className="mt-1 text-sm text-brand-muted">Compared with the 14 days before</div>
                    </div>
                    <TrendingDown className={`${icon} text-brand-aubergine`} aria-hidden="true" />
                </figcaption>
                <div className="pointer-events-none flex select-none flex-wrap gap-2" aria-hidden="true">
                    <span className="rounded-full border border-brand-aubergine bg-brand-aubergine px-3 py-1.5 text-[13px] font-medium text-brand-cream">All tags</span>
                    {["Fasting", "After meal", "Before exercise"].map((t) => (
                        <span key={t} className="rounded-full border border-brand-line-strong px-3 py-1.5 text-[13px] font-medium text-brand-body">
                            {t}
                        </span>
                    ))}
                </div>
                <table className="w-full border-collapse text-base tabular-nums">
                    <caption className="caption-bottom pt-3.5 text-left text-sm text-brand-muted">All values in mg/dL · sample data</caption>
                    <thead>
                        <tr className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-muted">
                            <th scope="col" className="pb-2.5 text-left font-semibold">Stat</th>
                            <th scope="col" className="pb-2.5 text-right font-semibold">Now</th>
                            <th scope="col" className="pb-2.5 text-right font-semibold">Before</th>
                            <th scope="col" className="pb-2.5 text-right font-semibold">Change</th>
                        </tr>
                    </thead>
                    <tbody>
                        {STATS.map((r) => (
                            <tr key={r.stat} className="border-t border-brand-line">
                                <th scope="row" className="py-3 text-left font-normal text-brand-body">{r.stat}</th>
                                <td className="py-3 text-right font-bold">{r.now}</td>
                                <td className="py-3 text-right">{r.before}</td>
                                <td className="py-3 text-right text-sm font-semibold text-brand-body">{r.change}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </figure>
        </div>
    );
}

export default function HomeFeatures() {
    return (
        <section id="features" className="py-[72px] md:py-24">
            <div className={wrap}>
                <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] xl:gap-16">
                    <div className="flex flex-col gap-3.5 lg:pt-11">
                        <div className={eyebrow}>Insights</div>
                        <h2 className={h2}>Your week, already added up</h2>
                        <p className={lead}>
                            No formulas and no copying numbers into a spreadsheet. Every entry feeds your charts and averages the
                            moment you save it — next to the period before, so you can see what changed.
                        </p>
                    </div>
                    <CompareCard />
                </div>
                <ul className="mt-10 grid list-none gap-x-10 p-0 md:mt-16 md:grid-cols-2 xl:grid-cols-3">
                    {FEATURES.map(({ Icon, title, body }) => (
                        <li key={title} className="flex gap-[18px] border-t border-brand-line py-[26px]">
                            <div className={tile}>
                                <Icon className={icon} aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="mb-1.5 text-balance text-lg font-semibold">{title}</h3>
                                <p className="text-pretty text-base leading-normal text-brand-body">{body}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
