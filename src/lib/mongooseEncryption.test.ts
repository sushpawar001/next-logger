import mongoose from "mongoose";
import { describe, expect, it, vi } from "vitest";
import { encrypt, isEncryptedData } from "./encryption";
import {
    addEncryptionHooks,
    createEncryptedSchema,
    decryptDocumentFields,
    encryptDocumentFields,
    hasEncryptedFields,
} from "./mongooseEncryption";

/**
 * These are the utilities the API layer calls directly: every POST handler runs
 * `decryptDocumentFields(entry.toObject(), [...], true, false, false)` before
 * echoing a created entry back, because the schema's post-read hooks do not
 * fire on a save.
 */

/** Matches how the four metric models are configured. */
const asStored = (plaintext: string) =>
    encryptDocumentFields({ v: plaintext }, ["v"], true).v;

describe("encryptDocumentFields", () => {
    it("encrypts only the named fields", () => {
        const result = encryptDocumentFields(
            { value: "110", tag: "Fasting", user: "u1" },
            ["value", "tag"]
        );

        expect(isEncryptedData(result.value)).toBe(true);
        expect(isEncryptedData(result.tag)).toBe(true);
        expect(result.user).toBe("u1");
    });

    it("stores as a JSON string when storeAsString is set", () => {
        const result = encryptDocumentFields({ value: "110" }, ["value"], true);

        expect(typeof result.value).toBe("string");
        expect(isEncryptedData(JSON.parse(result.value))).toBe(true);
    });

    it("does not mutate the input document", () => {
        const doc = { value: "110" };

        encryptDocumentFields(doc, ["value"]);

        expect(doc.value).toBe("110");
    });

    it.each([
        ["null", null],
        ["undefined", undefined],
    ])("passes a %s value through untouched", (_label, value) => {
        expect(encryptDocumentFields({ value }, ["value"]).value).toBe(value);
    });

    it("skips fields absent from the document", () => {
        expect(encryptDocumentFields({ a: 1 }, ["missing"])).toEqual({ a: 1 });
    });

    it("does not double-encrypt an already-encrypted value", () => {
        const once = encryptDocumentFields({ value: "110" }, ["value"]);
        const twice = encryptDocumentFields(once, ["value"]);

        expect(twice.value).toEqual(once.value);
    });

    // Values are stringified before encryption, then JSON.parsed on the way
    // back out -- so numbers and booleans survive as their original types.
    it.each([
        ["a number", 110],
        ["a boolean", true],
        ["a decimal", 72.4],
    ])("round-trips %s through its original type", (_label, input) => {
        const encrypted = encryptDocumentFields({ value: input }, ["value"], true);

        expect(typeof encrypted.value).toBe("string");
        expect(decryptDocumentFields(encrypted, ["value"], true).value).toBe(input);
    });

    it("JSON-stringifies an object value", () => {
        const encrypted = encryptDocumentFields(
            { value: { a: 1 } },
            ["value"],
            true
        );

        expect(decryptDocumentFields(encrypted, ["value"], true).value).toEqual({
            a: 1,
        });
    });

    it("encrypts each element when handleArrays is set", () => {
        const result = encryptDocumentFields(
            { value: ["a", "b"] },
            ["value"],
            false,
            true
        );

        expect(result.value).toHaveLength(2);
        for (const item of result.value) expect(isEncryptedData(item)).toBe(true);
    });

    it("encrypts each property when handleNested is set", () => {
        const result = encryptDocumentFields(
            { value: { a: "1", b: "2" } },
            ["value"],
            false,
            false,
            true
        );

        expect(isEncryptedData(result.value.a)).toBe(true);
        expect(isEncryptedData(result.value.b)).toBe(true);
    });

    it("throws when encryption fails", async () => {
        vi.resetModules();
        vi.stubEnv("ENCRYPTION_KEY", "short");
        const { encryptDocumentFields: efs } = await import("./mongooseEncryption");

        expect(() => efs({ value: "110" }, ["value"])).toThrow();

        vi.unstubAllEnvs();
        vi.resetModules();
    });
});

