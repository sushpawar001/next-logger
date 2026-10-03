import { connectDB } from "@/dbConfig/connectDB";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import { errorStatus } from "@/helpers/httpError";
import Insulin from "@/models/insulinModel";
import { convertStringToNumber } from "@/helpers/convertStringToNumber";

connectDB();

export async function GET(request: NextRequest, props) {
    const params = await props.params;
    try {
        const user = await getUserObjectId();
        const data = await Insulin.findOne(
            { _id: params.id, user: user },
            { __v: 0, user: 0 }
        ).lean();
        if (!data) {
            return NextResponse.json({ error: "Entry not found" }, { status: 404 });
        }
        const convertedData = convertStringToNumber(data, ["units"]);
        return NextResponse.json({ data: convertedData });
    } catch (error) {
        console.log("Error getting one Insulin " + error);
        return NextResponse.json({ error: error.message }, { status: errorStatus(error) });
    }
}
