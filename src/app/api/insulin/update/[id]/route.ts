import { connectDB } from "@/dbConfig/connectDB";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import Insulin from "@/models/insulinModel";


connectDB();

export async function PUT(request: NextRequest, { params }) {
    try {
        const body = await request.json();
        body.createdAt = new Date(body.createdAt);
        const user = await getUserObjectId();
        const data = await Insulin.findOneAndUpdate({ _id: params.id, user: user }, body, {
            new: true
        });
        return NextResponse.json({ message: "Data updated", data: data })

    } catch (error) {
        console.log("Error updating Insulin " + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
