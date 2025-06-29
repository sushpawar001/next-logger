import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export function DatetimeLocalFormat(rawDate: string | Date): string {
    return dayjs(rawDate).format("YYYY-MM-DDTHH:mm");
}

export function ShortDateformat(rawDate: string | Date): string {
    const formattedDate = dayjs
        .utc(rawDate)
        .tz(dayjs.tz.guess())
        .format("DD-MM hh:mm A");
    return formattedDate;
}

export default function formatDate(rawDate: string | Date): string {
    const formattedDate = dayjs
        .utc(rawDate)
        .tz(dayjs.tz.guess())
        .format("DD MMM YY, hh:mm A");
    return formattedDate;
}
