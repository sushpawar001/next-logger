import { connectDB } from "@/dbConfig/connectDB";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import Weight from "@/models/weightModel";

connectDB();

export async function DELETE(request: NextRequest, { params }) {
    try {
        const user = await getUserObjectId();
        const data = await Weight.findOneAndDelete({ _id: params.id, user: user });
        return NextResponse.json({ message: "Data deleted", data: data })

    } catch (error) {
        console.log("Error deleting Weight " + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
