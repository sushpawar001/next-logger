import mongoose from "mongoose";
import { describe, expect, it, vi } from "vitest";
import { isEncryptedData } from "./encryption";
import { addEncryptionHooks } from "./mongooseEncryption";

/**
 * Exercises the hook bodies that `addEncryptionHooks` registers.
 *
 * The hooks are invoked directly with plain stand-in objects as `this`, which
 * is enough because each only uses a small documented surface
 * (`isModified`/field access on save, `getUpdate()` on update). Running them
 * through a real save would need a live MongoDB, which this suite avoids.
 */

let counter = 0;

const buildSchema = (overrides: Record<string, any> = {}) => {
    const schema = new mongoose.Schema({
        value: { type: String },
        tag: { type: String },
        user: { type: String },
    });
    addEncryptionHooks(schema as any, {
        config: {
            fields: ["value", "tag"],
            storeAsString: true,
            ...overrides,
        },
        debug: false,
    });
    return schema;
};

const preHooks = (schema: any, name: string) =>
    (schema.s.hooks._pres.get(name) ?? []).map((h: any) => h.fn);

const postHooks = (schema: any, name: string) =>
    (schema.s.hooks._posts.get(name) ?? []).map((h: any) => h.fn);

/** Runs every pre-hook registered for `name` against `context`. */
const runPre = async (schema: any, name: string, context: any) => {
    for (const fn of preHooks(schema, name)) {
        await fn.call(context);
    }
};

const runPost = (schema: any, name: string, docs: any) => {
    for (const fn of postHooks(schema, name)) {
        fn.call({}, docs, () => {});
    }
};

describe("pre-save encryption", () => {
    it("encrypts modified fields in place", async () => {
        const schema = buildSchema();
        const doc: any = {
            value: "120",
            tag: "Fasting",
            isModified: () => true,
        };

        await runPre(schema, "save", doc);

        expect(typeof doc.value).toBe("string");
        expect(isEncryptedData(JSON.parse(doc.value))).toBe(true);
        expect(isEncryptedData(JSON.parse(doc.tag))).toBe(true);
    });

    it("leaves untouched fields alone", async () => {
        const schema = buildSchema();
        const doc: any = {
            value: "120",
            tag: "Fasting",
            isModified: (field: string) => field === "value",
        };

        await runPre(schema, "save", doc);

        expect(doc.tag).toBe("Fasting");
        expect(doc.value).not.toBe("120");
    });

    /**
     * KNOWN BUG (docs/BUGS.md #9): the already-encrypted guard is
     * `isEncryptedData(value)`, which only recognises the OBJECT form. Under
     * `storeAsString: true` -- which all four metric models use -- the stored
     * value is a JSON string, so the guard misses it and a second save
     * double-encrypts. In practice `isModified` usually prevents this.
     * Characterizing current behavior.
     */
    it("double-encrypts on a second save when storing as a string", async () => {
        const schema = buildSchema();
        const doc: any = { value: "120", tag: null, isModified: () => true };

        await runPre(schema, "save", doc);
        const afterFirst = doc.value;
        await runPre(schema, "save", doc);

        expect(doc.value).not.toBe(afterFirst);
    });

    it("does not double-encrypt when storing the object form", async () => {
        const schema = buildSchema({ storeAsString: false });
        const doc: any = { value: "120", tag: null, isModified: () => true };

        await runPre(schema, "save", doc);
        const afterFirst = doc.value;
        await runPre(schema, "save", doc);

        expect(doc.value).toBe(afterFirst);
    });

    it("passes null and undefined through untouched", async () => {
        const schema = buildSchema();
        const doc: any = { value: null, tag: undefined, isModified: () => true };

        await runPre(schema, "save", doc);

        expect(doc.value).toBeNull();
        expect(doc.tag).toBeUndefined();
    });

    it("rejects the hook on an encryption failure", async () => {
        vi.resetModules();
        vi.stubEnv("ENCRYPTION_KEY", "too-short");
        const { addEncryptionHooks: addHooks } = await import(
            "./mongooseEncryption"
        );
        const schema = new mongoose.Schema({ value: { type: String } });
        addHooks(schema as any, { config: { fields: ["value"] } });
        const doc: any = { value: "120", isModified: () => true };

        await expect(runPre(schema, "save", doc)).rejects.toBeInstanceOf(Error);

        vi.unstubAllEnvs();
        vi.resetModules();
    });
});

describe("pre-update encryption", () => {
    it("encrypts fields inside a $set", async () => {
        const schema = buildSchema();
        const update: any = { $set: { value: "130", tag: "Random" } };

        await runPre(schema, "findOneAndUpdate", { getUpdate: () => update });

        expect(isEncryptedData(JSON.parse(update.$set.value))).toBe(true);
        expect(isEncryptedData(JSON.parse(update.$set.tag))).toBe(true);
    });

    it("encrypts direct field updates when there is no $set", async () => {
        const schema = buildSchema();
        const update: any = { value: "130" };

        await runPre(schema, "findOneAndUpdate", { getUpdate: () => update });

        expect(isEncryptedData(JSON.parse(update.value))).toBe(true);
    });

    it("ignores direct fields when a $set is present", async () => {
        const schema = buildSchema();
        const update: any = { $set: { value: "130" }, tag: "Random" };

        await runPre(schema, "findOneAndUpdate", { getUpdate: () => update });

        expect(update.tag).toBe("Random");
    });

    it("does nothing when there is no update payload", async () => {
        const schema = buildSchema();

        await expect(
            runPre(schema, "findOneAndUpdate", { getUpdate: () => null })
        ).resolves.toBeUndefined();
    });

    it("leaves fields the update does not mention", async () => {
        const schema = buildSchema();
        const update: any = { $set: { user: "u1" } };

        await runPre(schema, "findOneAndUpdate", { getUpdate: () => update });

        expect(update.$set).toEqual({ user: "u1" });
    });
});

