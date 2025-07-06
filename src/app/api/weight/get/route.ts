import { connectDB } from "@/dbConfig/connectDB";
import Weight from "@/models/weightModel";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import { convertArrayStringToNumber } from "@/helpers/convertStringToNumber";

connectDB();

export async function GET(request: NextRequest) {
    try {
        const user = await getUserObjectId();
        const data = await Weight.find({ user: user }).sort({ createdAt: -1 });
        const convertedData = convertArrayStringToNumber(
            data.map((item) => item.toObject()),
            ["value"]
        );
        return NextResponse.json({ data: convertedData });
    } catch (error) {
        console.log("Error getting Weight " + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
