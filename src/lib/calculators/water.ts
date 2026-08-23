/**
 * Pure calculation logic for the WaterIntake calculator.
 *
 * Extracted verbatim from src/components/WaterIntakeCalculator.tsx so the formulas can be
 * unit-tested directly; the component imports them and is otherwise unchanged.
 */

export interface WaterIntakeResult {
    baseIntake: number; // in liters
    activityAdjustment: number; // in liters
    totalIntake: number; // in liters
    totalIntakeOz: number; // in ounces
    totalIntakeCups: number; // in cups (8 oz each)
}

export interface FormData {
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
export const ACTIVITY_LEVELS = {
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
export const formatWaterIntake = (liters: number): string => {
    const oz = liters * 33.814;
    const cups = oz / 8;
    return `${liters.toFixed(1)} L (${oz.toFixed(0)} oz, ${cups.toFixed(
        1
    )} cups)`;
};

export const kgToLbs = (kg: number): number => kg * 2.20462;
export const lbsToKg = (lbs: number): number => lbs / 2.20462;
export const cmToInches = (cm: number): number => cm / 2.54;
export const inchesToCm = (inches: number): number => inches * 2.54;

export const getWeightInKg = (formData: FormData): number => {
    if (formData.weightUnit === "kg") {
        return parseFloat(formData.weight);
    } else {
        return lbsToKg(parseFloat(formData.weight));
    }
};

export const getHeightInCm = (formData: FormData): number => {
    if (formData.heightUnit === "cm") {
        return parseFloat(formData.heightCm);
    } else {
        const feet = parseFloat(formData.heightFeet);
        const inches = parseFloat(formData.heightInches);
        return inchesToCm(feet * 12 + inches);
    }
};

export const calculateWaterIntake = (formData: FormData): WaterIntakeResult => {
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
