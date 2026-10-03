import { connectDB } from "@/dbConfig/connectDB";
import Measurements from "@/models/measurementsModel";
import { NextRequest, NextResponse } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import { errorStatus } from "@/helpers/httpError";
import { convertArrayStringToNumber } from "@/helpers/convertStringToNumber";

connectDB();

export async function GET(request: NextRequest) {
    try {
        const user = await getUserObjectId();
        const data = await Measurements.find(
            { user: user },
            { __v: 0, user: 0 }
        ).sort({ createdAt: -1 }).lean();
        const convertedData = convertArrayStringToNumber(
            data,
            ["arms", "chest", "abdomen", "waist", "hip", "thighs", "calves"]
        );
        return NextResponse.json({ data: convertedData });
    } catch (error) {
        console.log("Error getting Measurements " + error);
        return NextResponse.json({ error: error.message }, { status: errorStatus(error) });
    }
}
