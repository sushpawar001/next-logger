import { connectDB } from "@/dbConfig/connectDB";
import Glucose from "@/models/glucoseModel";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";

connectDB();

export async function GET() {
    try {
        const user = await getUserObjectId();
        const data = await Glucose.find({ user: user }).sort({ createdAt: -1 });
        return NextResponse.json({ data: data });
    } catch (error) {
        console.log("Error getting Glucose " + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
