import React, { ChangeEvent } from "react";
import { Field, TextInput } from "@/components/app-ui/controls";

/** One circumference field, in cm. The label doubles as the placeholder. */
export default function MeasurementInput({
    label,
    id,
    onChange,
    value,
    required = true,
}: {
    label: string;
    id: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    value: string | number;
    required?: boolean;
}) {
    const LabelText = label.charAt(0).toUpperCase() + label.slice(1);
    return (
        <Field label={LabelText} htmlFor={id}>
            <TextInput
                type="number"
                inputMode="decimal"
                step={0.1}
                min={0}
                id={id}
                name={id}
                placeholder={LabelText}
                value={value ?? ""}
                onChange={onChange}
                required={required}
                suffix="cm"
            />
        </Field>
    );
}
