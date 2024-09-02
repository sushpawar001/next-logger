import { connectDB } from "@/dbConfig/connectDB";
import { NextResponse, NextRequest } from "next/server";
import ClerkUser from "@/models/userModelClerk";
import Glucose from "@/models/glucoseModel";
import Insulin from "@/models/insulinModel";
import InsulinType from "@/models/insulinTypeModel";
import Measurements from "@/models/measurementsModel";
import Weight from "@/models/weightModel";

connectDB();

export async function POST(request: NextRequest) {
    try {
        console.log("webhook hit!")
        const body = await request.json();
        const { data } = body;
        const requestType = body.type;

        switch (requestType) {
            case "user.created":
                const email = data.email_addresses[0].email_address;
                const id = data.id;
                console.log(email, id);

                const user = await ClerkUser.create({
                    email: email,
                    clerkUserId: id,
                });

                if (user) {
                    return NextResponse.json(
                        {
                            message: "User created successfully",
                        },
                        { status: 200 }
                    );
                }

            case "user.deleted":
                const clerkUserId = data.id;
                const existingUser = await ClerkUser.findOne({
                    clerkUserId: clerkUserId,
                });
                console.log(existingUser._id);

                if (existingUser) {
                    const glucoseData = await Glucose.deleteMany({
                        user: existingUser._id,
                    });
                    const insulinData = await Insulin.deleteMany({
                        user: existingUser._id,
                    });
                    const insulinTypeData = await InsulinType.deleteMany({
                        user: existingUser._id,
                    });
                    const measurementsData = await Measurements.deleteMany({
                        user: existingUser._id,
                    });
                    const weightData = await Weight.deleteMany({
                        user: existingUser._id,
                    });
                    const deletedUser = await ClerkUser.findOneAndDelete({
                        clerkUserId: clerkUserId,
                    });

                    if (deletedUser) {
                        return NextResponse.json(
                            {
                                message: "User deleted successfully",
                            },
                            { status: 200 }
                        );
                    }
                } else {
                    return NextResponse.json(
                        {
                            message: "User not found",
                        },
                        { status: 404 }
                    );
                }

            default:
                throw new Error("Invalid request type");
        }
    } catch (error) {
        console.log("Error in Webhook: " + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
