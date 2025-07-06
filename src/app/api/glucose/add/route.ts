import { connectDB } from "@/dbConfig/connectDB";
import Glucose from "@/models/glucoseModel";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import { decryptDocumentFields } from "@/lib/mongooseEncryption";

connectDB();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { value, date, tag } = body;
        const user = await getUserObjectId();

        const payload = {
            value: value,
            user: user,
            tag: tag,
        };

        if (date) {
            payload["createdAt"] = date;
        }

        const glucoseDoc = new Glucose(payload);
        const entry = await glucoseDoc.save();

        // Manually decrypt the document since mongoose hooks might not work as expected
        const decryptedEntry = decryptDocumentFields(
            entry.toObject(),
            ["value", "tag"],
            true, // storeAsString
            false, // handleArrays
            false // handleNested
        );

        return NextResponse.json({
            entry: decryptedEntry,
            message: "Glucose Entry added!",
        });
    } catch (error) {
        console.log("Error adding Glucose" + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
