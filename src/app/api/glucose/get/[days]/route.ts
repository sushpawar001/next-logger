import { connectDB } from "@/dbConfig/connectDB";
import Glucose from "@/models/glucoseModel";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import { convertArrayStringToNumber } from "@/helpers/convertStringToNumber";

connectDB();

export async function GET(request: NextRequest, { params }) {
    try {
        const { days } = params;
        const user = await getUserObjectId();

        let daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - days);

        const data = await Glucose.find({
            user: user,
            createdAt: { $gt: daysAgo },
        }).sort({ createdAt: -1 });

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
