import { connectDB } from "@/dbConfig/connectDB";
import Glucose from "@/models/glucoseModel";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import { convertArrayStringToNumber } from "@/helpers/convertStringToNumber";

connectDB();

export async function GET() {
    try {
        const user = await getUserObjectId();
        const data = await Glucose.find(
            { user: user },
            { __v: 0, user: 0 }
        ).sort({ createdAt: -1 });
        const convertedData = convertArrayStringToNumber(
            data.map((item) => item.toObject()),
            ["value"]
        );
        return NextResponse.json({ data: convertedData });
    } catch (error) {
        console.log("Error getting Glucose " + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
