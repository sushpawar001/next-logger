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

export function simpleMovingAverage(arr: number[], period: number): number[] {
    const result = [];
    for (let i = 0; i <= arr.length - period; i++) {
        const window = arr.slice(i, i + period);
        const avg = window.reduce((sum, val) => sum + val, 0) / period;
        result.push(avg);
    }
    if (result.length < arr.length) {
        const myArray = new Array(arr.length - result.length);
        myArray.fill(null);
        return myArray.concat(result);
    }
    return result;
}