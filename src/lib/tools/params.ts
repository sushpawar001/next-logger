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
