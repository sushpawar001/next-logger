import { connectDB } from "@/dbConfig/connectDB";
import InsulinType from "@/models/insulinTypeModel";
import User from "@/models/userModel";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import mongoose from "mongoose";
mongoose.model("InsulinType", InsulinType.schema);

connectDB();

export async function GET(request: NextRequest) {
    try {
        const user = await getUserObjectId();
        const data = await User.findById(user).populate("insulins");
        // const data = await User.findById(user).populate({ path: "insulins", model: InsulinType });

        return NextResponse.json({
            data: data.insulins,
            message: "User Insulin data",
        });
    } catch (error) {
        console.error("Error adding insulin to user: " + error);
        console.log(error.stack);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
