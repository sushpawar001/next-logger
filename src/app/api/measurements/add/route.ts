import { connectDB } from "@/dbConfig/connectDB";
import Measurements from "@/models/measurementsModel";
import { NextRequest, NextResponse } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import { decryptDocumentFields } from "@/lib/mongooseEncryption";

connectDB();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { arms, chest, abdomen, waist, hip, thighs, calves, tag } =
            body.measurements;
        const user = await getUserObjectId();
        const measurementsDoc = new Measurements({
            arms,
            chest,
            abdomen,
            waist,
            hip,
            thighs,
            calves,
            user,
            tag,
        });
        const entry = await measurementsDoc.save();

        // Manually decrypt the document since mongoose hooks might not work as expected
        const decryptedEntry = decryptDocumentFields(
            entry.toObject(),
            [
                "arms",
                "chest",
                "abdomen",
                "waist",
                "hip",
                "thighs",
                "calves",
                "tag",
            ],
            true, // storeAsString
            false, // handleArrays
            false // handleNested
        );

        return NextResponse.json({
            entry: decryptedEntry,
            message: "Measurements added!",
        });
    } catch (error) {
        console.log("Error adding Measurements" + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
