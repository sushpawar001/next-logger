import ClerkUser from "@/models/userModelClerk";
import { auth } from "@clerk/nextjs/server";
import { HttpError } from "@/helpers/httpError";
import { connectDB } from "@/dbConfig/connectDB";

/**
 * Clerk id -> Mongo `_id`, so a warm serverless instance can skip the lookup on
 * repeat requests (the dashboard alone fires 3-4 in parallel). Entries expire
 * after a minute -- about one Clerk session-token lifetime -- so a deleted
 * account stops resolving on every instance soon after the webhook removes
 * its row, and the instance that handles the webhook evicts it straight away.
 * Bounded so a long-lived instance can't grow it without limit.
 */
const MAX_CACHED_USERS = 500;
const CACHE_TTL_MS = 60_000;
const idCache = new Map<string, { id: string; expires: number }>();

/** Drop one user's cached id, e.g. when their account is deleted. */
export function forgetUserId(clerkUserId: string) {
    idCache.delete(clerkUserId);
}

/** Test-only: forget cached ids between cases. */
export function clearUserIdCache() {
    idCache.clear();
}

export async function getUserObjectId(): Promise<string | null> {
    const { userId } = await auth();

    if (!userId) {
        throw new HttpError(401, "User not logged in");
    }

    const cached = idCache.get(userId);
    if (cached && cached.expires > Date.now()) {
        return cached.id;
    }

    // Awaiting here means a failed module-scope connect is retried on the
    // next authenticated request instead of leaving the instance unusable.
    await connectDB();
    const user = await ClerkUser.findOne({ clerkUserId: userId })
        .select("_id")
        .lean();

    // A Clerk session with no mirrored Mongo row has no usable identity here.
    if (!user) {
        throw new HttpError(401, "User not found");
    }

    const id = user._id.toString();
    idCache.delete(userId);
    if (idCache.size >= MAX_CACHED_USERS) {
        // Map iterates in insertion order, so this drops the oldest entry.
        idCache.delete(idCache.keys().next().value);
    }
    idCache.set(userId, { id, expires: Date.now() + CACHE_TTL_MS });
    return id;
}
