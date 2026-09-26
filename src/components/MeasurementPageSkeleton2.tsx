import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder in the shape of the Measurements page (A1). */
export default function MeasurementPageSkeleton2() {
    const cell = (i: number) => (
        <div key={i} className="space-y-3 p-4 last:col-span-2 lg:last:col-span-1">
            <Skeleton className="h-3 w-14 bg-brand-oat" />
            <Skeleton className="h-7 w-20 bg-brand-oat" />
            <Skeleton className="h-3 w-12 bg-brand-oat" />
        </div>
    );
    return (
        <div aria-busy="true" aria-label="Loading measurements">
            <div className="mb-6 space-y-2">
                <Skeleton className="h-8 w-52 bg-brand-oat" />
                <Skeleton className="h-4 w-72 max-w-full bg-brand-oat" />
            </div>
            <div className="mb-5 h-9 w-80 max-w-full rounded-lg bg-brand-oat/60" />
            <div className="grid grid-cols-2 rounded-2xl border border-border bg-white p-2 lg:grid-cols-7">
                {Array.from({ length: 7 }, (_, i) => cell(i))}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-5 lg:grid-cols-12 lg:gap-5">
                <div className="rounded-2xl border border-border bg-white p-6 lg:col-span-8">
                    <Skeleton className="mb-6 h-5 w-40 bg-brand-oat" />
                    <Skeleton className="h-72 w-full bg-brand-cream" />
                </div>
                <div className="space-y-5 rounded-2xl border border-border bg-white p-6 lg:col-span-4">
                    <Skeleton className="h-5 w-24 bg-brand-oat" />
                    {Array.from({ length: 4 }, (_, i) => (
                        <Skeleton key={i} className="h-14 w-full bg-brand-cream" />
                    ))}
                </div>
            </div>
        </div>
    );
}
