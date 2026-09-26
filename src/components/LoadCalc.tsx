"use client";
import {
    greedyApproach,
    calcOneSideWeight,
    robustApproach,
} from "@/helpers/loadCalcHelpers";
import React, { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Eyebrow, Panel, PanelHead, PanelSub, PanelTitle } from "@/components/app-ui/layout";
import { Chip, Field, Segmented, TextInput } from "@/components/app-ui/controls";
import { DataTable } from "@/components/app-ui/table";

/** Standard plates offered as chips. Any custom plates saved earlier are added. */
const STANDARD_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
const DEFAULT_PLATES = [2.5, 5, 10, 15, 20];

/** IWF (Olympic) plate colours. */
const RED = "#D62828";
const BLUE = "#1D4ED8";
const YELLOW = "#F5C518";
const GREEN = "#15803D";
const WHITE = "#FFFFFF";
const CHROME = "#C9CDD2";
const LIGHT_FG = "#FAF7F2";
const DARK_FG = "#241A33";

/**
 * Plates follow the IWF colour code by size, change plates included.
 * [fill, drawn height, label colour].
 */
const PLATE_STYLE: Record<string, [string, number, string]> = {
    25: [RED, 170, LIGHT_FG],
    20: [BLUE, 160, LIGHT_FG],
    15: [YELLOW, 146, DARK_FG],
    10: [GREEN, 126, LIGHT_FG],
    5: [WHITE, 100, DARK_FG],
    2.5: [RED, 82, LIGHT_FG],
    2: [BLUE, 78, LIGHT_FG],
    1.5: [YELLOW, 72, DARK_FG],
    1.25: [CHROME, 66, DARK_FG],
    1: [GREEN, 62, LIGHT_FG],
    0.5: [WHITE, 58, DARK_FG],
};
const plateStyle = (p: number): [string, number, string] =>
    PLATE_STYLE[String(p)] ?? [CHROME, Math.max(60, Math.min(170, 60 + p * 4)), DARK_FG];
const isLight = (fill: string) => fill === WHITE || fill === CHROME || fill === YELLOW;

const fmt = (n: number) => String(Math.round(n * 100) / 100);

type Mode = "robust" | "greedy";

const MODES = [
    { value: "robust" as Mode, label: "Robust" },
    { value: "greedy" as Mode, label: "Greedy" },
];

function readSavedPlates(): number[] | null {
    try {
        const item = JSON.parse(localStorage.getItem("availablePlates"));
        return Array.isArray(item) ? item.filter((n) => typeof n === "number") : null;
    } catch {
        return null;
    }
}

