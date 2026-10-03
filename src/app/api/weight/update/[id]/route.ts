import { connectDB } from "@/dbConfig/connectDB";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import { errorStatus } from "@/helpers/httpError";
import Weight from "@/models/weightModel";

connectDB();

export async function PUT(request: NextRequest, props) {
    const params = await props.params;
    try {
        const body = await request.json();
        if (body.createdAt !== undefined) {
            body.createdAt = new Date(body.createdAt);
        }
        const user = await getUserObjectId();
        const data = await Weight.findOneAndUpdate({ _id: params.id, user: user }, body, {
            returnDocument: "after"
        });
        return NextResponse.json({ message: "Data updated", data: data })

    } catch (error) {
        console.log("Error updating Weight " + error);
        return NextResponse.json({ error: error.message }, { status: errorStatus(error) })
    }
}
