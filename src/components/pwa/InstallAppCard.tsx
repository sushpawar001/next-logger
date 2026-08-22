"use client";

import { useEffect } from "react";
import { Activity, Download, Share, SquarePlus, Zap } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useInstallPrompt } from "@/hooks/use-install-prompt";

/**
 * Bottom-sheet install prompt.
 *
 * Mounted in the (Dashboard) layout, not the root layout — the (Public) /tools
 * calculators are anonymous SEO traffic with no data to come back to, and an
 * install nag there costs more than it wins.
 *
 * Opens on the "fitdose:entry-logged" event (see the DashboardInputs *Add
 * components) for any user who has not been prompted yet — deliberately not
 * "first ever log", or the existing user base would never see it.
 */
export default function InstallAppCard() {
    const {
        open,
        setOpen,
        installed,
        ios,
        isSupported,
        requestShow,
        promptInstall,
        dismiss,
    } = useInstallPrompt();

    useEffect(() => {
        const onEntryLogged = () => requestShow();
        const onManualRequest = () => setOpen(true);

        window.addEventListener("fitdose:entry-logged", onEntryLogged);
        window.addEventListener("fitdose:install-requested", onManualRequest);
        return () => {
            window.removeEventListener("fitdose:entry-logged", onEntryLogged);
            window.removeEventListener(
                "fitdose:install-requested",
                onManualRequest
            );
        };
    }, [requestShow, setOpen]);

    if (installed || !isSupported) return null;

    return (
        <Sheet
            open={open}
            onOpenChange={(next) => (next ? setOpen(true) : dismiss())}
        >
            <SheetContent side="bottom" className="rounded-t-2xl">
                <SheetHeader className="text-left">
                    <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#5E4AE3] to-[#7C3AED] text-white">
                            <Activity className="h-5 w-5" />
                        </div>
                        <div>
                            <SheetTitle className="text-lg">
                                Keep FitDose one tap away
                            </SheetTitle>
                            <SheetDescription className="text-sm">
                                Logging takes five seconds when it&apos;s on
                                your home screen.
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                {ios ? (
                    <div className="mt-2 space-y-3">
                        <ol className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-center gap-2">
                                <Share className="h-4 w-4 shrink-0 text-[#5E4AE3]" />
                                Tap <strong>Share</strong> in the Safari toolbar
                            </li>
                            <li className="flex items-center gap-2">
                                <SquarePlus className="h-4 w-4 shrink-0 text-[#5E4AE3]" />
                                Choose <strong>Add to Home Screen</strong>
                            </li>
                        </ol>
                        <p className="flex items-start gap-2 rounded-lg bg-purple-50 p-3 text-xs text-gray-600">
                            <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5E4AE3]" />
                            <span>
                                On iPhone this is also what lets us send you log
                                reminders later. You may need to sign in once
                                inside the app.
                            </span>
                        </p>
                        <button
                            type="button"
                            onClick={dismiss}
                            className="w-full py-2 text-center text-sm font-medium text-gray-500"
                        >
                            Got it
                        </button>
                    </div>
                ) : (
                    <div className="mt-4 space-y-2">
                        <button
                            type="button"
                            onClick={promptInstall}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#5E4AE3] to-[#7C3AED] py-2.5 text-sm font-medium text-white transition-all duration-300 hover:from-[#5E4AE3]/90 hover:to-[#7C3AED]/90"
                        >
                            <Download className="h-4 w-4" />
                            Install
                        </button>
                        <button
                            type="button"
                            onClick={dismiss}
                            className="w-full py-2 text-center text-sm font-medium text-gray-500"
                        >
                            Not now
                        </button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
