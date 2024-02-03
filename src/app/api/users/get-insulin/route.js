import { connectDB } from "@/dbConfig/connectDB";
import InsulinType from "@/models/insulinTypeModel";
import User from "@/models/userModel";
import { NextResponse } from "next/server";
import getUserFromToken from "@/helpers/getUserFromToken";

connectDB();

export async function GET(request) {
  try {
    const user = getUserFromToken(request);
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
