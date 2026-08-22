import { Activity, WifiOff } from "lucide-react";

export const metadata = {
    title: "Offline — FitDose",
    description: "You are offline.",
};

// Precached by the service worker and served when a navigation fails. Keep this
// page static and dependency-free: no data fetching, no auth, no client JS.
export default function OfflinePage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#FAFAFA] px-6 text-center">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#5E4AE3] to-[#7C3AED] text-white">
                    <Activity className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold text-gray-900">FitDose</span>
            </div>

            <div className="flex flex-col items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
                    <WifiOff className="h-6 w-6 text-[#5E4AE3]" />
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
