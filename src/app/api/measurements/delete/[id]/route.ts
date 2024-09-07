import { connectDB } from "@/dbConfig/connectDB";
import Measurements from "@/models/measurementsModel";
import { NextRequest, NextResponse } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";

connectDB();

export async function DELETE(request: NextRequest, { params }: any) {
    try {
        const user = await getUserObjectId();
        const data = await Measurements.findOneAndDelete({ _id: params.id, user: user });
        return NextResponse.json({ message: "Data deleted", data: data })

    } catch (error) {
        console.log("Error deleting Measurements " + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
