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

interface WHRResult {
    whr: number;
    classification: string;
    category: "low" | "moderate" | "high";
    riskLevel: string;
}

interface FormData {
    gender: "male" | "female";
    waistUnit: "cm" | "in";
    waistCm: string;
    waistIn: string;
    hipUnit: "cm" | "in";
    hipCm: string;
    hipIn: string;
}

// WHO WHR Classification Constants
const WHR_CLASSIFICATIONS = {
    male: {
        low: {
            min: 0,
            max: 0.9,
            label: "Low Risk",
            color: "green",
            riskLevel: "Low cardiovascular risk",
        },
        moderate: {
            min: 0.9,
            max: 0.99,
            label: "Moderate Risk",
            color: "yellow",
            riskLevel: "Moderate cardiovascular risk",
        },
        high: {
            min: 1.0,
            max: Infinity,
            label: "High Risk",
            color: "red",
            riskLevel: "High cardiovascular risk",
        },
    },
    female: {
        low: {
            min: 0,
            max: 0.8,
            label: "Low Risk",
            color: "green",
            riskLevel: "Low cardiovascular risk",
        },
        moderate: {
            min: 0.8,
            max: 0.84,
            label: "Moderate Risk",
            color: "yellow",
            riskLevel: "Moderate cardiovascular risk",
        },
        high: {
            min: 0.85,
            max: Infinity,
            label: "High Risk",
            color: "red",
            riskLevel: "High cardiovascular risk",
        },
    },
} as const;

const IMPORTANT_NOTES = [
    "WHR is a measure of body fat distribution and cardiovascular risk",
    "WHR is more accurate than BMI for assessing cardiovascular risk",
    "Abdominal obesity (high WHR) is associated with increased health risks",
    "WHR should be used alongside other health indicators",
    "Consult with a healthcare professional for personalized health assessments",
    "WHR measurements should be taken at the narrowest part of the waist and widest part of the hips",
];

// Utility functions
const getWaistInCm = (formData: FormData): number => {
    if (formData.waistUnit === "cm") {
        return parseFloat(formData.waistCm);
    } else {
        return parseFloat(formData.waistIn) * 2.54;
    }
};

const getHipInCm = (formData: FormData): number => {
    if (formData.hipUnit === "cm") {
        return parseFloat(formData.hipCm);
    } else {
        return parseFloat(formData.hipIn) * 2.54;
    }
};

const calculateWHR = (waistCm: number, hipCm: number): number => {
    return waistCm / hipCm;
};

const getWHRClassification = (
    whr: number,
    gender: "male" | "female"
): WHRResult => {
    const classifications = WHR_CLASSIFICATIONS[gender];

    for (const [category, range] of Object.entries(classifications)) {
        if (whr >= range.min && whr < range.max) {
            return {
                whr,
                classification: range.label,
                category: category as keyof typeof classifications,
                riskLevel: range.riskLevel,
            };
        }
    }

    // Fallback for very high WHR values
    return {
        whr,
        classification: classifications.high.label,
        category: "high",
        riskLevel: classifications.high.riskLevel,
    };
};

const validateInputs = (formData: FormData): string[] => {
    const errors: string[] = [];

    // Validate waist measurement
    if (formData.waistUnit === "cm") {
        if (
            !formData.waistCm ||
            isNaN(parseFloat(formData.waistCm)) ||
            parseFloat(formData.waistCm) <= 0
        ) {
            errors.push(
                "Please enter a valid waist measurement in centimeters"
            );
        }
    } else {
        if (
            !formData.waistIn ||
            isNaN(parseFloat(formData.waistIn)) ||
            parseFloat(formData.waistIn) <= 0
        ) {
            errors.push("Please enter a valid waist measurement in inches");
        }
    }

    // Validate hip measurement
    if (formData.hipUnit === "cm") {
        if (
            !formData.hipCm ||
            isNaN(parseFloat(formData.hipCm)) ||
            parseFloat(formData.hipCm) <= 0
        ) {
            errors.push("Please enter a valid hip measurement in centimeters");
        }
    } else {
        if (
            !formData.hipIn ||
            isNaN(parseFloat(formData.hipIn)) ||
            parseFloat(formData.hipIn) <= 0
        ) {
            errors.push("Please enter a valid hip measurement in inches");
        }
    }

    return errors;
};

// Reusable Components
const WHRClassificationCard: React.FC<{
    result: WHRResult;
    gender: "male" | "female";
}> = ({ result, gender }) => {
    const classifications = WHR_CLASSIFICATIONS[gender];
    const category = classifications[result.category];

    const colorClasses = {
        low: "from-green-50 to-green-100 border-green-200 text-green-900",
        moderate:
            "from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-900",
        high: "from-red-50 to-red-100 border-red-200 text-red-900",
    };

    return (
        <div
            className={`p-6 bg-gradient-to-r ${
                colorClasses[result.category]
            } border-2 rounded-lg`}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Your WHR Result</h3>
                <Badge
                    variant="default"
                    className={`${
                        result.category === "low"
                            ? "bg-green-600"
                            : result.category === "moderate"
                            ? "bg-yellow-600"
                            : "bg-red-600"
                    }`}
                >
                    {result.classification}
                </Badge>
            </div>
            <div className="text-center">
                <p className="text-3xl font-bold mb-2">
                    {result.whr.toFixed(2)}
                </p>
                <p className="text-sm opacity-80">Waist-to-Hip Ratio</p>
            </div>
            <div className="mt-4 text-sm">
                <p>
                    <strong>Risk Level:</strong> {result.riskLevel}
                </p>
                <p>
                    <strong>Category:</strong> {result.classification}
                </p>
                <p>
                    <strong>Range:</strong> {category.min} -{" "}
                    {category.max === Infinity ? "∞" : category.max}
                </p>
            </div>
        </div>
    );
};

