import { connectDB } from "@/dbConfig/connectDB";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import Insulin from "@/models/insulinModel";
import { convertStringToNumber } from "@/helpers/convertStringToNumber";

connectDB();

export async function GET(request: NextRequest, { params }) {
    try {
        const user = await getUserObjectId();
        const data = await Insulin.findOne({ _id: params.id, user: user });
        const convertedData = convertStringToNumber(data.toObject(), ["units"]);
        return NextResponse.json({ data: convertedData });
    } catch (error) {
        console.log("Error getting one Insulin " + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
