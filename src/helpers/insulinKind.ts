/**
 * Bolus or basal, for colouring (bolus Aubergine, basal Lavender).
 *
 * Insulin types are stored as a bare name (insulinTypeModel has no kind
 * field), so the kind is inferred from well-known long- and
 * intermediate-acting brand and generic names. Anything else — rapid,
 * short-acting and premixed — counts as bolus.
 */
export type InsulinKind = "bolus" | "basal";

const BASAL_NAMES = [
    /lantus/i,
    /levemir/i,
    /tresiba/i,
    /toujeo/i,
    /basaglar/i,
    /semglee/i,
    /rezvoglar/i,
    /glargine/i,
    /detemir/i,
    /degludec/i,
    /insulatard/i,
    /humulin\s*n\b/i,
    /novolin\s*n\b/i,
    /\bnph\b/i,
    /basal/i,
];

export function insulinKind(name: string | null | undefined): InsulinKind {
    if (!name) return "bolus";
    return BASAL_NAMES.some((re) => re.test(name)) ? "basal" : "bolus";
}

/** Bolus and basal unit totals for a set of doses. */
export function splitUnits(doses: { name?: string | null; units: number }[]) {
    let bolus = 0;
    let basal = 0;
    for (const d of doses) {
        const units = Number(d.units) || 0;
        if (insulinKind(d.name) === "basal") basal += units;
        else bolus += units;
    }
    return { bolus, basal, total: bolus + basal };
}
