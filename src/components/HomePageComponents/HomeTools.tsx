import Link from "next/link";
import { ArrowRight, Calculator, Flame, GlassWater, Ruler, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { card, eyebrow, h2, textLink, tile, wrap } from "./styles";

export const HOME_TOOLS = [
    { href: "/tools/bmi-calculator", Icon: Calculator, name: "BMI", body: "Where your weight sits for your height." },
    { href: "/tools/bmr-calculator", Icon: Flame, name: "BMR", body: "Calories your body uses at rest." },
    { href: "/tools/ideal-weight-calculator", Icon: Target, name: "Ideal weight", body: "Healthy ranges from common formulas." },
    { href: "/tools/whr-calculator", Icon: Ruler, name: "Waist-to-hip", body: "A quick read on fat distribution." },
    { href: "/tools/water-intake-calculator", Icon: GlassWater, name: "Water intake", body: "How much to drink in a day." },
];

export default function HomeTools() {
    return (
        <section id="tools" className="pb-[72px] md:pb-24">
            <div className={wrap}>
                <div className="mb-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-baseline">
                    <div className="flex flex-col gap-3.5">
                        <div className={eyebrow}>Free tools</div>
                        <h2 className={cn(h2, "md:text-[30px]")}>Not ready yet? Try a free calculator.</h2>
                        <p className="text-[17px] text-brand-body">Calculated in your browser. No account needed.</p>
                    </div>
                    <Link href="/tools" className={`${textLink} gap-2 font-semibold text-brand-aubergine hover:text-brand-ink`}>
                        All tools <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </div>
                <div className="grid grid-cols-2 gap-2.5 md:grid-cols-6 md:gap-4 xl:grid-cols-5">
                    {HOME_TOOLS.map(({ href, Icon, name, body }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`${card} flex items-center gap-3 px-4 py-3.5 transition-[border-color,transform] last:col-span-2 hover:-translate-y-0.5 hover:border-brand-lavender focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-brand-lavender motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:col-span-2 md:flex-col md:items-start md:p-6 md:[&:nth-child(n+4)]:col-span-3 xl:col-span-1 xl:[&:nth-child(n+4)]:col-span-1`}
                        >
                            <span className={cn(tile, "h-10 w-10")}>
                                <Icon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div className="flex flex-col gap-1.5">
                                <h3 className="text-base font-semibold md:text-[17px]">{name}</h3>
                                <p className="hidden text-pretty text-base leading-normal text-brand-body md:block">{body}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
