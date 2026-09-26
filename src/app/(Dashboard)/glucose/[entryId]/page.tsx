"use client";
import React, { useEffect, useState } from "react";
import notify from "@/helpers/notify";
import { DatetimeLocalFormat } from "@/helpers/formatDate";
import { useParams, useRouter } from "next/navigation";
import { entryTags, GLUCOSE_TARGET } from "@/constants/constants";
import { useEntry } from "@/hooks/queries/useEntries";
import {
    useUpdateEntry,
    useDeleteEntry,
    mutationErrorMessage,
} from "@/hooks/queries/useEntryMutations";
import { EditEntryShell } from "@/components/app-ui/EditEntryShell";
import {
    Field,
    TagPicker,
    TextInput,
    inputControl,
} from "@/components/app-ui/controls";
import { StatusBadge } from "@/components/app-ui/data";
import GlucoseDayContext, {
    contextWindow,
} from "@/components/glucose/GlucoseDayContext";
import { dayTimeLabel, longLabel } from "@/components/glucose/glucoseSummary";
import { cn } from "@/lib/utils";

export default function EditEntry() {
    const params = useParams<{ entryId: string }>();
    const [data, setData] = useState({ value: "", createdAt: "", tag: "" });
    const router = useRouter();

    const entry = useEntry("glucose", params.entryId);
    const updateEntry = useUpdateEntry("glucose", params.entryId);
    const deleteEntry = useDeleteEntry("glucose");
    const isSubmitting = updateEntry.isPending || deleteEntry.isPending;

    // The form is an edited draft, so it stays local state and is seeded from
    // the query rather than bound to it.
    useEffect(() => {
        if (!entry.data) return;
        setData({
            ...entry.data,
            createdAt: DatetimeLocalFormat(entry.data.createdAt),
        });
    }, [entry.data]);
    const changeValue = (event) => {
        setData({ ...data, value: event.target.value });
    };
    const changeTag = (tag: string | null) => {
        setData({ ...data, tag });
    };
    const changeDate = (event) => {
        setData({ ...data, createdAt: event.target.value });
    };

    const submitForm = async (e) => {
        e.preventDefault();
        try {
            const response = await updateEntry.mutateAsync({
                ...data,
                createdAt: new Date(data.createdAt).toISOString(),
            });
            notify(response.message, "success");
            router.push("/glucose");
        } catch (error) {
            notify(mutationErrorMessage(error), "error");
        }
    };

    const deleteData = async (id) => {
        try {
            await deleteEntry.mutateAsync(id);
            notify("Glucose data deleted!", "success");
            router.push("/glucose");
        } catch (error) {
            notify(mutationErrorMessage(error), "error");
        }
    };

    const reading = parseFloat(String(data.value));
    const saved = entry.data;
    const ctxDays = saved?.createdAt ? contextWindow(saved.createdAt) : null;

    return (
        <EditEntryShell
            backHref="/glucose"
            backLabel="Glucose"
            title="Edit reading"
            subtitle={saved?.createdAt ? `Logged on ${longLabel(saved.createdAt)}` : undefined}
            formId="edit-glucose"
            onSubmit={submitForm}
            isSubmitting={isSubmitting}
            isLoading={entry.isPending}
            noun="reading"
            deleteDescription={
                saved
                    ? `${saved.value} mg/dL${saved.tag ? ` · ${saved.tag}` : ""} · ${dayTimeLabel(saved.createdAt)}`
                    : undefined
            }
            onDelete={() => deleteData(params.entryId)}
            loggedAt={saved?.createdAt ? dayTimeLabel(saved.createdAt) : undefined}
            context={
                saved?.createdAt && ctxDays ? (
                    <GlucoseDayContext createdAt={saved.createdAt} days={ctxDays} />
                ) : null
            }
        >
            <Field
                label="Reading"
                htmlFor="glucose"
                help={`Your target range is ${GLUCOSE_TARGET.low}–${GLUCOSE_TARGET.high} mg/dL. The status updates as you type.`}
            >
                <div className="flex flex-wrap items-center gap-2.5 rounded-lg border border-border bg-white px-5 py-4 text-brand-muted focus-within:border-brand-lavender focus-within:shadow-[0_0_0_1px_#8E78C4]">
                    <input
                        type="number"
                        id="glucose"
                        inputMode="numeric"
                        className={cn(
                            inputControl,
                            "w-[3.4ch] flex-none text-[44px] leading-[1.1] font-semibold tracking-[-0.02em] lg:text-[52px]"
                        )}
                        placeholder="98"
                        value={data.value}
                        onChange={changeValue}
                        required
                    />
                    <span className="flex-1 text-xl font-medium">mg/dL</span>
                    <span aria-live="polite">
                        {Number.isFinite(reading) && <StatusBadge value={reading} />}
                    </span>
                </div>
            </Field>

            <TagPicker
                id="glucose-tag"
                value={data.tag}
                onChange={changeTag}
                tags={entryTags}
            />

            <Field label="Date & time" htmlFor="glucoseDate" className="max-w-sm">
                <TextInput
                    type="datetime-local"
                    id="glucoseDate"
                    value={data.createdAt ? DatetimeLocalFormat(data.createdAt) : ""}
                    onChange={changeDate}
                    className="text-[15px]"
                />
            </Field>
        </EditEntryShell>
    );
}
