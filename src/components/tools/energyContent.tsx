import ReferenceTable from "./ReferenceTable";
import { ACTIVITY_FACTORS, ACTIVITY_LABELS } from "@/lib/calculators/bmr";
import { ACTIVITY_LEVELS } from "@/lib/calculators/energy";

/**
 * Method and reference content shared by the TDEE, calorie-deficit and
 * maintenance-calorie pages. Each page adds its own tables and FAQ on top so
 * the three don't read as duplicates.
 */
export const ENERGY_FORMULA = {
    formula: [
        "Men: BMR = 10 × weight (kg) + 6.25 × height (cm) − 5 × age + 5",
        "Women: BMR = 10 × weight (kg) + 6.25 × height (cm) − 5 × age − 161",
        "TDEE = BMR × activity factor",
    ],
    sources: [
        {
            label: "Mifflin et al., Am J Clin Nutr 1990",
            href: "https://pubmed.ncbi.nlm.nih.gov/2305711/",
        },
        {
            label: "Frankenfield et al., J Am Diet Assoc 2005",
            href: "https://pubmed.ncbi.nlm.nih.gov/15883556/",
        },
    ],
};

export function ActivityFactorTable() {
    return (
        <ReferenceTable
            title="Activity multipliers"
            description="Your BMR is multiplied by one of these to estimate daily energy use."
            columns={["Activity", "Multiplier"]}
            rows={ACTIVITY_LEVELS.map((level) => [
                ACTIVITY_LABELS[level],
                ACTIVITY_FACTORS[level],
            ])}
        />
    );
}