describe("decryptDocumentFields", () => {
    it("round-trips through the object form", () => {
        const encrypted = encryptDocumentFields({ value: "abc" }, ["value"]);

        expect(decryptDocumentFields(encrypted, ["value"]).value).toBe("abc");
    });

    it("round-trips through the string form", () => {
        const encrypted = encryptDocumentFields({ value: "abc" }, ["value"], true);

        expect(decryptDocumentFields(encrypted, ["value"], true).value).toBe("abc");
    });

    /**
     * The decrypt path tries JSON.parse on the recovered plaintext, so a numeric
     * string comes back as a NUMBER while a non-numeric one stays a string.
     * This is exactly why the GET handlers still need convertStringToNumber for
     * the read path, and why POST responses can differ in type from GET ones.
     */
    it("returns a number for a numeric value but a string for a non-numeric one", () => {
        const doc = decryptDocumentFields(
            {
                value: asStored("120"),
                tag: asStored("After meal"),
            },
            ["value", "tag"],
            true
        );

        expect(doc.value).toBe(120);
        expect(typeof doc.value).toBe("number");
        expect(doc.tag).toBe("After meal");
        expect(typeof doc.tag).toBe("string");
    });

    it("decodes a decimal value to a number", () => {
        expect(
            decryptDocumentFields({ v: asStored("72.4") }, ["v"], true).v
        ).toBe(72.4);
    });

    it.each([
        ["null", null],
        ["undefined", undefined],
    ])("passes a %s value through untouched", (_label, value) => {
        expect(decryptDocumentFields({ value }, ["value"], true).value).toBe(value);
    });

    it("leaves plaintext that was never encrypted untouched", () => {
        // Pre-migration rows look like this
        expect(decryptDocumentFields({ value: "110" }, ["value"], true).value).toBe(
            "110"
        );
    });

    it("leaves a non-encrypted object untouched", () => {
        const doc = { value: { not: "encrypted" } };

        expect(decryptDocumentFields(doc, ["value"]).value).toEqual({
            not: "encrypted",
        });
    });

    /**
     * A failed decryption returns the ORIGINAL value rather than throwing, so a
     * key rotation degrades silently instead of erroring. Characterizing.
     */
    it("returns the still-encrypted value when decryption fails", () => {
        const encrypted = encrypt("110").data!;
        const corrupt = {
            value: JSON.stringify({ ...encrypted, tag: "0".repeat(32) }),
        };

        const result = decryptDocumentFields(corrupt, ["value"], true);

        expect(result.value).toBe(corrupt.value);
    });

    it("decrypts each element when handleArrays is set", () => {
        const encrypted = encryptDocumentFields(
            { value: ["a", "b"] },
            ["value"],
            false,
            true
        );

        expect(
            decryptDocumentFields(encrypted, ["value"], false, true).value
        ).toEqual(["a", "b"]);
    });

    it("decrypts each property when handleNested is set", () => {
        const encrypted = encryptDocumentFields(
            { value: { a: "x", b: "y" } },
            ["value"],
            false,
            false,
            true
        );

        expect(
            decryptDocumentFields(encrypted, ["value"], false, false, true).value
        ).toEqual({ a: "x", b: "y" });
    });

    it("does not mutate the input document", () => {
        const encrypted = encryptDocumentFields({ value: "110" }, ["value"], true);
        const snapshot = encrypted.value;

        decryptDocumentFields(encrypted, ["value"], true);

        expect(encrypted.value).toBe(snapshot);
    });

    it("round-trips every field the measurement model encrypts", () => {
        const fields = [
            "arms",
            "chest",
            "abdomen",
            "waist",
            "hip",
            "thighs",
            "calves",
            "tag",
        ];
        const original = {
            arms: "32",
            chest: "98",
            abdomen: "88",
            waist: "84",
            hip: "96",
            thighs: "56",
            calves: "38",
            tag: "Other",
        };

        const encrypted = encryptDocumentFields(original, fields, true);
        for (const field of fields) expect(encrypted[field]).not.toBe(original[field]);

        expect(decryptDocumentFields(encrypted, fields, true)).toEqual({
            arms: 32,
            chest: 98,
            abdomen: 88,
            waist: 84,
            hip: 96,
            thighs: 56,
            calves: 38,
            tag: "Other",
        });
    });
});

