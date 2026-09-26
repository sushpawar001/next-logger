"use client";
/**
 * Dashboard quick log: one row for glucose, insulin or weight. Posts the same
 * payloads as GlucoseAdd / InsulinAdd / WeightAdd.
 */
import { useState, type FormEvent } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { Check, Clock, Loader2, Plus } from "lucide-react";
import { entryTags } from "@/constants/constants";
import notify from "@/helpers/notify";
import entryLogged from "@/helpers/entryLogged";
import { useAddEntry, mutationErrorMessage } from "@/hooks/queries/useEntryMutations";
import { useUserInsulins } from "@/hooks/queries/useReferenceData";
import { Panel, PanelHead, PanelTitle } from "@/components/app-ui/layout";
import { StatusBadge } from "@/components/app-ui/data";
import {
    AppButton,
    Chip,
    Dot,
    Field,
    SelectInput,
    Segmented,
    TextInput,
} from "@/components/app-ui/controls";
import { SERIES } from "@/components/Charts/RechartComponents/chartTheme";
import { cn } from "@/lib/utils";

type Metric = "glucose" | "insulin" | "weight";

const METRICS: Record<Metric, { label: string; unit: string; noun: string; step: string }> = {
    glucose: { label: "Reading", unit: "mg/dL", noun: "reading", step: "1" },
    insulin: { label: "Dose", unit: "IU", noun: "dose", step: "0.5" },
    weight: { label: "Weight", unit: "kg", noun: "weight", step: "0.1" },
};

const nowTime = () => dayjs().format("HH:mm");

export default function QuickLog({
    lastInsulin,
    className,
}: {
    /** Name of the most recently logged insulin, preselected. */
    lastInsulin?: string;
    className?: string;
}) {
    const [metric, setMetric] = useState<Metric>("glucose");
    const [value, setValue] = useState("");
    const [tag, setTag] = useState("");
    const [time, setTime] = useState(nowTime);
    // Unless the time is edited, the server stamps the entry, as the add forms do.
    const [timeTouched, setTimeTouched] = useState(false);
    const [insulinChoice, setInsulinChoice] = useState<string | null>(null);

    const { data: insulins = [] } = useUserInsulins();
    const insulinName =
        insulinChoice ??
        (insulins.some((i) => i.name === lastInsulin) ? lastInsulin : insulins[0]?.name) ??
        "";

    const glucoseAdd = useAddEntry("glucose");
    const insulinAdd = useAddEntry("insulin");
    const weightAdd = useAddEntry("weight");
    const mutation = { glucose: glucoseAdd, insulin: insulinAdd, weight: weightAdd }[metric];
    const meta = METRICS[metric];
    const numeric = parseFloat(value);

    const switchMetric = (m: Metric) => {
        setMetric(m);
        setValue("");
    };

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        let date: Date | null = null;
        if (timeTouched && /^\d{2}:\d{2}$/.test(time)) {
            const [h, m] = time.split(":").map(Number);
            date = dayjs().hour(h).minute(m).second(0).millisecond(0).toDate();
        }
        const payload =
            metric === "insulin"
                ? { units: value, name: insulinName, date, tag: tag || null }
                : { value, date, tag: tag || null };
        try {
            const response = await mutation.mutateAsync(payload);
            notify(response.message, "success");
            entryLogged();
            setValue("");
            setTag("");
            setTime(nowTime());
            setTimeTouched(false);
        } catch (error) {
            notify(mutationErrorMessage(error), "error");
        }
    };

    const noInsulins = metric === "insulin" && insulins.length === 0;

    return (
        <Panel as="form" onSubmit={submit} aria-labelledby="ql-title" className={className}>
            <PanelHead>
                <PanelTitle id="ql-title">Quick log</PanelTitle>
                <Segmented<Metric>
                    label="What to log"
                    value={metric}
                    onChange={switchMetric}
                    options={[
                        { value: "glucose", label: "Glucose" },
                        { value: "insulin", label: "Insulin" },
                        { value: "weight", label: "Weight" },
                    ]}
                />
            </PanelHead>

            {metric === "insulin" && (
                <div className="mb-4">
                    <div className="mb-1.5 flex items-baseline justify-between">
                        <span id="ql-insulin-label" className="text-[13px] font-semibold">
                            Insulin
                        </span>
                        <Link
                            href="/profile"
                            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-aubergine no-underline"
                        >
                            <Plus className="icon-spin h-3.5 w-3.5" aria-hidden="true" />
                            Add insulin
                        </Link>
                    </div>
                    {noInsulins ? (
                        <p className="text-[13px] text-brand-muted">
                            Add the insulins you use on your profile to log doses.
                        </p>
                    ) : (
                        <div role="radiogroup" aria-labelledby="ql-insulin-label" className="flex flex-wrap gap-2">
                            {insulins.map((ins, i) => (
                                <Chip
                                    key={ins._id}
                                    radio
                                    pressed={ins.name === insulinName}
                                    onClick={() => setInsulinChoice(ins.name)}
                                    leading={<Dot color={SERIES[i % SERIES.length]} />}
                                >
                                    {ins.name}
                                </Chip>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-2 items-end gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,0.9fr)_auto]">
                <Field label={meta.label} htmlFor="ql-value">
                    <TextInput
                        id="ql-value"
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step={meta.step}
                        required
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        suffix={meta.unit}
                    />
                </Field>
                <Field label="Tag" htmlFor="ql-tag">
                    <SelectInput id="ql-tag" value={tag} onChange={(e) => setTag(e.target.value)}>
                        <option value="">No tag</option>
                        {entryTags.map((t) => (
                            <option key={t}>{t}</option>
                        ))}
                    </SelectInput>
                </Field>
                <Field label="Time" htmlFor="ql-time">
                    <TextInput
                        id="ql-time"
                        type="time"
                        value={time}
                        onChange={(e) => {
                            setTime(e.target.value);
                            setTimeTouched(true);
                        }}
                        leading={<Clock className="h-4 w-4 flex-none" aria-hidden="true" />}
                    />
                </Field>
                <AppButton
                    type="submit"
                    size="field"
                    disabled={mutation.isPending || noInsulins || (metric === "insulin" && !insulinName)}
                    className="col-span-2 xl:col-span-1"
                >
                    {mutation.isPending ? (
                        <Loader2 className="animate-spin" aria-hidden="true" />
                    ) : (
                        <Check aria-hidden="true" />
                    )}
                    Save {meta.noun}
                </AppButton>
            </div>

            <div className={cn("mt-2.5 min-h-6", metric !== "glucose" && "hidden")} aria-live="polite">
                {metric === "glucose" && Number.isFinite(numeric) && <StatusBadge value={numeric} />}
            </div>
        </Panel>
    );
}
