import { connectDB } from "@/dbConfig/connectDB";
import Weight from "@/models/weightModel";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";

connectDB();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { value } = body;
        const user = await getUserObjectId();
        const entry = await Weight.create({ value, user });
        return NextResponse.json({ entry, message: "Weight entry added!" })

    } catch (error) {
        console.log("Error adding Weight" + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
