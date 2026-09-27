import { connectDB } from "@/dbConfig/connectDB";
import ContactUs from "@/models/contactUs";
import { NextResponse, NextRequest } from "next/server";

connectDB();

// This route is public (see src/proxy.ts), so everything it stores is capped
// and checked before it reaches Mongo.
const LIMITS = { name: 100, email: 200, message: 5000 } as const;
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isFilledString = (value: unknown, max: number): value is string =>
    typeof value === "string" && value.trim().length > 0 && value.length <= max;

export async function POST(request: NextRequest) {
    let body: any;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { message: "Invalid request" },
            { status: 400 }
        );
    }

    const { name, email, message, website } = body ?? {};

    // Honeypot: the form renders a hidden "website" field that people never
    // fill in. Bots that do get a success response and nothing is saved.
    if (typeof website === "string" && website.length > 0) {
        return NextResponse.json(
            { message: "Message sent successfully" },
            { status: 201 }
        );
    }

    if (
        !isFilledString(name, LIMITS.name) ||
        !isFilledString(email, LIMITS.email) ||
        !EMAIL_SHAPE.test(email.trim()) ||
        !isFilledString(message, LIMITS.message)
    ) {
        return NextResponse.json(
            { message: "Please enter your name, a valid email and a message" },
            { status: 400 }
        );
    }

    const newContactMessage = new ContactUs({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
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
