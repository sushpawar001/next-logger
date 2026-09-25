import { SidebarTrigger } from "@/components/ui/sidebar";
import Logo from "@/components/brand/Logo";
import Link from "next/link";

export function DashboardHeader() {
    return (
        <header className="flex min-h-16 pt-safe items-center justify-between border-b border-border bg-white/80 backdrop-blur-sm px-4 md:hidden">
            <Link href="/dashboard">
                <Logo variant="wordmark" height={24} priority />
            </Link>
            <SidebarTrigger />
        </header>
    );
}
