import { connectDB } from "@/dbConfig/connectDB";
import Glucose from "@/models/glucoseModel";
import { NextResponse } from "next/server";
import getUserFromToken from "@/helpers/getUserFromToken";

connectDB();

export async function DELETE(request, { params }) {
    try {
        const user = getUserFromToken(request);
        const data = await Glucose.findOneAndDelete({ _id: params.id, user: user });
        console.log("RouteData: ", data)
        return NextResponse.json({ message: "Data deleted", data: data })

    } catch (error) {
        console.log("Error deleting Glucose " + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
