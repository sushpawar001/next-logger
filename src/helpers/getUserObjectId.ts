import ClerkUser from "@/models/userModelClerk";
import { auth } from "@clerk/nextjs/server";

export async function getUserObjectId(): Promise<string | null> {
    const { userId } = auth();

    if (!userId) {
        throw new Error("User not logged in");
    }
    const user = await ClerkUser.findOne({ clerkUserId: userId });

    if (!user) {
        throw new Error("User not found");
    }

    return user._id;
}
