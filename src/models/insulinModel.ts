import mongoose, { Document, Model } from "mongoose";
import { addEncryptionHooks } from "../lib/mongooseEncryption";

interface IInsulin {
    units: string;
    name: string;
    user: mongoose.Types.ObjectId;
    tag?: string | null;
    createdAt: Date;
}

interface IInsulinDocument extends IInsulin, Document {}

const insulinSchema = new mongoose.Schema<IInsulinDocument>(
    {
        units: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        tag: {
            type: String,
            default: null,
        },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

// Add encryption hooks for sensitive fields
addEncryptionHooks(insulinSchema, {
    config: {
        fields: ["units", "name", "tag"],
        encryptOnSave: true,
        decryptOnRead: true,
        storeAsString: true, // Store encrypted data as strings for better compatibility
        handleArrays: false,
        handleNested: false,
    },
    debug: process.env.NODE_ENV === "development", // Enable debug logs in development
    onError: (error, operation, field) => {
        console.error(
            `Encryption error during ${operation} for field ${field}:`,
            error
        );
    },
});

const Insulin: Model<IInsulinDocument> =
    mongoose.models.insulin ||
    mongoose.model<IInsulinDocument>("insulin", insulinSchema);

export default Insulin;
