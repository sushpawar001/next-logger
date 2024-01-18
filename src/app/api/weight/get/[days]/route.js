import { connectDB } from "@/dbConfig/connectDB";
import Weight from "@/models/weightModel";
import { NextResponse } from "next/server";
import getUserFromToken from "@/helpers/getUserFromToken";

connectDB();

export async function GET(request, { params }) {
    try {
        const { days } = params
        const user = getUserFromToken(request);
        
        let daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - days);

        const data = await Weight.find({ user: user, createdAt: { $gt: daysAgo } }).sort({ createdAt: -1 });
        return NextResponse.json({ data: data })

    } catch (error) {
        console.log("Error adding Weight " + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
