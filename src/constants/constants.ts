export const entryTags = [
    "Before meal",
    "After meal",
    "Fasting",
    "Random",
    "Before exercise",
    "After exercise",
    "Other",
];

/** Glucose target range in mg/dL (brand-guidelines.md §3). Readings outside it get a status colour. */
export const GLUCOSE_TARGET = { low: 70, high: 180 } as const;
