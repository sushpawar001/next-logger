import mongoose from "mongoose";
import { describe, expect, it } from "vitest";

/**
 * Schema-shape tests. These import the REAL model modules, which means
 * `addEncryptionHooks` runs for real -- so they also prove that every field
 * listed for encryption actually exists on its schema (the hook throws at
 * import time otherwise).
 *
 * Note: userModel.ts and userModelClerk.ts both register the model name
 * "users", and both guard with `mongoose.models.users || ...`, so whichever is
 * imported first silently wins. They are therefore never imported together
 * here; userModelClerk is the active one and is covered below.
 */

import Glucose from "./glucoseModel";
import Weight from "./weightModel";
import Insulin from "./insulinModel";
import Measurements from "./measurementsModel";
import InsulinType from "./insulinTypeModel";
import ContactUs from "./contactUs";
import ClerkUser from "./userModelClerk";

const METRIC_MODELS = [
    {
        name: "glucose",
        model: Glucose,
        valueFields: ["value"],
        encrypted: ["value", "tag"],
    },
    {
        name: "weight",
        model: Weight,
        valueFields: ["value"],
        encrypted: ["value", "tag"],
    },
    {
        name: "insulin",
        model: Insulin,
        valueFields: ["units", "name"],
        encrypted: ["units", "name", "tag"],
    },
    {
        name: "measurement",
        model: Measurements,
        valueFields: [
            "arms",
            "chest",
            "abdomen",
            "waist",
            "hip",
            "thighs",
            "calves",
        ],
        encrypted: [
            "arms",
            "chest",
            "abdomen",
            "waist",
            "hip",
            "thighs",
            "calves",
            "tag",
        ],
    },
];

describe.each(METRIC_MODELS)("$name model", (m) => {
    it("registers under its expected collection name", () => {
        expect(m.model.modelName).toBe(m.name);
    });

    it("stores every encrypted field as a String", () => {
        // storeAsString: true means ciphertext is persisted as a JSON string,
        // so these paths must be String even for numeric metrics.
        for (const field of m.valueFields) {
            expect((m.model.schema as any).path(field).instance).toBe("String");
        }
    });

    it("requires its value fields", () => {
        for (const field of m.valueFields) {
            expect((m.model.schema as any).path(field).isRequired).toBe(true);
        }
    });

    it("scopes rows to a user via an ObjectId ref", () => {
        const userPath = (m.model.schema as any).path("user") as any;

        expect(userPath.instance).toBe("ObjectId");
        expect(userPath.options.ref).toBe("users");
        expect(userPath.isRequired).toBe(true);
    });

    it("defaults tag to null rather than requiring it", () => {
        const tagPath = (m.model.schema as any).path("tag") as any;

        expect(tagPath.instance).toBe("String");
        expect(tagPath.options.default).toBeNull();
    });

    /**
     * The app writes user-chosen entry dates, so createdAt is an explicit path
     * with `timestamps: false`. Switching to mongoose timestamps would silently
     * overwrite the date the user picked.
     */
    it("owns an explicit createdAt and does not use mongoose timestamps", () => {
        expect((m.model.schema as any).path("createdAt").instance).toBe("Date");
        expect((m.model.schema as any).options.timestamps).toBe(false);
    });

    it("exposes a decrypted virtual for each encrypted field", () => {
        for (const field of m.encrypted) {
            expect((m.model.schema as any).virtuals).toHaveProperty(`${field}_decrypted`);
        }
    });

    it("registers encryption hooks for save, update and read", () => {
        const hooks = (m.model.schema as any).s.hooks;

        expect(hooks._pres.get("save")?.length).toBeGreaterThan(0);
        expect(hooks._pres.get("findOneAndUpdate")?.length).toBeGreaterThan(0);
        expect(hooks._posts.get("find")?.length).toBeGreaterThan(0);
    });
});

describe("insulinType model", () => {
    it("registers as insulintype with a unique name", () => {
        expect(InsulinType.modelName).toBe("insulintype");

        const namePath = (InsulinType.schema as any).path("name") as any;
        expect(namePath.instance).toBe("String");
        expect(namePath.isRequired).toBe(true);
        expect(namePath.options.unique).toBe(true);
    });

    it("is not encrypted", () => {
        expect(InsulinType.schema.virtuals).not.toHaveProperty("name_decrypted");
    });
});

describe("contactUs model", () => {
    it("requires name, email and message", () => {
        for (const field of ["name", "email", "message"]) {
            expect((ContactUs.schema as any).path(field).isRequired).toBe(true);
        }
    });

    it("uses mongoose timestamps", () => {
        expect((ContactUs.schema as any).options.timestamps).toBe(true);
    });
});

describe("userModelClerk (the active user model)", () => {
    it("registers under the users collection", () => {
        expect(ClerkUser.modelName).toBe("users");
    });

    it("keys users by a unique clerkUserId", () => {
        const path = (ClerkUser.schema as any).path("clerkUserId") as any;

        expect(path.isRequired).toBe(true);
        expect(path.options.unique).toBe(true);
    });

    it("requires a unique email", () => {
        const path = (ClerkUser.schema as any).path("email") as any;

        expect(path.isRequired).toBe(true);
        expect(path.options.unique).toBe(true);
    });

    it.each([
        ["layoutSettings", ["diabetes", "fitness"], "diabetes"],
        ["subscriptionPlan", ["trial", "premium", "free"], "free"],
    ])("constrains %s by enum with a default", (field, values, fallback) => {
        const path = (ClerkUser.schema as any).path(field) as any;

        expect(path.options.enum).toEqual(values);
        expect(path.options.default).toBe(fallback);
    });

    it("defaults subscriptionEndDate to roughly 30 days out", () => {
        const path = (ClerkUser.schema as any).path("subscriptionEndDate") as any;
        const computed = path.options.default();
        const daysOut = (computed.getTime() - Date.now()) / 86_400_000;

        expect(daysOut).toBeGreaterThan(29);
        expect(daysOut).toBeLessThan(31);
    });

    it("references insulin types by id", () => {
        const path = (ClerkUser.schema as any).path("insulins") as any;

        expect(path.instance).toBe("Array");
        expect(path.caster.options.ref).toBe("insulintype");
    });

    /**
     * userModel.ts registers the SAME "users" name. Because both guard with
     * `mongoose.models.users || mongoose.model(...)`, a clash resolves silently
     * to whichever imported first rather than throwing OverwriteModelError.
     * This asserts the Clerk schema is the one that won here.
     */
    it("is the schema registered for the users model name", () => {
        expect(mongoose.models.users.schema.path("clerkUserId")).toBeDefined();
    });
});
