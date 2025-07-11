"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/animate-ui/radix/radio-group";
import PrivacyNotice from "./PrivacyNotice";
import { useQueryState } from "nuqs";

interface BMRResult {
    bmr: number;
    activityLevels: {
        sedentary: number;
        light: number;
        moderate: number;
        active: number;
        veryActive: number;
        extraActive: number;
    };
}

interface FormData {
    age: string;
    gender: "male" | "female";
    heightUnit: "cm" | "ft";
    heightCm: string;
    heightFeet: string;
    heightInches: string;
    weightUnit: "kg" | "lbs";
    weight: string;
}

// Activity level definitions
const ACTIVITY_LEVELS = {
    sedentary: "Sedentary (little or no exercise)",
    light: "Exercise 1-3 times/week",
    moderate: "Exercise 4-5 times/week",
    active: "Daily exercise or intense exercise 3-4 times/week",
    veryActive: "Intense exercise 6-7 times/week",
    extraActive: "Very intense exercise daily, or physical job",
} as const;

const ACTIVITY_FACTORS = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.465,
    active: 1.55,
    veryActive: 1.725,
    extraActive: 1.9,
} as const;

const EXERCISE_DEFINITIONS = [
    "Exercise: 15-30 minutes of elevated heart rate activity.",
    "Intense exercise: 45-120 minutes of elevated heart rate activity.",
    "Very intense exercise: 2+ hours of elevated heart rate activity.",
];

const IMPORTANT_NOTES = [
    "BMR represents calories burned at complete rest",
    "Actual calorie needs vary based on activity level and lifestyle",
    "BMR decreases with age and increases with muscle mass",
    "Consult with a healthcare professional for personalized advice",
    "These calculations are estimates and may not be suitable for all individuals",
];

// Utility functions
const formatCalories = (calories: number): string =>
    `${Math.round(calories).toLocaleString()} Calories/day`;

const convertHeightToCm = (formData: FormData): number => {
    if (formData.heightUnit === "cm") {
        return parseFloat(formData.heightCm);
    } else {
        const feet = parseFloat(formData.heightFeet);
        const inches = parseFloat(formData.heightInches);
        return (feet * 12 + inches) * 2.54;
    }
};

const convertWeightToKg = (formData: FormData): number => {
    if (formData.weightUnit === "kg") {
        return parseFloat(formData.weight);
    } else {
        return parseFloat(formData.weight) * 0.453592;
    }
};

