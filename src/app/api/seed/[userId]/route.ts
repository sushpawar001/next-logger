import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/connectDB";
import Measurements from "@/models/measurementsModel";
import Weight from "@/models/weightModel";
import Glucose from "@/models/glucoseModel";
import Insulin from "@/models/insulinModel";
import mongoose from "mongoose";
import { entryTags } from "@/constants/constants";
import { timingSafeEqual } from "node:crypto";
import { encryptDocumentFields } from "@/lib/mongooseEncryption";

/**
 * insertMany skips the schemas' pre('save') hooks, so rows are encrypted here
 * instead. These mirror each model's addEncryptionHooks field list, stored as
 * strings (`storeAsString: true`) just as the hooks would.
 */
const ENCRYPTED_FIELDS = {
    measurements: ["arms", "chest", "abdomen", "waist", "hip", "thighs", "calves", "tag"],
    weight: ["value", "tag"],
    glucose: ["value", "tag"],
    insulin: ["units", "name", "tag"],
};

const encryptRows = (rows: Record<string, any>[], fields: string[]) =>
    rows.map((row) => encryptDocumentFields(row, fields, true));

/**
 * This route is public (src/proxy.ts), so the token is the only gate. It must
 * fail closed: a missing or empty token is rejected, and so is every request
 * when SEED_TOKEN is not configured on the server.
 */
function isValidSeedToken(token: unknown): boolean {
    const expected = process.env.SEED_TOKEN;
    if (!expected || typeof token !== "string" || token.length === 0) {
        return false;
    }
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
}
// Helper function to generate random number between min and max
const randomNumber = (min: number, max: number, fractionAllowed: boolean = false) => {
    if (fractionAllowed) {
        return (Math.random() * (max - min) + min).toFixed(1);
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
        ...entryTags,
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
    props: { params: Promise<{ userId: string }> }
) {
    const params = await props.params;
    try {
        const { userId } = params;
        const { days = 60, count = 180, seed_token } = await req.json();

        if (!isValidSeedToken(seed_token)) {
            return NextResponse.json(
                { error: "Invalid seed token" },
                { status: 401 }
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
                value: randomNumber(65, 80, true),
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
            Measurements.insertMany(
                encryptRows(measurementsData, ENCRYPTED_FIELDS.measurements)
            ),
            Weight.insertMany(encryptRows(weightData, ENCRYPTED_FIELDS.weight)),
            Glucose.insertMany(encryptRows(glucoseData, ENCRYPTED_FIELDS.glucose)),
            Insulin.insertMany(encryptRows(insulinData, ENCRYPTED_FIELDS.insulin)),
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
