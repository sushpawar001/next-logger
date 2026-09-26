"use client";
import { entryTags } from "@/constants/constants";
import React, { useState, useEffect, useRef } from "react";
import notify from "@/helpers/notify";
import entryLogged from "@/helpers/entryLogged";
import InsulinType from "@/models/insulinTypeModel"; // import to avoid error
import { DatetimeLocalFormat } from "@/helpers/formatDate";
import { Droplets, Weight, Syringe, Loader2 } from "lucide-react";
import { useUserInsulins } from "@/hooks/queries/useReferenceData";
import { useAddEntry, mutationErrorMessage } from "@/hooks/queries/useEntryMutations";

export default function InsulinAdd(props) {
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
    // dashboard and /insulin. A failed lookup now leaves the dropdown empty
    // rather than rejecting into nothing (docs/BUGS.md #19).
    const { data: userInsulinType = [] } = useUserInsulins();
    const addEntry = useAddEntry("insulin");
    // isPending resets on error too. The hand-rolled flag it replaces was
    // only cleared on the success path, so a failed submit left the button
    // disabled and spinning until reload.
    const isSubmitting = addEntry.isPending;
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectTag, setSelectTag] = useState<string>(null);
    const [sendTime, setSendTime] = useState(false);

    const handleTagChange = (event: { target: { value: string } }) => {
        setSelectTag(event.target.value);
    };

    const handleDateChange = (event: { target: { value: string } }) => {
        setSendTime(true);
        setSelectedDate(new Date(event.target.value));
    };

    const changeInsulin = (event: { target: { value: string } }): void => {
        const insulinInput = event.target.value;
        setInsulin(insulinInput);
    };

    const changeInsulinType = (event: { target: { value: string } }): void => {
        const insulinTypeInput = event.target.value;
        setInsulinType(insulinTypeInput);
    };


    const submitForm = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        try {
            const response = await addEntry.mutateAsync({
                units: insulin,
                name: insulinType,
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
        } catch (error) {
            // Was `error.response.data.message`, which threw a second time from
            // inside the catch on any non-axios error.
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
                    className={`p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600`}
                >
                    <Syringe className="h-4 w-4 text-white" />
                </div>
                Insulin Dose
            </div>

            <div className="flex flex-col space-y-3">
                <div className="flex flex-col md:flex-row md:space-x-3 space-y-2 md:space-y-0">
                    <div className="w-full lg:w-1/2 space-y-2">
                        <label
                            className="block text-sm leading-6 font-medium text-gray-700"
                            htmlFor="glucose"
                        >
                            Dose (units)
                        </label>
                        <input
                            type="number"
                            id="insulin"
                            ref={valueInputRef}
                            className="border text-sm rounded-lg block w-full px-2.5 py-2 border-border focus:border-primary focus:ring-ring h-10 outline-hidden"
                            placeholder="10 IU"
                            value={insulin}
                            onChange={changeInsulin}
                            required
                        />
                    </div>
                    <div className="w-full lg:w-1/2 space-y-2">
                        <label
                            className="block text-sm leading-6 font-medium text-gray-700"
                            htmlFor="glucose"
                        >
                            Insulin Type
                        </label>
                        <select
                            id="insulinType"
                            value={insulinType}
                            onChange={changeInsulinType}
                            className="border text-sm rounded-lg block w-full px-2.5 py-2 border-border focus:border-primary focus:ring-ring h-10 bg-white outline-hidden"
                            required
                        >
                            <option value="" disabled>
                                Select Type
                            </option>
                            {userInsulinType.map((data) => (
                                <option key={data._id}>{data.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="space-y-2">
                    <label
                        className="block text-sm leading-6 font-medium text-gray-700"
                        htmlFor="glucose"
                    >
                        Date & Time
                    </label>
                    <input
                        type="datetime-local"
                        id="glucoseDate"
                        className="border text-sm rounded-lg block w-full px-2.5 py-2 placeholder:text-red-500 border-border focus:border-primary focus:ring-ring h-10 bg-white outline-hidden"
                        value={DatetimeLocalFormat(selectedDate)}
                        // value={selectedDate}
                        onChange={handleDateChange}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label
                        className="block text-sm leading-6 font-medium text-gray-700"
                        htmlFor="glucose"
                    >
                        Measurement Tag
                    </label>
                    <select
                        id="insulin_tag"
                        value={selectTag ?? ""}
                        onChange={handleTagChange}
                        className="border border-border focus:border-primary focus:ring-ring text-gray-900 text-sm rounded-lg  block w-full px-2.5 py-2 invalid:text-gray-400 h-10 bg-white outline-hidden"
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
                    className="bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-primary-ring font-medium rounded-lg text-sm w-full py-2 text-center transition-all duration-300"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <Loader2 className="mx-auto my-0.5 h-4 w-4 animate-spin" />
                    ) : (
                        "Submit"
                    )}
                </button>
            </div>

            {/* </div> */}
        </form>
    );
}
