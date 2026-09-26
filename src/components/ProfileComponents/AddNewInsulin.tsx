import notify from "@/helpers/notify";
import React, { useState } from "react";
import type { InsulinNameType } from "@/types/models";
import { Plus, Loader2 } from "lucide-react";
import { useAddNewInsulin } from "@/hooks/queries/useInsulinMutations";
import { mutationErrorMessage } from "@/hooks/queries/useEntryMutations";
import { AppButton, Field, TextInput } from "@/components/app-ui/controls";
import { cn } from "@/lib/utils";

/**
 * Creates a new insulin type and attaches it to the user. Renders bare: the
 * profile page puts it under the chip list in its "My insulins" card.
 */
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
        <form
            className={cn(
                "grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3",
                className
            )}
            onSubmit={submitNewInsulin}
        >
            <Field label="Not listed? Add a new insulin" htmlFor="insulin">
                <TextInput
                    type="text"
                    id="insulin"
                    placeholder="e.g. Lantus"
                    value={newInsulinType}
                    onChange={changeNewInsulinType}
                    required
                />
            </Field>
            <AppButton
                type="submit"
                variant="secondary"
                size="field"
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                    <Plus aria-hidden="true" />
                )}
                Add
            </AppButton>
        </form>
    );
}
