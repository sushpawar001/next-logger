import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { btnPrimary, h2, iconSm, lead, wrap } from "./styles";

export default function HomeCta() {
    return (
        <div className={wrap}>
            <div className="flex flex-col items-center gap-[18px] rounded-3xl bg-brand-oat px-6 py-14 text-center md:rounded-[32px] md:px-12 md:py-20">
                <span aria-hidden="true">
                    <Logo variant="mark" height={64} />
                </span>
                <h2 className={h2}>Start logging today</h2>
                <p className={lead}>Free to start, with 30 days of Premium on us. No card needed.</p>
                <Link href="/signup" className={cn(btnPrimary, "focus-visible:outline-brand-aubergine")}>
                    Create your account <ArrowRight className={iconSm} aria-hidden="true" />
                </Link>
            </div>
        </div>
    );
}
