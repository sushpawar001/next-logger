import React, { ChangeEvent } from 'react'


export default function MeasurementInput({
    label,
    id,
    onChange,
    value,
}: {
    label: string;
    id: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    value: string;
}) {
    const LabelText = label.charAt(0).toUpperCase() + label.slice(1);
    return (
        <div className="space-y-1">
            <label htmlFor={id} className="text-sm font-medium text-gray-700">
                {LabelText}
            </label>
            <input
                type="number"
                step={0.1}
                min={0}
                id={id}
                name={id}
                className="border text-sm rounded-lg block w-full px-2.5 py-2 border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] outline-none h-9"
                placeholder={LabelText}
                value={value}
                onChange={onChange}
                required
            />
        </div>
    );
}