const calculateBMR = (formData: FormData): BMRResult => {
    const age = parseFloat(formData.age);
    const heightCm = convertHeightToCm(formData);
    const weightKg = convertWeightToKg(formData);

    let bmr: number;
    if (formData.gender === "male") {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }

    return {
        bmr,
        activityLevels: {
            sedentary: bmr * ACTIVITY_FACTORS.sedentary,
            light: bmr * ACTIVITY_FACTORS.light,
            moderate: bmr * ACTIVITY_FACTORS.moderate,
            active: bmr * ACTIVITY_FACTORS.active,
            veryActive: bmr * ACTIVITY_FACTORS.veryActive,
            extraActive: bmr * ACTIVITY_FACTORS.extraActive,
        },
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

    // Validate weight
    if (
        !formData.weight ||
        isNaN(parseFloat(formData.weight)) ||
        parseFloat(formData.weight) <= 0
    ) {
        errors.push("Please enter a valid weight");
    }

    return errors;
};

// Reusable Components
const BMRResultCard: React.FC<{ bmr: number }> = ({ bmr }) => (
    <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-lg">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-green-900 text-lg">
                Your BMR Result
            </h3>
            <Badge variant="default" className="bg-green-600">
                Mifflin-St Jeor
            </Badge>
        </div>
        <div className="text-center">
            <p className="text-3xl font-bold text-green-900 mb-2">
                {formatCalories(bmr)}
            </p>
            <p className="text-sm text-green-700 opacity-80">
                Basal Metabolic Rate
            </p>
        </div>
        <div className="mt-4 text-sm text-green-800">
            <p>
                <strong>Definition:</strong> Calories your body needs at
                complete rest
            </p>
            <p>
                <strong>Formula:</strong> Mifflin-St Jeor Equation
            </p>
        </div>
    </div>
);

const ActivityLevelTable: React.FC<{
    activityLevels: BMRResult["activityLevels"];
}> = ({ activityLevels }) => (
    <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 text-sm">
            Daily Calorie Needs Based on Activity Level
        </h4>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50">
                        <TableHead className="text-sm font-medium text-gray-700">
                            Activity Level
                        </TableHead>
                        <TableHead className="text-sm font-medium text-gray-700 text-right">
                            Calories
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="text-sm text-gray-700">
                            {ACTIVITY_LEVELS.sedentary}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-gray-900 text-right">
                            {formatCalories(activityLevels.sedentary)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="text-sm text-gray-700">
                            {ACTIVITY_LEVELS.light}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-gray-900 text-right">
                            {formatCalories(activityLevels.light)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="text-sm text-gray-700">
                            {ACTIVITY_LEVELS.moderate}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-gray-900 text-right">
                            {formatCalories(activityLevels.moderate)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="text-sm text-gray-700">
                            {ACTIVITY_LEVELS.active}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-gray-900 text-right">
                            {formatCalories(activityLevels.active)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="text-sm text-gray-700">
                            {ACTIVITY_LEVELS.veryActive}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-gray-900 text-right">
                            {formatCalories(activityLevels.veryActive)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="text-sm text-gray-700">
                            {ACTIVITY_LEVELS.extraActive}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-gray-900 text-right">
                            {formatCalories(activityLevels.extraActive)}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    </div>
);

const ExerciseDefinitions: React.FC = () => (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2 text-sm">
            Activity Level Definitions:
        </h4>
        <ul className="text-xs text-blue-800 space-y-1">
            {EXERCISE_DEFINITIONS.map((definition, index) => (
                <li key={index}>• {definition}</li>
            ))}
        </ul>
    </div>
);

const ImportantNotes: React.FC = () => (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-900 mb-2 text-sm">
            Important Notes:
        </h4>
        <ul className="text-xs text-yellow-800 space-y-1">
            {IMPORTANT_NOTES.map((note, index) => (
                <li key={index}>• {note}</li>
            ))}
        </ul>
    </div>
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

const ResultsCard: React.FC<{ results: BMRResult }> = ({ results }) => (
    <Card className="border border-purple-100 shadow-md">
        <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
                BMR Results
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <BMRResultCard bmr={results.bmr} />
                <ActivityLevelTable activityLevels={results.activityLevels} />
                <ExerciseDefinitions />
                <ImportantNotes />
            </div>
        </CardContent>
    </Card>
);

const EmptyResultsCard: React.FC = () => (
    <Card className="border border-purple-100 shadow-md">
        <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
                Results
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
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
                                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    <p className="text-sm">
                        Enter your information and click Calculate to see your
                        BMR results
                    </p>
                </div>
            </div>
        </CardContent>
    </Card>
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
    <div className="space-y-4">
        <Label className="text-sm font-medium text-gray-700">Height</Label>
        <RadioGroup
            value={heightUnit}
            onValueChange={(value) => onHeightUnitChange(value as "cm" | "ft")}
            className="flex gap-4"
        >
            <div className="flex items-center space-x-2">
                <RadioGroupItem
                    value="cm"
                    id={`cm${suffix}`}
                    className="w-4 h-4 text-[#5E4AE3]"
                />
                <Label htmlFor={`cm${suffix}`}>Centimeters (cm)</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem
                    value="ft"
                    id={`ft${suffix}`}
                    className="w-4 h-4 text-[#5E4AE3]"
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
                className="border border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] focus-visible:ring-0 focus-visible:ring-offset-0"
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
                        className="border border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] focus-visible:ring-0 focus-visible:ring-offset-0"
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
                        className="border border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
            </div>
        )}
    </div>
);

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
    <div className="space-y-4">
        <Label className="text-sm font-medium text-gray-700">Weight</Label>
        <RadioGroup
            value={weightUnit}
            onValueChange={(value) => onWeightUnitChange(value as "kg" | "lbs")}
            className="flex gap-4"
        >
            <div className="flex items-center space-x-2">
                <RadioGroupItem
                    value="kg"
                    id={`kg${suffix}`}
                    className="w-4 h-4 text-[#5E4AE3]"
                />
                <Label htmlFor={`kg${suffix}`}>Kilograms (kg)</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem
                    value="lbs"
                    id={`lbs${suffix}`}
                    className="w-4 h-4 text-[#5E4AE3]"
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
            className="border border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] focus-visible:ring-0 focus-visible:ring-offset-0"
        />
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
            onValueChange={(value) =>
                onGenderChange(value as "male" | "female")
            }
            className="flex gap-4"
        >
            <div className="flex items-center space-x-2">
                <RadioGroupItem
                    value="male"
                    id={`male${suffix}`}
                    className="w-4 h-4 text-[#5E4AE3]"
                />
                <Label htmlFor={`male${suffix}`}>Male</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem
                    value="female"
                    id={`female${suffix}`}
                    className="w-4 h-4 text-[#5E4AE3]"
                />
                <Label htmlFor={`female${suffix}`}>Female</Label>
            </div>
        </RadioGroup>
    </div>
);

const InputForm: React.FC<{
    formData: FormData;
    errors: string[];
    onFormDataChange: (
        field: keyof FormData,
        value: string | "cm" | "ft" | "kg" | "lbs" | "male" | "female"
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
    <Card className="border border-purple-100 shadow-md">
        <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
                Enter Your Information
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                    onChange={(e) => onFormDataChange("age", e.target.value)}
                    min="1"
                    max="120"
                    className="border border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] focus-visible:ring-0 focus-visible:ring-offset-0"
                />
            </div>

            {/* Gender Selection */}
            <GenderSelection
                gender={formData.gender}
                onGenderChange={(gender) => onFormDataChange("gender", gender)}
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

            {/* Weight Input */}
            <WeightInput
                weightUnit={formData.weightUnit}
                weight={formData.weight}
                onWeightUnitChange={(unit) =>
                    onFormDataChange("weightUnit", unit)
                }
                onWeightChange={(value) => onFormDataChange("weight", value)}
                suffix={suffix}
            />

            {/* Error Messages */}
            <ErrorMessages errors={errors} />

            {/* Action Buttons */}
            <div className="flex gap-4">
                <Button onClick={onCalculate} className="flex-1">
                    Calculate
                </Button>
                <Button onClick={onClear} variant="outline" className="flex-1">
                    Clear
                </Button>
            </div>
        </CardContent>
    </Card>
);

// Main Component
const BMRCalculator: React.FC = () => {
    // Form inputs in query parameters
    const [age, setAge] = useQueryState("age", { defaultValue: "" });
    const [gender, setGender] = useQueryState<"male" | "female">("gender", {
        defaultValue: "male",
        parse: (value) =>
            value === "male" || value === "female" ? value : "male",
        serialize: (value) => value,
    });
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
    const [weightUnit, setWeightUnit] = useQueryState<"kg" | "lbs">(
        "weightUnit",
        {
            defaultValue: "kg",
            parse: (value) =>
                value === "kg" || value === "lbs" ? value : "kg",
            serialize: (value) => value,
        }
    );
    const [weight, setWeight] = useQueryState("weight", {
        defaultValue: "",
    });

    // Results and errors in local state
    const [results, setResults] = useState<BMRResult | null>(null);
    const [errors, setErrors] = useState<string[]>([]);

    // Create formData object from query parameters
    const formData: FormData = {
        age: age || "",
        gender: gender || "male",
        heightUnit: heightUnit || "cm",
        heightCm: heightCm || "",
        heightFeet: heightFeet || "",
        heightInches: heightInches || "",
        weightUnit: weightUnit || "kg",
        weight: weight || "",
    };

    const handleFormDataChange = (
        field: keyof FormData,
        value: string | "cm" | "ft" | "kg" | "lbs" | "male" | "female"
    ) => {
        switch (field) {
            case "age":
                setAge(value as string);
                break;
            case "gender":
                setGender(value as "male" | "female");
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
            case "weightUnit":
                setWeightUnit(value as "kg" | "lbs");
                break;
            case "weight":
                setWeight(value as string);
                break;
        }
    };

    const handleCalculate = () => {
        const validationErrors = validateInputs(formData);
        setErrors(validationErrors);

        if (validationErrors.length > 0) {
            return;
        }

        const calculatedResults = calculateBMR(formData);
        setResults(calculatedResults);
    };

    const handleClear = () => {
        setAge("");
        setGender("male");
        setHeightUnit("cm");
        setHeightCm("");
        setHeightFeet("");
        setHeightInches("");
        setWeightUnit("kg");
        setWeight("");
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

export default BMRCalculator;
