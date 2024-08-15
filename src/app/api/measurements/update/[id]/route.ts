import { connectDB } from "@/dbConfig/connectDB";
import Measurements from "@/models/measurementsModel";
import { NextResponse } from "next/server";
import getUserFromToken from "@/helpers/getUserFromToken";

connectDB();

export async function PUT(request, { params }) {
    try {
        const body = await request.json();
        body.createdAt = new Date(body.createdAt);
        const user = getUserFromToken(request);
        const data = await Measurements.findOneAndUpdate({ _id: params.id, user: user }, body, {
            new: true
        });
        console.log("RouteData: ", data)
        return NextResponse.json({ message: "Measurements Data updated", data: data })

    } catch (error) {
        console.log("Error getting Measurements " + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
