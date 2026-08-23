import { encryptToString } from "@/lib/encryption";
import { USER_A } from "./auth";

/**
 * Row factories mirroring what Mongo actually stores.
 *
 * Note every numeric value is a *string*: the encryption layer runs with
 * `storeAsString: true`, which is why the GET handlers pipe results through
 * `convertArrayStringToNumber` before responding.
 */
export const ENTRY_ID = "65b000000000000000000abc";

export const glucoseRow = (overrides: Record<string, any> = {}) => ({
    _id: ENTRY_ID,
    value: "110",
    tag: "Fasting",
    createdAt: new Date("2026-01-30T08:00:00.000Z"),
    ...overrides,
});

export const weightRow = (overrides: Record<string, any> = {}) => ({
    _id: ENTRY_ID,
    value: "72.4",
    tag: null,
    createdAt: new Date("2026-01-30T07:00:00.000Z"),
    ...overrides,
});

export const insulinRow = (overrides: Record<string, any> = {}) => ({
    _id: ENTRY_ID,
    units: "12",
    name: "Lantus",
    tag: "Before meal",
    createdAt: new Date("2026-01-30T21:00:00.000Z"),
    ...overrides,
});

export const measurementRow = (overrides: Record<string, any> = {}) => ({
    _id: ENTRY_ID,
    arms: "32",
    chest: "98",
    abdomen: "88",
    waist: "84",
    hip: "96",
    thighs: "56",
    calves: "38",
    tag: null,
    createdAt: new Date("2026-01-30T06:00:00.000Z"),
    ...overrides,
});

/** Adds the owning user, which GET projections normally strip. */
export const ownedBy = <T extends object>(row: T, user = USER_A) => ({
    ...row,
    user,
});

/**
 * Real AES-256-GCM ciphertext under the test key, so POST tests exercise the
 * genuine `decryptDocumentFields` path instead of a stub.
 */
export function encryptedString(plaintext: string): string {
    const result = encryptToString(plaintext);
    if (!result.success) {
        throw new Error(`fixture encryption failed: ${result.error}`);
    }
    return result.data!;
}
