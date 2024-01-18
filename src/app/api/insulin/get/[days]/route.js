import { connectDB } from "@/dbConfig/connectDB";
import Insulin from "@/models/insulinModel";
import { NextResponse } from "next/server";
import getUserFromToken from "@/helpers/getUserFromToken";

connectDB();

export async function GET(request, { params }) {
    try {
        const { days } = params
        const user = getUserFromToken(request);

        let daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - days);

        const data = await Insulin.find({ user: user, createdAt: { $gt: daysAgo } }).sort({ createdAt: -1 });
        return NextResponse.json({ data: data })

    } catch (error) {
        console.log("Error getting Insulin " + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
