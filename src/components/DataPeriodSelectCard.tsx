import React from "react";
import { Calendar, History } from "lucide-react";

export default function DataPeriodSelectCard({
    daysOfData,
    changeDaysOfData,
    className = "",
}: {
    daysOfData: number;
    changeDaysOfData: (event: { target: { value: string } }) => void;
    className?: string;
}) {
    return (
        <div
            className={`bg-white p-4 rounded-lg border border-border transition-all duration-300 shadow-md flex items-center justify-between ${className}`}
        >
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary">
                    <Calendar className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">Data Period</h3>
                    <p className="text-sm text-gray-500">
                        Select time range for analysis
                    </p>
                </div>
            </div>
            <select
                id="daysOfDataInput"
                value={daysOfData}
                onChange={changeDaysOfData}
                className="border text-gray-900 text-sm rounded-lg  block p-2.5 w-32 border-border focus:border-primary focus:ring-ring outline-hidden bg-white"
            >
                <option defaultValue="7">7</option>
                <option>14</option>
                <option>30</option>
                <option>90</option>
                <option>365</option>
                <option value={365 * 100}>All</option>
            </select>
        </div>
    );
}
