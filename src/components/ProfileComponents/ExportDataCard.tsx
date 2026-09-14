"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import notify from "@/helpers/notify";
import {
    runExport,
    type ExportFormat,
    type PdfMode,
} from "@/lib/export/exportData";
import { METRICS, metricMeta, type MetricKey } from "@/lib/export/metricMeta";
import { ALL_DAYS } from "@/lib/export/filterByPeriod";

const PERIODS: { value: number; label: string }[] = [
    { value: 7, label: "Last 7 days" },
    { value: 14, label: "Last 14 days" },
    { value: 30, label: "Last 30 days" },
    { value: 90, label: "Last 90 days" },
    { value: 365, label: "Last 365 days" },
    { value: ALL_DAYS, label: "All time" },
];

const FORMATS: { value: ExportFormat; label: string }[] = [
    { value: "csv", label: "CSV (one file per metric)" },
    { value: "json", label: "JSON (single file)" },
    { value: "pdf", label: "PDF" },
];

const PDF_MODES: { value: PdfMode; label: string }[] = [
    { value: "combined", label: "One combined PDF" },
    { value: "separate", label: "A separate PDF per dataset" },
];

export default function ExportDataCard({
    className = "",
}: {
    className?: string;
}) {
    const [selected, setSelected] = useState<MetricKey[]>([]);
    const [days, setDays] = useState<number>(30);
    const [format, setFormat] = useState<ExportFormat>("csv");
    const [pdfMode, setPdfMode] = useState<PdfMode>("combined");
    const [isExporting, setIsExporting] = useState(false);

    const toggleMetric = (key: MetricKey) => {
        setSelected((prev) =>
            prev.includes(key)
                ? prev.filter((k) => k !== key)
                : [...prev, key]
        );
    };

    const handleExport = async () => {
        if (selected.length === 0 || isExporting) return;
        setIsExporting(true);
        try {
            const total = await runExport({
                metrics: selected,
                days,
                format,
                pdfMode,
            });
            notify(
                total > 0
                    ? `Exported ${total} record${total === 1 ? "" : "s"}.`
                    : "Export complete — no records in the selected range.",
                "success"
            );
        } catch (error: any) {
            notify(
                error?.message || "Export failed. Please try again.",
                "error"
            );
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Card className={`border-purple-100 shadow-md ${className}`}>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-[#5E4AE3] to-[#7C3AED]">
                        <Download className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            Export data
                        </h3>
                        <p className="text-sm text-gray-500">
                            Download your records as CSV, JSON or PDF
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-5">
                {/* Datasets */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Datasets
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {METRICS.map((key) => (
                            <label
                                key={key}
                                className="flex items-center space-x-3 p-2 hover:bg-purple-50 rounded cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selected.includes(key)}
                                    onChange={() => toggleMetric(key)}
                                    className="w-4 h-4 text-[#5E4AE3] bg-gray-100 border-gray-300 rounded focus:ring-[#5E4AE3] focus:ring-2"
                                />
                                <span className="text-sm text-gray-700">
                                    {metricMeta[key].label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Time period */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Time period
                        </label>
                        <Select
                            value={String(days)}
                            onValueChange={(v) => setDays(Number(v))}
                        >
                            <SelectTrigger aria-label="Time period">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PERIODS.map((p) => (
                                    <SelectItem
                                        key={p.value}
                                        value={String(p.value)}
                                    >
                                        {p.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Format */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Format
                        </label>
                        <Select
                            value={format}
                            onValueChange={(v) => setFormat(v as ExportFormat)}
                        >
                            <SelectTrigger aria-label="Format">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {FORMATS.map((f) => (
                                    <SelectItem key={f.value} value={f.value}>
                                        {f.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* PDF layout choice — combined vs one file per dataset */}
                {format === "pdf" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            PDF layout
                        </label>
                        <Select
                            value={pdfMode}
                            onValueChange={(v) => setPdfMode(v as PdfMode)}
                        >
                            <SelectTrigger aria-label="PDF layout">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PDF_MODES.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>
                                        {m.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <Button
                    onClick={handleExport}
                    disabled={selected.length === 0 || isExporting}
                    className="w-full bg-gradient-to-r from-[#5E4AE3] to-[#7C3AED] text-white hover:opacity-90"
                >
                    {isExporting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Exporting…
                        </>
                    ) : (
                        <>
                            <Download className="h-4 w-4" />
                            Export
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
