import { connectDB } from "@/dbConfig/connectDB";
import Measurements from "@/models/measurementsModel";
import { NextRequest, NextResponse } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";

connectDB();

export async function GET(request: NextRequest) {
    try {
        const user = await getUserObjectId();
        const data = await Measurements.find({ user: user }).sort({
            createdAt: -1,
        });
        return NextResponse.json({ data: data });
    } catch (error) {
        console.log("Error getting Measurements " + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
