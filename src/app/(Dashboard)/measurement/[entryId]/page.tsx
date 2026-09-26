"use client";
import React, { useEffect, useState, ChangeEvent } from "react";
import notify from "@/helpers/notify";
import formatDate, { DatetimeLocalFormat } from "@/helpers/formatDate";
import { useParams, useRouter } from "next/navigation";
import { entryTags } from "@/constants/constants";
import { CalendarClock } from "lucide-react";
import { useEntry } from "@/hooks/queries/useEntries";
import {
    useUpdateEntry,
    useDeleteEntry,
    mutationErrorMessage,
} from "@/hooks/queries/useEntryMutations";
import MeasurementInput from "@/components/MeasurementInput";
import { EditEntryShell } from "@/components/app-ui/EditEntryShell";
import { Field, TagPicker, TextInput } from "@/components/app-ui/controls";
import { filledCount } from "@/components/measurement/measurementSummary";

const dataInputs = [
    "arms",
    "chest",
    "abdomen",
    "waist",
    "hip",
    "thighs",
    "calves",
];

export default function EditEntry() {
    const params = useParams<{ entryId: string }>();
    const [data, setData] = useState({
        arms: "",
        chest: "",
        abdomen: "",
        waist: "",
        hip: "",
        thighs: "",
        calves: "",
        createdAt: "",
        tag: "",
    });
    const router = useRouter();

    const entry = useEntry("measurements", params.entryId);
    const updateEntry = useUpdateEntry("measurements", params.entryId);
    const deleteEntry = useDeleteEntry("measurements");
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
    const changeDate = (event) => {
        setData({ ...data, createdAt: event.target.value });
    };
    const changeTag = (tag: string | null) => {
        setData({ ...data, tag });
    };

    const submitForm = async (e) => {
        e.preventDefault();
        try {
            data.createdAt = new Date(data.createdAt).toISOString();
            const response = await updateEntry.mutateAsync(data);
            notify(response.message, "success");
            router.push("/measurement/");
        } catch (error) {
            notify(mutationErrorMessage(error), "error");
        }
    };

    const changeMeasurements = (event: ChangeEvent<HTMLInputElement>) => {
        const name = event.target.name;
        const value = event.target.value;
        setData((m) => ({
            ...m,
            [name]: value,
        }));
    };

    const deleteData = async (id) => {
        try {
            await deleteEntry.mutateAsync(id);
            notify("Measurements data deleted!", "success");
            router.push("/measurement/");
        } catch (error) {
            notify(mutationErrorMessage(error), "error");
        }
    };

    const loggedAt = entry.data?.createdAt
        ? formatDate(entry.data.createdAt)
        : undefined;

    return (
        <EditEntryShell
            backHref="/measurement"
            backLabel="Measurements"
            title="Edit measurements"
            subtitle={loggedAt ? `Logged on ${loggedAt}` : undefined}
            formId="edit-measurement"
            onSubmit={submitForm}
            isSubmitting={isSubmitting}
            isLoading={entry.isPending}
            noun="measurement"
            deleteDescription={
                entry.data
                    ? `${filledCount(entry.data)} of 7 measurements · ${loggedAt}`
                    : undefined
            }
            onDelete={() => deleteData(params.entryId)}
            loggedAt={loggedAt}
        >
            <div className="grid grid-cols-2 gap-x-3 gap-y-4 lg:grid-cols-4 lg:gap-x-4">
                {dataInputs.map((input) => (
                    <MeasurementInput
                        key={input}
                        label={input}
                        id={input}
                        onChange={changeMeasurements}
                        value={data[input]}
                    />
                ))}
            </div>
            <TagPicker
                id="measurement_tag"
                value={data.tag}
                onChange={changeTag}
                tags={entryTags}
            />
            <Field label="Date & time" htmlFor="measurementDate" className="max-w-xs">
                <TextInput
                    type="datetime-local"
                    id="measurementDate"
                    value={DatetimeLocalFormat(data.createdAt)}
                    onChange={changeDate}
                    leading={<CalendarClock className="h-4 w-4 flex-none" aria-hidden="true" />}
                />
            </Field>
        </EditEntryShell>
    );
}
