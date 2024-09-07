import { connectDB } from "@/dbConfig/connectDB";
import InsulinType from "@/models/insulinTypeModel";
import User from "@/models/userModel";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";

connectDB();

export async function POST(request: NextRequest) {
    try {
        const { insulinData } = await request.json();
        const user = await getUserObjectId();

        const updatedUser = await User.findByIdAndUpdate(
            user,
            {
                $set: { insulins: insulinData },
            },
            { new: true }
        );

        return NextResponse.json({
            user: updatedUser,
            insulin: insulinData,
            message: "Selected insulins are saved to user successfully",
        });
    } catch (error) {
        console.log("Error adding insulin to user: " + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
