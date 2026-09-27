import type { ReactNode } from "react";
import Link from "next/link";
import Logo from "@/components/brand/Logo";

/**
 * Page frame for the Clerk sign-in / sign-up screens (design "M1 · Plain"):
 * the wordmark and the form, centred on Cream, with only the legal links below.
 */
export default function AuthShell({ children }: { children: ReactNode }) {
    return (
        <main className="flex min-h-dvh flex-col bg-background px-6 text-foreground">
            <div className="flex flex-1 flex-col items-center justify-center gap-10 py-12">
                <Link href="/">
                    <Logo variant="wordmark" height={30} priority />
                </Link>
                <div className="w-full max-w-[360px]">{children}</div>
            </div>
            <footer className="flex justify-center gap-2 pb-6 text-[13px] text-muted-foreground">
                <Link href="/privacy-policy" className="hover:text-primary">
                    Privacy
                </Link>
                <span aria-hidden="true">·</span>
                <Link href="/terms-service" className="hover:text-primary">
                    Terms
                </Link>
            </footer>
        </main>
    );
}
