import { connectDB } from "@/dbConfig/connectDB";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import Weight from "@/models/weightModel";
import { convertStringToNumber } from "@/helpers/convertStringToNumber";

connectDB();

export async function GET(request: NextRequest, { params }) {
    try {
        const user = await getUserObjectId();
        const data = await Weight.findOne({ _id: params.id, user: user });
        const convertedData = convertStringToNumber(data.toObject(), ["value"]);
        return NextResponse.json({ data: convertedData });
    } catch (error) {
        console.log("Error getting one Weight " + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
