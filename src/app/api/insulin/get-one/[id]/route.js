import { connectDB } from "@/dbConfig/connectDB";
import { NextResponse } from "next/server";
import getUserFromToken from "@/helpers/getUserFromToken";
import Insulin from "@/models/insulinModel";

connectDB();

export async function GET(request, { params }) {
    try {
        const user = getUserFromToken(request);
        const data = await Insulin.findOne({ _id: params.id, user: user });
        return NextResponse.json({ data: data })

    } catch (error) {
        console.log("Error getting one Insulin " + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
