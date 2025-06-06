import { connectDB } from "@/dbConfig/connectDB";
import Weight from "@/models/weightModel";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import { getWeightByDay } from "@/helpers/dataFetchHelpers";

connectDB();

export async function GET(request: NextRequest, { params }) {
    try {
        const { days } = params;
        const user = await getUserObjectId();

        const data = await getWeightByDay(days, user);
        return NextResponse.json({ data: data });
    } catch (error) {
        console.log("Error adding Weight " + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
