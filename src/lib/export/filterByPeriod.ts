/**
 * Client-side date-window filter for exports.
 *
 * The export pulls each metric's full history from `/api/{metric}/get` and
 * narrows it here rather than via a `/get/[days]` route, because insulin has no
 * `/get/[days]` endpoint and this keeps all four metrics on one uniform path.
 * Rows arrive sorted by `createdAt` descending; order is preserved.
 */

/** Matches the "All" option (365 * 100 days) used by DataPeriodSelectCard. */
export const ALL_DAYS = 365 * 100;

const DAY_MS = 24 * 60 * 60 * 1000;

export function filterByPeriod<T extends { createdAt?: string | Date }>(
    rows: T[],
    days: number
): T[] {
    if (!days || days >= ALL_DAYS) return rows;
    const cutoff = Date.now() - days * DAY_MS;
    return rows.filter((row) => {
        if (!row.createdAt) return false;
        return new Date(row.createdAt).getTime() >= cutoff;
    });
}
