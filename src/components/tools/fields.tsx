"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/animate-ui/radix/radio-group";

/**
 * Form controls shared by the newer calculators. Each is rendered once per
 * page (see CalculatorLayout), so ids only need to be unique per field.
 */

const inputClass =
    "border border-border focus:border-primary focus:ring-ring focus-visible:ring-0 focus-visible:ring-offset-0";

export function ChoiceGroup<T extends string>({
    name,
    label,
    value,
    options,
    onChange,
    layout = "row",
}: {
    name: string;
    label: string;
    value: T;
    options: readonly { value: T; label: string }[];
    onChange: (value: T) => void;
    /** "column" stacks options, for long labels. */
    layout?: "row" | "column";
}) {
    const labelId = `${name}-label`;
    return (
        <div className="space-y-2">
            <Label
                id={labelId}
                className="block text-sm leading-6 font-medium text-gray-700"
            >
                {label}
            </Label>
            <RadioGroup
                aria-labelledby={labelId}
                value={value}
                onValueChange={(next) => onChange(next as T)}
                className={
                    layout === "row"
                        ? "flex flex-wrap gap-x-4 gap-y-2"
                        : "flex flex-col gap-2"
                }
            >
                {options.map((option) => {
                    const id = `${name}-${option.value}`;
                    return (
                        <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem
                                value={option.value}
                                id={id}
                                className="w-4 h-4 text-primary"
                            />
                            <Label htmlFor={id}>{option.label}</Label>
                        </div>
                    );
                })}
            </RadioGroup>
        </div>
    );
}

export function NumberField({
    id,
    label,
    value,
    onChange,
    unit,
    placeholder,
    min,
    max,
    step = "any",
    hint,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    /** Shown after the input, e.g. "mg/dL". */
    unit?: string;
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number | "any";
    /** Shown under the field, e.g. a validation message. */
    hint?: string;
}) {
    const hintId = hint ? `${id}-hint` : undefined;
    return (
        <div className="space-y-2">
            <Label
                htmlFor={id}
                className="block text-sm leading-6 font-medium text-gray-700"
            >
                {label}
            </Label>
            <div className="flex items-center gap-2">
                <Input
                    id={id}
                    type="number"
                    inputMode="decimal"
                    value={value}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    step={step}
                    aria-describedby={hintId}
                    aria-invalid={hint ? true : undefined}
                    onChange={(e) => onChange(e.target.value)}
                    className={inputClass}
                />
                {unit && (
                    <span className="text-sm text-gray-600 whitespace-nowrap">
                        {unit}
                    </span>
                )}
            </div>
            {hint && (
                <p id={hintId} className="text-sm text-red-600">
                    {hint}
                </p>
            )}
        </div>
    );
}
