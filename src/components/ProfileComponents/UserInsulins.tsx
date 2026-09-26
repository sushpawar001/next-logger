import React, { useEffect, useState, SetStateAction, useRef } from "react";
import { Check, Loader2, X } from "lucide-react";
import type { InsulinNameType } from "@/types/models";
import notify from "@/helpers/notify";
import autoAnimate from "@formkit/auto-animate";
import { useSaveUserInsulins } from "@/hooks/queries/useInsulinMutations";
import { mutationErrorMessage } from "@/hooks/queries/useEntryMutations";
import { AppButton, Field, SelectInput } from "@/components/app-ui/controls";
import { SERIES } from "@/components/Charts/RechartComponents/chartTheme";
import { cn } from "@/lib/utils";

/**
 * The user's insulins as removable chips, plus a picker for the known types.
 * Renders bare: the profile page puts it inside its "My insulins" card.
 */
export default function UserInsulins({
    className = "",
    allAvailableInsulins,
    userInsulins,
    setUserInsulins,
}: {
    className?: string;
    allAvailableInsulins: InsulinNameType[];
    userInsulins: InsulinNameType[];
    setUserInsulins: React.Dispatch<SetStateAction<InsulinNameType[]>>;
}) {
    // The chip list stays local draft state -- only Save commits it.
    const saveInsulins = useSaveUserInsulins();
    const isSubmitting = saveInsulins.isPending;
    const [isChanged, setIsChanged] = useState(false);
    const parent = useRef(null);

    const submitInsulin = async (e) => {
        e.preventDefault();
        try {
            const response = await saveInsulins.mutateAsync(userInsulins);
            setIsChanged(false);
            notify(response.message, "success");
        } catch (error) {
            notify(mutationErrorMessage(error), "error");
        }
    };

    const selectInsulinAndAdd = (e) => {
        const newInsulin = e.target.value;
        if (!userInsulins.find((data) => data.name === newInsulin)) {
            const currentSelected = allAvailableInsulins.find(
                (data) => data.name === newInsulin
            );
            if (!currentSelected) return;
            setIsChanged(true);
            setUserInsulins([...userInsulins, currentSelected]);
        }
    };

    const removeInsulin = (name: string) => {
        setUserInsulins(userInsulins.filter((data) => data.name !== name));
        setIsChanged(true);
    };

    useEffect(() => {
        parent.current && autoAnimate(parent.current);
    }, [parent]);

    const notChosen = allAvailableInsulins.filter(
        (a) => !userInsulins.some((u) => u.name === a.name)
    );

    return (
        <div className={cn("min-w-0", className)}>
            <div className="flex flex-wrap gap-2" ref={parent}>
                {userInsulins.length === 0 && (
                    <p className="text-sm text-brand-muted">
                        No insulins yet. Pick one below.
                    </p>
                )}
                {userInsulins.map((data, i) => (
                    <span
                        key={data._id}
                        className="inline-flex h-10 items-center gap-1.5 rounded-[20px] border border-border bg-white pr-2 pl-4 text-sm font-semibold text-brand-ink"
                    >
                        <span
                            className="h-2.5 w-2.5 flex-none rounded-full"
                            style={{ background: SERIES[i % SERIES.length] }}
                            aria-hidden="true"
                        />
                        {data.name}
                        <button
                            type="button"
                            aria-label={`Remove ${data.name}`}
                            onClick={() => removeInsulin(data.name)}
                            className="inline-grid h-7 w-7 place-items-center rounded-lg text-brand-muted hover:bg-brand-cream hover:text-brand-ink"
                        >
                            <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </span>
                ))}
            </div>
            <form
                className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3"
                onSubmit={submitInsulin}
            >
                <Field label="Add from the list" htmlFor="insulinType">
                    <SelectInput
                        id="insulinType"
                        value=""
                        onChange={selectInsulinAndAdd}
                    >
                        <option value="" disabled>
                            Select insulin
                        </option>
                        {notChosen.map((data) => (
                            <option key={data._id} value={data.name}>
                                {data.name}
                            </option>
                        ))}
                    </SelectInput>
                </Field>
                <AppButton
                    type="submit"
                    size="field"
                    disabled={isSubmitting || !isChanged}
                >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin" aria-hidden="true" />
                    ) : (
                        <Check aria-hidden="true" />
                    )}
                    Save
                </AppButton>
            </form>
        </div>
    );
}
