import { connectDB } from "@/dbConfig/connectDB";
import ClerkUser from "@/models/userModelClerk";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";

connectDB();

export async function POST(request: NextRequest) {
    try {
        const { layoutSettings } = await request.json();
        const user = await getUserObjectId();

        const updatedUser = await ClerkUser.findByIdAndUpdate(
            user,
            {
                $set: { layoutSettings: layoutSettings },
            },
            { new: true }
        );

        return NextResponse.json({
            user: updatedUser,
            message: "User layout settings updated successfully",
        });
    } catch (error) {
        console.log("Error setting user layout settings: " + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
