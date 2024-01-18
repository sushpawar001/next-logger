import moment from 'moment-timezone';

export function DatetimeLocalFormat(rawDate) {
    return moment(rawDate).format('YYYY-MM-DDTHH:mm')
}

export default function formatDate(rawDate) {
    const formattedDate = moment.utc(rawDate)
        .tz('Asia/Kolkata')
        .format('DD MMM YY, hh:mm A');
    return formattedDate
}