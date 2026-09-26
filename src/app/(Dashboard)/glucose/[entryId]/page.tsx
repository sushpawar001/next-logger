"use client";
import React, { useEffect, useState } from "react";
import notify from "@/helpers/notify";
import { DatetimeLocalFormat } from "@/helpers/formatDate";
import { useParams, useRouter } from "next/navigation";
import { entryTags } from "@/constants/constants";
import { Droplets, ArrowLeft, Save, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEntry } from "@/hooks/queries/useEntries";
import {
    useUpdateEntry,
    useDeleteEntry,
    mutationErrorMessage,
} from "@/hooks/queries/useEntryMutations";

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
    const changeTag = (event) => {
        setData({ ...data, tag: event.target.value });
    };
    const changeDate = (event) => {
        setData({ ...data, createdAt: event.target.value });
    };

    const submitForm = async (e) => {
        e.preventDefault();
        try {
            data.createdAt = new Date(data.createdAt).toISOString();
            const response = await updateEntry.mutateAsync(data);
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

    return (
        <section className="h-full w-full flex flex-col justify-center items-center bg-background p-5 space-y-6">
            <div className="max-w-2xl mx-auto p-4 md:px-6 py-5 rounded-lg bg-white border border-border transition-all duration-300 shadow-md w-full">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                            <Droplets className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xl font-semibold text-gray-900">
                                Edit Glucose Entry
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Update your glucose measurement details
                            </p>
                        </div>
                    </div>
                    <Link
                        href={"/glucose"}
                        className="border-border hover:bg-accent/50 hover:border-primary flex items-center gap-2 border rounded-lg px-3 py-2 transition-all duration-300"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Link>
                </div>
            </div>
            <form
                className="max-w-2xl w-full mx-auto p-4 md:px-6 py-5 rounded-lg bg-white border border-border transition-all duration-300 shadow-md"
                onSubmit={submitForm}
            >
                <div className="flex items-center gap-3 text-lg font-semibold text-gray-900 mb-3">
                    <div
                        className={`p-2 rounded-lg bg-primary`}
                    >
                        <Save className="h-4 w-4 text-white" />
                    </div>
                    Blood Glucose
                </div>
                <div className="flex flex-col space-y-3">
                    <div className="space-y-2">
                        <label
                            className="block text-sm leading-6 font-medium text-gray-700"
                            htmlFor="glucose"
                        >
                            Glucose Level
                        </label>
                        <input
                            type="number"
                            id="glucose"
                            className="border text-sm rounded-lg block w-full px-2.5 py-2 border-border focus:border-primary focus:ring-ring h-10"
                            placeholder="98 mg/dl"
                            value={data.value}
                            onChange={changeValue}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label
                            className="block text-sm leading-6 font-medium text-gray-700"
                            htmlFor="glucoseDate"
                        >
                            Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            id="glucoseDate"
                            className="border text-sm rounded-lg block w-full px-2.5 py-2 placeholder:text-red-500 border-border focus:border-primary focus:ring-ring h-10"
                            value={DatetimeLocalFormat(data.createdAt)}
                            onChange={changeDate}
                        />
                    </div>
                    <div className="space-y-2">
                        <label
                            className="block text-sm leading-6 font-medium text-gray-700"
                            htmlFor="glucose_tag"
                        >
                            Measurement Tag
                        </label>
                        <select
                            id="glucose_tag"
                            value={data.tag ?? ""}
                            onChange={changeTag}
                            className="border border-border focus:border-primary focus:ring-ring text-gray-900 text-sm rounded-lg  block w-full px-2.5 py-2 invalid:text-gray-400 h-10"
                        >
                            <option value="">Select Tag</option>
                            {entryTags.map((data) => (
                                <option key={data}>{data}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-row gap-2 w-full">
                        <button
                            type="submit"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-primary-ring font-medium rounded-lg text-sm w-full  md:w-2/3 py-2 text-center transition-all duration-300"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="mx-auto my-0.5 h-4 w-4 animate-spin" />
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <Save className="h-4 w-4" />
                                    Update Entry
                                </div>
                            )}
                        </button>
                        <button
                            type="button"
                            className="text-white bg-destructive hover:bg-destructive/90 font-medium rounded-lg text-sm md:w-1/3  w-full py-2 text-center transition-all duration-300"
                            disabled={isSubmitting}
                            onClick={() => deleteData(params.entryId)}
                        >
                            {isSubmitting ? (
                                <Loader2 className="mx-auto my-0.5 h-4 w-4 animate-spin" />
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </section>
    );
}
