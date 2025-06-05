import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/dbConfig/connectDB";
import ClerkUser from "@/models/userModelClerk";

connectDB();

export async function GET() {
    try {
        // Get the current user from Clerk
        const { userId } = auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Find user in our database
        const dbUser = await ClerkUser.findOne({ clerkUserId: userId }).lean();

        if (!dbUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Calculate remaining days
        const now = new Date();
        const endDate = dbUser.subscriptionEndDate;
        const remainingDays = Math.ceil(
            (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        return NextResponse.json({
            subscriptionPlan: dbUser.subscriptionPlan || "free",
            subscriptionEndDate: endDate.toDateString(),
            remainingDays: remainingDays,
        });
    } catch (error) {
        console.error("Error fetching subscription info:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
