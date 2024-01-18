import { connectDB } from "@/dbConfig/connectDB";
import { NextResponse } from "next/server";
import getUserFromToken from "@/helpers/getUserFromToken";
import Insulin from "@/models/insulinModel";

connectDB();

export async function DELETE(request, { params }) {
    try {
        const user = getUserFromToken(request);
        const data = await Insulin.findOneAndDelete({ _id: params.id, user: user });
        return NextResponse.json({ message: "Data deleted", data: data })

    } catch (error) {
        console.log("Error deleting Insulin " + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
