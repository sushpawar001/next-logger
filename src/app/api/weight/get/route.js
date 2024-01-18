import { connectDB } from "@/dbConfig/connectDB";
import Weight from "@/models/weightModel";
import { NextResponse } from "next/server";
import getUserFromToken from "@/helpers/getUserFromToken";

connectDB();

export async function GET(request) {
    try {
        const user = getUserFromToken(request);
        const data = await Weight.find({ user: user }).sort({ createdAt: -1 });
        return NextResponse.json({ data: data })

    } catch (error) {
        console.log("Error getting Weight " + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
