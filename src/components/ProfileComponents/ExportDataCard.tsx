"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Panel, PanelHead, PanelSub, PanelTitle } from "@/components/app-ui/layout";
import { AppButton, Field, SelectInput } from "@/components/app-ui/controls";
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
    { value: "csv", label: "CSV" },
    { value: "json", label: "JSON" },
    { value: "pdf", label: "PDF" },
];

const PDF_MODES: { value: PdfMode; label: string }[] = [
    { value: "combined", label: "One combined PDF" },
    { value: "separate", label: "A separate PDF per dataset" },
];

const legend = "mb-2.5 text-[13px] font-semibold text-brand-ink";
const choice = "inline-flex cursor-pointer items-center gap-2.5 text-[15px] text-brand-ink";
const control = "m-0 h-5 w-5 flex-none cursor-pointer accent-brand-aubergine";

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
        <Panel
            as="form"
            className={className}
            aria-labelledby="export-title"
            onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                handleExport();
            }}
        >
            <PanelHead>
                <div>
                    <PanelTitle id="export-title">Export data</PanelTitle>
                    <PanelSub>Download a copy of your records.</PanelSub>
                </div>
            </PanelHead>

            <fieldset className="m-0 border-0 p-0">
                <legend className={legend}>Include</legend>
                <div className="grid grid-cols-2 gap-3">
                    {METRICS.map((key) => (
                        <label key={key} className={choice}>
                            <input
                                type="checkbox"
                                checked={selected.includes(key)}
                                onChange={() => toggleMetric(key)}
                                className={control}
                            />
                            {metricMeta[key].label}
                        </label>
                    ))}
                </div>
            </fieldset>

            <Field label="Period" htmlFor="export-period" className="mt-5">
                <SelectInput
                    id="export-period"
                    value={String(days)}
                    onChange={(e) => setDays(Number(e.target.value))}
                >
                    {PERIODS.map((p) => (
                        <option key={p.value} value={String(p.value)}>
                            {p.label}
                        </option>
                    ))}
                </SelectInput>
            </Field>

            <fieldset className="m-0 mt-5 border-0 p-0">
                <legend className={legend}>Format</legend>
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                    {FORMATS.map((f) => (
                        <label key={f.value} className={choice}>
                            <input
                                type="radio"
                                name="export-format"
                                value={f.value}
                                checked={format === f.value}
                                onChange={() => setFormat(f.value)}
                                className={control}
                            />
                            {f.label}
                        </label>
                    ))}
                </div>
                {format !== "pdf" && (
                    <p className="mt-2 text-[13px] text-brand-muted">
                        {format === "csv"
                            ? "One file per dataset."
                            : "Everything in a single file."}
                    </p>
                )}
            </fieldset>

            {/* PDF layout choice — combined vs one file per dataset */}
            {format === "pdf" && (
                <fieldset className="m-0 mt-5 border-0 p-0">
                    <legend className={legend}>PDF layout</legend>
                    <div className="grid gap-3">
                        {PDF_MODES.map((m) => (
                            <label key={m.value} className={choice}>
                                <input
                                    type="radio"
                                    name="export-pdf-mode"
                                    value={m.value}
                                    checked={pdfMode === m.value}
                                    onChange={() => setPdfMode(m.value)}
                                    className={control}
                                />
                                {m.label}
                            </label>
                        ))}
                    </div>
                </fieldset>
            )}

            <AppButton
                type="submit"
                variant="secondary"
                block
                className="mt-6"
                disabled={selected.length === 0 || isExporting}
            >
                {isExporting ? (
                    <>
                        <Loader2 className="animate-spin" aria-hidden="true" />
                        Exporting…
                    </>
                ) : (
                    <>
                        <Download aria-hidden="true" />
                        Export
                    </>
                )}
            </AppButton>
            {selected.length === 0 && (
                <p className="mt-2 text-center text-[13px] text-brand-muted">
                    Choose at least one dataset.
                </p>
            )}
        </Panel>
    );
}
