import { connectDB } from "@/dbConfig/connectDB";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import ClerkUser from "@/models/userModelClerk";

connectDB();

export async function GET(request: NextRequest) {
    try {
        const user = await getUserObjectId();
        const data = await ClerkUser.findById(user);
        return NextResponse.json({
            data: data.layoutSettings || "",
            message: "User layout settings",
        });
    } catch (error) {
        console.error("Error getting user layout settings: " + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
