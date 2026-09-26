"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Plus } from "lucide-react";
import { entryTags } from "@/constants/constants";
import notify from "@/helpers/notify";
import entryLogged from "@/helpers/entryLogged";
import { DatetimeLocalFormat } from "@/helpers/formatDate";
import InsulinDot from "@/components/InsulinComponents/InsulinDot";
import { useUserInsulins } from "@/hooks/queries/useReferenceData";
import { useAddEntry, mutationErrorMessage } from "@/hooks/queries/useEntryMutations";
import {
    AppButton,
    Chip,
    Field,
    SelectInput,
    TextInput,
    inputControl,
    inputShell,
} from "@/components/app-ui/controls";

export default function InsulinAdd(props: {
    autoFocus?: boolean;
    /** Called after a dose is saved, e.g. to close the dialog around the form. */
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

    const [insulin, setInsulin] = useState("");
    const [insulinType, setInsulinType] = useState("");
    // Shared with the insulin edit page and /profile, and deduped across the
    // dashboard and /insulin. A failed lookup leaves the choice list empty
    // rather than rejecting into nothing (docs/BUGS.md #19).
    const { data: userInsulinType = [] } = useUserInsulins();
    const addEntry = useAddEntry("insulin");
    // isPending resets on error too, so a failed submit re-enables the button.
    const isSubmitting = addEntry.isPending;
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectTag, setSelectTag] = useState<string>(null);
    const [sendTime, setSendTime] = useState(false);

    // With a single insulin there is nothing to choose.
    const chosenType =
        insulinType ||
        (userInsulinType.length === 1 ? userInsulinType[0].name : "");

    const handleDateChange = (event: { target: { value: string } }) => {
        setSendTime(true);
        setSelectedDate(new Date(event.target.value));
    };

    const submitForm = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        // The type chips are buttons, so `required` can't enforce a choice.
        if (!chosenType) {
            notify("Choose which insulin you took.", "error");
            return;
        }
        try {
            const response = await addEntry.mutateAsync({
                units: insulin,
                name: chosenType,
                date: sendTime ? selectedDate : null,
                tag: selectTag,
            });
            notify(response.message, "success");
            entryLogged();
            setInsulinType("");
            setInsulin("");
            setSelectedDate(new Date());
            setSendTime(false);
            setSelectTag(null);
            props.onSaved?.();
        } catch (error) {
            notify(mutationErrorMessage(error), "error");
        }
    };

    return (
        <form className="space-y-4" onSubmit={submitForm} aria-label="Log insulin dose">
            <div>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span id="insulinType-label" className="text-[13px] font-semibold text-brand-ink">
                        Insulin
                    </span>
                    <Link
                        href="/profile"
                        className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-aubergine no-underline"
                    >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        Add insulin
                    </Link>
                </div>
                {userInsulinType.length === 0 ? (
                    <p className="text-[13px] text-brand-muted">
                        No insulins yet. Add the ones you use in your profile.
                    </p>
                ) : (
                    <div
                        role="radiogroup"
                        aria-labelledby="insulinType-label"
                        className="flex flex-wrap gap-2"
                    >
                        {userInsulinType.map((type) => (
                            <Chip
                                key={type._id}
                                radio
                                pressed={chosenType === type.name}
                                onClick={() => setInsulinType(type.name)}
                                leading={<InsulinDot name={type.name} />}
                            >
                                {type.name}
                            </Chip>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Dose" htmlFor="insulin">
                    <TextInput
                        ref={valueInputRef}
                        type="number"
                        id="insulin"
                        inputMode="decimal"
                        step="any"
                        min="0"
                        placeholder="10"
                        value={insulin}
                        onChange={(e) => setInsulin(e.target.value)}
                        suffix="IU"
                        required
                    />
                </Field>
                <Field label="Tag" htmlFor="insulin_tag">
                    <SelectInput
                        id="insulin_tag"
                        value={selectTag ?? ""}
                        onChange={(e) => setSelectTag(e.target.value || null)}
                    >
                        <option value="">Select Tag</option>
                        {entryTags.map((tag) => (
                            <option key={tag}>{tag}</option>
                        ))}
                    </SelectInput>
                </Field>
            </div>

            <Field label="Date & time" htmlFor="insulinDate">
                <div className={inputShell}>
                    <input
                        type="datetime-local"
                        id="insulinDate"
                        className={inputControl}
                        value={DatetimeLocalFormat(selectedDate)}
                        onChange={handleDateChange}
                        required
                    />
                </div>
            </Field>

            <AppButton type="submit" size="field" block disabled={isSubmitting}>
                {isSubmitting ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                    <Check aria-hidden="true" />
                )}
                Save dose
            </AppButton>
        </form>
    );
}
