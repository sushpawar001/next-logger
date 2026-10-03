import { connectDB } from "@/dbConfig/connectDB";
import Measurements from "@/models/measurementsModel";
import { NextRequest, NextResponse } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import { errorStatus } from "@/helpers/httpError";

connectDB();

export async function DELETE(request: NextRequest, props) {
    const params = await props.params;
    try {
        const user = await getUserObjectId();
        const data = await Measurements.findOneAndDelete({ _id: params.id, user: user });
        if (!data) {
            return NextResponse.json({ error: "Entry not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Data deleted", data: data })

    } catch (error) {
        console.log("Error deleting Measurements " + error);
        return NextResponse.json({ error: error.message }, { status: errorStatus(error) })
    }
}
