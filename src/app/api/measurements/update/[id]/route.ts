import { connectDB } from "@/dbConfig/connectDB";
import Measurements from "@/models/measurementsModel";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";

connectDB();

export async function PUT(request: NextRequest, { params }) {
    try {
        const body = await request.json();
        body.createdAt = new Date(body.createdAt);
        const user = await getUserObjectId();
        const data = await Measurements.findOneAndUpdate({ _id: params.id, user: user }, body, {
            new: true
        });
        return NextResponse.json({ message: "Measurements Data updated", data: data })

    } catch (error) {
        console.log("Error getting Measurements " + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
