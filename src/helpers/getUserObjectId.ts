import ClerkUser from "@/models/userModelClerk";
import { auth } from "@clerk/nextjs/server";
import { HttpError } from "@/helpers/httpError";

export async function getUserObjectId(): Promise<string | null> {
    const { userId } = await auth();

    if (!userId) {
        throw new HttpError(401, "User not logged in");
    }
    const user = await ClerkUser.findOne({ clerkUserId: userId });

    // A Clerk session with no mirrored Mongo row has no usable identity here.
    if (!user) {
        throw new HttpError(401, "User not found");
    }

    return user._id.toString();
}
