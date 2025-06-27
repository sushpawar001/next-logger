"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/animate-ui/radix/radio-group";
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/animate-ui/radix/toggle-group";
import PrivacyNotice from "./PrivacyNotice";
import { useQueryState } from "nuqs";

interface WaterIntakeResult {
    baseIntake: number; // in liters
    activityAdjustment: number; // in liters
    totalIntake: number; // in liters
    totalIntakeOz: number; // in ounces
    totalIntakeCups: number; // in cups (8 oz each)
}

interface FormData {
    age: string;
    gender: "male" | "female";
    weightUnit: "kg" | "lbs";
    weight: string;
    heightUnit: "cm" | "ft";
    heightCm: string;
    heightFeet: string;
    heightInches: string;
    activityLevel:
        | "sedentary"
        | "lightly-active"
        | "moderately-active"
        | "very-active"
        | "extremely-active";
}

// Activity level definitions
const ACTIVITY_LEVELS = {
    sedentary: {
        label: "Sedentary",
        description: "Little to no exercise",
        adjustment: 0,
    },
    "lightly-active": {
        label: "Lightly Active",
        description: "Light exercise/sports 1-3 days/week",
        adjustment: 0.5,
    },
    "moderately-active": {
        label: "Moderately Active",
        description: "Moderate exercise/sports 3-5 days/week",
        adjustment: 1.0,
    },
    "very-active": {
        label: "Very Active",
        description: "Hard exercise/sports 6-7 days/week",
        adjustment: 1.5,
    },
    "extremely-active": {
        label: "Extremely Active",
        description: "Very hard daily exercise/physical job",
        adjustment: 2.0,
    },
} as const;

// Utility functions
const formatWaterIntake = (liters: number): string => {
    const oz = liters * 33.814;
    const cups = oz / 8;
    return `${liters.toFixed(1)} L (${oz.toFixed(0)} oz, ${cups.toFixed(
        1
    )} cups)`;
};

const kgToLbs = (kg: number): number => kg * 2.20462;
const lbsToKg = (lbs: number): number => lbs / 2.20462;
const cmToInches = (cm: number): number => cm / 2.54;
const inchesToCm = (inches: number): number => inches * 2.54;

const getWeightInKg = (formData: FormData): number => {
    if (formData.weightUnit === "kg") {
        return parseFloat(formData.weight);
    } else {
        return lbsToKg(parseFloat(formData.weight));
    }
};

const getHeightInCm = (formData: FormData): number => {
    if (formData.heightUnit === "cm") {
        return parseFloat(formData.heightCm);
    } else {
        const feet = parseFloat(formData.heightFeet);
        const inches = parseFloat(formData.heightInches);
        return inchesToCm(feet * 12 + inches);
    }
};

const calculateWaterIntake = (formData: FormData): WaterIntakeResult => {
    const weightKg = getWeightInKg(formData);
    const heightCm = getHeightInCm(formData);
    const age = parseFloat(formData.age);
    const activityLevel = formData.activityLevel;

    // Base calculation: 30-35ml per kg of body weight
    // Adjust based on age and gender
    let baseMultiplier = 32; // ml per kg (middle of 30-35 range)

    // Age adjustments
    if (age < 18) {
        baseMultiplier += 2; // Slightly more for younger people
    } else if (age > 65) {
        baseMultiplier -= 2; // Slightly less for older people
    }

    // Gender adjustments
    if (formData.gender === "male") {
        baseMultiplier += 1; // Men typically need slightly more
    }

    // Height adjustment (taller people may need more)
    const heightAdjustment = Math.max(0, (heightCm - 170) / 10) * 0.1; // Small adjustment for height

    const baseIntake =
        ((weightKg * baseMultiplier) / 1000) * (1 + heightAdjustment); // Convert to liters
    const activityAdjustment = ACTIVITY_LEVELS[activityLevel].adjustment;
    const totalIntake = baseIntake + activityAdjustment;

    return {
        baseIntake,
        activityAdjustment,
        totalIntake,
        totalIntakeOz: totalIntake * 33.814,
        totalIntakeCups: (totalIntake * 33.814) / 8,
    };
};

