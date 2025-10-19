"use client";
import AdvGlucoseChartRecharts from "@/components/Charts/RechartComponents/AdvGlucoseChartRecharts";
import AdvInsulinChartSeparateRecharts from "@/components/Charts/RechartComponents/AdvInsulinChartSeparateRecharts";
import AdvWeightChartRecharts from "@/components/Charts/RechartComponents/AdvWeightChartRecharts";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Calendar,
    Droplets,
    Syringe,
    TrendingUp,
    Weight,
    Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import TagFilterCard from "@/components/TagFilterCard";
import { filterByTags } from "@/helpers/tagFilterHelpers";

const daysOfDataOptions = [
    { value: 7, label: "7 days" },
    { value: 14, label: "14 days" },
    { value: 30, label: "30 days" },
    { value: 90, label: "90 days" },
    { value: 365, label: "365 days" },
    { value: 365 * 100, label: "All" },
];

export default function ChartPage() {
    const [daysOfData, setDaysOfData] = useState(90);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [glucoseData, setGlucoseData] = useState([]);
    const [weightData, setWeightData] = useState([]);
    const [insulinData, setInsulinData] = useState([]);
    const [loading, setLoading] = useState(true);

    const changeDaysOfData = (duration: string) => {
        setDaysOfData(parseInt(duration));
    };

    useEffect(() => {
        setLoading(true);
        const fetchData = async () => {
            try {
                const [glucoseRes, weightRes, insulinRes] = await Promise.all([
                    axios.get(`/api/glucose/get/${daysOfData}`),
                    axios.get(`/api/weight/get/${daysOfData}`),
                    axios.get(`/api/insulin/get/${daysOfData}`),
                ]);
                setGlucoseData(glucoseRes.data.data || []);
                setWeightData(weightRes.data.data || []);
                setInsulinData(insulinRes.data.data || []);
            } catch (error) {
                // Optionally handle error
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [daysOfData]);

    // Filter data based on selected tags
    const filteredGlucoseData = filterByTags(glucoseData, selectedTags);
    const filteredWeightData = filterByTags(weightData, selectedTags);
    const filteredInsulinData = filterByTags(insulinData, selectedTags);

    return (
        <div className="h-full bg-background py-5 px-5">
            <div className="flex flex-col max-w-screen-xl mx-auto h-full">
                <div className="grid gap-2 md:gap-3 h-full">
                    <ChartsHeader
                        selectedDuration={daysOfData.toString()}
                        onDurationChange={changeDaysOfData}
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3">
                        <TagFilterCard
                            selectedTags={selectedTags}
                            onTagsChange={setSelectedTags}
                            className="w-full"
                        />
                    </div>
                    <div className=" w-full p-2.5 md:p-5 rounded-lg bg-white border border-purple-100 transition-all duration-300 shadow-md">
                        <div className="flex items-center gap-3 text-lg font-semibold text-gray-900 mb-3">
                            <div
                                className={`p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600`}
                            >
                                <Droplets className="h-4 w-4 text-white" />
                            </div>
                            Blood Glucose
                        </div>
                        <div className="h-96 flex items-center justify-center">
                            {loading ? (
                                <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                            ) : (
                                <AdvGlucoseChartRecharts
                                    fetch={false}
                                    data={filteredGlucoseData}
                                    days={daysOfData}
                                />
                            )}
                        </div>
                    </div>
                    <div className=" w-full p-2.5 md:p-5 rounded-lg bg-white border border-purple-100 transition-all duration-300 shadow-md">
                        <div className="flex items-center gap-3 text-lg font-semibold text-gray-900 mb-3">
                            <div
                                className={`p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600`}
                            >
                                <Weight className="h-4 w-4 text-white" />
                            </div>
                            Weight history
                        </div>
                        <div className="h-96 flex items-center justify-center">
                            {loading ? (
                                <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                            ) : (
                                <AdvWeightChartRecharts
                                    fetch={false}
                                    data={filteredWeightData}
                                    days={daysOfData}
                                />
                            )}
                        </div>
                    </div>
                    <div className="w-full p-2.5 md:p-5 rounded-lg bg-white border border-purple-100 transition-all duration-300 shadow-md">
                        <div className="flex items-center gap-3 text-lg font-semibold text-gray-900 mb-3">
                            <div
                                className={`p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600`}
                            >
                                <Syringe className="h-4 w-4 text-white" />
                            </div>
                            Insulin Dose
                        </div>
                        <div className="h-96 flex items-center justify-center">
                            {loading ? (
                                <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                            ) : (
                                <AdvInsulinChartSeparateRecharts
                                    fetch={false}
                                    data={filteredInsulinData}
                                    days={daysOfData}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ChartsHeaderProps {
    selectedDuration: string;
    onDurationChange: (duration: string) => void;
}

function ChartsHeader({
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
                            <SelectTrigger className="lg:w-32 border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] bg-white">
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
