import { connectDB } from "@/dbConfig/connectDB";
import ContactUs from "@/models/contactUs";
import { NextResponse, NextRequest } from "next/server";

connectDB();

export async function POST(request: NextRequest) {
    const { name, email, message } = await request.json();

    const newContactMessage = new ContactUs({
        name,
        email,
        message,
    });

    try {
        await newContactMessage.save();
        return NextResponse.json(
            { message: "Message sent successfully" },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Error sending message" },
            { status: 500 }
        );
    }
}