const ImportantNotes: React.FC = () => (
    <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
            <CardTitle className="text-lg font-semibold text-blue-900">
                Important Notes
            </CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="space-y-2 text-sm text-blue-800">
                {IMPORTANT_NOTES.map((note, index) => (
                    <li key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{note}</span>
                    </li>
                ))}
            </ul>
        </CardContent>
    </Card>
);

const ErrorMessages: React.FC<{ errors: string[] }> = ({ errors }) => {
    if (errors.length === 0) return null;

    return (
        <div className="space-y-1">
            {errors.map((error, index) => (
                <p key={index} className="text-sm text-red-600">
                    {error}
                </p>
            ))}
        </div>
    );
};

const ResultsCard: React.FC<{
    result: WHRResult;
    gender: "male" | "female";
}> = ({ result, gender }) => (
    <Card className="border border-purple-100 shadow">
        <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
                Your Results
            </CardTitle>
        </CardHeader>
        <CardContent>
            <WHRClassificationCard result={result} gender={gender} />
        </CardContent>
    </Card>
);

const EmptyResultsCard: React.FC = () => (
    <Card className="border border-purple-100 shadow">
        <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
                Your Results
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="p-8 text-center">
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Results Yet
                </h3>
                <p className="text-gray-600">
                    Enter your measurements and click Calculate to see your WHR
                    result.
                </p>
            </div>
        </CardContent>
    </Card>
);

const MeasurementInput: React.FC<{
    label: string;
    unit: "cm" | "in";
    cmValue: string;
    inValue: string;
    onUnitChange: (unit: "cm" | "in") => void;
    onCmChange: (value: string) => void;
    onInChange: (value: string) => void;
    suffix?: string;
}> = ({
    label,
    unit,
    cmValue,
    inValue,
    onUnitChange,
    onCmChange,
    onInChange,
    suffix = "",
}) => (
    <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
        <div className="flex gap-2">
            <div className="flex-1">
                <Input
                    type="number"
                    placeholder={
                        unit === "cm" ? "Enter in cm" : "Enter in inches"
                    }
                    value={unit === "cm" ? cmValue : inValue}
                    onChange={(e) =>
                        unit === "cm"
                            ? onCmChange(e.target.value)
                            : onInChange(e.target.value)
                    }
                    min="0"
                    step="0.1"
                    className="border border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] focus-visible:ring-0 focus-visible:ring-offset-0"
                />
            </div>
            <div className="flex border border-purple-200 rounded-md">
                <button
                    type="button"
                    onClick={() => onUnitChange("cm")}
                    className={`px-3 py-2 text-sm font-medium rounded-l-md transition-colors ${
                        unit === "cm"
                            ? "bg-[#5E4AE3] text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                >
                    cm
                </button>
                <button
                    type="button"
                    onClick={() => onUnitChange("in")}
                    className={`px-3 py-2 text-sm font-medium rounded-r-md transition-colors ${
                        unit === "in"
                            ? "bg-[#5E4AE3] text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                >
                    in
                </button>
            </div>
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
        value: string | "cm" | "in" | "male" | "female"
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
            {/* Gender Selection */}
            <GenderSelection
                gender={formData.gender}
                onGenderChange={(gender) => onFormDataChange("gender", gender)}
                suffix={suffix}
            />

            {/* Waist Measurement */}
            <MeasurementInput
                label="Waist Measurement"
                unit={formData.waistUnit}
                cmValue={formData.waistCm}
                inValue={formData.waistIn}
                onUnitChange={(unit) => onFormDataChange("waistUnit", unit)}
                onCmChange={(value) => onFormDataChange("waistCm", value)}
                onInChange={(value) => onFormDataChange("waistIn", value)}
                suffix={suffix}
            />

            {/* Hip Measurement */}
            <MeasurementInput
                label="Hip Measurement"
                unit={formData.hipUnit}
                cmValue={formData.hipCm}
                inValue={formData.hipIn}
                onUnitChange={(unit) => onFormDataChange("hipUnit", unit)}
                onCmChange={(value) => onFormDataChange("hipCm", value)}
                onInChange={(value) => onFormDataChange("hipIn", value)}
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
const WHRCalculator: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        gender: "male",
        waistUnit: "cm",
        waistCm: "",
        waistIn: "",
        hipUnit: "cm",
        hipCm: "",
        hipIn: "",
    });
    const [results, setResults] = useState<WHRResult | null>(null);
    const [errors, setErrors] = useState<string[]>([]);

    const handleFormDataChange = (
        field: keyof FormData,
        value: string | "cm" | "in" | "male" | "female"
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCalculate = () => {
        const validationErrors = validateInputs(formData);
        setErrors(validationErrors);

        if (validationErrors.length > 0) {
            return;
        }

        const waistCm = getWaistInCm(formData);
        const hipCm = getHipInCm(formData);
        const whr = calculateWHR(waistCm, hipCm);
        const result = getWHRClassification(whr, formData.gender);
        setResults(result);
    };

    const handleClear = () => {
        setFormData({
            gender: "male",
            waistUnit: "cm",
            waistCm: "",
            waistIn: "",
            hipUnit: "cm",
            hipCm: "",
            hipIn: "",
        });
        setResults(null);
        setErrors([]);
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <PrivacyNotice />

            {/* Mobile Layout - Results first, then inputs */}
            <div className="lg:hidden space-y-6">
                {results && (
                    <ResultsCard result={results} gender={formData.gender} />
                )}
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
                    <ResultsCard result={results} gender={formData.gender} />
                ) : (
                    <EmptyResultsCard />
                )}
            </div>
        </div>
    );
};

export default WHRCalculator;
