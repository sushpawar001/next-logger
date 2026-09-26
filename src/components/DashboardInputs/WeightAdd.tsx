"use client";
import notify from "@/helpers/notify";
import entryLogged from "@/helpers/entryLogged";
import React, { useEffect, useRef, useState } from "react";
import { DatetimeLocalFormat } from "@/helpers/formatDate";
import { entryTags } from "@/constants/constants";
import { Droplets, Weight, Syringe, Loader2 } from "lucide-react";
import { useAddEntry, mutationErrorMessage } from "@/hooks/queries/useEntryMutations";

export default function WeightAdd(props) {
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

    const handleTagChange = (event: { target: { value: string } }) => {
        setSelectTag(event.target.value);
    };

    const handleDateChange = (event: { target: { value: string } }) => {
        setSendTime(true);
        setSelectedDate(new Date(event.target.value));
    };
    const changeWeight = (event: { target: { value: string } }) => {
        setWeight(event.target.value);
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
        } catch (error) {
            notify(mutationErrorMessage(error), "error");
        }
    };
    return (
        <form
            className="max-w-full mx-auto p-4 md:px-6 py-5 rounded-lg bg-white border border-border transition-all duration-300 h-full shadow-md"
            onSubmit={submitForm}
        >
            <div className="flex items-center gap-3 text-lg font-semibold text-gray-900 mb-3">
                <div
                    className={`p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600`}
                >
                    <Weight className="h-4 w-4 text-white" />
                </div>
                Body Weight
            </div>
            <div className="flex flex-col space-y-3">
                <div className="space-y-2">
                    <label
                        className="text-sm font-medium text-gray-700"
                        htmlFor="weight"
                    >
                        Weight (kg)
                    </label>
                    <input
                        type="number"
                        id="weight"
                        ref={valueInputRef}
                        className="border text-sm rounded-lg block w-full px-2.5 py-2 border-border focus:border-primary focus:ring-ring h-10 outline-none"
                        placeholder="72 kg"
                        value={weight}
                        onChange={changeWeight}
                        step="any"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label
                        className="text-sm font-medium text-gray-700"
                        htmlFor="weight_date"
                    >
                        Date & Time
                    </label>
                    <input
                        type="datetime-local"
                        id="weight_date"
                        className="border text-sm rounded-lg block w-full px-2.5 py-2 placeholder:text-red-500 border-border focus:border-primary focus:ring-ring h-10 bg-white outline-none"
                        value={DatetimeLocalFormat(selectedDate)}
                        onChange={handleDateChange}
                    />
                </div>
                <div className="space-y-2">
                    <label
                        className="text-sm font-medium text-gray-700"
                        htmlFor="weight_tag"
                    >
                        Measurement Tag
                    </label>
                    <select
                        id="weight_tag"
                        value={selectTag ?? ""}
                        onChange={handleTagChange}
                        className="border border-border focus:border-primary focus:ring-ring text-gray-900 text-sm rounded-lg block w-full px-2.5 py-2 invalid:text-gray-400 h-10 bg-white outline-none"
                    >
                        <option value="" disabled>
                            Select Tag
                        </option>
                        {entryTags.map((data) => (
                            <option key={data}>{data}</option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    className="font-medium rounded-lg text-sm w-full py-2 text-center transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-ring"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <Loader2 className="mx-auto my-0.5 h-4 w-4 animate-spin" />
                    ) : (
                        "Submit"
                    )}
                </button>
            </div>
        </form>
    );
}
