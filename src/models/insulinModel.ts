import mongoose, { Document, Model } from "mongoose";

interface IInsulin {
    units: number;
    name: string;
    user: mongoose.Types.ObjectId;
    tag?: string | null;
    createdAt: Date;
}

interface IInsulinDocument extends IInsulin, Document {}

const insulinSchema = new mongoose.Schema<IInsulinDocument>(
    {
        units: {
            type: Number,
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

const Insulin: Model<IInsulinDocument> =
    mongoose.models.insulin ||
    mongoose.model<IInsulinDocument>("insulin", insulinSchema);

export default Insulin;
