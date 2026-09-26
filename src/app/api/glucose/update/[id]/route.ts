import { connectDB } from "@/dbConfig/connectDB";
import Glucose from "@/models/glucoseModel";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";

connectDB();

export async function PUT(request: NextRequest, props) {
    const params = await props.params;
    try {
        const body = await request.json();
        const { value, createdAt, tag } = body;
        const user = await getUserObjectId();

        // Build update payload
        const updatePayload: any = {};
        if (value !== undefined) updatePayload.value = value;
        if (tag !== undefined) updatePayload.tag = tag;
        if (createdAt !== undefined) updatePayload.createdAt = new Date(createdAt);

        const data = await Glucose.findOneAndUpdate(
            { _id: params.id, user: user },
            updatePayload,
            { returnDocument: "after" }
        );
        return NextResponse.json({ message: "Data updated", data: data });

    } catch (error) {
        console.log("Error updating Glucose " + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
