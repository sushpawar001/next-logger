import { connectDB } from "@/dbConfig/connectDB";
import User from "@/models/userModel";
import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { Resend } from "resend";
import { VerifyEmailTemplate } from "@/components/Resend/VerifyEmailTemplate";

connectDB();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;
        const oldUser = await User.findOne({ email: email });

        if (oldUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }
        const hashpass = await bcryptjs.hash(password, 11);

        const user = await User.create({ email, password: hashpass });
        
        // const user_id = user._id;

        // const hashedToken = await bcryptjs.hash(user_id.toString(), 10);

        // await User.findByIdAndUpdate(user_id, {
        //     verifyToken: hashedToken,
        //     verifyTokenExpiry: Date.now() + 3600000,
        // });

        // const { data, error } = await resend.emails.send({
        //     from: "FitDose <fitdose@resend.dev>",
        //     to: [email],
        //     subject: "Verify your email",
        //     react: VerifyEmailTemplate({
        //         email: email,
        //         hashedToken: hashedToken,
        //     }),
        // });

        // if (error) {
        //     return NextResponse.json({ error }, { status: 500 });
        // }


        return NextResponse.json({
            user: user,
            message: "User created successfully",
        });
    } catch (error) {
        console.log("Error creating user: " + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
