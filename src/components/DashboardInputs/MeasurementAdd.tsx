"use client";
import notify from "@/helpers/notify";
import entryLogged from "@/helpers/entryLogged";
import { Check, Loader2 } from "lucide-react";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { entryTags } from "@/constants/constants";
import MeasurementInput from "../MeasurementInput";
import { AppButton, TagPicker } from "@/components/app-ui/controls";
import { useAddEntry, mutationErrorMessage } from "@/hooks/queries/useEntryMutations";
import { cn } from "@/lib/utils";

const dataInputs = [
    "arms",
    "chest",
    "abdomen",
    "waist",
    "hip",
    "thighs",
    "calves",
];

const EMPTY = {
    arms: "",
    chest: "",
    abdomen: "",
    waist: "",
    hip: "",
    thighs: "",
    calves: "",
};

/**
 * The seven circumferences plus a tag. Bare (no card): it renders inside the
 * Measurements page's log dialog.
 */
export default function MeasurementAdd({
    className = "",
    autoFocus = false,
    onSaved,
}: {
    className?: string;
    autoFocus?: boolean;
    /** Called after a successful save, e.g. to close the dialog. */
    onSaved?: () => void;
}) {
    const formRef = useRef<HTMLFormElement>(null);

    // Arriving from a PWA manifest shortcut (?quick=1): start on the first field.
    useEffect(() => {
        if (!autoFocus) return;
        formRef.current?.querySelector("input")?.focus();
    }, [autoFocus]);

    const [measurements, setMeasurements] = useState(EMPTY);
    const addEntry = useAddEntry("measurements");
    // isPending resets on error too. The hand-rolled flag it replaces was
    // only cleared on the success path, so a failed submit left the button
    // disabled and spinning until reload.
    const isSubmitting = addEntry.isPending;
    const [selectTag, setSelectTag] = useState<string>(null);

    const changeMeasurements = (event: ChangeEvent<HTMLInputElement>) => {
        const name = event.target.name;
        const value = event.target.value;
        setMeasurements((m) => ({
            ...m,
            [name]: value,
        }));
    };
    const submitForm = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        try {
            const response = await addEntry.mutateAsync({
                measurements: measurements,
                tag: selectTag,
            });
            notify(response.message, "success");
            entryLogged();
            setMeasurements(EMPTY);
            setSelectTag(null);
            onSaved?.();
        } catch (error) {
            notify(mutationErrorMessage(error), "error");
        }
    };

    return (
        <form
            ref={formRef}
            className={cn("space-y-5", className)}
            onSubmit={submitForm}
            aria-label="Log measurements"
        >
            <div className="grid grid-cols-2 gap-x-3 gap-y-4 [&>*:last-child]:col-span-2">
                {dataInputs.map((input) => (
                    <MeasurementInput
                        key={input}
                        label={input}
                        id={input}
                        onChange={changeMeasurements}
                        value={measurements[input]}
                    />
                ))}
            </div>
            <TagPicker
                id="measurement_tag"
                value={selectTag}
                onChange={setSelectTag}
                tags={entryTags}
            />
            <div className="flex gap-3">
                <AppButton
                    variant="secondary"
                    type="reset"
                    disabled={isSubmitting}
                    onClick={() => {
                        setMeasurements(EMPTY);
                        setSelectTag(null);
                    }}
                >
                    Clear
                </AppButton>
                <AppButton type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <Loader2 className="animate-spin" aria-hidden="true" />
                    ) : (
                        <Check aria-hidden="true" />
                    )}
                    Save measurements
                </AppButton>
            </div>
        </form>
    );
}
