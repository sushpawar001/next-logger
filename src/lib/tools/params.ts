import { parseAsString, parseAsStringLiteral } from "nuqs";

/**
 * URL-state parsers for the newer calculators. Every input lives in the query
 * string so a result can be shared or bookmarked; numeric fields stay strings
 * so a half-typed value ("7.") survives the round trip.
 */
export const textParam = parseAsString.withDefault("");

export const glucoseUnitParam = parseAsStringLiteral([
    "mgdl",
    "mmol",
] as const).withDefault("mgdl");

export const GLUCOSE_UNIT_OPTIONS = [
    { value: "mgdl", label: "mg/dL" },
    { value: "mmol", label: "mmol/L" },
] as const;

export const a1cParams = {
    mode: parseAsStringLiteral(["a1c", "eag"] as const).withDefault("a1c"),
    a1c: textParam,
    a1cUnit: parseAsStringLiteral(["pct", "mmolmol"] as const).withDefault(
        "pct"
    ),
    glucose: textParam,
    unit: glucoseUnitParam,
};

export const bloodSugarParams = {
    value: textParam,
    unit: glucoseUnitParam,
    context: parseAsStringLiteral([
        "random",
        "fasting",
        "postMeal",
    ] as const).withDefault("random"),
};

export const bodyFatParams = {
    gender: parseAsStringLiteral(["male", "female"] as const).withDefault(
        "male"
    ),
    units: parseAsStringLiteral(["metric", "imperial"] as const).withDefault(
        "metric"
    ),
    height: textParam,
    neck: textParam,
    waist: textParam,
    hip: textParam,
    weight: textParam,
};

export const energyParams = {
    activity: parseAsStringLiteral([
        "sedentary",
        "light",
        "moderate",
        "active",
        "veryActive",
        "extraActive",
    ] as const).withDefault("sedentary"),
    pace: parseAsStringLiteral(["0.25", "0.5", "0.75", "1"] as const).withDefault(
        "0.5"
    ),
    goalWeight: textParam,
};

export const gmiParams = {
    mode: parseAsStringLiteral(["readings", "mean"] as const).withDefault(
        "readings"
    ),
    readings: textParam,
    mean: textParam,
    unit: glucoseUnitParam,
};
