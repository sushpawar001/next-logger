import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatRow {
    param: string;
    previous: string | number;
    current: string | number;
    trend?: "up" | "down" | "neutral";
}

interface statsObjType {
    mean: number;
    median: number;
    mode: number[];
    min: number;
    max: number;
    sum?: number;
    dailyAvg?: number;
}

interface StatsTableCardProps {
    title: string;
    icon: LucideIcon;
    gradient: string;
    newData: statsObjType;
    oldData?: statsObjType;
    showTrend?: boolean;
}

export function StatsTableCard({
    title,
    icon: Icon,
    gradient,
    newData,
    oldData = null,
    showTrend = true,
}: StatsTableCardProps) {
    const getTrendIcon = (trend?: "up" | "down" | "neutral") => {
        if (!trend || trend === "neutral") return null;
        return trend === "up" ? (
            <TrendingUp className="h-3 w-3 text-red-500" />
        ) : (
            <TrendingDown className="h-3 w-3 text-green-500" />
        );
    };

    const getTrendColor = (trend?: "up" | "down" | "neutral") => {
        if (!trend || trend === "neutral") return "text-gray-900";
        return trend === "up" ? "text-red-600" : "text-green-600";
    };

    return (
        <Card className="border-purple-100 shadow transition-all duration-300">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                    <div className={`p-2 rounded-lg ${gradient}`}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg border border-purple-100 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gradient-to-r from-[#5E4AE3] to-[#7C3AED] hover:from-[#5E4AE3] hover:to-[#7C3AED]">
                                <TableHead className="text-white font-medium">
                                    Param
                                </TableHead>
                                {oldData && (
                                    <TableHead className="text-white font-medium">
                                        Previous
                                    </TableHead>
                                )}
                                <TableHead className="text-white font-medium">
                                    Current
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Object.keys(newData).map((key, index) => (
                                <TableRow
                                    key={key}
                                    className={`hover:bg-purple-50 transition-colors ${
                                        index % 2 === 0
                                            ? "bg-white"
                                            : "bg-gray-50/50"
                                    }`}
                                >
                                    <TableCell className="font-medium text-gray-900">
                                        {key}
                                    </TableCell>
                                    {oldData && (
                                        <TableCell className="text-gray-600">
                                            {showData(oldData, key)}
                                        </TableCell>
                                    )}
                                    <TableCell
                                        className={`font-medium ${getTrendColor(
                                            oldData
                                                ? newData[key] > oldData[key]
                                                    ? "up"
                                                    : newData[key] <
                                                      oldData[key]
                                                    ? "down"
                                                    : "neutral"
                                                : "neutral"
                                        )}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {showData(newData, key)}
                                            {showTrend &&
                                                getTrendIcon(
                                                    oldData
                                                        ? newData[key] >
                                                          oldData[key]
                                                            ? "up"
                                                            : newData[key] <
                                                              oldData[key]
                                                            ? "down"
                                                            : "neutral"
                                                        : "neutral"
                                                )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

function showData(newData: statsObjType, key: string) {
    return Array.isArray(newData[key])
        ? newData[key].join(", ")
        : typeof newData[key] === "number"
        ? newData[key].toFixed(2)
        : newData[key];
}
