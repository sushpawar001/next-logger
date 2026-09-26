"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { btnSecondary, btnSmall, icon, textLink, wrap } from "./styles";

export const HOME_NAV_LINKS = [
    { href: "#features", label: "Features" },
    { href: "#privacy", label: "Privacy" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
    { href: "#tools", label: "Free tools" },
];

export default function HomeNav() {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!open) return;
        menuRef.current?.querySelector("a")?.focus();
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            setOpen(false);
            buttonRef.current?.focus();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open]);

    return (
        <div className={wrap}>
            <header className="flex h-20 items-center justify-between gap-6">
                <Link href="/" className={textLink}>
                    <Logo variant="wordmark" height={30} priority />
                </Link>
                <nav aria-label="Main" className="hidden gap-7 text-[15px] font-medium lg:flex">
                    {HOME_NAV_LINKS.map((l) => (
                        <a key={l.href} href={l.href} className={`${textLink} hover:text-brand-aubergine`}>
                            {l.label}
                        </a>
                    ))}
                </nav>
                <div className="flex items-center gap-2">
                    <Link
                        href="/login"
                        className={`${textLink} h-11 px-3 text-[15px] font-semibold hover:text-brand-aubergine`}
                    >
                        Log in
                    </Link>
                    <Link href="/signup" className={cn(btnSecondary, btnSmall, "hidden xs:inline-flex")}>
                        Start free
                    </Link>
                    <button
                        ref={buttonRef}
                        type="button"
                        aria-label="Menu"
                        aria-expanded={open}
                        aria-controls="home-mobile-nav"
                        onClick={() => setOpen((o) => !o)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-brand-line-strong bg-white text-brand-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-brand-lavender lg:hidden"
                    >
                        <Menu className={icon} aria-hidden="true" />
                    </button>
                </div>
            </header>
            <nav
                ref={menuRef}
                id="home-mobile-nav"
                aria-label="Mobile"
                hidden={!open}
                className="flex-col border-b border-brand-line pb-4 pt-2 [&:not([hidden])]:flex lg:!hidden"
            >
                {HOME_NAV_LINKS.map((l) => (
                    <a
                        key={l.href}
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className="flex min-h-12 items-center border-t border-brand-line text-[17px] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-lavender"
                    >
                        {l.label}
                    </a>
                ))}
            </nav>
        </div>
    );
}
