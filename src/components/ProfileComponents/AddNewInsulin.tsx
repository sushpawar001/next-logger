import notify from "@/helpers/notify";
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import type { InsulinNameType } from "@/types/models";
import { Plus, Loader2 } from "lucide-react";
import { useAddNewInsulin } from "@/hooks/queries/useInsulinMutations";
import { mutationErrorMessage } from "@/hooks/queries/useEntryMutations";

export default function AddNewInsulin({
    className = "",
    allAvailableInsulins = [],
}: {
    className?: string;
    allAvailableInsulins?: InsulinNameType[];
}) {
    // Both setters this component used to take were pure server syncs after the
    // two POSTs; invalidation covers them.
    const addNewInsulin = useAddNewInsulin();
    const isSubmitting = addNewInsulin.isPending;
    const [newInsulinType, setNewInsulinType] = useState("");

    const changeNewInsulinType = (event: { target: { value: string } }) => {
        const newInsulinTypeInput = event.target.value;
        setNewInsulinType(newInsulinTypeInput);
    };

    const submitNewInsulin = async (e) => {
        e.preventDefault();
        try {
            if (
                !allAvailableInsulins.some(
                    (obj) =>
                        obj.name.toLowerCase() === newInsulinType.toLowerCase()
                )
            ) {
                await addNewInsulin.mutateAsync(newInsulinType);
                notify("Insulin added!", "success");
                setNewInsulinType("");
            } else {
                notify("Insulin already exists!", "error");
                setNewInsulinType("");
            }
        } catch (error) {
            // Was `error.response.data.error` unguarded, which threw again from
            // inside the catch on a network failure.
            notify(mutationErrorMessage(error, "Something went wrong!"), "error");
        }
    };

    return (
        <div
            className={`p-5 md:p-7 rounded-lg bg-white border border-border transition-all duration-300 shadow-md ${className}`}
        >
            <div className="flex items-center gap-3 text-lg text-gray-900 mb-4 md:mb-6">
                <div
                    className={`p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600`}
                >
                    <Plus className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Add New Insulin
                    </h2>
                    <p className="text-gray-600 text-sm">
                        Don&apos;t see your insulin? Add it here
                    </p>
                </div>
            </div>
            <form
                className="flex flex-col md:flex-row gap-2"
                onSubmit={submitNewInsulin}
            >
                <input
                    type="text"
                    id="insulin"
                    className="border text-sm rounded-lg block w-full px-2.5 py-2 border-border focus:border-primary focus:ring-ring h-10 outline-hidden"
                    placeholder="Enter new insulin name"
                    value={newInsulinType}
                    onChange={changeNewInsulinType}
                    required
                />
                <button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-ring focus:outline-hidden font-medium rounded-lg text-sm w-full lg:w-1/5 py-2.5 text-center transition duration-300 disabled:bg-primary/50"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <Loader2 className="mx-auto my-0.5 h-4 w-4 animate-spin" />
                    ) : (
                        "Add"
                    )}
                </button>
            </form>
        </div>
    );
}
