import { connectDB } from "@/dbConfig/connectDB";
import Weight from "@/models/weightModel";
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
        const weightDoc = new Weight(payload);
        const entry = await weightDoc.save();
        return NextResponse.json({ entry, message: "Weight entry added!" });
    } catch (error) {
        console.log("Error adding Weight" + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
