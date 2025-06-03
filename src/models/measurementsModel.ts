import mongoose, { Document, Model } from "mongoose";

interface IMeasurements {
    arms: number;
    chest: number;
    abdomen: number;
    waist: number;
    hip: number;
    thighs: number;
    calves: number;
    user: mongoose.Types.ObjectId;
    tag?: string | null;
    createdAt: Date;
}

interface IMeasurementsDocument extends IMeasurements, Document {}

const measurementSchema = new mongoose.Schema<IMeasurementsDocument>(
    {
        arms: {
            type: Number,
            required: true,
        },
        chest: {
            type: Number,
            required: true,
        },
        abdomen: {
            type: Number,
            required: true,
        },
        waist: {
            type: Number,
            required: true,
        },
        hip: {
            type: Number,
            required: true,
        },
        thighs: {
            type: Number,
            required: true,
        },
        calves: {
            type: Number,
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

const Measurements: Model<IMeasurementsDocument> =
    mongoose.models.measurement ||
    mongoose.model<IMeasurementsDocument>("measurement", measurementSchema);

export default Measurements;
