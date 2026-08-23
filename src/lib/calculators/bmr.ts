/**
 * Pure calculation logic for the BMR calculator.
 *
 * Extracted verbatim from src/components/BMRCalculator.tsx so the formulas can be
 * unit-tested directly; the component imports them and is otherwise unchanged.
 */

export interface BMRResult {
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

export interface FormData {
    age: string;
    gender: "male" | "female";
    heightUnit: "cm" | "ft";
    heightCm: string;
    heightFeet: string;
    heightInches: string;
    weightUnit: "kg" | "lbs";
    weight: string;
}


export const ACTIVITY_FACTORS = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.465,
    active: 1.55,
    veryActive: 1.725,
    extraActive: 1.9,
} as const;

// Utility functions
export const formatCalories = (calories: number): string =>
    `${Math.round(calories).toLocaleString()} Calories/day`;

export const convertHeightToCm = (formData: FormData): number => {
    if (formData.heightUnit === "cm") {
        return parseFloat(formData.heightCm);
    } else {
        const feet = parseFloat(formData.heightFeet);
        const inches = parseFloat(formData.heightInches);
        return (feet * 12 + inches) * 2.54;
    }
};

export const convertWeightToKg = (formData: FormData): number => {
    if (formData.weightUnit === "kg") {
        return parseFloat(formData.weight);
    } else {
        return parseFloat(formData.weight) * 0.453592;
    }
};

export const calculateBMR = (formData: FormData): BMRResult => {
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

export const validateInputs = (formData: FormData): string[] => {
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
