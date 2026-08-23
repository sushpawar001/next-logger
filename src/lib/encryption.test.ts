import { afterEach, describe, expect, it, vi } from "vitest";
import {
    decrypt,
    decryptField,
    decryptFieldFromString,
    decryptFields,
    decryptFromString,
    encrypt,
    encryptField,
    encryptFieldToString,
    encryptFields,
    encryptToString,
    encryptedDataToString,
    generateEncryptionKey,
    isEncryptedData,
    stringToEncryptedData,
    validateEncryptionKey,
    type EncryptedData,
} from "./encryption";

const PLAINTEXT = "120";

describe("encrypt / decrypt", () => {
    it("round-trips a value", () => {
        const encrypted = encrypt(PLAINTEXT);

        expect(encrypted.success).toBe(true);
        expect(encrypted.data).toMatchObject({
            encrypted: expect.any(String),
            iv: expect.any(String),
            tag: expect.any(String),
        });
        // AES-GCM: 12-byte IV and 16-byte auth tag, hex-encoded
        expect(encrypted.data!.iv).toHaveLength(24);
        expect(encrypted.data!.tag).toHaveLength(32);
        expect(encrypted.data!.encrypted).not.toContain(PLAINTEXT);

        expect(decrypt(encrypted.data!)).toEqual({
            success: true,
            data: PLAINTEXT,
        });
    });

    it("produces a different ciphertext each time (random IV)", () => {
        const a = encrypt(PLAINTEXT).data!;
        const b = encrypt(PLAINTEXT).data!;

        expect(a.iv).not.toBe(b.iv);
        expect(a.encrypted).not.toBe(b.encrypted);
        expect(decrypt(a).data).toBe(decrypt(b).data);
    });

    it("round-trips unicode and long values", () => {
        for (const value of ["After meal", "cafe latte", "x".repeat(5000)]) {
            expect(decrypt(encrypt(value).data!).data).toBe(value);
        }
    });

    it.each([
        ["empty string", ""],
        ["null", null as any],
        ["undefined", undefined as any],
    ])("refuses to encrypt %s rather than throwing", (_label, value) => {
        expect(encrypt(value)).toEqual({
            success: false,
            error: "No text provided for encryption",
        });
    });

    it.each([
        ["null", null as any],
        ["an empty object", {} as any],
        ["a missing iv", { encrypted: "aa", tag: "bb" } as any],
        ["a missing tag", { encrypted: "aa", iv: "bb" } as any],
    ])("rejects %s as an invalid structure", (_label, value) => {
        expect(decrypt(value)).toEqual({
            success: false,
            error: "Invalid encrypted data structure",
        });
    });

    it("fails authentication when the ciphertext is tampered with", () => {
        const original = encrypt(PLAINTEXT).data!;
        const tampered: EncryptedData = {
            ...original,
            encrypted: original.encrypted.replace(/^../, "ff"),
        };

        const result = decrypt(tampered);

        expect(result.success).toBe(false);
        expect(result.error).toMatch(/Decryption failed/);
        expect(result.data).toBeUndefined();
    });

    it("fails authentication when the auth tag is tampered with", () => {
        const original = encrypt(PLAINTEXT).data!;
        const replacement = original.tag.startsWith("ff") ? "aa" : "ff";
        const tampered: EncryptedData = {
            ...original,
            tag: original.tag.replace(/^../, replacement),
        };

        expect(decrypt(tampered).success).toBe(false);
    });
});

describe("key handling", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.resetModules();
    });

    it("cannot decrypt a value produced under a different key", async () => {
        const encrypted = encrypt(PLAINTEXT).data!;

        vi.resetModules();
        vi.stubEnv("ENCRYPTION_KEY", "ffffffffffffffffffffffffffffffff");
        const { decrypt: decryptWithOtherKey } = await import("./encryption");

        expect(decryptWithOtherKey(encrypted).success).toBe(false);
    });

    it("reports a wrong-length key through the result object", async () => {
        vi.resetModules();
        vi.stubEnv("ENCRYPTION_KEY", "too-short");
        const { encrypt: encryptShortKey } = await import("./encryption");

        const result = encryptShortKey(PLAINTEXT);

        expect(result.success).toBe(false);
        expect(result.error).toContain("exactly 32 characters");
        expect(result.error).toContain("Current length: 9");
    });

    it("reports a missing key", async () => {
        vi.resetModules();
        vi.stubEnv("ENCRYPTION_KEY", "");
        const { encrypt: encryptNoKey } = await import("./encryption");

        expect(encryptNoKey(PLAINTEXT)).toEqual({
            success: false,
            error: "Encryption failed: ENCRYPTION_KEY environment variable is not set",
        });
    });

    it("validates a 32-character key", () => {
        expect(validateEncryptionKey("0123456789abcdef0123456789abcdef")).toBe(
            true
        );
        expect(validateEncryptionKey("short")).toBe(false);
        expect(validateEncryptionKey("")).toBeFalsy();
    });

    // KNOWN BUG (docs/BUGS.md #6): generateEncryptionKey returns base64 of 32 bytes
    // -- 44 characters -- which validateEncryptionKey always rejects, so the
    // generator cannot produce a key its own validator accepts.
    // Characterizing current behavior.
    it("generates a key its own validator rejects", () => {
        const key = generateEncryptionKey();

        expect(key).toHaveLength(44);
        expect(validateEncryptionKey(key)).toBe(false);
    });

    it("throws when a field cannot be encrypted", async () => {
        vi.resetModules();
        vi.stubEnv("ENCRYPTION_KEY", "short");
        const { encryptField: ef } = await import("./encryption");

        expect(() => ef({ value: 1 }, "value")).toThrow(
            /Failed to encrypt field value/
        );
    });
});

