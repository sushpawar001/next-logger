import mongoose, { Document, Model } from "mongoose";
import { addEncryptionHooks } from "../lib/mongooseEncryption";

interface IMeasurements {
    arms: string;
    chest: string;
    abdomen: string;
    waist: string;
    hip: string;
    thighs: string;
    calves: string;
    user: mongoose.Types.ObjectId;
    tag?: string | null;
    createdAt: Date;
}

interface IMeasurementsDocument extends IMeasurements, Document {}

const measurementSchema = new mongoose.Schema<IMeasurementsDocument>(
    {
        arms: {
            type: String,
            required: true,
        },
        chest: {
            type: String,
            required: true,
        },
        abdomen: {
            type: String,
            required: true,
        },
        waist: {
            type: String,
            required: true,
        },
        hip: {
            type: String,
            required: true,
        },
        thighs: {
            type: String,
            required: true,
        },
        calves: {
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
addEncryptionHooks(measurementSchema, {
    config: {
        fields: [
            "arms",
            "chest",
            "abdomen",
            "waist",
            "hip",
            "thighs",
            "calves",
            "tag",
        ],
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

const Measurements: Model<IMeasurementsDocument> =
    mongoose.models.measurement ||
    mongoose.model<IMeasurementsDocument>("measurement", measurementSchema);

export default Measurements;
