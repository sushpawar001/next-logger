import { connectDB } from "@/dbConfig/connectDB";
import Glucose from "@/models/glucoseModel";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import { errorStatus } from "@/helpers/httpError";
import { convertStringToNumber } from "@/helpers/convertStringToNumber";

connectDB();

export async function GET(request: NextRequest, props) {
    const params = await props.params;
    try {
        const user = await getUserObjectId();
        const data = await Glucose.findOne(
            { _id: params.id, user: user },
            { __v: 0, user: 0 }
        );
        if (!data) {
            return NextResponse.json({ error: "Entry not found" }, { status: 404 });
        }
        const convertedData = convertStringToNumber(data.toObject(), ["value"]);
        return NextResponse.json({ data: convertedData });
    } catch (error) {
        console.log("Error getting Glucose " + error);
        return NextResponse.json({ error: error.message }, { status: errorStatus(error) });
    }
}
