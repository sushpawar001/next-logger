import { connectDB } from "@/dbConfig/connectDB";
import Measurements from "@/models/measurementsModel";
import { NextRequest, NextResponse } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";

connectDB();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { arms, chest, abdomen, waist, hip, thighs, calves, tag } =
            body.measurements;
        const user = await getUserObjectId();
        const measurementsDoc = new Measurements({
            arms,
            chest,
            abdomen,
            waist,
            hip,
            thighs,
            calves,
            user,
            tag,
        });
        const entry = await measurementsDoc.save();
        return NextResponse.json({ entry, message: "Measurements added!" });
    } catch (error) {
        console.log("Error adding Measurements" + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
