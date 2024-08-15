import { connectDB } from "@/dbConfig/connectDB";
import Measurements from "@/models/measurementsModel";
import { NextRequest, NextResponse } from "next/server";
import getUserFromToken from "@/helpers/getUserFromToken";

connectDB();

export async function GET(request: NextRequest, { params }: any) {
    try {
        const { days } = params;
        const user = getUserFromToken(request);

        let daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - days);

        const data = await Measurements.find({
            user: user,
            createdAt: { $gt: daysAgo },
        }).sort({ createdAt: -1 });
        return NextResponse.json({ data: data });
    } catch (error) {
        console.log("Error getting Glucose " + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
