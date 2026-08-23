/**
 * Pure calculation logic for the BMI calculator.
 *
 * Extracted verbatim from src/components/BMICalculator.tsx so the formulas can be
 * unit-tested directly; the component imports them and is otherwise unchanged.
 */

export interface BMIResult {
    bmi: number;
    classification: string;
    category: "underweight" | "normal" | "overweight" | "obesity";
}

export interface FormData {
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
export const BMI_CLASSIFICATIONS = {
    underweight: { min: 0, max: 18.5, label: "Underweight", color: "blue" },
    normal: { min: 18.5, max: 25, label: "Normal", color: "green" },
    overweight: { min: 25, max: 30, label: "Overweight", color: "yellow" },
    obesity: { min: 30, max: Infinity, label: "Obesity", color: "red" },
} as const;

// Utility functions
export const getHeightInMeters = (formData: FormData): number => {
    if (formData.heightUnit === "cm") {
        return parseFloat(formData.heightCm) / 100;
    } else {
        const totalInches =
            parseFloat(formData.heightFeet) * 12 +
            parseFloat(formData.heightInches);
        return totalInches * 0.0254;
    }
};

export const getWeightInKg = (formData: FormData): number => {
    if (formData.weightUnit === "kg") {
        return parseFloat(formData.weightKg);
    } else {
        return parseFloat(formData.weightLbs) * 0.453592;
    }
};

export const calculateBMI = (weightKg: number, heightM: number): number => {
    return weightKg / (heightM * heightM);
};

export const getBMIClassification = (bmi: number): BMIResult => {
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
