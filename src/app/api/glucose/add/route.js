import { connectDB } from "@/dbConfig/connectDB";
import Glucose from "@/models/glucoseModel";
import { NextResponse } from "next/server";
import getUserFromToken from "@/helpers/getUserFromToken";

connectDB();

export async function POST(request) {
    try {
        const body = await request.json();
        const { value } = body;
        const user = getUserFromToken(request);
        const entry = await Glucose.create({ value, user });
        return NextResponse.json({ entry, message: "Glucose Entry added!" })

    } catch (error) {
        console.log("Error adding Glucose" + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
