import { connectDB } from "@/dbConfig/connectDB";
import Weight from "@/models/weightModel";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";

connectDB();

export async function GET(request: NextRequest) {
    try {
        const user = await getUserObjectId();
        const data = await Weight.find({ user: user }).sort({ createdAt: -1 });
        return NextResponse.json({ data: data })

    } catch (error) {
        console.log("Error getting Weight " + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