describe("hasEncryptedFields", () => {
    it("detects an encrypted field in object form", () => {
        const doc = encryptDocumentFields({ value: "110", tag: "x" }, ["value"]);

        expect(hasEncryptedFields(doc, ["value"])).toBe(true);
    });

    it("is false for plaintext", () => {
        expect(hasEncryptedFields({ value: "110" }, ["value"])).toBe(false);
    });

    it("is false when the field is absent, null or undefined", () => {
        expect(hasEncryptedFields({}, ["value"])).toBe(false);
        expect(hasEncryptedFields({ value: null }, ["value"])).toBe(false);
        expect(hasEncryptedFields({ value: undefined }, ["value"])).toBe(false);
    });

    it("is true when any one of several fields is encrypted", () => {
        const doc = encryptDocumentFields({ a: "1", b: "2" }, ["b"]);

        expect(hasEncryptedFields(doc, ["a", "b"])).toBe(true);
    });

    // storeAsString rows are plain strings, so this returns false for them.
    it("does not detect string-stored ciphertext", () => {
        const doc = encryptDocumentFields({ value: "110" }, ["value"], true);

        expect(hasEncryptedFields(doc, ["value"])).toBe(false);
    });
});

describe("addEncryptionHooks", () => {
    const buildSchema = () =>
        new mongoose.Schema({
            value: { type: String },
            tag: { type: String },
            user: { type: String },
        });

    it("accepts fields that exist on the schema", () => {
        expect(() =>
            addEncryptionHooks(buildSchema() as any, {
                config: { fields: ["value", "tag"] },
            })
        ).not.toThrow();
    });

    it("throws when a field is not in the schema", () => {
        expect(() =>
            addEncryptionHooks(buildSchema() as any, {
                config: { fields: ["value", "nope"] },
            })
        ).toThrow(/Invalid fields specified for encryption: nope/);
    });

    it("lists every invalid field in the error", () => {
        expect(() =>
            addEncryptionHooks(buildSchema() as any, {
                config: { fields: ["nope", "alsoNope"] },
            })
        ).toThrow(/nope, alsoNope/);
    });

    it.each([
        ["an empty list", [] as string[]],
        ["a missing list", undefined as any],
    ])("throws for %s of fields", (_label, fields) => {
        expect(() =>
            addEncryptionHooks(buildSchema() as any, { config: { fields } })
        ).toThrow("At least one field must be specified for encryption");
    });

    it("registers a decrypted virtual per field", () => {
        const schema = buildSchema();

        addEncryptionHooks(schema as any, {
            config: { fields: ["value"], storeAsString: true },
        });

        expect(schema.virtuals).toHaveProperty("value_decrypted");
    });

    it("registers pre-save and pre-update hooks", () => {
        const schema = buildSchema();

        addEncryptionHooks(schema as any, {
            config: { fields: ["value"], storeAsString: true },
        });

        // Mongoose expands regex hook patterns into concrete operation names.
        const pres = (schema as any).s.hooks._pres;

        expect(pres.get("save")?.length).toBeGreaterThan(0);
        expect(pres.get("findOneAndUpdate")?.length).toBeGreaterThan(0);
        expect(pres.get("updateOne")?.length).toBeGreaterThan(0);
    });

    it("registers post-read hooks so finds decrypt in place", () => {
        const schema = buildSchema();

        addEncryptionHooks(schema as any, {
            config: { fields: ["value"], storeAsString: true },
        });

        const posts = (schema as any).s.hooks._posts;

        expect(posts.get("find")?.length).toBeGreaterThan(0);
        expect(posts.get("findOne")?.length).toBeGreaterThan(0);
    });

    it("does not register hooks when encryptOnSave and decryptOnRead are off", () => {
        const schema = buildSchema();
        const before = (schema as any).s.hooks._pres.get("save")?.length ?? 0;

        addEncryptionHooks(schema as any, {
            config: {
                fields: ["value"],
                encryptOnSave: false,
                decryptOnRead: false,
            },
        });

        expect((schema as any).s.hooks._pres.get("save")?.length ?? 0).toBe(before);
    });
});

describe("createEncryptedSchema", () => {
    it("builds a schema with the hooks already attached", () => {
        const schema = createEncryptedSchema(
            { value: { type: String }, tag: { type: String } },
            { config: { fields: ["value"], storeAsString: true } }
        );

        expect(schema.path("value")).toBeDefined();
        expect(schema.virtuals).toHaveProperty("value_decrypted");
    });

    it("propagates the invalid-field error", () => {
        expect(() =>
            createEncryptedSchema(
                { value: { type: String } },
                { config: { fields: ["nope"] } }
            )
        ).toThrow(/Invalid fields specified for encryption/);
    });
});
