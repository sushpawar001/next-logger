import { WifiOff } from "lucide-react";
import Logo from "@/components/brand/Logo";

export const metadata = {
    title: "Offline — FitDose",
    description: "You are offline.",
};

// Precached by the service worker and served when a navigation fails. Keep this
// page static and dependency-free: no data fetching, no auth, no client JS.
export default function OfflinePage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#FAFAFA] px-6 text-center">
            <Logo variant="wordmark" height={32} />

            <div className="flex flex-col items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
                    <WifiOff className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-900">
                    You&apos;re offline
                </h1>
                <p className="max-w-sm text-sm text-gray-600">
                    Your saved entries are safe. Reconnect to log a new one —
                    this page will pick up where you left off.
                </p>
            </div>
        </div>
    );
}
