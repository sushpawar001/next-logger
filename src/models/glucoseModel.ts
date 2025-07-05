import mongoose, { Document, Model } from "mongoose";
import { addEncryptionHooks } from "../lib/mongooseEncryption";

export interface IGlucose {
    value: string;
    user: mongoose.Types.ObjectId;
    tag?: string | null;
    createdAt?: Date;
}

export interface IGlucoseDocument extends IGlucose, Document {}

const glucoseSchema = new mongoose.Schema<IGlucoseDocument>(
    {
        value: {
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
addEncryptionHooks(glucoseSchema, {
    config: {
        fields: ["value", "tag"],
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

const Glucose: Model<IGlucoseDocument> =
    (mongoose.models.glucose as Model<IGlucoseDocument>) ||
    mongoose.model<IGlucoseDocument>("glucose", glucoseSchema);

export default Glucose;
