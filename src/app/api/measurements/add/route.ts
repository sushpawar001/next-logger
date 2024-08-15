import { connectDB } from "@/dbConfig/connectDB";
import Measurements from "@/models/measurementsModel";
import { NextRequest, NextResponse } from "next/server";
import getUserFromToken from "@/helpers/getUserFromToken";

connectDB();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { arms, chest, abdomen, waist, hip, thighs, calves } = body.measurements;
        const user = getUserFromToken(request);
        const entry = await Measurements.create({
            arms,
            chest,
            abdomen,
            waist,
            hip,
            thighs,
            calves,
            user,
        });
        return NextResponse.json({ entry, message: "Measurements added!" });
    } catch (error) {
        console.log("Error adding Measurements" + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}