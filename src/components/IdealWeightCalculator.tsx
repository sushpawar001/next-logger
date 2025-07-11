"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/animate-ui/radix/radio-group";
import PrivacyNotice from "./PrivacyNotice";
import { useQueryState } from "nuqs";

interface IBWResult {
    robinson: number;
    miller: number;
    devine: number;
    hamwi: number;
}

interface FormData {
    age: string;
    heightUnit: "cm" | "ft";
    heightCm: string;
    heightFeet: string;
    heightInches: string;
    gender: "male" | "female";
}

// Constants
const FORMULA_NAMES = {
    devine: "Devine Formula",
    robinson: "Robinson",
    miller: "Miller",
    hamwi: "Hamwi",
} as const;

const IMPORTANT_NOTES = [
    "These formulas provide estimates and may not be suitable for all individuals",
    "Consult with a healthcare professional for personalized recommendations",
    "Ideal body weight does not account for muscle mass, bone density, or body composition",
    "The Devine formula is highlighted as it's most commonly used in clinical settings",
];

// Utility functions
const formatWeight = (weight: number): string => `${weight.toFixed(1)} kg`;

const getHeightInInches = (formData: FormData): number => {
    if (formData.heightUnit === "cm") {
        return parseFloat(formData.heightCm) / 2.54;
    } else {
        return (
            parseFloat(formData.heightFeet) * 12 +
            parseFloat(formData.heightInches)
        );
    }
};

const calculateIBW = (
    heightInches: number,
    gender: "male" | "female"
): IBWResult => {
    const baseHeight = 60; // 5 feet = 60 inches
    const inchesOver5Feet = Math.max(0, heightInches - baseHeight);

    if (gender === "male") {
        return {
            robinson: 52 + 1.9 * inchesOver5Feet,
            miller: 56.2 + 1.41 * inchesOver5Feet,
            devine: 50.0 + 2.3 * inchesOver5Feet,
            hamwi: 48.0 + 2.7 * inchesOver5Feet,
        };
    } else {
        return {
            robinson: 49 + 1.7 * inchesOver5Feet,
            miller: 53.1 + 1.36 * inchesOver5Feet,
            devine: 45.5 + 2.2 * inchesOver5Feet,
            hamwi: 45.5 + 2.2 * inchesOver5Feet,
        };
    }
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

    return errors;
};

const DevineFormulaCard: React.FC<{ weight: number }> = ({ weight }) => (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-blue-900 text-sm">
                {FORMULA_NAMES.devine}
            </h3>
            <Badge variant="default" className="bg-blue-600">
                Primary
            </Badge>
        </div>
        <p className="text-lg font-bold text-blue-900">
            {formatWeight(weight)}
        </p>
        <p className="text-sm text-blue-700 mt-1">
            Most commonly used formula in clinical practice
        </p>
    </div>
);

const FormulaCard: React.FC<{ name: string; weight: number }> = ({
    name,
    weight,
}) => (
    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-1 text-sm">{name}</h3>
        <p className="text-lg font-bold text-gray-900">
            {formatWeight(weight)}
        </p>
    </div>
);

const OtherFormulas: React.FC<{ results: IBWResult }> = ({ results }) => (
    <div className="grid gap-3 grid-cols-3">
        <FormulaCard name={FORMULA_NAMES.robinson} weight={results.robinson} />
        <FormulaCard name={FORMULA_NAMES.miller} weight={results.miller} />
        <FormulaCard name={FORMULA_NAMES.hamwi} weight={results.hamwi} />
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

const ResultsCard: React.FC<{ results: IBWResult }> = ({ results }) => (
    <Card className="border border-purple-100 shadow-md">
        <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
                Ideal Body Weight Results
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <DevineFormulaCard weight={results.devine} />
                <OtherFormulas results={results} />
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
                        ideal body weight results
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
        value: string | "cm" | "ft" | "male" | "female"
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

            {/* Gender Selection */}
            <GenderSelection
                gender={formData.gender}
                onGenderChange={(gender) => onFormDataChange("gender", gender)}
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
const IdealWeightCalculator: React.FC = () => {
    // Form inputs in query parameters
    const [age, setAge] = useQueryState("age", { defaultValue: "" });
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
    const [gender, setGender] = useQueryState<"male" | "female">("gender", {
        defaultValue: "male",
        parse: (value) =>
            value === "male" || value === "female" ? value : "male",
        serialize: (value) => value,
    });

    // Results and errors in local state
    const [results, setResults] = useState<IBWResult | null>(null);
    const [errors, setErrors] = useState<string[]>([]);

    // Create formData object from query parameters
    const formData: FormData = {
        age: age || "",
        heightUnit: heightUnit || "cm",
        heightCm: heightCm || "",
        heightFeet: heightFeet || "",
        heightInches: heightInches || "",
        gender: gender || "male",
    };

    const handleFormDataChange = (
        field: keyof FormData,
        value: string | "cm" | "ft" | "male" | "female"
    ) => {
        switch (field) {
            case "age":
                setAge(value as string);
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
            case "gender":
                setGender(value as "male" | "female");
                break;
        }
    };

    const handleCalculate = () => {
        const validationErrors = validateInputs(formData);
        setErrors(validationErrors);

        if (validationErrors.length > 0) {
            return;
        }

        const heightInches = getHeightInInches(formData);
        const calculatedResults = calculateIBW(heightInches, formData.gender);
        setResults(calculatedResults);
    };

    const handleClear = () => {
        setAge("");
        setHeightUnit("cm");
        setHeightCm("");
        setHeightFeet("");
        setHeightInches("");
        setGender("male");
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

export default IdealWeightCalculator;
