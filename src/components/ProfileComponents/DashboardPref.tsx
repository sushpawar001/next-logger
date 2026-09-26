import {
    getDashboardLayout,
    setDashboardLayoutLocal,
} from "@/helpers/getDashboardLayout";
import notify from "@/helpers/notify";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Panel, PanelHead, PanelSub, PanelTitle } from "@/components/app-ui/layout";
import { AppButton } from "@/components/app-ui/controls";
import { cn } from "@/lib/utils";

const layoutSettingsOptions = [
    {
        value: "diabetes",
        label: "Diabetes",
        help: "Glucose, insulin and time in range first",
    },
    {
        value: "fitness",
        label: "Fitness",
        help: "Weight and measurements first",
    },
];

export default function DashboardPreferences({
    className = "",
}: {
    className?: string;
}) {
    const [layoutSettings, setLayoutSettings] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isChanged, setIsChanged] = useState(false);

    useEffect(() => {
        const getLayout = async () => {
            const layout = await getDashboardLayout();
            setLayoutSettings(layout);
        };
        getLayout();
    }, []);

    const changeValue = (event) => {
        setLayoutSettings(event.target.value);
        setIsChanged(true);
    };

    const submitValue = async (event) => {
        event.preventDefault();
        if (isChanged) {
            setIsSubmitting(true);
            const response = await axios.post("/api/users/set-layout", {
                layoutSettings: layoutSettings,
            });
            setDashboardLayoutLocal(layoutSettings);
            setIsSubmitting(false);
            setIsChanged(false);
            notify(response.data.message, "success");
        }
    };

    return (
        <Panel as="form" onSubmit={submitValue} className={className} aria-labelledby="dash-title">
            <PanelHead>
                <div>
                    <PanelTitle id="dash-title">Dashboard</PanelTitle>
                    <PanelSub>Choose what your home screen focuses on.</PanelSub>
                </div>
            </PanelHead>
            <fieldset className="m-0 grid grid-cols-1 gap-4 border-0 p-0 sm:grid-cols-2">
                <legend className="sr-only">Dashboard layout</legend>
                {layoutSettingsOptions.map((o) => {
                    const checked = layoutSettings === o.value;
                    return (
                        <label
                            key={o.value}
                            className={cn(
                                "block cursor-pointer rounded-[14px] border p-4 transition-shadow",
                                checked
                                    ? "border-brand-aubergine shadow-[0_0_0_1px_#4A3470]"
                                    : "border-border"
                            )}
                        >
                            <Preview value={o.value} />
                            <span className="mt-4 inline-flex items-center gap-2.5 text-[15px] font-medium text-brand-ink">
                                <input
                                    type="radio"
                                    name="dashboardType"
                                    value={o.value}
                                    checked={checked}
                                    onChange={changeValue}
                                    className="m-0 h-5 w-5 cursor-pointer accent-brand-aubergine"
                                />
                                {o.label}
                            </span>
                            <p className="mt-1 ml-[30px] text-xs text-brand-muted">
                                {o.help}
                            </p>
                        </label>
                    );
                })}
            </fieldset>
            <div className="mt-5 flex justify-end">
                <AppButton
                    type="submit"
                    variant="secondary"
                    disabled={isSubmitting || !isChanged}
                >
                    {isSubmitting && (
                        <Loader2 className="animate-spin" aria-hidden="true" />
                    )}
                    Save
                </AppButton>
            </div>
        </Panel>
    );
}

/** A small sketch of each dashboard, so the choice reads at a glance. */
function Preview({ value }: { value: string }) {
    if (value === "diabetes") {
        return (
            <div className="grid h-[110px] grid-cols-[1.4fr_1fr] gap-2 rounded-lg bg-brand-cream p-3" aria-hidden="true">
                <div className="rounded-md border border-border bg-white px-3 py-2.5">
                    <div className="text-xl font-semibold tabular-nums text-brand-ink">126</div>
                    <div className="mt-2 h-2.5 w-12 rounded-full bg-status-in-bg" />
                </div>
                <div className="grid gap-2">
                    <div className="rounded-md border border-border bg-white" />
                    <div className="rounded-md border border-border bg-white" />
                </div>
            </div>
        );
    }
    return (
        <div className="h-[110px] rounded-lg bg-brand-cream p-3" aria-hidden="true">
            <svg viewBox="0 0 200 84" className="h-full w-full rounded-md border border-border bg-white p-2" preserveAspectRatio="none">
                <polyline
                    points="0,30 30,34 60,28 90,42 120,46 150,52 180,58 200,60"
                    fill="none"
                    stroke="#8E78C4"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
        </div>
    );
}
