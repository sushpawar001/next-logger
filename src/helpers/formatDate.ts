import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

let zone: string | undefined;
let zoneCheckedAt = 0;
const ZONE_TTL_MS = 60_000;

/**
 * The viewer's IANA zone. dayjs.tz.guess() builds a fresh Intl.DateTimeFormat
 * on every call, which adds up when formatting a long list, so reuse it -- but
 * only for a minute, so an installed app left open while travelling (or after
 * a system timezone change) picks the new zone up without a reload.
 */
export const localZone = (): string => {
    const now = Date.now();
    if (zone === undefined || now - zoneCheckedAt > ZONE_TTL_MS) {
        zone = dayjs.tz.guess();
        zoneCheckedAt = now;
    }
    return zone;
};

export function DatetimeLocalFormat(rawDate: string | Date): string {
    return dayjs(rawDate).format("YYYY-MM-DDTHH:mm");
}

export function ShortDateformat(rawDate: string | Date): string {
    const formattedDate = dayjs
        .utc(rawDate)
        .tz(localZone())
        .format("DD-MM hh:mm A");
    return formattedDate;
}

export default function formatDate(rawDate: string | Date): string {
    const formattedDate = dayjs
        .utc(rawDate)
        .tz(localZone())
        .format("DD MMM YY, hh:mm A");
    return formattedDate;
}
