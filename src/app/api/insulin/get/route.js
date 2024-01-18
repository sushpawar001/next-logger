import { connectDB } from "@/dbConfig/connectDB";
import Insulin from "@/models/insulinModel";
import { NextResponse } from "next/server";
import getUserFromToken from "@/helpers/getUserFromToken";

connectDB();

export async function GET(request) {
    try {
        const user = getUserFromToken(request);
        const data = await Insulin.find({ user: user }).sort({ createdAt: -1 });
        return NextResponse.json({ data: data })

    } catch (error) {
        console.log("Error getting Insulin " + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
