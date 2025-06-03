import { connectDB } from "@/dbConfig/connectDB";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import bcryptjs from "bcryptjs";
import { ForgotPasswordTemplate } from "@/components/Resend/ForgotPasswordTemplate";
import { Resend } from "resend";

connectDB();
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        const user = await User.findOne({
            email,
        });

        if (!user) {
            return NextResponse.json(
                { error: "User does not exist" },
                { status: 400 }
            );
        }

        const user_id = user._id;
        const hashedToken = await bcryptjs.hash(user_id.toString(), 10);

        await User.findByIdAndUpdate(user_id, {
            forgotPasswordToken: hashedToken,
            forgotPasswordTokenExpiry: Date.now() + 3600000,
        });

        const { data, error } = await resend.emails.send({
            from: "FitDose <fitdose@resend.dev>",
            to: [email],
            subject: "Forget Password",
            react: ForgotPasswordTemplate({
                email: email,
                hashedToken: hashedToken,
            }),
        });

        if (error) {
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json({
            message: "Email sent successfully",
            success: true,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
