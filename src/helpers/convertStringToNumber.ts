/**
 * Converts string values to numbers in API response data
 * This is needed because encrypted data is stored as strings but should be returned as numbers
 */

export function convertStringToNumber<T extends Record<string, any>>(
    data: T,
    fieldsToConvert: string[]
): T {
    const converted = { ...data } as any;

    for (const field of fieldsToConvert) {
        if (converted[field] && typeof converted[field] === "string") {
            converted[field] = Number(converted[field]);
        }
    }

    return converted as T;
}

export function convertArrayStringToNumber<T extends Record<string, any>>(
    dataArray: T[],
    fieldsToConvert: string[]
): T[] {
    return dataArray.map((item) =>
        convertStringToNumber(item, fieldsToConvert)
    );
}
