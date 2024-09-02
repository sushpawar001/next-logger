import { connectDB } from "@/dbConfig/connectDB";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import Insulin from "@/models/insulinModel";

connectDB();

export async function GET(request: NextRequest, { params }) {
    try {
        const user = await getUserObjectId();
        const data = await Insulin.findOne({ _id: params.id, user: user });
        return NextResponse.json({ data: data })

    } catch (error) {
        console.log("Error getting one Insulin " + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