describe("field helpers", () => {
    it("encrypts and decrypts a single field", () => {
        const encrypted = encryptField({ value: 120, tag: "Fasting" }, "value");

        expect(isEncryptedData(encrypted.value)).toBe(true);
        expect(encrypted.tag).toBe("Fasting");
        expect(decryptField(encrypted, "value").value).toBe("120");
    });

    it.each([
        ["undefined", undefined],
        ["null", null],
    ])("leaves a %s field untouched when encrypting", (_label, value) => {
        const input = { value };
        expect(encryptField(input, "value")).toEqual(input);
    });

    it("leaves a non-object field untouched when decrypting", () => {
        expect(decryptField({ value: "plain" }, "value").value).toBe("plain");
    });

    it("throws when a field cannot be decrypted", () => {
        const corrupt = { value: { encrypted: "ff", iv: "ff", tag: "ff" } };

        expect(() => decryptField(corrupt, "value")).toThrow(
            /Failed to decrypt field value/
        );
    });

    it("round-trips multiple fields at once", () => {
        const encrypted = encryptFields(
            { value: 120, tag: "Fasting", user: "u1" },
            ["value", "tag"]
        );

        expect(isEncryptedData(encrypted.value)).toBe(true);
        expect(isEncryptedData(encrypted.tag)).toBe(true);
        expect(encrypted.user).toBe("u1");

        expect(decryptFields(encrypted, ["value", "tag"])).toMatchObject({
            value: "120",
            tag: "Fasting",
            user: "u1",
        });
    });
});

describe("isEncryptedData", () => {
    it("accepts a well-formed payload", () => {
        expect(isEncryptedData(encrypt(PLAINTEXT).data)).toBe(true);
    });

    it.each([
        ["null", null],
        ["undefined", undefined],
        ["a string", "nope"],
        ["a number", 42],
        ["a partial object", { encrypted: "aa", iv: "bb" }],
        ["non-string members", { encrypted: 1, iv: 2, tag: 3 }],
    ])("rejects %s", (_label, value) => {
        expect(isEncryptedData(value)).toBeFalsy();
    });
});

describe("string storage helpers", () => {
    it("round-trips through a JSON string", () => {
        const asString = encryptToString(PLAINTEXT);

        expect(asString.success).toBe(true);
        expect(typeof asString.data).toBe("string");
        expect(decryptFromString(asString.data!)).toEqual({
            success: true,
            data: PLAINTEXT,
        });
    });

    it("propagates an encryption failure instead of returning a string", () => {
        expect(encryptToString("")).toEqual({
            success: false,
            error: "No text provided for encryption",
        });
    });

    it("serialises and parses an encrypted payload", () => {
        const data = encrypt(PLAINTEXT).data!;
        const serialised = encryptedDataToString(data);

        expect(JSON.parse(serialised)).toEqual(data);
        expect(stringToEncryptedData(serialised)).toEqual(data);
    });

    it.each([
        ["malformed JSON", "{not json"],
        ["valid JSON of the wrong shape", '{"a":1}'],
        ["an empty string", ""],
        ["a non-string", 42 as any],
    ])("returns null for %s", (_label, value) => {
        expect(stringToEncryptedData(value)).toBeNull();
    });

    it.each([
        ["a non-string", 42 as any],
        ["an empty string", ""],
    ])("rejects %s when decrypting from a string", (_label, value) => {
        expect(decryptFromString(value)).toEqual({
            success: false,
            error: "Invalid encrypted string",
        });
    });

    it("reports malformed JSON when decrypting from a string", () => {
        const result = decryptFromString("{not json");

        expect(result.success).toBe(false);
        expect(result.error).toMatch(/Failed to parse encrypted string/);
    });

    it("reports a wrong-shaped payload when decrypting from a string", () => {
        expect(decryptFromString('{"a":1}')).toEqual({
            success: false,
            error: "Invalid encrypted data structure",
        });
    });

    it("round-trips a field stored as a string", () => {
        const encrypted = encryptFieldToString({ value: 120 }, "value");

        expect(typeof encrypted.value).toBe("string");
        expect(decryptFieldFromString(encrypted, "value").value).toBe("120");
    });

    it.each([
        ["undefined", undefined],
        ["null", null],
    ])(
        "leaves a %s field untouched when encrypting to a string",
        (_label, value) => {
            expect(encryptFieldToString({ value }, "value")).toEqual({ value });
        }
    );

    it("leaves a non-string field untouched when decrypting from a string", () => {
        expect(decryptFieldFromString({ value: 120 }, "value").value).toBe(120);
    });

    it("throws when a string field cannot be decrypted", () => {
        expect(() =>
            decryptFieldFromString({ value: "{not json" }, "value")
        ).toThrow(/Failed to decrypt field value/);
    });
});
