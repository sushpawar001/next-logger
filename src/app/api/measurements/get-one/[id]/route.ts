import { connectDB } from "@/dbConfig/connectDB";
import Measurements from "@/models/measurementsModel";
import { NextRequest, NextResponse } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import { errorStatus } from "@/helpers/httpError";
import { convertStringToNumber } from "@/helpers/convertStringToNumber";

connectDB();

export async function GET(request: NextRequest, props) {
    const params = await props.params;
    try {
        const user = await getUserObjectId();
        const data = await Measurements.findOne(
            { _id: params.id, user: user },
            { __v: 0, user: 0 }
        );
        if (!data) {
            return NextResponse.json({ error: "Entry not found" }, { status: 404 });
        }
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
        return NextResponse.json({ error: error.message }, { status: errorStatus(error) });
    }
}
