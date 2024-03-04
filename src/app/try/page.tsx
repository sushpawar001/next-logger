import React from "react";
import GlucoseChart from "@/components/GlucoseChart";
import GlucoseAdd from "@/components/GlucoseAdd";

export default function page() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full px-8 py-12 bg-background">
            <div className="col-span-1 grid grid-rows-2 gap-6 h-full">
                <div className="bg-white shadow-md rounded-xl h-full flex flex-col p-6">
                    <h3 className="p-0 text-sm font-medium text-secondary mb-2">
                        Hello World
                    </h3>
                    <div className="flex-1">
                        <GlucoseChart fetch={true} />
                    </div>
                </div>
                <div className="bg-white shadow-md rounded-xl h-full flex flex-col p-6">
                    <h3 className="p-0 text-sm font-medium text-secondary mb-2">
                        Hello World
                    </h3>
                    <div className="flex-1">
                        <GlucoseChart fetch={true} />
                    </div>
                </div>
            </div>
            <div className="col-span-1 grid grid-rows-3 gap-6 h-full">
                <div className="h-full">
                    <GlucoseAdd />
                </div>
                <div className="h-full">
                    <GlucoseAdd />
                </div>
                <div className="h-full">
                    <GlucoseAdd />
                </div>
            </div>
        </div>
    );
}