describe("post-read decryption", () => {
    const encryptOne = async (plaintext: string) => {
        const schema = buildSchema();
        const doc: any = { value: plaintext, isModified: () => true };
        await runPre(schema, "save", doc);
        return doc.value;
    };

    /**
     * The hook path returns the plaintext STRING, whereas the standalone
     * decryptDocumentFields() JSON.parses it into a number. That asymmetry is
     * why GET handlers still pipe results through convertArrayStringToNumber
     * while POST handlers, which call decryptDocumentFields directly, do not.
     */
    it("decrypts a single document in place, as a string", async () => {
        const schema = buildSchema();
        const doc: any = { value: await encryptOne("120") };

        runPost(schema, "findOne", doc);

        expect(doc.value).toBe("120");
    });

    it("decrypts every document in an array", async () => {
        const schema = buildSchema();
        const docs: any[] = [
            { value: await encryptOne("120") },
            { value: await encryptOne("94") },
        ];

        runPost(schema, "find", docs);

        expect(docs.map((d) => d.value)).toEqual(["120", "94"]);
    });

    it("tolerates a null result", () => {
        const schema = buildSchema();

        expect(() => runPost(schema, "findOne", null)).not.toThrow();
    });

    it("tolerates an empty array", () => {
        const schema = buildSchema();
        const docs: any[] = [];

        runPost(schema, "find", docs);

        expect(docs).toEqual([]);
    });

    it("leaves plaintext rows untouched", () => {
        const schema = buildSchema();
        const doc: any = { value: "120" };

        runPost(schema, "findOne", doc);

        expect(doc.value).toBe("120");
    });

    /**
     * KNOWN BUG (docs/BUGS.md #8): addEncryptionHooks registers
     * `post(/^aggregate/)` and `post(/^populate/)`, but mongoose only expands
     * regex hook patterns against its known QUERY middleware names -- which do
     * not include aggregate or populate. Both hooks therefore register nothing
     * and those results are never decrypted.
     *
     * No impact today (nothing aggregates an encrypted field, and the one
     * populate call targets the unencrypted insulintype collection), but an
     * encrypted field surfaced either way would come back as ciphertext.
     * Characterizing current behavior.
     */
    it.each(["aggregate", "populate"])(
        "registers no %s hook at all, so those results stay encrypted",
        (hookName) => {
            const schema = buildSchema();

            expect(postHooks(schema, hookName)).toHaveLength(0);
        }
    );

    it("leaves an aggregate result encrypted", async () => {
        const schema = buildSchema();
        const ciphertext = await encryptOne("150");
        const docs: any[] = [{ value: ciphertext }];

        runPost(schema, "aggregate", docs);

        expect(docs[0].value).toBe(ciphertext);
    });
});

describe("configuration switches", () => {
    it("registers no save hook when encryptOnSave is false", () => {
        const schema = buildSchema({ encryptOnSave: false });

        expect(preHooks(schema, "save")).toHaveLength(0);
    });

    it("registers no read hook when decryptOnRead is false", () => {
        const schema = buildSchema({ decryptOnRead: false });

        expect(postHooks(schema, "find")).toHaveLength(0);
    });

    it("exposes a decrypted virtual that decrypts on access", async () => {
        const schema = buildSchema();
        const doc: any = { value: "120", isModified: () => true };
        await runPre(schema, "save", doc);

        const getter = (schema.virtuals as any).value_decrypted.getters[0];

        expect(getter.call(doc)).toBe("120");
    });

    it("calls the supplied onError handler", async () => {
        const onError = vi.fn();
        const schema = new mongoose.Schema({ value: { type: String } });
        addEncryptionHooks(schema as any, {
            config: { fields: ["value"], storeAsString: true },
            onError,
        });

        // A value that is not valid encrypted data simply passes through.
        const doc: any = { value: "not encrypted" };
        runPost(schema, "findOne", doc);

        expect(doc.value).toBe("not encrypted");
    });

    it("logs when debug is enabled", async () => {
        const log = vi.spyOn(console, "log").mockImplementation(() => {});
        const schema = new mongoose.Schema({ value: { type: String } });
        addEncryptionHooks(schema as any, {
            config: { fields: ["value"], storeAsString: true },
            debug: true,
        });

        await runPre(schema, "save", { value: "120", isModified: () => true });

        expect(log).toHaveBeenCalledWith(expect.stringContaining("[Encryption]"));
    });
});
