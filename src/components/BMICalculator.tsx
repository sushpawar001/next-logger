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

interface BMIResult {
    bmi: number;
    classification: string;
    category: "underweight" | "normal" | "overweight" | "obesity";
}

interface FormData {
    age: string;
    gender: "male" | "female";
    heightUnit: "cm" | "ft";
    heightCm: string;
    heightFeet: string;
    heightInches: string;
    weightUnit: "kg" | "lbs";
    weightKg: string;
    weightLbs: string;
}

// Constants
const BMI_CLASSIFICATIONS = {
    underweight: { min: 0, max: 18.5, label: "Underweight", color: "blue" },
    normal: { min: 18.5, max: 25, label: "Normal", color: "green" },
    overweight: { min: 25, max: 30, label: "Overweight", color: "yellow" },
    obesity: { min: 30, max: Infinity, label: "Obesity", color: "red" },
} as const;

const IMPORTANT_NOTES = [
    "BMI is a screening tool and may not be accurate for all individuals",
    "Athletes with high muscle mass may have a higher BMI despite being healthy",
    "BMI does not account for body composition, bone density, or fat distribution",
    "Consult with a healthcare professional for personalized health assessments",
    "BMI ranges may vary slightly between different health organizations",
];

// Utility functions
const getHeightInMeters = (formData: FormData): number => {
    if (formData.heightUnit === "cm") {
        return parseFloat(formData.heightCm) / 100;
    } else {
        const totalInches =
            parseFloat(formData.heightFeet) * 12 +
            parseFloat(formData.heightInches);
        return totalInches * 0.0254;
    }
};

const getWeightInKg = (formData: FormData): number => {
    if (formData.weightUnit === "kg") {
        return parseFloat(formData.weightKg);
    } else {
        return parseFloat(formData.weightLbs) * 0.453592;
    }
};

const calculateBMI = (weightKg: number, heightM: number): number => {
    return weightKg / (heightM * heightM);
};

