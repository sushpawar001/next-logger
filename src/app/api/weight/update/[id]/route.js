import { connectDB } from "@/dbConfig/connectDB";
import { NextResponse } from "next/server";
import getUserFromToken from "@/helpers/getUserFromToken";
import Weight from "@/models/weightModel";

connectDB();

export async function PUT(request, { params }) {
    try {
        const body = await request.json();
        body.createdAt = new Date(body.createdAt);
        const user = getUserFromToken(request);
        const data = await Weight.findOneAndUpdate({ _id: params.id, user: user }, body, {
            new: true
        });
        console.log("RouteData: ", data)
        return NextResponse.json({ message: "Data updated", data: data })

    } catch (error) {
        console.log("Error updating Weight " + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
