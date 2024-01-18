import { connectDB } from "@/dbConfig/connectDB";
import Weight from "@/models/weightModel";
import { NextResponse } from "next/server";
import getUserFromToken from "@/helpers/getUserFromToken";

connectDB();

export async function POST(request) {
    try {
        const body = await request.json();
        const { value } = body;
        const user = getUserFromToken(request);
        const entry = await Weight.create({ value, user });
        return NextResponse.json({ entry, message: "Weight entry added!" })

    } catch (error) {
        console.log("Error adding Weight" + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
