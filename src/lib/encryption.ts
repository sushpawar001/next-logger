import crypto from "crypto";

// Encryption configuration
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // For GCM, this is 12 bytes
const TAG_LENGTH = 16; // GCM authentication tag length
const KEY_LENGTH = 32; // 256 bits = 32 bytes

// Environment variable for the encryption key
// In production, this should be stored securely (e.g., in environment variables)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// Ensure the key is exactly 32 bytes (256 bits)
const getEncryptionKey = (): Buffer => {
    const key = ENCRYPTION_KEY.padEnd(KEY_LENGTH, "0").slice(0, KEY_LENGTH);
    return Buffer.from(key, "utf8");
};

export interface EncryptedData {
    encrypted: string;
    iv: string;
    tag: string;
}

export interface EncryptionResult {
    success: boolean;
    data?: EncryptedData;
    error?: string;
}

export interface DecryptionResult {
    success: boolean;
    data?: string;
    error?: string;
}

/**
 * Encrypts a string using AES-256-GCM
 * @param text - The text to encrypt
 * @returns EncryptionResult with encrypted data or error
 */
export function encrypt(text: string): EncryptionResult {
    try {
        if (!text) {
            return { success: false, error: "No text provided for encryption" };
        }

        const key = getEncryptionKey();
        const iv = crypto.randomBytes(12); // GCM uses 12 bytes for IV
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");

        const tag = cipher.getAuthTag();

        return {
            success: true,
            data: {
                encrypted,
                iv: iv.toString("hex"),
                tag: tag.toString("hex"),
            },
        };
    } catch (error) {
        return {
            success: false,
            error: `Encryption failed: ${
                error instanceof Error ? error.message : "Unknown error"
            }`,
        };
    }
}

/**
 * Decrypts a string using AES-256-GCM
 * @param encryptedData - The encrypted data object
 * @returns DecryptionResult with decrypted data or error
 */
export function decrypt(encryptedData: EncryptedData): DecryptionResult {
    try {
        if (
            !encryptedData ||
            !encryptedData.encrypted ||
            !encryptedData.iv ||
            !encryptedData.tag
        ) {
            return {
                success: false,
                error: "Invalid encrypted data structure",
            };
        }

        const key = getEncryptionKey();
        const iv = Buffer.from(encryptedData.iv, "hex");
        const tag = Buffer.from(encryptedData.tag, "hex");
        const encrypted = Buffer.from(encryptedData.encrypted, "hex");

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(encrypted, undefined, "utf8");
        decrypted += decipher.final("utf8");

        return {
            success: true,
            data: decrypted,
        };
    } catch (error) {
        return {
            success: false,
            error: `Decryption failed: ${
                error instanceof Error ? error.message : "Unknown error"
            }`,
        };
    }
}

/**
 * Encrypts a specific field in an object
 * @param obj - The object containing the field to encrypt
 * @param fieldName - The name of the field to encrypt
 * @returns The object with the encrypted field
 */
export function encryptField<T extends Record<string, any>>(
    obj: T,
    fieldName: keyof T
): T & { [K in keyof T]: K extends typeof fieldName ? EncryptedData : T[K] } {
    const value = obj[fieldName];
    if (value === undefined || value === null) {
        return obj as any;
    }

    const encryptionResult = encrypt(String(value));
    if (!encryptionResult.success) {
        throw new Error(
            `Failed to encrypt field ${String(fieldName)}: ${
                encryptionResult.error
            }`
        );
    }

    return {
        ...obj,
        [fieldName]: encryptionResult.data,
    } as any;
}

/**
 * Decrypts a specific field in an object
 * @param obj - The object containing the encrypted field
 * @param fieldName - The name of the field to decrypt
 * @returns The object with the decrypted field
 */
export function decryptField<T extends Record<string, any>>(
    obj: T,
    fieldName: keyof T
): T & { [K in keyof T]: K extends typeof fieldName ? string : T[K] } {
    const encryptedValue = obj[fieldName];
    if (!encryptedValue || typeof encryptedValue !== "object") {
        return obj as any;
    }

    const decryptionResult = decrypt(encryptedValue as EncryptedData);
    if (!decryptionResult.success) {
        throw new Error(
            `Failed to decrypt field ${String(fieldName)}: ${
                decryptionResult.error
            }`
        );
    }

    return {
        ...obj,
        [fieldName]: decryptionResult.data,
    } as any;
}

/**
 * Encrypts multiple fields in an object
 * @param obj - The object containing fields to encrypt
 * @param fieldNames - Array of field names to encrypt
 * @returns The object with encrypted fields
 */
export function encryptFields<T extends Record<string, any>>(
    obj: T,
    fieldNames: (keyof T)[]
): T {
    let result = { ...obj };

    for (const fieldName of fieldNames) {
        result = encryptField(result, fieldName);
    }

    return result;
}

