"use client";
import { useEffect, useState, type ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Remembered for the browser tab only, so each new visit asks again. */
export const DOSING_ACK_KEY = "fitdose:dosing-ack";

function readAck(): boolean {
    try {
        return sessionStorage.getItem(DOSING_ACK_KEY) === "1";
    } catch {
        return false;
    }
}

/**
 * Hides a dosing calculator until the visitor confirms they understand it is
 * educational and not a substitute for their care team's settings. The page's
 * explanatory content stays visible (and crawlable) either way.
 */
export default function DosingGate({ children }: { children: ReactNode }) {
    const [accepted, setAccepted] = useState(false);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage is only readable after hydration
        if (readAck()) setAccepted(true);
    }, []);

    if (accepted) return <>{children}</>;

    const accept = () => {
        try {
            sessionStorage.setItem(DOSING_ACK_KEY, "1");
        } catch {
            // Storage blocked: the gate simply shows again next time.
        }
        setAccepted(true);
    };

    return (
        <Card className="border-2 border-amber-300 bg-amber-50 shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-amber-900">
                    <ShieldAlert className="h-5 w-5" aria-hidden="true" />
                    Before you use this calculator
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-amber-900">
                <ul className="list-disc space-y-1 pl-5">
                    <li>
                        It uses general rules of thumb. Your own ratios and
                        correction factor should come from your diabetes care
                        team and can differ a lot from these estimates.
                    </li>
                    <li>
                        It is for education and for discussing settings with
                        your team. Do not use it to change your insulin doses
                        on your own.
                    </li>
                    <li>
                        A wrong insulin dose can cause dangerous low or high
                        blood sugar. If you feel unwell, follow your care plan
                        or get medical help.
                    </li>
                </ul>
                <label className="flex items-start gap-2">
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                        className="mt-0.5 h-4 w-4"
                    />
                    <span>
                        I understand this is for education only and is not
                        medical advice.
                    </span>
                </label>
                <Button type="button" disabled={!checked} onClick={accept}>
                    Show the calculator
                </Button>
            </CardContent>
        </Card>
    );
}
