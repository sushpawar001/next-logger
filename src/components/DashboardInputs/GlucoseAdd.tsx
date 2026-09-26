"use client";
import { entryTags, GLUCOSE_TARGET } from "@/constants/constants";
import { DatetimeLocalFormat } from "@/helpers/formatDate";
import notify from "@/helpers/notify";
import entryLogged from "@/helpers/entryLogged";
import { Check, Loader2 } from "lucide-react";
import { useAddEntry, mutationErrorMessage } from "@/hooks/queries/useEntryMutations";
import { useEffect, useRef, useState } from "react";
import {
    AppButton,
    Field,
    SelectInput,
    TextInput,
} from "@/components/app-ui/controls";
import { StatusBadge } from "@/components/app-ui/data";

/**
 * Log one glucose reading. Rendered bare (no card) so it sits inside the
 * "Log glucose" dialog; the dialog supplies the title.
 */
export default function GlucoseAdd(props: {
    autoFocus?: boolean;
    /** Called after a successful save, e.g. to close the dialog. */
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

    const [glucose, setGlucose] = useState("");
    const [sendTime, setSendTime] = useState(false);
    const [selectTag, setSelectTag] = useState<string>(null);
    const addEntry = useAddEntry("glucose");
    // isPending resets on error too. The hand-rolled flag it replaces was
    // only cleared on the success path, so a failed submit left the button
    // disabled and spinning until reload.
    const isSubmitting = addEntry.isPending;
    const [selectedDate, setSelectedDate] = useState(new Date());

    const reading = parseFloat(glucose);

    const changeGlucose = (event: { target: { value: string } }): void => {
        setGlucose(event.target.value);
    };

    const handleTagChange = (event: { target: { value: string } }) => {
        setSelectTag(event.target.value || null);
    };

    const handleDateChange = (event: { target: { value: string } }) => {
        setSendTime(true);
        setSelectedDate(new Date(event.target.value));
    };

    const submitForm = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        try {
            const response = await addEntry.mutateAsync({
                value: glucose,
                date: sendTime ? selectedDate : null,
                tag: selectTag,
            });
            notify(response.message, "success");
            entryLogged();
            setGlucose("");
            setSendTime(false);
            setSelectTag(null);
            setSelectedDate(new Date());
            props.onSaved?.();
        } catch (error) {
            notify(mutationErrorMessage(error), "error");
        }
    };
    return (
        <form className="space-y-4" onSubmit={submitForm}>
            <Field
                label="Glucose reading"
                htmlFor="glucose"
                help={`Your target range is ${GLUCOSE_TARGET.low}–${GLUCOSE_TARGET.high} mg/dL.`}
            >
                <TextInput
                    type="number"
                    id="glucose"
                    inputMode="decimal"
                    ref={valueInputRef}
                    placeholder="98"
                    value={glucose}
                    onChange={changeGlucose}
                    suffix="mg/dL"
                    required
                />
            </Field>
            <div className="min-h-6" aria-live="polite">
                {Number.isFinite(reading) && <StatusBadge value={reading} />}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Tag" htmlFor="glucose_tag">
                    <SelectInput
                        id="glucose_tag"
                        value={selectTag ?? ""}
                        onChange={handleTagChange}
                    >
                        <option value="">Select Tag</option>
                        {entryTags.map((data) => (
                            <option key={data}>{data}</option>
                        ))}
                    </SelectInput>
                </Field>
                <Field label="Date & time" htmlFor="glucoseDate">
                    <TextInput
                        type="datetime-local"
                        id="glucoseDate"
                        value={DatetimeLocalFormat(selectedDate)}
                        onChange={handleDateChange}
                        className="text-[15px]"
                    />
                </Field>
            </div>
            <AppButton type="submit" size="lg" block disabled={isSubmitting}>
                {isSubmitting ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                    <Check aria-hidden="true" />
                )}
                Save reading
            </AppButton>
        </form>
    );
}
