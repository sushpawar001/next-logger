"use client";
import React from "react";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/animate-ui/radix/radio-group";
import type { FormData } from "@/lib/calculators/bmr";

/**
 * Age, sex, height and weight inputs shared by the BMR, TDEE, calorie-deficit
 * and maintenance-calorie calculators. They all use the same URL keys, so a
 * link can carry someone's numbers from one calculator to the next.
 */

const bodyStatsParams = {
    age: parseAsString.withDefault(""),
    gender: parseAsStringLiteral(["male", "female"] as const).withDefault(
        "male"
    ),
    heightUnit: parseAsStringLiteral(["cm", "ft"] as const).withDefault("cm"),
    heightCm: parseAsString.withDefault(""),
    heightFeet: parseAsString.withDefault(""),
    heightInches: parseAsString.withDefault(""),
    weightUnit: parseAsStringLiteral(["kg", "lbs"] as const).withDefault("kg"),
    weight: parseAsString.withDefault(""),
};

export const BODY_STATS_KEYS = Object.keys(bodyStatsParams) as (keyof FormData)[];

export function useBodyStatsParams() {
    const [formData, setParams] = useQueryStates(bodyStatsParams);

    const setField = (field: keyof FormData, value: string) => {
        if (field === "heightUnit") {
            // Drop the other unit's values so the URL only holds one height.
            setParams(
                value === "cm"
                    ? { heightUnit: "cm", heightFeet: "", heightInches: "" }
                    : { heightUnit: "ft", heightCm: "" }
            );
            return;
        }
        setParams({ [field]: value } as Partial<FormData>);
    };

    const clear = () =>
        setParams({
            age: "",
            gender: "male",
            heightUnit: "cm",
            heightCm: "",
            heightFeet: "",
            heightInches: "",
            weightUnit: "kg",
            weight: "",
        });

    return { formData: formData as FormData, setField, clear };
}

export const HeightInput: React.FC<{
    heightUnit: "cm" | "ft";
    heightCm: string;
    heightFeet: string;
    heightInches: string;
    onHeightUnitChange: (unit: "cm" | "ft") => void;
    onHeightCmChange: (value: string) => void;
    onHeightFeetChange: (value: string) => void;
    onHeightInchesChange: (value: string) => void;
    suffix?: string;
}> = ({
    heightUnit,
    heightCm,
    heightFeet,
    heightInches,
    onHeightUnitChange,
    onHeightCmChange,
    onHeightFeetChange,
    onHeightInchesChange,
    suffix = "",
}) => (
    <div className="space-y-4">
        <Label className="block text-sm leading-6 font-medium text-gray-700">Height</Label>
        <RadioGroup
            value={heightUnit}
            onValueChange={(value) => onHeightUnitChange(value as "cm" | "ft")}
            className="flex gap-4"
        >
            <div className="flex items-center space-x-2">
                <RadioGroupItem
                    value="cm"
                    id={`cm${suffix}`}
                    className="w-4 h-4 text-primary"
                />
                <Label htmlFor={`cm${suffix}`}>Centimeters (cm)</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem
                    value="ft"
                    id={`ft${suffix}`}
                    className="w-4 h-4 text-primary"
                />
                <Label htmlFor={`ft${suffix}`}>Feet & Inches</Label>
            </div>
        </RadioGroup>

        {heightUnit === "cm" ? (
            <Input
                type="number"
                placeholder="Enter height in centimeters"
                value={heightCm}
                onChange={(e) => onHeightCmChange(e.target.value)}
                min="50"
                max="300"
                className="border border-border focus:border-primary focus:ring-ring focus-visible:ring-0 focus-visible:ring-offset-0"
            />
        ) : (
            <div className="flex gap-4">
                <div className="flex-1">
                    <Label htmlFor={`feet${suffix}`}>Feet</Label>
                    <Input
                        id={`feet${suffix}`}
                        type="number"
                        placeholder="5"
                        value={heightFeet}
                        onChange={(e) => onHeightFeetChange(e.target.value)}
                        min="1"
                        max="8"
                        className="border border-border focus:border-primary focus:ring-ring focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
                <div className="flex-1">
                    <Label htmlFor={`inches${suffix}`}>Inches</Label>
                    <Input
                        id={`inches${suffix}`}
                        type="number"
                        placeholder="10"
                        value={heightInches}
                        onChange={(e) => onHeightInchesChange(e.target.value)}
                        min="0"
                        max="11"
                        className="border border-border focus:border-primary focus:ring-ring focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
            </div>
        )}
    </div>
);

