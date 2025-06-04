import { connectDB } from "@/dbConfig/connectDB";
import { NextResponse, NextRequest } from "next/server";
import ClerkUser from "@/models/userModelClerk";
import Glucose from "@/models/glucoseModel";
import Insulin from "@/models/insulinModel";
import InsulinType from "@/models/insulinTypeModel";
import Measurements from "@/models/measurementsModel";
import Weight from "@/models/weightModel";
import { clerkClient, currentUser } from "@clerk/nextjs/server";

connectDB();

export async function POST(request: NextRequest) {
    try {
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
                    password: "ClerkUser",
                    clerkUserId: id,
                    layoutSettings: "diabetes",
                    subscriptionPlan: "trial",
                    subscriptionEndDate: new Date(
                        Date.now() + 30 * 24 * 60 * 60 * 1000
                    ),
                });

                await clerkClient.users.updateUserMetadata(id, {
                    publicMetadata: {
                        subscriptionPlan: "trial",
                        subscriptionEndDate: new Date(
                            Date.now() + 30 * 24 * 60 * 60 * 1000
                        ).toISOString(),
                    },
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
                return NextResponse.json(
                    {
                        message: "Webhook received",
                    },
                    { status: 200 }
                );
        }
    } catch (error) {
        console.error("Error in webhook:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
