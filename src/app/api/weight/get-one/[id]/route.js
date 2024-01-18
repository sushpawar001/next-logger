import { connectDB } from "@/dbConfig/connectDB";
import { NextResponse } from "next/server";
import getUserFromToken from "@/helpers/getUserFromToken";
import Weight from "@/models/weightModel";


connectDB();

export async function GET(request, { params }) {
    try {
        const user = getUserFromToken(request);
        const data = await Weight.findOne({ _id: params.id, user: user });
        return NextResponse.json({ data: data })

    } catch (error) {
        console.log("Error getting one Weight " + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