const getBMIClassification = (bmi: number): BMIResult => {
    for (const [category, range] of Object.entries(BMI_CLASSIFICATIONS)) {
        if (bmi >= range.min && bmi < range.max) {
            return {
                bmi,
                classification: range.label,
                category: category as keyof typeof BMI_CLASSIFICATIONS,
            };
        }
    }
    // Fallback for very high BMI values
    return {
        bmi,
        classification: BMI_CLASSIFICATIONS.obesity.label,
        category: "obesity",
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

    // Validate weight based on unit
    if (formData.weightUnit === "kg") {
        if (
            !formData.weightKg ||
            isNaN(parseFloat(formData.weightKg)) ||
            parseFloat(formData.weightKg) <= 0
        ) {
            errors.push("Please enter a valid weight in kilograms");
        }
    } else {
        if (
            !formData.weightLbs ||
            isNaN(parseFloat(formData.weightLbs)) ||
            parseFloat(formData.weightLbs) <= 0
        ) {
            errors.push("Please enter a valid weight in pounds");
        }
    }

    return errors;
};

// Reusable Components
const BMIClassificationCard: React.FC<{ result: BMIResult }> = ({ result }) => {
    const category = BMI_CLASSIFICATIONS[result.category];
    const colorClasses = {
        underweight: "from-blue-50 to-blue-100 border-blue-200 text-blue-900",
        normal: "from-green-50 to-green-100 border-green-200 text-green-900",
        overweight:
            "from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-900",
        obesity: "from-red-50 to-red-100 border-red-200 text-red-900",
    };

    return (
        <div
            className={`p-6 bg-gradient-to-r ${
                colorClasses[result.category]
            } border-2 rounded-lg`}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Your BMI Result</h3>
                <Badge
                    variant="default"
                    className={`${
                        result.category === "underweight"
                            ? "bg-blue-600"
                            : result.category === "normal"
                            ? "bg-green-600"
                            : result.category === "overweight"
                            ? "bg-yellow-600"
                            : "bg-red-600"
                    }`}
                >
                    {result.classification}
                </Badge>
            </div>
            <div className="text-center">
                <p className="text-3xl font-bold mb-2">
                    {result.bmi.toFixed(1)}
                </p>
                <p className="text-sm opacity-80">Body Mass Index</p>
            </div>
            <div className="mt-4 text-sm">
                <p>
                    <strong>Range:</strong> {category.min} -{" "}
                    {category.max === Infinity ? "∞" : category.max}
                </p>
                <p>
                    <strong>Category:</strong> {result.classification}
                </p>
            </div>
        </div>
    );
};

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

const ResultsCard: React.FC<{ result: BMIResult }> = ({ result }) => (
    <Card className="border border-purple-100 shadow">
        <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
                BMI Results
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <BMIClassificationCard result={result} />
                <ImportantNotes />
            </div>
        </CardContent>
    </Card>
);

const EmptyResultsCard: React.FC = () => (
    <Card className="border border-purple-100 shadow">
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
                        BMI results
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
    weightKg: string;
    weightLbs: string;
    onWeightUnitChange: (unit: "kg" | "lbs") => void;
    onWeightKgChange: (value: string) => void;
    onWeightLbsChange: (value: string) => void;
    suffix?: string;
}> = ({
    weightUnit,
    weightKg,
    weightLbs,
    onWeightUnitChange,
    onWeightKgChange,
    onWeightLbsChange,
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
            value={weightUnit === "kg" ? weightKg : weightLbs}
            onChange={(e) =>
                weightUnit === "kg"
                    ? onWeightKgChange(e.target.value)
                    : onWeightLbsChange(e.target.value)
            }
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
    <Card className="border border-purple-100 shadow">
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
                weightKg={formData.weightKg}
                weightLbs={formData.weightLbs}
                onWeightUnitChange={(unit) =>
                    onFormDataChange("weightUnit", unit)
                }
                onWeightKgChange={(value) =>
                    onFormDataChange("weightKg", value)
                }
                onWeightLbsChange={(value) =>
                    onFormDataChange("weightLbs", value)
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
                <Button onClick={onClear} variant="outline" className="flex-1">
                    Clear
                </Button>
            </div>
        </CardContent>
    </Card>
);

// Main Component
const BMICalculator: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        age: "",
        gender: "male",
        heightUnit: "cm",
        heightCm: "",
        heightFeet: "",
        heightInches: "",
        weightUnit: "kg",
        weightKg: "",
        weightLbs: "",
    });
    const [results, setResults] = useState<BMIResult | null>(null);
    const [errors, setErrors] = useState<string[]>([]);

    const handleFormDataChange = (
        field: keyof FormData,
        value: string | "cm" | "ft" | "kg" | "lbs" | "male" | "female"
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCalculate = () => {
        const validationErrors = validateInputs(formData);
        setErrors(validationErrors);

        if (validationErrors.length > 0) {
            return;
        }

        const heightM = getHeightInMeters(formData);
        const weightKg = getWeightInKg(formData);
        const bmi = calculateBMI(weightKg, heightM);
        const result = getBMIClassification(bmi);
        setResults(result);
    };

    const handleClear = () => {
        setFormData({
            age: "",
            gender: "male",
            heightUnit: "cm",
            heightCm: "",
            heightFeet: "",
            heightInches: "",
            weightUnit: "kg",
            weightKg: "",
            weightLbs: "",
        });
        setResults(null);
        setErrors([]);
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <PrivacyNotice />

            {/* Mobile Layout - Results first, then inputs */}
            <div className="lg:hidden space-y-6">
                {results && <ResultsCard result={results} />}
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
                    <ResultsCard result={results} />
                ) : (
                    <EmptyResultsCard />
                )}
            </div>
        </div>
    );
};

export default BMICalculator;
