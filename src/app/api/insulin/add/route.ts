import { connectDB } from "@/dbConfig/connectDB";
import Insulin from "@/models/insulinModel";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";

connectDB();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { units, name } = body;
        const user = await getUserObjectId();
        const entry = await Insulin.create({ units, name, user });
        return NextResponse.json({ entry, message: `${name} insulin Entry added!` })

    } catch (error) {
        console.log("Error adding Insulin" + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
