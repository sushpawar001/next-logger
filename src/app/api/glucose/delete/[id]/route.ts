import { connectDB } from "@/dbConfig/connectDB";
import Glucose from "@/models/glucoseModel";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";

connectDB();

export async function DELETE(request: NextRequest, { params }) {
    try {
        const user = await getUserObjectId();
        const data = await Glucose.findOneAndDelete({ _id: params.id, user: user });
        
        return NextResponse.json({ message: "Data deleted", data: data })

    } catch (error) {
        console.log("Error deleting Glucose " + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
