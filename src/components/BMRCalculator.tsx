"use client";
import ToolCta from "@/components/tools/ToolCta";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import PrivacyNotice from "./PrivacyNotice";
import {
    BodyStatsFields,
    useBodyStatsParams,
} from "@/components/tools/BodyStatsFields";
import {
    ACTIVITY_FACTORS,
    formatCalories,
    convertHeightToCm,
    convertWeightToKg,
    calculateBMR,
    validateInputs,
} from "@/lib/calculators/bmr";
import type {
    BMRResult,
    FormData,
} from "@/lib/calculators/bmr";

// Activity level definitions
const ACTIVITY_LEVELS = {
    sedentary: "Sedentary (little or no exercise)",
    light: "Exercise 1-3 times/week",
    moderate: "Exercise 4-5 times/week",
    active: "Daily exercise or intense exercise 3-4 times/week",
    veryActive: "Intense exercise 6-7 times/week",
    extraActive: "Very intense exercise daily, or physical job",
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
    <Card className="border border-border shadow-md">
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
                <ToolCta slug="bmr-calculator" />
            </div>
        </CardContent>
    </Card>
);

const EmptyResultsCard: React.FC = () => (
    <Card className="border border-border shadow-md">
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

const InputForm: React.FC<{
    formData: FormData;
    errors: string[];
    onFormDataChange: (field: keyof FormData, value: string) => void;
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
    <Card className="border border-border shadow-md">
        <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
                Enter Your Information
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <BodyStatsFields
                formData={formData}
                onChange={onFormDataChange}
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
    // Form inputs live in the URL so a result can be shared.
    const { formData, setField, clear } = useBodyStatsParams();

    // Results and errors in local state
    const [results, setResults] = useState<BMRResult | null>(null);
    const [errors, setErrors] = useState<string[]>([]);

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
        clear();
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
                    onFormDataChange={setField}
                    onCalculate={handleCalculate}
                    onClear={handleClear}
                />
            </div>

            {/* Desktop Layout - Side by side */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-6">
                <InputForm
                    formData={formData}
                    errors={errors}
                    onFormDataChange={setField}
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
