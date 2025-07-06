import { connectDB } from "@/dbConfig/connectDB";
import Weight from "@/models/weightModel";
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

        const data = await Weight.find(
            {
                user: user,
                createdAt: { $gt: daysAgo },
            },
            { __v: 0, user: 0 }
        ).sort({ createdAt: -1 });
        const convertedData = convertArrayStringToNumber(
            data.map((item) => item.toObject()),
            ["value"]
        );
        return NextResponse.json({ data: convertedData });
    } catch (error) {
        console.log("Error adding Weight " + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
