import { connectDB } from "@/dbConfig/connectDB";
import Insulin from "@/models/insulinModel";
import { NextResponse } from "next/server";
import getUserFromToken from "@/helpers/getUserFromToken";

connectDB();

export async function POST(request) {
    try {
        const body = await request.json();
        const { units, name } = body;
        const user = getUserFromToken(request);
        const entry = await Insulin.create({ units, name, user });
        return NextResponse.json({ entry, message: "Entry added!" })

    } catch (error) {
        console.log("Error adding Insulin" + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
