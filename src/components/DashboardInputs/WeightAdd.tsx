"use client";
import notify from "@/helpers/notify";
import entryLogged from "@/helpers/entryLogged";
import React, { useEffect, useRef, useState } from "react";
import { DatetimeLocalFormat } from "@/helpers/formatDate";
import { entryTags } from "@/constants/constants";
import { Check, Clock, Loader2 } from "lucide-react";
import { useAddEntry, mutationErrorMessage } from "@/hooks/queries/useEntryMutations";
import {
    AppButton,
    Field,
    TagPicker,
    TextInput,
} from "@/components/app-ui/controls";

/**
 * Log a weigh-in. Bare (no card) so it sits inside LogEntryDialog; `onSaved`
 * lets the dialog close after a successful save.
 */
export default function WeightAdd(props: {
    autoFocus?: boolean;
    onSaved?: () => void;
}) {
    const valueInputRef = useRef<HTMLInputElement>(null);

    // Focused when arriving from a PWA manifest shortcut (?quick=1). Driven by an
    // effect rather than the autoFocus attribute, which only applies on mount —
    // the page reads the query param after hydration.
    useEffect(() => {
        if (!props.autoFocus) return;
        valueInputRef.current?.focus();
        valueInputRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    }, [props.autoFocus]);

    const [weight, setWeight] = useState("");
    const addEntry = useAddEntry("weight");
    // isPending resets on error too. The hand-rolled flag it replaces was
    // only cleared on the success path, so a failed submit left the button
    // disabled and spinning until reload.
    const isSubmitting = addEntry.isPending;
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [sendTime, setSendTime] = useState(false);
    const [selectTag, setSelectTag] = useState<string>(null);

    const handleDateChange = (event: { target: { value: string } }) => {
        setSendTime(true);
        setSelectedDate(new Date(event.target.value));
    };

    const submitForm = async (e) => {
        e.preventDefault();
        try {
            const response = await addEntry.mutateAsync({
                value: weight,
                date: sendTime ? selectedDate : null,
                tag: selectTag,
            });
            notify(response.message, "success");
            entryLogged();
            setWeight("");
            setSelectedDate(new Date());
            setSendTime(false);
            setSelectTag(null);
            props.onSaved?.();
        } catch (error) {
            notify(mutationErrorMessage(error), "error");
        }
    };

    return (
        <form className="space-y-5" onSubmit={submitForm} aria-label="Log weight">
            <Field label="Weight" htmlFor="weight">
                <TextInput
                    type="number"
                    id="weight"
                    ref={valueInputRef}
                    inputMode="decimal"
                    placeholder="72.4"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    step="any"
                    min="0"
                    required
                    suffix="kg"
                />
            </Field>
            <Field label="Date & time" htmlFor="weight_date">
                <TextInput
                    type="datetime-local"
                    id="weight_date"
                    value={DatetimeLocalFormat(selectedDate)}
                    onChange={handleDateChange}
                    leading={<Clock className="h-4 w-4 flex-none" aria-hidden="true" />}
                />
            </Field>
            <TagPicker
                id="weight_tag"
                tags={entryTags}
                value={selectTag}
                onChange={setSelectTag}
            />
            <AppButton type="submit" size="lg" block disabled={isSubmitting}>
                {isSubmitting ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                    <Check aria-hidden="true" />
                )}
                Save weight
            </AppButton>
        </form>
    );
}
