import { insulin } from "@/types/models";

export function getDailyInsulinValues(valuesArray: insulin[]): number[] {
    const dates = {};

    for (let index = 0; index < valuesArray.length; index++) {
        const element = valuesArray[index];
        const date = new Date(element.createdAt);
        const dateStr = date.toDateString();
        if (dates[dateStr]) {
            dates[dateStr] = dates[dateStr] + element.units;
        } else {
            dates[dateStr] = element.units;
        }
    }
    return Object.values(dates);
}
