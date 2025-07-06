import { connectDB } from "@/dbConfig/connectDB";
import Insulin from "@/models/insulinModel";
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

        const data = await Insulin.find(
            {
                user: user,
                createdAt: { $gt: daysAgo },
            },
            { __v: 0, user: 0 }
        ).sort({ createdAt: -1 });
        const convertedData = convertArrayStringToNumber(
            data.map((item) => item.toObject()),
            ["units"]
        );
        return NextResponse.json({ data: convertedData });
    } catch (error) {
        console.log("Error getting Insulin " + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
