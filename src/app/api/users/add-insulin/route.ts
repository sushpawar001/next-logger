import { connectDB } from "@/dbConfig/connectDB";
import InsulinType from "@/models/insulinTypeModel";
import User from "@/models/userModel";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";

connectDB();

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    const user = await getUserObjectId();

    const insulin = await InsulinType.findOne({ name });
    if (!insulin) {
      return NextResponse.json(
        { error: "Insulin does not exists!" },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      user,
      {
        $addToSet: { insulins: insulin },
      },
      { new: true }
    );

    return NextResponse.json({
      user: updatedUser,
      insulin: insulin,
      message: "User updated successfully",
    });
  } catch (error) {
    console.log("Error adding insulin to user: " + error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
