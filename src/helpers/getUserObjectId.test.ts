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
import {
    getUserObjectId,
    clearUserIdCache,
    forgetUserId,
} from "./getUserObjectId";
import { HttpError, errorStatus } from "./httpError";
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
    clearUserIdCache();
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

    // docs/BUGS.md #14 (fixed): callers' catch blocks read the status off the
    // error, so auth failures must carry 401 while a DB failure stays a 500.
    it.each([
        ["no Clerk session", () => mockClerkSignedOut()],
        [
            "no mirrored Mongo row",
            () => {
                mockClerkSignedIn();
                clerkUser.findOne.mockReturnValue(createQuery(null));
            },
        ],
    ])("throws a 401 HttpError when there is %s", async (_case, arrange) => {
        arrange();

        const error = await getUserObjectId().catch((e) => e);

        expect(error).toBeInstanceOf(HttpError);
        expect(errorStatus(error)).toBe(401);
    });

    it("leaves a database failure as a 500", async () => {
        mockClerkSignedIn();
        clerkUser.findOne.mockReturnValue(
            createFailingQuery(new Error("connection lost"))
        );

        const error = await getUserObjectId().catch((e) => e);

        expect(errorStatus(error)).toBe(500);
    });

    it("only fetches the id, as a lean document", async () => {
        mockClerkSignedIn(CLERK_ID_A);
        const query = createQuery({ _id: { toString: () => USER_A } });
        clerkUser.findOne.mockReturnValue(query);

        await getUserObjectId();

        expect(query.select).toHaveBeenCalledWith("_id");
        expect(query.lean).toHaveBeenCalled();
    });

    it("reuses the mapping on a warm instance instead of querying again", async () => {
        mockClerkSignedIn(CLERK_ID_A);
        clerkUser.findOne.mockReturnValue(
            createQuery({ _id: { toString: () => USER_A } })
        );

        await getUserObjectId();
        await expect(getUserObjectId()).resolves.toBe(USER_A);
        expect(clerkUser.findOne).toHaveBeenCalledTimes(1);
    });

    it("does not cache a missing user", async () => {
        mockClerkSignedIn(CLERK_ID_A);
        clerkUser.findOne.mockReturnValueOnce(createQuery(null));
        await expect(getUserObjectId()).rejects.toThrow("User not found");

        clerkUser.findOne.mockReturnValueOnce(
            createQuery({ _id: { toString: () => USER_A } })
        );
        await expect(getUserObjectId()).resolves.toBe(USER_A);
    });

    it("looks the user up again once the cached id expires or is forgotten", async () => {
        vi.useFakeTimers();
        try {
            mockClerkSignedIn(CLERK_ID_A);
            clerkUser.findOne.mockReturnValue(
                createQuery({ _id: { toString: () => USER_A } })
            );

            await getUserObjectId();
            vi.advanceTimersByTime(61_000);
            await getUserObjectId();
            expect(clerkUser.findOne).toHaveBeenCalledTimes(2);

            // A deleted account must not keep resolving from the cache.
            forgetUserId(CLERK_ID_A);
            clerkUser.findOne.mockReturnValue(createQuery(null));
            await expect(getUserObjectId()).rejects.toThrow("User not found");
        } finally {
            vi.useRealTimers();
        }
    });
});
