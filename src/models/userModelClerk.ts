import mongoose, { Document, Model } from "mongoose";

export type LayoutSettingType = "diabetes" | "fitness";

export interface IClerkUser {
    email: string;
    insulins: mongoose.Types.ObjectId[];
    password?: string;
    clerkUserId: string;
    layoutSettings: LayoutSettingType;
    trialExpiry: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IClerkUserDocument extends IClerkUser, Document {}

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        insulins: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "insulintype",
            },
        ],
        password: {
            type: String,
        },
        clerkUserId: {
            type: String,
            required: true,
            unique: true,
        },
        layoutSettings: {
            type: String,
            enum: ["diabetes", "fitness"],
            default: "diabetes",
        },
        trialExpiry: {
            type: Date,
            default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
    },
    { timestamps: true }
);

const ClerkUser: Model<IClerkUserDocument> =
    (mongoose.models.users as Model<IClerkUserDocument>) ||
    mongoose.model<IClerkUserDocument>("users", userSchema);

export default ClerkUser;
