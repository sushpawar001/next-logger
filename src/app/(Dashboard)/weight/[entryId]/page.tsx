"use client";
import React, { useEffect, useState } from "react";
import notify from "@/helpers/notify";
import formatDate, { DatetimeLocalFormat } from "@/helpers/formatDate";
import { useParams, useRouter } from "next/navigation";
import { entryTags } from "@/constants/constants";
import { Clock } from "lucide-react";
import { useEntry } from "@/hooks/queries/useEntries";
import {
    useUpdateEntry,
    useDeleteEntry,
    mutationErrorMessage,
} from "@/hooks/queries/useEntryMutations";
import { EditEntryShell } from "@/components/app-ui/EditEntryShell";
import { Field, TagPicker, TextInput } from "@/components/app-ui/controls";

export default function EditEntry() {
    const params = useParams<{ entryId: string }>();
    const [data, setData] = useState({ value: "", createdAt: "", tag: "" });
    const router = useRouter();

    const entry = useEntry("weight", params.entryId);
    const updateEntry = useUpdateEntry("weight", params.entryId);
    const deleteEntry = useDeleteEntry("weight");
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

    const submitForm = async (e) => {
        e.preventDefault();
        try {
            data.createdAt = new Date(data.createdAt).toISOString();
            const response = await updateEntry.mutateAsync(data);
            notify(response.message, "success");
            router.push("/weight/");
        } catch (error) {
            notify(mutationErrorMessage(error), "error");
        }
    };

    const deleteData = async (id) => {
        try {
            await deleteEntry.mutateAsync(id);
            notify("Weight data deleted!", "success");
            router.push("/weight");
        } catch (error) {
            notify(mutationErrorMessage(error), "error");
        }
    };

    const loggedAt = entry.data ? formatDate(entry.data.createdAt) : undefined;

    return (
        <EditEntryShell
            backHref="/weight"
            backLabel="Weight"
            title="Edit weigh-in"
            subtitle={loggedAt ? `Logged on ${loggedAt}` : undefined}
            formId="edit-weight"
            onSubmit={submitForm}
            isSubmitting={isSubmitting}
            isLoading={entry.isPending}
            noun="weigh-in"
            deleteDescription={
                entry.data
                    ? `${entry.data.value} kg${entry.data.tag ? ` · ${entry.data.tag}` : ""} · ${loggedAt}`
                    : undefined
            }
            onDelete={() => deleteData(params.entryId)}
            loggedAt={loggedAt}
        >
            <Field label="Weight" htmlFor="weight">
                <TextInput
                    type="number"
                    id="weight"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    placeholder="72.4"
                    value={data.value}
                    onChange={(e) => setData({ ...data, value: e.target.value })}
                    required
                    suffix="kg"
                    shellClassName="h-auto px-5 py-4 [&>span]:text-xl [&>span]:font-medium"
                    className="w-[4.4ch] flex-none text-[52px] leading-[1.1] font-semibold tracking-[-0.02em]"
                />
            </Field>

            <TagPicker
                id="weight_tag"
                tags={entryTags}
                value={data.tag}
                onChange={(tag) => setData({ ...data, tag })}
            />

            <Field label="Date & time" htmlFor="weightDate" className="sm:max-w-sm">
                <TextInput
                    type="datetime-local"
                    id="weightDate"
                    value={DatetimeLocalFormat(data.createdAt)}
                    onChange={(e) => setData({ ...data, createdAt: e.target.value })}
                    leading={<Clock className="h-4 w-4 flex-none" aria-hidden="true" />}
                />
            </Field>
        </EditEntryShell>
    );
}
