import moment from "moment-timezone";

export function DatetimeLocalFormat(rawDate) {
    return moment(rawDate).format("YYYY-MM-DDTHH:mm");
}

export function ShortDateformat(rawDate) {
    const formattedDate = moment
        .utc(rawDate)
        .tz(moment.tz.guess())
        .format("DD-MM hh:mm A");
    return formattedDate;
}
export default function formatDate(rawDate) {
    const formattedDate = moment
        .utc(rawDate)
        .tz(moment.tz.guess())
        .format("DD MMM YY, hh:mm A");
    return formattedDate;
}