/**
 * Decrypts multiple fields in an object
 * @param obj - The object containing encrypted fields
 * @param fieldNames - Array of field names to decrypt
 * @returns The object with decrypted fields
 */
export function decryptFields<T extends Record<string, any>>(
    obj: T,
    fieldNames: (keyof T)[]
): T {
    let result = { ...obj };

    for (const fieldName of fieldNames) {
        result = decryptField(result, fieldName);
    }

    return result;
}

/**
 * Checks if a value is encrypted data
 * @param value - The value to check
 * @returns True if the value is encrypted data
 */
export function isEncryptedData(value: any): value is EncryptedData {
    return (
        value &&
        typeof value === "object" &&
        typeof value.encrypted === "string" &&
        typeof value.iv === "string" &&
        typeof value.tag === "string"
    );
}

/**
 * Generates a secure random encryption key
 * @returns A base64 encoded encryption key
 */
export function generateEncryptionKey(): string {
    return crypto.randomBytes(KEY_LENGTH).toString("base64");
}

/**
 * Validates if a string can be used as an encryption key
 * @param key - The key to validate
 * @returns True if the key is valid
 */
export function validateEncryptionKey(key: string): boolean {
    return key && key.length >= KEY_LENGTH;
}

/**
 * Converts encrypted data to a JSON string for database storage
 * @param encryptedData - The encrypted data object
 * @returns JSON string representation of the encrypted data
 */
export function encryptedDataToString(encryptedData: EncryptedData): string {
    return JSON.stringify(encryptedData);
}

/**
 * Converts a JSON string back to encrypted data object
 * @param encryptedString - The JSON string from database
 * @returns EncryptedData object or null if invalid
 */
export function stringToEncryptedData(
    encryptedString: string
): EncryptedData | null {
    try {
        if (!encryptedString || typeof encryptedString !== "string") {
            return null;
        }

        const parsed = JSON.parse(encryptedString);

        // Validate the parsed object has the required structure
        if (isEncryptedData(parsed)) {
            return parsed;
        }

        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Encrypts data and returns it as a JSON string ready for database storage
 * @param text - The text to encrypt
 * @returns JSON string of encrypted data or error
 */
export function encryptToString(text: string): {
    success: boolean;
    data?: string;
    error?: string;
} {
    const encryptionResult = encrypt(text);

    if (!encryptionResult.success) {
        return { success: false, error: encryptionResult.error };
    }

    return {
        success: true,
        data: JSON.stringify(encryptionResult.data),
    };
}

/**
 * Decrypts data from a JSON string stored in the database
 * @param encryptedString - The JSON string from database
 * @returns DecryptionResult with decrypted data or error
 */
export function decryptFromString(encryptedString: string): DecryptionResult {
    try {
        if (!encryptedString || typeof encryptedString !== "string") {
            return { success: false, error: "Invalid encrypted string" };
        }

        const encryptedData = JSON.parse(encryptedString);

        if (!isEncryptedData(encryptedData)) {
            return {
                success: false,
                error: "Invalid encrypted data structure",
            };
        }

        return decrypt(encryptedData);
    } catch (error) {
        return {
            success: false,
            error: `Failed to parse encrypted string: ${
                error instanceof Error ? error.message : "Unknown error"
            }`,
        };
    }
}

/**
 * Encrypts a field and stores it as a JSON string
 * @param obj - The object containing the field to encrypt
 * @param fieldName - The name of the field to encrypt
 * @returns The object with the encrypted field as a string
 */
export function encryptFieldToString<T extends Record<string, any>>(
    obj: T,
    fieldName: keyof T
): T & { [K in keyof T]: K extends typeof fieldName ? string : T[K] } {
    const value = obj[fieldName];
    if (value === undefined || value === null) {
        return obj as any;
    }

    const encryptionResult = encrypt(String(value));
    if (!encryptionResult.success) {
        throw new Error(
            `Failed to encrypt field ${String(fieldName)}: ${
                encryptionResult.error
            }`
        );
    }

    return {
        ...obj,
        [fieldName]: JSON.stringify(encryptionResult.data),
    } as any;
}

/**
 * Decrypts a field from a JSON string
 * @param obj - The object containing the encrypted field as string
 * @param fieldName - The name of the field to decrypt
 * @returns The object with the decrypted field
 */
export function decryptFieldFromString<T extends Record<string, any>>(
    obj: T,
    fieldName: keyof T
): T & { [K in keyof T]: K extends typeof fieldName ? string : T[K] } {
    const encryptedString = obj[fieldName];
    if (!encryptedString || typeof encryptedString !== "string") {
        return obj as any;
    }

    const decryptionResult = decryptFromString(encryptedString);
    if (!decryptionResult.success) {
        throw new Error(
            `Failed to decrypt field ${String(fieldName)}: ${
                decryptionResult.error
            }`
        );
    }

    return {
        ...obj,
        [fieldName]: decryptionResult.data,
    } as any;
}
