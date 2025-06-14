import mongoose, { Document, Model } from "mongoose";

export interface IGlucose {
    value: number;
    user: mongoose.Types.ObjectId;
    tag?: string | null;
    createdAt?: Date;
}

export interface IGlucoseDocument extends IGlucose, Document {}

const glucoseSchema = new mongoose.Schema<IGlucoseDocument>(
    {
        value: {
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

const Glucose: Model<IGlucoseDocument> =
    (mongoose.models.glucose as Model<IGlucoseDocument>) ||
    mongoose.model<IGlucoseDocument>("glucose", glucoseSchema);

export default Glucose;
