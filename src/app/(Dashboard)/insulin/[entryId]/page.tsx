"use client";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useParams, useRouter } from "next/navigation";
import notify from "@/helpers/notify";
import { DatetimeLocalFormat } from "@/helpers/formatDate";
import { entryTags } from "@/constants/constants";
import { useEntry } from "@/hooks/queries/useEntries";
import {
    useUpdateEntry,
    useDeleteEntry,
    mutationErrorMessage,
} from "@/hooks/queries/useEntryMutations";
import { useUserInsulins } from "@/hooks/queries/useReferenceData";
import { EditEntryShell } from "@/components/app-ui/EditEntryShell";
import {
    Chip,
    Field,
    TagPicker,
    TextInput,
    inputControl,
    inputShell,
} from "@/components/app-ui/controls";
import InsulinDot from "@/components/InsulinComponents/InsulinDot";

export default function EditEntry() {
    const params = useParams<{ entryId: string }>();
    const [data, setData] = useState({
        units: "",
        name: "",
        createdAt: "",
        tag: "",
    });
    // Shared with InsulinAdd and /profile through one cache entry, so arriving
    // here from /insulin costs no extra request.
    const { data: userInsulinType = [] } = useUserInsulins();
    const router = useRouter();

    const entry = useEntry("insulin", params.entryId);
    const updateEntry = useUpdateEntry("insulin", params.entryId);
    const deleteEntry = useDeleteEntry("insulin");
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

    const deleteData = async (id: string) => {
        try {
            await deleteEntry.mutateAsync(id);
            notify("Insulin data deleted!", "success");
            router.push("/insulin/");
        } catch (error) {
            notify(mutationErrorMessage(error), "error");
        }
    };

    const submitForm = async (e) => {
        e.preventDefault();
        try {
            const response = await updateEntry.mutateAsync({
                ...data,
                createdAt: new Date(data.createdAt).toISOString(),
            });
            notify(response.message, "success");
            router.push("/insulin/");
        } catch (error) {
            notify(mutationErrorMessage(error), "error");
        }
    };

    // Keep the entry's own insulin selectable even if it was since removed
    // from the profile list.
    const insulinNames = Array.from(
        new Set([...userInsulinType.map((t) => t.name), data.name].filter(Boolean))
    );
    const loggedAt = data.createdAt
        ? dayjs(data.createdAt).format("D MMM YYYY, HH:mm")
        : undefined;

    return (
        <EditEntryShell
            backHref="/insulin"
            backLabel="Insulin"
            title="Edit dose"
            subtitle={loggedAt ? `Logged on ${loggedAt}` : undefined}
            formId="edit-insulin"
            onSubmit={submitForm}
            isSubmitting={isSubmitting}
            isLoading={entry.isPending}
            noun="dose"
            deleteDescription={
                data.units !== ""
                    ? `${data.units} IU ${data.name}${data.tag ? ` · ${data.tag}` : ""}${loggedAt ? ` · ${loggedAt}` : ""}`
                    : undefined
            }
            onDelete={() => deleteData(params.entryId)}
            loggedAt={loggedAt}
        >
            <Field label="Dose" htmlFor="insulin">
                <TextInput
                    type="number"
                    id="insulin"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    placeholder="10"
                    value={data.units}
                    onChange={(e) => setData({ ...data, units: e.target.value })}
                    suffix="IU"
                    shellClassName="h-auto px-5 py-4"
                    className="w-[3.4ch] flex-none text-[40px] leading-[1.1] font-semibold tracking-[-0.02em] lg:text-[52px]"
                    required
                />
            </Field>

            <div>
                <span
                    id="insulinType-label"
                    className="mb-1.5 block text-[13px] font-semibold text-brand-ink"
                >
                    Insulin
                </span>
                <div
                    role="radiogroup"
                    aria-labelledby="insulinType-label"
                    className="flex flex-wrap gap-2"
                >
                    {insulinNames.map((name) => (
                        <Chip
                            key={name}
                            radio
                            pressed={data.name === name}
                            onClick={() => setData({ ...data, name })}
                            leading={<InsulinDot name={name} />}
                        >
                            {name}
                        </Chip>
                    ))}
                </div>
            </div>

            <TagPicker
                id="insulin_tag"
                tags={entryTags}
                value={data.tag}
                onChange={(tag) => setData({ ...data, tag })}
            />

            <Field label="Date & time" htmlFor="insulinDate">
                <div className={inputShell}>
                    <input
                        type="datetime-local"
                        id="insulinDate"
                        className={inputControl}
                        value={DatetimeLocalFormat(data.createdAt)}
                        onChange={(e) => setData({ ...data, createdAt: e.target.value })}
                    />
                </div>
            </Field>
        </EditEntryShell>
    );
}
