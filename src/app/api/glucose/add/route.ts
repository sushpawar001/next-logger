import { connectDB } from "@/dbConfig/connectDB";
import Glucose from "@/models/glucoseModel";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";

connectDB();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { value } = body;
        const user = await getUserObjectId();
        const entry = await Glucose.create({ value, user });
        return NextResponse.json({ entry, message: "Glucose Entry added!" })

    } catch (error) {
        console.log("Error adding Glucose" + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
