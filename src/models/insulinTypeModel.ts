import mongoose, { Document, Model } from "mongoose";

export interface IInsulinType {
    name: string;
    createdAt?: Date;
}

export interface IInsulinTypeDocument extends IInsulinType, Document {}

const insulinTypeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            required: true,
        },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

const InsulinType: Model<IInsulinTypeDocument> =
    (mongoose.models.insulintype as Model<IInsulinTypeDocument>) ||
    mongoose.model<IInsulinTypeDocument>("insulintype", insulinTypeSchema);

export default InsulinType;
