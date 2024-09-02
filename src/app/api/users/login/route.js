import { connectDB } from "@/dbConfig/connectDB";
import User from "@/models/userModel";
import { NextResponse, NextRequest } from "next/server";
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken";

connectDB();
// Deprecated
export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body
        const oldUser = await User.findOne({ email });

        if (!oldUser) {
            return NextResponse.json({ error: "User does not exists" }, { status: 400 })
        }
        const match = await bcryptjs.compare(password, oldUser.password)

        if (!match) {
            return NextResponse.json({ error: "Wrong password!" }, { status: 400 })
        }

        const token = jwt.sign({
            email: oldUser.email,
            userId: oldUser._id,
        }, process.env.TOKEN_SECRET, { expiresIn: "30d" })

        const response = NextResponse.json({
            message: "Login successful",
        })

        response.cookies.set("token", token, {
            httpOnly: true, maxAge: 60 * 60 * 24 * 30

        })
        return response;

    } catch (error) {
        console.log("Error logging in: " + error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}