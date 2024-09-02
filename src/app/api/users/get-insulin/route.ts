import { connectDB } from "@/dbConfig/connectDB";
import InsulinType from "@/models/insulinTypeModel";
import User from "@/models/userModel";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";

connectDB();

export async function GET(request: NextRequest) {
  try {
    const user = await getUserObjectId();
    const data = await User.findById(user).populate("insulins");

    return NextResponse.json({
      data: data.insulins,
      message: "User Insulin data",
    });
  } catch (error) {
    console.log("Error adding insulin to user: " + error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
