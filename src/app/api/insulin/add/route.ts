import { connectDB } from "@/dbConfig/connectDB";
import Insulin from "@/models/insulinModel";
import { NextResponse, NextRequest } from "next/server";
import { getUserObjectId } from "@/helpers/getUserObjectId";
import { decryptDocumentFields } from "@/lib/mongooseEncryption";

connectDB();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { units, name, date, tag } = body;
        const user = await getUserObjectId();

        const payload = {
            units: units,
            user: user,
            tag: tag,
            name: name,
        };

        if (date) {
            payload["createdAt"] = date;
        }

        const insulinDoc = new Insulin(payload);
        const entry = await insulinDoc.save();

        // Manually decrypt the document since mongoose hooks might not work as expected
        const decryptedEntry = decryptDocumentFields(
            entry.toObject(),
            ["units", "name", "tag"],
            true, // storeAsString
            false, // handleArrays
            false // handleNested
        );

        return NextResponse.json({
            entry: decryptedEntry,
            message: `${name} insulin Entry added!`,
        });
    } catch (error) {
        console.log("Error adding Insulin" + error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
