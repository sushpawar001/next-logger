import { connectDB } from "@/dbConfig/connectDB";
import Glucose from "@/models/glucoseModel";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";

connectDB();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { value, date, tag } = body;
        const user = await getUserObjectId();

        const payload = {
            value: value,
            user: user,
            tag: tag,
        };

        if (date) {
            payload["createdAt"] = date;
        }

        const glucoseDoc = new Glucose(payload);
        const entry = await glucoseDoc.save();

        return NextResponse.json({ entry, message: "Glucose Entry added!" });
    } catch (error) {
        console.log("Error adding Glucose" + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
