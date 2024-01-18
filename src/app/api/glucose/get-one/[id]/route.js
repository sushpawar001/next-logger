import { connectDB } from "@/dbConfig/connectDB";
import Glucose from "@/models/glucoseModel";
import { NextResponse } from "next/server";
import getUserFromToken from "@/helpers/getUserFromToken";

connectDB();

export async function GET(request, { params }) {
    try {
        const user = getUserFromToken(request);
        const data = await Glucose.findOne({ _id: params.id, user: user });
        return NextResponse.json({ data: data })

    } catch (error) {
        console.log("Error getting Glucose " + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
