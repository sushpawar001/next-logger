import { connectDB } from "@/dbConfig/connectDB";
import User from "@/models/userModel";
import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs"

connectDB();

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body
        const oldUser = await User.findOne({ email: email });

        if (oldUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 })
        }
        const hashpass = await bcryptjs.hash(password, 11);

        const user = await User.create({ email, password: hashpass });
        return NextResponse.json({
            user: user,
            message: "User created successfully",
        })

    } catch (error) {
        console.log("Error creating user: " + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}