export default function LoadCalc() {
    const [barWeight, setBarWeight] = useState(20);
    const [Load, setLoad] = useState(0);
    const [availablePlates, setAvailablePlates] = useState<number[]>(DEFAULT_PLATES);
    const [mode, setMode] = useState<Mode>("robust");

    useEffect(() => {
        const saved = readSavedPlates();
        // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after hydration
        if (saved) setAvailablePlates(saved);
    }, []);

    const togglePlate = (plate: number) => {
        const next = availablePlates.includes(plate)
            ? availablePlates.filter((p) => p !== plate)
            : [...availablePlates, plate];
        setAvailablePlates(next);
        localStorage.setItem("availablePlates", JSON.stringify(next));
    };

    const plateChoices = useMemo(
        () =>
            [...new Set([...STANDARD_PLATES, ...availablePlates])].sort(
                (a, b) => b - a
            ),
        [availablePlates]
    );

    const oneSideLoad = calcOneSideWeight(Load, barWeight);
    const platesToLoad = useMemo(
        () =>
            mode === "greedy"
                ? greedyApproach(oneSideLoad, availablePlates)
                : robustApproach(Load, barWeight, availablePlates),
        [mode, oneSideLoad, availablePlates, Load, barWeight]
    );

    const loaded = platesToLoad.reduce((a, b) => a + b, 0);
    const total = barWeight + loaded * 2;
    const exact = Math.abs(total - Load) < 0.001;
    const hasTarget = Load > barWeight;

    const number = (setter: (n: number) => void) => (e: { target: { value: string } }) =>
        setter(parseFloat(e.target.value));

    return (
        <form
            className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5"
            onSubmit={(e) => e.preventDefault()}
        >
            <Panel aria-labelledby="setup-title" className="order-2 lg:order-none lg:col-span-5">
                <PanelHead>
                    <PanelTitle id="setup-title">Your setup</PanelTitle>
                </PanelHead>

                <div>
                    <span id="mode-label" className="mb-1.5 block text-[13px] font-semibold text-brand-ink">
                        Mode
                    </span>
                    <Segmented<Mode>
                        label="Mode"
                        options={MODES}
                        value={mode}
                        onChange={setMode}
                        size="lg"
                        fill
                    />
                    <p className="mt-1.5 text-[13px] text-brand-muted">
                        {mode === "robust"
                            ? "Robust prefers matching plates, so each set builds up in even steps."
                            : "Greedy loads the heaviest plates first."}
                    </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                    <Field label="Target load" htmlFor="Load">
                        <TextInput
                            type="number"
                            id="Load"
                            inputMode="decimal"
                            value={Number.isNaN(Load) ? "" : Load}
                            onChange={number(setLoad)}
                            min={0}
                            max={1000}
                            step="any"
                            required
                            suffix="kg"
                        />
                    </Field>
                    <Field label="Bar weight" htmlFor="barWeight">
                        <TextInput
                            type="number"
                            id="barWeight"
                            inputMode="decimal"
                            value={Number.isNaN(barWeight) ? "" : barWeight}
                            onChange={number(setBarWeight)}
                            min={0}
                            step="any"
                            required
                            suffix="kg"
                        />
                    </Field>
                </div>

                <div className="mt-5">
                    <span id="plates-label" className="mb-1.5 block text-[13px] font-semibold text-brand-ink">
                        Available plates (kg)
                    </span>
                    <div role="group" aria-labelledby="plates-label" className="flex flex-wrap gap-2">
                        {plateChoices.map((p) => (
                            <Chip
                                key={p}
                                pressed={availablePlates.includes(p)}
                                onClick={() => togglePlate(p)}
                            >
                                {fmt(p)}
                            </Chip>
                        ))}
                    </div>
                    <p className="mt-1.5 text-[13px] text-brand-muted">
                        Tap a plate to include or exclude it.
                    </p>
                </div>
            </Panel>

            <div className="order-1 flex min-w-0 flex-col gap-4 lg:order-none lg:col-span-7 lg:gap-5">
                <Panel aria-labelledby="result-label" aria-live="polite">
                    <div className="mb-1 flex items-start justify-between gap-3">
                        <Eyebrow id="result-label">Each side</Eyebrow>
                        {hasTarget && (
                            <strong className="text-[13px] tabular-nums">
                                {fmt(total)} kg total
                            </strong>
                        )}
                    </div>
                    <span className="flex items-baseline gap-[0.12em] text-[40px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-brand-ink">
                        {fmt(loaded)}
                        <span className="ml-[0.12em] text-[15px] font-medium tracking-normal text-brand-muted">
                            kg
                        </span>
                    </span>
                    <p className="mt-2 text-xl font-semibold text-brand-aubergine">
                        {!hasTarget
                            ? "Enter a target load above the bar weight"
                            : platesToLoad.length
                              ? platesToLoad.map(fmt).join(" + ")
                              : "Bar only"}
                    </p>
                    <div className="my-4">
                        <Barbell plates={platesToLoad} />
                    </div>
                    {hasTarget && (
                        <p className="flex flex-wrap items-center justify-center gap-1.5 text-center text-[13px] text-brand-muted">
                            Bar {fmt(barWeight)} kg + 2 × {fmt(loaded)} kg = {fmt(total)} kg
                            {exact ? (
                                <Check
                                    className="h-4 w-4 text-brand-aubergine"
                                    strokeWidth={2.6}
                                    aria-label="Exact match"
                                />
                            ) : (
                                <span>(closest to {fmt(Load)} kg with these plates)</span>
                            )}
                        </p>
                    )}
                </Panel>

                <Panel aria-labelledby="list-title">
                    <PanelHead>
                        <div>
                            <PanelTitle id="list-title">Plate list</PanelTitle>
                            <PanelSub>
                                Load one plate on each side per step, in this order.
                            </PanelSub>
                        </div>
                    </PanelHead>
                    {platesToLoad.length > 0 ? (
                        <DataTable>
                            <thead>
                                <tr>
                                    <th>Step</th>
                                    <th>Plate</th>
                                    <th className="text-right!">Bar total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {platesToLoad.map((p, i) => {
                                    const [fill] = plateStyle(p);
                                    const soFar = platesToLoad
                                        .slice(0, i + 1)
                                        .reduce((a, b) => a + b, 0);
                                    return (
                                        <tr key={i}>
                                            <td className="tabular-nums text-brand-muted">{i + 1}</td>
                                            <td>
                                                <span className="inline-flex items-center gap-2">
                                                    <span
                                                        className="inline-block h-[18px] w-1.5 rounded-[3px]"
                                                        style={{
                                                            background: fill,
                                                            boxShadow: isLight(fill)
                                                                ? "inset 0 0 0 1px #DDD3C2"
                                                                : undefined,
                                                        }}
                                                        aria-hidden="true"
                                                    />
                                                    <strong className="tabular-nums">{fmt(p)} kg</strong>
                                                </span>
                                            </td>
                                            <td className="pr-0! text-right tabular-nums">
                                                <strong>{fmt(soFar * 2 + barWeight)} kg</strong>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </DataTable>
                    ) : (
                        <p className="text-sm text-brand-muted">Enter weight to see sets</p>
                    )}
                </Panel>
            </div>
        </form>
    );
}

/** The bar with the per-side plates drawn from the collar outwards. */
function Barbell({ plates }: { plates: number[] }) {
    const W = 780;
    const H = 190;
    const cx = W / 2;
    const cy = H / 2;

    const sides = [-1, 1].map((side) => {
        let off = 219;
        const shapes: React.ReactNode[] = [];
        for (const [i, p] of plates.entries()) {
            const [fill, h, fg] = plateStyle(p);
            const w = p >= 10 ? 30 : 20;
            if (off + w > W / 2 - 12) break;
            const x = side > 0 ? cx + off : cx - off - w;
            shapes.push(
                <g key={`${side}-${i}`}>
                    <rect
                        x={x}
                        y={cy - h / 2}
                        width={w}
                        height={h}
                        rx={6}
                        fill={fill}
                        stroke={isLight(fill) ? "#DDD3C2" : undefined}
                    />
                    <text
                        x={x + w / 2}
                        y={cy + 4}
                        fontSize={11}
                        fontWeight={700}
                        fill={fg}
                        textAnchor="middle"
                        transform={`rotate(-90 ${x + w / 2} ${cy})`}
                    >
                        {fmt(p)}
                    </text>
                </g>
            );
            off += w + 3;
        }
        return shapes;
    });

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            className="block h-auto w-full"
            role="img"
            aria-label={`Barbell loaded with ${plates.length ? plates.map(fmt).join(", ") : "no"} kg plates on each side`}
        >
            <rect x={10} y={cy - 6} width={W - 20} height={12} rx={6} fill="#8A8198" />
            <rect x={cx - 200} y={cy - 9} width={400} height={18} rx={4} fill="#6E667B" />
            <rect x={cx - 216} y={cy - 22} width={16} height={44} rx={4} fill="#241A33" />
            <rect x={cx + 200} y={cy - 22} width={16} height={44} rx={4} fill="#241A33" />
            {sides}
        </svg>
    );
}
