import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/connectDB";
import Measurements from "@/models/measurementsModel";
import Weight from "@/models/weightModel";
import Glucose from "@/models/glucoseModel";
import Insulin from "@/models/insulinModel";
import mongoose from "mongoose";

// Helper function to generate random number between min and max
const randomNumber = (min: number, max: number) => {
    return (Math.random() * (max - min) + min).toFixed(1);
};

// Helper function to generate random date within last n days
const randomDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * days));
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    return date;
};

// Helper function to generate random tag
const randomTag = () => {
    const tags = [
        "morning",
        "afternoon",
        "evening",
        "night",
        "pre-meal",
        "post-meal",
        null,
    ];
    return tags[Math.floor(Math.random() * tags.length)];
};

// Helper function to generate random insulin name
const randomInsulinName = () => {
    const names = ["Lantus", "Humalog", "NovoLog", "Levemir", "Tresiba"];
    return names[Math.floor(Math.random() * names.length)];
};

export async function POST(
    req: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const { userId } = params;
        const { days = 60, count = 300, seed_token } = await req.json();

        if (seed_token && seed_token !== process.env.SEED_TOKEN) {
            return NextResponse.json(
                { error: "Invalid seed token" },
                { status: 400 }
            );
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json(
                { error: "Invalid user ID" },
                { status: 400 }
            );
        }

        await connectDB();
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Generate measurements data
        const measurementsData = Array(count)
            .fill(null)
            .map(() => ({
                arms: randomNumber(25, 45),
                chest: randomNumber(80, 120),
                abdomen: randomNumber(70, 110),
                waist: randomNumber(65, 100),
                hip: randomNumber(80, 120),
                thighs: randomNumber(45, 70),
                calves: randomNumber(30, 45),
                user: userObjectId,
                tag: randomTag(),
                createdAt: randomDate(days),
            }));

        // Generate weight data
        const weightData = Array(count)
            .fill(null)
            .map(() => ({
                value: randomNumber(60, 80),
                user: userObjectId,
                tag: randomTag(),
                createdAt: randomDate(days),
            }));

        // Generate glucose data
        const glucoseData = Array(count)
            .fill(null)
            .map(() => ({
                value: randomNumber(32, 540),
                user: userObjectId,
                tag: randomTag(),
                createdAt: randomDate(days),
            }));

        // Generate insulin data
        const insulinData = Array(count)
            .fill(null)
            .map(() => ({
                units: randomNumber(2, 20),
                name: randomInsulinName(),
                user: userObjectId,
                tag: randomTag(),
                createdAt: randomDate(days),
            }));

        // Insert all data
        await Promise.all([
            Measurements.insertMany(measurementsData),
            Weight.insertMany(weightData),
            Glucose.insertMany(glucoseData),
            Insulin.insertMany(insulinData),
        ]);

        return NextResponse.json({
            success: true,
            message: "Data seeded successfully",
            count: {
                measurements: measurementsData.length,
                weight: weightData.length,
                glucose: glucoseData.length,
                insulin: insulinData.length,
            },
        });
    } catch (error: any) {
        console.error("Error seeding data:", error);
        return NextResponse.json(
            { error: error.message || "Failed to seed data" },
            { status: 500 }
        );
    }
}
