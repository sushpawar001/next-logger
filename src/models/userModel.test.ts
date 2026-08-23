import { describe, expect, it } from "vitest";

/**
 * The legacy pre-Clerk user model. It registers the SAME "users" model name as
 * userModelClerk, so it is imported in isolation here -- see models.test.ts for
 * why (whichever imports first silently wins, with no OverwriteModelError).
 *
 * Still reachable: users/add-insulin, users/bulk-add-insulin and
 * users/get-insulin all read and write through this model.
 */
import User from "./userModel";

describe("userModel (legacy)", () => {
    it("registers under the users collection", () => {
        expect(User.modelName).toBe("users");
    });

    it("requires a unique email", () => {
        const path = (User.schema as any).path("email") as any;

        expect(path.instance).toBe("String");
        expect(path.isRequired).toBe(true);
        expect(path.options.unique).toBe(true);
    });

    it("requires a password, unlike the Clerk model", () => {
        expect((User.schema as any).path("password").isRequired).toBe(true);
    });

    it("references insulin types by id", () => {
        const path = (User.schema as any).path("insulins") as any;

        expect(path.instance).toBe("Array");
    });

    // Note the spelling: the field is `isVerfied`, not `isVerified`.
    it("defaults the (misspelled) verification flag to false", () => {
        const path = (User.schema as any).path("isVerfied") as any;

        expect(path).toBeDefined();
        expect(path.options.default).toBe(false);
    });

    it.each([
        "forgotPasswordToken",
        "forgotPasswordTokenExpiry",
        "verifyToken",
        "verifyTokenExpiry",
    ])("carries the %s field for the JWT-era email flows", (field) => {
        expect((User.schema as any).path(field)).toBeDefined();
    });

    it("uses mongoose timestamps", () => {
        expect((User.schema as any).options.timestamps).toBe(true);
    });

    it("is not encrypted", () => {
        expect(User.schema.virtuals).not.toHaveProperty("email_decrypted");
    });
});
