export default function getMovingAvgInterval(daysOfData: number) {
    if (daysOfData <= 7) {
        return 1;
    } else if (daysOfData <= 30) {
        return 7;
    } else {
        return 30;
    }
}
