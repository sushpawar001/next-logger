import React, { useEffect, useState, SetStateAction, useRef } from "react";
import { FaSyringe } from "react-icons/fa";
import { Syringe } from "lucide-react";
import type { InsulinNameType } from "@/types/models";
import notify from "@/helpers/notify";
import autoAnimate from "@formkit/auto-animate";
import { useSaveUserInsulins } from "@/hooks/queries/useInsulinMutations";
import { mutationErrorMessage } from "@/hooks/queries/useEntryMutations";

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
    const [selectedInsulin, setSelectedInsulin] = useState("");
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
        e.preventDefault();
        const newInsulin = e.target.value;
        if (!userInsulins.find((data) => data.name === newInsulin)) {
            setIsChanged(true);
            setSelectedInsulin(newInsulin);
            let currentSelected = allAvailableInsulins.find(
                (data) => data.name === newInsulin
            );
            setUserInsulins([...userInsulins, currentSelected]);
            setSelectedInsulin("");
        }
    };

    const removeInsulin = (e) => {
        e.preventDefault();
        const removedInsulin = e.target.value;
        setUserInsulins(
            userInsulins.filter((data) => data.name !== removedInsulin)
        );
        setIsChanged(true);
    };

    useEffect(() => {
        parent.current && autoAnimate(parent.current);
    }, [parent]);

    return (
        <div
            className={`p-5 md:p-7 rounded-lg bg-white border border-border transition-all duration-300 shadow-md ${className}`}
        >
            <div className="flex items-center gap-3 text-lg text-gray-900 mb-4 md:mb-6">
                <div
                    className={`p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600`}
                >
                    <Syringe className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Your Insulins
                    </h2>
                    <p className="text-gray-600 text-sm">
                        Add insulin to your profile to use it for logging
                    </p>
                </div>
            </div>
            <form
                className="flex flex-col md:flex-row gap-2 mb-4"
                onSubmit={submitInsulin}
            >
                <select
                    id="insulinType"
                    value={selectedInsulin}
                    onChange={selectInsulinAndAdd}
                    className="border border-border focus:border-primary focus:ring-ring text-gray-900 text-sm rounded-lg block w-full px-2.5 py-2 invalid:text-gray-400 h-10 bg-white outline-none"
                >
                    <option value="" disabled>
                        Select Insulin
                    </option>
                    {allAvailableInsulins.map((data) => (
                        <option key={data._id} value={data.name}>
                            {data.name}
                        </option>
                    ))}
                </select>
                <button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-ring focus:outline-none font-medium rounded-lg text-sm min-w-fit w-full md:w-1/5 py-2.5 text-center transition duration-300 disabled:bg-primary/50"
                    disabled={isSubmitting || !isChanged}
                >
                    {isSubmitting ? (
                        <span className="loading loading-spinner loading-xs my-auto h-full"></span>
                    ) : (
                        "Save"
                    )}
                </button>
            </form>
            <div className="flex flex-wrap gap-1" ref={parent}>
                {userInsulins.map((data) => (
                    <div
                        key={data._id}
                        className="text-sm text-center text-white bg-gray-900 hover:bg-gray-700 py-0.5 px-1.5 md:px-2.5 rounded-full flex items-center justify-center gap-1 w-fit"
                    >
                        <p>{data.name}</p>
                        <button
                            className="p-1 text-white/85"
                            value={data.name}
                            onClick={removeInsulin}
                        >
                            x
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
