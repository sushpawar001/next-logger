import { vi } from "vitest";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createQuery } from "./mongoose";

/** Mongo _ids, as `getUserObjectId()` returns them (strings). */
export const USER_A = "65a000000000000000000001";
export const USER_B = "65a000000000000000000002";
export const CLERK_ID_A = "user_2clerkA";
export const CLERK_ID_B = "user_2clerkB";

/** `@clerk/nextjs/server` is mocked globally in setup.node.ts. */
export function mockClerkSignedIn(clerkUserId = CLERK_ID_A) {
    vi.mocked(auth).mockReturnValue({
        userId: clerkUserId,
        sessionId: "sess_test",
        sessionClaims: {},
        orgId: null,
        getToken: vi.fn().mockResolvedValue("test-jwt"),
        protect: vi.fn(),
        redirectToSignIn: vi.fn(),
    } as any);
    vi.mocked(currentUser).mockResolvedValue({
        id: clerkUserId,
        emailAddresses: [{ emailAddress: "a@example.com" }],
    } as any);
    return clerkUserId;
}

export function mockClerkSignedOut() {
    vi.mocked(auth).mockReturnValue({ userId: null, sessionId: null } as any);
    vi.mocked(currentUser).mockResolvedValue(null as any);
}

/**
 * Points a mocked ClerkUser model at a Mongo _id so the *real*
 * `getUserObjectId` can be exercised. Most route tests instead mock the helper
 * itself and use `mockResolvedUser`.
 */
export function mockClerkUserLookup(ClerkUserMock: any, mongoId: string | null) {
    ClerkUserMock.findOne.mockReturnValue(
        createQuery(mongoId ? { _id: { toString: () => mongoId } } : null)
    );
}

/** For files that do `vi.mock("@/helpers/getUserObjectId")`. */
export async function mockResolvedUser(userId = USER_A) {
    const { getUserObjectId } = await import("@/helpers/getUserObjectId");
    vi.mocked(getUserObjectId).mockResolvedValue(userId);
    return userId;
}

export async function mockUnauthenticated(message = "User not logged in") {
    const { getUserObjectId } = await import("@/helpers/getUserObjectId");
    vi.mocked(getUserObjectId).mockRejectedValue(new Error(message));
}
