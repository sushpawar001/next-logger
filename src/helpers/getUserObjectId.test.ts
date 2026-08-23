import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * getUserObjectId is the identity chokepoint: 32 of the 43 route handlers call
 * it to translate a Clerk session into the Mongo `_id` that scopes every query.
 */
vi.mock("@/models/userModelClerk", async () => {
    const { createModelMock } = await import("@/test/mongoose");
    return { default: createModelMock("users") };
});

import ClerkUser from "@/models/userModelClerk";
import { getUserObjectId } from "./getUserObjectId";
import { createQuery, createFailingQuery } from "@/test/mongoose";
import {
    CLERK_ID_A,
    USER_A,
    mockClerkSignedIn,
    mockClerkSignedOut,
} from "@/test/auth";

const clerkUser = ClerkUser as any;

beforeEach(() => {
    clerkUser.findOne.mockReset();
});

describe("getUserObjectId", () => {
    it("maps a Clerk session to the mirrored Mongo id", async () => {
        mockClerkSignedIn(CLERK_ID_A);
        clerkUser.findOne.mockReturnValue(
            createQuery({ _id: { toString: () => USER_A } })
        );

        await expect(getUserObjectId()).resolves.toBe(USER_A);
        expect(clerkUser.findOne).toHaveBeenCalledWith({
            clerkUserId: CLERK_ID_A,
        });
    });

    it("returns the id as a string, not an ObjectId", async () => {
        mockClerkSignedIn();
        clerkUser.findOne.mockReturnValue(
            createQuery({ _id: { toString: () => USER_A } })
        );

        expect(typeof (await getUserObjectId())).toBe("string");
    });

    it("throws when there is no Clerk session", async () => {
        mockClerkSignedOut();

        await expect(getUserObjectId()).rejects.toThrow("User not logged in");
        expect(clerkUser.findOne).not.toHaveBeenCalled();
    });

    it("throws when the Clerk user has no mirrored Mongo row", async () => {
        mockClerkSignedIn();
        clerkUser.findOne.mockReturnValue(createQuery(null));

        await expect(getUserObjectId()).rejects.toThrow("User not found");
    });

    it("propagates a database failure", async () => {
        mockClerkSignedIn();
        clerkUser.findOne.mockReturnValue(
            createFailingQuery(new Error("connection lost"))
        );

        await expect(getUserObjectId()).rejects.toThrow("connection lost");
    });

    /**
     * Callers wrap this in a try/catch that returns 500, so an unauthenticated
     * request surfaces as a server error rather than a 401. See docs/BUGS.md #14.
     */
    it("signals auth failure by throwing, which callers turn into a 500", async () => {
        mockClerkSignedOut();

        await expect(getUserObjectId()).rejects.toBeInstanceOf(Error);
    });
});