export const WeightInput: React.FC<{
    weightUnit: "kg" | "lbs";
    weight: string;
    onWeightUnitChange: (unit: "kg" | "lbs") => void;
    onWeightChange: (value: string) => void;
    suffix?: string;
}> = ({
    weightUnit,
    weight,
    onWeightUnitChange,
    onWeightChange,
    suffix = "",
}) => (
    <div className="space-y-4">
        <Label className="block text-sm leading-6 font-medium text-gray-700">Weight</Label>
        <RadioGroup
            value={weightUnit}
            onValueChange={(value) => onWeightUnitChange(value as "kg" | "lbs")}
            className="flex gap-4"
        >
            <div className="flex items-center space-x-2">
                <RadioGroupItem
                    value="kg"
                    id={`kg${suffix}`}
                    className="w-4 h-4 text-primary"
                />
                <Label htmlFor={`kg${suffix}`}>Kilograms (kg)</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem
                    value="lbs"
                    id={`lbs${suffix}`}
                    className="w-4 h-4 text-primary"
                />
                <Label htmlFor={`lbs${suffix}`}>Pounds (lbs)</Label>
            </div>
        </RadioGroup>

        <Input
            type="number"
            placeholder={
                weightUnit === "kg"
                    ? "Enter weight in kilograms"
                    : "Enter weight in pounds"
            }
            value={weight}
            onChange={(e) => onWeightChange(e.target.value)}
            min="1"
            max="500"
            className="border border-border focus:border-primary focus:ring-ring focus-visible:ring-0 focus-visible:ring-offset-0"
        />
    </div>
);

export const GenderSelection: React.FC<{
    gender: "male" | "female";
    onGenderChange: (gender: "male" | "female") => void;
    suffix?: string;
}> = ({ gender, onGenderChange, suffix = "" }) => (
    <div className="space-y-2">
        <Label className="block text-sm leading-6 font-medium text-gray-700">Gender</Label>
        <RadioGroup
            value={gender}
            onValueChange={(value) =>
                onGenderChange(value as "male" | "female")
            }
            className="flex gap-4"
        >
            <div className="flex items-center space-x-2">
                <RadioGroupItem
                    value="male"
                    id={`male${suffix}`}
                    className="w-4 h-4 text-primary"
                />
                <Label htmlFor={`male${suffix}`}>Male</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem
                    value="female"
                    id={`female${suffix}`}
                    className="w-4 h-4 text-primary"
                />
                <Label htmlFor={`female${suffix}`}>Female</Label>
            </div>
        </RadioGroup>
    </div>
);

/** Age, sex, height and weight, wired to a FormData object. */
export function BodyStatsFields({
    formData,
    onChange,
    suffix = "",
}: {
    formData: FormData;
    onChange: (field: keyof FormData, value: string) => void;
    suffix?: string;
}) {
    return (
        <>
            <div className="space-y-2">
                <Label
                    htmlFor={`age${suffix}`}
                    className="block text-sm leading-6 font-medium text-gray-700"
                >
                    Age (years)
                </Label>
                <Input
                    id={`age${suffix}`}
                    type="number"
                    placeholder="Enter your age"
                    value={formData.age}
                    onChange={(e) => onChange("age", e.target.value)}
                    min="1"
                    max="120"
                    className="border border-border focus:border-primary focus:ring-ring focus-visible:ring-0 focus-visible:ring-offset-0"
                />
            </div>
            <GenderSelection
                gender={formData.gender}
                onGenderChange={(gender) => onChange("gender", gender)}
                suffix={suffix}
            />
            <HeightInput
                heightUnit={formData.heightUnit}
                heightCm={formData.heightCm}
                heightFeet={formData.heightFeet}
                heightInches={formData.heightInches}
                onHeightUnitChange={(unit) => onChange("heightUnit", unit)}
                onHeightCmChange={(value) => onChange("heightCm", value)}
                onHeightFeetChange={(value) => onChange("heightFeet", value)}
                onHeightInchesChange={(value) => onChange("heightInches", value)}
                suffix={suffix}
            />
            <WeightInput
                weightUnit={formData.weightUnit}
                weight={formData.weight}
                onWeightUnitChange={(unit) => onChange("weightUnit", unit)}
                onWeightChange={(value) => onChange("weight", value)}
                suffix={suffix}
            />
        </>
    );
}
