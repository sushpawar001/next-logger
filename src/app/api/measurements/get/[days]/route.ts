import { connectDB } from "@/dbConfig/connectDB";
import Measurements from "@/models/measurementsModel";
import { NextRequest, NextResponse } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import { convertArrayStringToNumber } from "@/helpers/convertStringToNumber";

connectDB();

export async function GET(request: NextRequest, { params }: any) {
    try {
        const { days } = params;
        const user = await getUserObjectId();

        let daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - days);

        const data = await Measurements.find(
            {
                user: user,
                createdAt: { $gt: daysAgo },
            },
            { __v: 0, user: 0 }
        ).sort({ createdAt: -1 });
        const convertedData = convertArrayStringToNumber(
            data.map((item) => item.toObject()),
            ["arms", "chest", "abdomen", "waist", "hip", "thighs", "calves"]
        );
        return NextResponse.json({ data: convertedData });
    } catch (error) {
        console.log("Error getting Glucose " + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
