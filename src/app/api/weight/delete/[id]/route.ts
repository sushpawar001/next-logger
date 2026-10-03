import { connectDB } from "@/dbConfig/connectDB";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import { errorStatus } from "@/helpers/httpError";
import Weight from "@/models/weightModel";

connectDB();

export async function DELETE(request: NextRequest, props) {
    const params = await props.params;
    try {
        const user = await getUserObjectId();
        const data = await Weight.findOneAndDelete({ _id: params.id, user: user });
        if (!data) {
            return NextResponse.json({ error: "Entry not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Data deleted", data: data })

    } catch (error) {
        console.log("Error deleting Weight " + error);
        return NextResponse.json({ error: error.message }, { status: errorStatus(error) })
    }
}
