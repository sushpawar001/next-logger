/**
 * Pure calculation logic for the IdealWeight calculator.
 *
 * Extracted verbatim from src/components/IdealWeightCalculator.tsx so the formulas can be
 * unit-tested directly; the component imports them and is otherwise unchanged.
 */

export interface IBWResult {
    robinson: number;
    miller: number;
    devine: number;
    hamwi: number;
}

export interface FormData {
    age: string;
    heightUnit: "cm" | "ft";
    heightCm: string;
    heightFeet: string;
    heightInches: string;
    gender: "male" | "female";
}

// Utility functions
export const formatWeight = (weight: number): string => `${weight.toFixed(1)} kg`;

export const getHeightInInches = (formData: FormData): number => {
    if (formData.heightUnit === "cm") {
        return parseFloat(formData.heightCm) / 2.54;
    } else {
        return (
            parseFloat(formData.heightFeet) * 12 +
            parseFloat(formData.heightInches)
        );
    }
};

export const calculateIBW = (
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

    return errors;
};