const validateInputs = (formData: FormData): string[] => {
    const errors: string[] = [];

    // Validate age
    if (
        !formData.age ||
        isNaN(parseFloat(formData.age)) ||
        parseFloat(formData.age) <= 0
    ) {
        errors.push("Please enter a valid age");
    }

    // Validate weight
    if (
        !formData.weight ||
        isNaN(parseFloat(formData.weight)) ||
        parseFloat(formData.weight) <= 0
    ) {
        errors.push("Please enter a valid weight");
    }

    // Validate height based on unit
    if (formData.heightUnit === "cm") {
        if (
            !formData.heightCm ||
            isNaN(parseFloat(formData.heightCm)) ||
            parseFloat(formData.heightCm) <= 0
        ) {
            errors.push("Please enter a valid height in centimeters");
        }
    } else {
        if (
            !formData.heightFeet ||
            isNaN(parseFloat(formData.heightFeet)) ||
            parseFloat(formData.heightFeet) <= 0
        ) {
            errors.push("Please enter a valid height in feet");
        }
        if (
            !formData.heightInches ||
            isNaN(parseFloat(formData.heightInches)) ||
            parseFloat(formData.heightInches) < 0 ||
            parseFloat(formData.heightInches) >= 12
        ) {
            errors.push("Please enter a valid height in inches (0-11)");
        }
    }

    return errors;
};

const ResultsCard: React.FC<{ results: WaterIntakeResult }> = ({ results }) => (
    <Card className="border border-blue-100 shadow">
        <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
                Daily Water Intake Results
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {/* Main Result */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-blue-900 text-sm">
                            Recommended Daily Intake
                        </h3>
                        <Badge variant="default" className="bg-blue-600">
                            Primary
                        </Badge>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">
                        {formatWaterIntake(results.totalIntake)}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                        Based on your body weight, age, gender, and activity
                        level
                    </p>
                </div>

                {/* Breakdown */}
                <div className="grid gap-3 grid-cols-2">
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                            Base Intake
                        </h3>
                        <p className="text-lg font-bold text-gray-900">
                            {results.baseIntake.toFixed(1)} L
                        </p>
                        <p className="text-xs text-gray-600">
                            From body weight
                        </p>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                            Activity Bonus
                        </h3>
                        <p className="text-lg font-bold text-gray-900">
                            +{results.activityAdjustment.toFixed(1)} L
                        </p>
                        <p className="text-xs text-gray-600">For exercise</p>
                    </div>
                </div>

                {/* Important Notes */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2 text-sm">
                        Important Notes:
                    </h4>
                    <ul className="text-xs text-yellow-800 space-y-1">
                        <li>
                            • The recommended amount of water varies
                            significantly based on factors such as age, gender,
                            body size, daily activity level, and the physical
                            environment.
                        </li>
                        <li>
                            • This is an estimate and may need adjustment based
                            on climate, diet, and individual factors.
                        </li>
                        <li>
                            • Consult with a healthcare professional for
                            personalized recommendations.
                        </li>
                        <li>
                            • Listen to your body's thirst signals and adjust
                            accordingly.
                        </li>
                    </ul>
                </div>
            </div>
        </CardContent>
    </Card>
);

const EmptyResultsCard: React.FC = () => (
    <Card className="border border-gray-200 shadow">
        <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
                Daily Water Intake Results
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Calculate Your Water Intake
                </h3>
                <p className="text-gray-600 text-sm max-w-sm">
                    Enter your details and click "Calculate" to see your
                    recommended daily water intake based on your personal
                    factors and activity level.
                </p>
            </div>
        </CardContent>
    </Card>
);

const ErrorMessages: React.FC<{ errors: string[] }> = ({ errors }) => {
    if (errors.length === 0) return null;

    return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                ))}
            </ul>
        </div>
    );
};

