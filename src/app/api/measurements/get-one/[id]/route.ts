import { connectDB } from "@/dbConfig/connectDB";
import Measurements from "@/models/measurementsModel";
import { NextRequest, NextResponse } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import { convertStringToNumber } from "@/helpers/convertStringToNumber";

connectDB();

export async function GET(request: NextRequest, { params }: any) {
    try {
        const user = await getUserObjectId();
        const data = await Measurements.findOne({ _id: params.id, user: user });
        const convertedData = convertStringToNumber(data.toObject(), [
            "arms",
            "chest",
            "abdomen",
            "waist",
            "hip",
            "thighs",
            "calves",
        ]);
        return NextResponse.json({ data: convertedData });
    } catch (error) {
        console.log("Error getting Glucose " + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
