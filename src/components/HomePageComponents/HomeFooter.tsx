import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { textLink, wrap } from "./styles";

const LINKS = [
    { href: "/tools", label: "Free tools" },
    { href: "/privacy-policy", label: "Privacy policy" },
    { href: "/terms-service", label: "Terms of service" },
    { href: "/contact-us", label: "Contact" },
];

export default function HomeFooter() {
    return (
        <footer className="mt-16 border-t border-brand-line-strong pb-16 pt-12">
            <div className={`${wrap} flex flex-wrap items-start justify-between gap-8`}>
                <div className="flex flex-col gap-3.5">
                    <Logo variant="wordmark" height={26} />
                    <p className="max-w-[52ch] text-sm leading-normal text-brand-body">
                        FitDose records what you log. It doesn’t give medical or dosing advice — always follow your care team.
                    </p>
                    <div className="text-sm text-brand-muted">© {new Date().getFullYear()} FitDose · by FitnationPlus</div>
                </div>
                <nav aria-label="Footer" className="flex flex-wrap gap-7 text-[15px] text-brand-body">
                    {LINKS.map((l) => (
                        <Link key={l.href} href={l.href} className={`${textLink} hover:text-brand-aubergine`}>
                            {l.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </footer>
    );
}