const WeightInput: React.FC<{
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
    <div className="space-y-2">
        <Label
            htmlFor={`weight${suffix}`}
            className="text-sm font-medium text-gray-700"
        >
            Weight
        </Label>
        <div className="flex gap-2">
            <Input
                id={`weight${suffix}`}
                type="number"
                placeholder="Enter your weight"
                value={weight}
                onChange={(e) => onWeightChange(e.target.value)}
                min="1"
                max="500"
                className="flex-1 border border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <ToggleGroup
                type="single"
                value={weightUnit}
                onValueChange={(value) => {
                    if (value) onWeightUnitChange(value as "kg" | "lbs");
                }}
                className="border border-purple-200 rounded-md text-sm font-medium"
                activeClassName="bg-[#5E4AE3]"
            >
                <ToggleGroupItem
                    value="kg"
                    className="px-3 py-2 data-[state=on]:text-white"
                >
                    kg
                </ToggleGroupItem>
                <ToggleGroupItem
                    value="lbs"
                    className="px-3 py-2 data-[state=on]:text-white"
                >
                    lbs
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    </div>
);

const HeightInput: React.FC<{
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
    <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Height</Label>
        <div className="flex gap-2">
            {heightUnit === "cm" ? (
                <Input
                    type="number"
                    placeholder="Height in cm"
                    value={heightCm}
                    onChange={(e) => onHeightCmChange(e.target.value)}
                    min="1"
                    max="300"
                    className="flex-1 border border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] focus-visible:ring-0 focus-visible:ring-offset-0"
                />
            ) : (
                <div className="flex gap-2 flex-1">
                    <Input
                        type="number"
                        placeholder="Feet"
                        value={heightFeet}
                        onChange={(e) => onHeightFeetChange(e.target.value)}
                        min="1"
                        max="10"
                        className="flex-1 border border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Input
                        type="number"
                        placeholder="Inches"
                        value={heightInches}
                        onChange={(e) => onHeightInchesChange(e.target.value)}
                        min="0"
                        max="11"
                        className="flex-1 border border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
            )}
            <ToggleGroup
                type="single"
                value={heightUnit}
                onValueChange={(value) => {
                    if (value) onHeightUnitChange(value as "cm" | "ft");
                }}
                className="border border-purple-200 rounded-md text-sm font-medium"
                activeClassName="bg-[#5E4AE3]"
            >
                <ToggleGroupItem
                    value="cm"
                    className="px-3 py-2 data-[state=on]:text-white"
                >
                    cm
                </ToggleGroupItem>
                <ToggleGroupItem
                    value="ft"
                    className="px-3 py-2 data-[state=on]:text-white"
                >
                    ft
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    </div>
);

const GenderSelection: React.FC<{
    gender: "male" | "female";
    onGenderChange: (gender: "male" | "female") => void;
    suffix?: string;
}> = ({ gender, onGenderChange, suffix = "" }) => (
    <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Gender</Label>
        <RadioGroup
            value={gender}
            onValueChange={(value: "male" | "female") => onGenderChange(value)}
            className="flex gap-4"
        >
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id={`male${suffix}`} />
                <Label
                    htmlFor={`male${suffix}`}
                    className="text-sm font-normal"
                >
                    Male
                </Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id={`female${suffix}`} />
                <Label
                    htmlFor={`female${suffix}`}
                    className="text-sm font-normal"
                >
                    Female
                </Label>
            </div>
        </RadioGroup>
    </div>
);

