"use client";
import Link from "next/link";
import { Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useSidebar } from "@/components/ui/sidebar";
import Logo from "@/components/brand/Logo";

/**
 * Phone and tablet top bar (below `lg`): menu, logo, account. The public
 * /tools layout has no ClerkProvider, so it turns the account button off.
 */
export function DashboardHeader({ showAccount = true }: { showAccount?: boolean }) {
    const { toggleSidebar, openMobile } = useSidebar();

    return (
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-border bg-brand-cream/90 pt-safe pr-3 pl-2 backdrop-blur-sm lg:hidden">
            <button
                type="button"
                onClick={toggleSidebar}
                aria-label="Open menu"
                aria-expanded={openMobile}
                className="inline-grid h-10 w-10 place-items-center rounded-lg text-brand-muted hover:bg-brand-cream hover:text-brand-ink"
            >
                <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <Link href="/dashboard">
                <Logo variant="wordmark" height={24} priority />
            </Link>
            <div className="grid h-10 w-10 place-items-center">
                {showAccount && <UserButton />}
            </div>
        </header>
    );
}
