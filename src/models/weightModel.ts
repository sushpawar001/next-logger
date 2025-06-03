import mongoose, { Document, Model } from "mongoose";

interface IWeight {
    value: number;
    user: mongoose.Types.ObjectId;
    tag?: string | null;
    createdAt: Date;
}

interface IWeightDocument extends IWeight, Document {}

const weightSchema = new mongoose.Schema<IWeightDocument>(
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

const Weight: Model<IWeightDocument> =
    mongoose.models.weight ||
    mongoose.model<IWeightDocument>("weight", weightSchema);

export default Weight;
