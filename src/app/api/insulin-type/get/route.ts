import { connectDB } from "@/dbConfig/connectDB";
import InsulinType from "@/models/insulinTypeModel";
import { NextResponse, NextRequest } from "next/server";

connectDB();

export async function GET(request: NextRequest) {
  try {
    const data = await InsulinType.find({});
    return NextResponse.json({ data: data });
  } catch (error) {
    console.log("Error getting Insulin Types " + error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
