/**
 * Pure calculation logic for the WHR calculator.
 *
 * Extracted verbatim from src/components/WHRCalculator.tsx so the formulas can be
 * unit-tested directly; the component imports them and is otherwise unchanged.
 */

export interface WHRResult {
    whr: number;
    classification: string;
    category: "low" | "moderate" | "high";
    riskLevel: string;
}

export interface FormData {
    gender: "male" | "female";
    waistUnit: "cm" | "in";
    waistCm: string;
    waistIn: string;
    hipUnit: "cm" | "in";
    hipCm: string;
    hipIn: string;
}


// WHO WHR Classification Constants
export const WHR_CLASSIFICATIONS = {
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

// Utility functions
export const getWaistInCm = (formData: FormData): number => {
    if (formData.waistUnit === "cm") {
        return parseFloat(formData.waistCm);
    } else {
        return parseFloat(formData.waistIn) * 2.54;
    }
};

export const getHipInCm = (formData: FormData): number => {
    if (formData.hipUnit === "cm") {
        return parseFloat(formData.hipCm);
    } else {
        return parseFloat(formData.hipIn) * 2.54;
    }
};

export const calculateWHR = (waistCm: number, hipCm: number): number => {
    return waistCm / hipCm;
};

export const getWHRClassification = (
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

export const validateInputs = (formData: FormData): string[] => {
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
