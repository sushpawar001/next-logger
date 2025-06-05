import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar, TrendingUp } from "lucide-react";

interface ChartsHeaderProps {
    selectedDuration: string;
    onDurationChange: (duration: string) => void;
}

export const daysOfDataOptions = [
    { value: 7, label: "7 days" },
    { value: 14, label: "14 days" },
    { value: 30, label: "30 days" },
    { value: 90, label: "90 days" },
    { value: 365, label: "365 days" },
    { value: 365 * 100, label: "All" },
];

export function ChartsHeader({
    selectedDuration,
    onDurationChange,
}: ChartsHeaderProps) {
    return (
        <Card className="border-purple-100 transition-all duration-300 w-full">
            <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-[#5E4AE3] to-[#7C3AED]">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">
                                    Charts Overview
                                </h1>
                                <p className="text-gray-600 mt-1 text-sm">
                                    Track your health metrics over time
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 w-full lg:w-fit">
                            <Calendar className="h-4 w-4" />
                            <span>Select Duration</span>
                        </div>
                        <Select
                            value={selectedDuration}
                            onValueChange={onDurationChange}
                        >
                            <SelectTrigger className="lg:w-32 border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {daysOfDataOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value.toString()}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