const ActivityLevelSelect: React.FC<{
    activityLevel:
        | "sedentary"
        | "lightly-active"
        | "moderately-active"
        | "very-active"
        | "extremely-active";
    onActivityLevelChange: (
        level:
            | "sedentary"
            | "lightly-active"
            | "moderately-active"
            | "very-active"
            | "extremely-active"
    ) => void;
    suffix?: string;
}> = ({ activityLevel, onActivityLevelChange, suffix = "" }) => (
    <div className="space-y-2">
        <Label
            htmlFor={`activity${suffix}`}
            className="text-sm font-medium text-gray-700"
        >
            Activity Level
        </Label>
        <Select value={activityLevel} onValueChange={onActivityLevelChange}>
            <SelectTrigger
                id={`activity${suffix}`}
                className="border border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] focus-visible:ring-0 focus-visible:ring-offset-0"
            >
                <SelectValue placeholder="Select activity level" />
            </SelectTrigger>
            <SelectContent>
                {Object.entries(ACTIVITY_LEVELS).map(([key, level]) => (
                    <SelectItem key={key} value={key}>
                        <div>
                            <div className="font-medium">{level.label}</div>
                            <div className="text-xs text-gray-500">
                                {level.description}
                            </div>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
);

const InputForm: React.FC<{
    formData: FormData;
    errors: string[];
    onFormDataChange: (
        field: keyof FormData,
        value:
            | string
            | "kg"
            | "lbs"
            | "cm"
            | "ft"
            | "male"
            | "female"
            | "sedentary"
            | "lightly-active"
            | "moderately-active"
            | "very-active"
            | "extremely-active"
    ) => void;
    onCalculate: () => void;
    onClear: () => void;
    suffix?: string;
}> = ({
    formData,
    errors,
    onFormDataChange,
    onCalculate,
    onClear,
    suffix = "",
}) => (
    <Card className="border border-purple-100 shadow">
        <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
                Enter Your Details
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {/* Age Input */}
                <div className="space-y-2">
                    <Label
                        htmlFor={`age${suffix}`}
                        className="text-sm font-medium text-gray-700"
                    >
                        Age (years)
                    </Label>
                    <Input
                        id={`age${suffix}`}
                        type="number"
                        placeholder="Enter your age"
                        value={formData.age}
                        onChange={(e) =>
                            onFormDataChange("age", e.target.value)
                        }
                        min="1"
                        max="120"
                        className="border border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>

                {/* Gender Selection */}
                <GenderSelection
                    gender={formData.gender}
                    onGenderChange={(gender) =>
                        onFormDataChange("gender", gender)
                    }
                    suffix={suffix}
                />

                {/* Weight Input */}
                <WeightInput
                    weightUnit={formData.weightUnit}
                    weight={formData.weight}
                    onWeightUnitChange={(unit) =>
                        onFormDataChange("weightUnit", unit)
                    }
                    onWeightChange={(value) =>
                        onFormDataChange("weight", value)
                    }
                    suffix={suffix}
                />

                {/* Height Input */}
                <HeightInput
                    heightUnit={formData.heightUnit}
                    heightCm={formData.heightCm}
                    heightFeet={formData.heightFeet}
                    heightInches={formData.heightInches}
                    onHeightUnitChange={(unit) =>
                        onFormDataChange("heightUnit", unit)
                    }
                    onHeightCmChange={(value) =>
                        onFormDataChange("heightCm", value)
                    }
                    onHeightFeetChange={(value) =>
                        onFormDataChange("heightFeet", value)
                    }
                    onHeightInchesChange={(value) =>
                        onFormDataChange("heightInches", value)
                    }
                    suffix={suffix}
                />

                {/* Activity Level */}
                <ActivityLevelSelect
                    activityLevel={formData.activityLevel}
                    onActivityLevelChange={(level) =>
                        onFormDataChange("activityLevel", level)
                    }
                    suffix={suffix}
                />

                {/* Error Messages */}
                <ErrorMessages errors={errors} />

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <Button onClick={onCalculate} className="flex-1">
                        Calculate
                    </Button>
                    <Button
                        onClick={onClear}
                        variant="outline"
                        className="flex-1"
                    >
                        Clear
                    </Button>
                </div>
            </div>
        </CardContent>
    </Card>
);

// Main Component
const WaterIntakeCalculator: React.FC = () => {
    // Form inputs in query parameters
    const [age, setAge] = useQueryState("age", { defaultValue: "" });
    const [gender, setGender] = useQueryState<"male" | "female">("gender", {
        defaultValue: "male",
        parse: (value) =>
            value === "male" || value === "female" ? value : "male",
        serialize: (value) => value,
    });
    const [weightUnit, setWeightUnit] = useQueryState<"kg" | "lbs">(
        "weightUnit",
        {
            defaultValue: "kg",
            parse: (value) =>
                value === "kg" || value === "lbs" ? value : "kg",
            serialize: (value) => value,
        }
    );
    const [weight, setWeight] = useQueryState("weight", { defaultValue: "" });
    const [heightUnit, setHeightUnit] = useQueryState<"cm" | "ft">(
        "heightUnit",
        {
            defaultValue: "cm",
            parse: (value) => (value === "cm" || value === "ft" ? value : "cm"),
            serialize: (value) => value,
        }
    );
    const [heightCm, setHeightCm] = useQueryState("heightCm", {
        defaultValue: "",
    });
    const [heightFeet, setHeightFeet] = useQueryState("heightFeet", {
        defaultValue: "",
    });
    const [heightInches, setHeightInches] = useQueryState("heightInches", {
        defaultValue: "",
    });
    const [activityLevel, setActivityLevel] = useQueryState<
        | "sedentary"
        | "lightly-active"
        | "moderately-active"
        | "very-active"
        | "extremely-active"
    >("activityLevel", {
        defaultValue: "sedentary",
        parse: (value) =>
            Object.keys(ACTIVITY_LEVELS).includes(value)
                ? (value as
                      | "sedentary"
                      | "lightly-active"
                      | "moderately-active"
                      | "very-active"
                      | "extremely-active")
                : "sedentary",
        serialize: (value) => value,
    });

    // Results and errors in local state
    const [results, setResults] = useState<WaterIntakeResult | null>(null);
    const [errors, setErrors] = useState<string[]>([]);

    // Create formData object from query parameters
    const formData: FormData = {
        age: age || "",
        gender: gender || "male",
        weightUnit: weightUnit || "kg",
        weight: weight || "",
        heightUnit: heightUnit || "cm",
        heightCm: heightCm || "",
        heightFeet: heightFeet || "",
        heightInches: heightInches || "",
        activityLevel: activityLevel || "sedentary",
    };

    const handleFormDataChange = (
        field: keyof FormData,
        value:
            | string
            | "kg"
            | "lbs"
            | "cm"
            | "ft"
            | "male"
            | "female"
            | "sedentary"
            | "lightly-active"
            | "moderately-active"
            | "very-active"
            | "extremely-active"
    ) => {
        switch (field) {
            case "age":
                setAge(value as string);
                break;
            case "gender":
                setGender(value as "male" | "female");
                break;
            case "weightUnit":
                setWeightUnit(value as "kg" | "lbs");
                break;
            case "weight":
                setWeight(value as string);
                break;
            case "heightUnit":
                setHeightUnit(value as "cm" | "ft");
                // Remove unused height unit parameters
                if (value === "cm") {
                    setHeightFeet("");
                    setHeightInches("");
                } else {
                    setHeightCm("");
                }
                break;
            case "heightCm":
                setHeightCm(value as string);
                break;
            case "heightFeet":
                setHeightFeet(value as string);
                break;
            case "heightInches":
                setHeightInches(value as string);
                break;
            case "activityLevel":
                setActivityLevel(
                    value as
                        | "sedentary"
                        | "lightly-active"
                        | "moderately-active"
                        | "very-active"
                        | "extremely-active"
                );
                break;
        }
    };

    const handleCalculate = () => {
        const validationErrors = validateInputs(formData);
        setErrors(validationErrors);

        if (validationErrors.length > 0) {
            return;
        }

        const calculatedResults = calculateWaterIntake(formData);
        setResults(calculatedResults);
    };

    const handleClear = () => {
        setAge("");
        setGender("male");
        setWeightUnit("kg");
        setWeight("");
        setHeightUnit("cm");
        setHeightCm("");
        setHeightFeet("");
        setHeightInches("");
        setActivityLevel("sedentary");
        setResults(null);
        setErrors([]);
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <PrivacyNotice />

            {/* Mobile Layout - Results first, then inputs */}
            <div className="lg:hidden space-y-6">
                {results && <ResultsCard results={results} />}
                <InputForm
                    formData={formData}
                    errors={errors}
                    onFormDataChange={handleFormDataChange}
                    onCalculate={handleCalculate}
                    onClear={handleClear}
                />
            </div>

            {/* Desktop Layout - Side by side */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-6">
                <InputForm
                    formData={formData}
                    errors={errors}
                    onFormDataChange={handleFormDataChange}
                    onCalculate={handleCalculate}
                    onClear={handleClear}
                    suffix="-desktop"
                />
                {results ? (
                    <ResultsCard results={results} />
                ) : (
                    <EmptyResultsCard />
                )}
            </div>
        </div>
    );
};

export default WaterIntakeCalculator;
