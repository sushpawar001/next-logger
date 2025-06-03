import mongoose, { Document, Model } from "mongoose";

interface IUser {
    email: string;
    password: string;
    insulins: mongoose.Types.ObjectId[];
    isVerfied: boolean;
    forgotPasswordToken?: string;
    forgotPasswordTokenExpiry?: Date;
    verifyToken?: string;
    verifyTokenExpiry?: Date;
    createdAt: Date;
    updatedAt: Date;
}

interface IUserDocument extends IUser, Document {}

const userSchema = new mongoose.Schema<IUserDocument>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        insulins: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "insulintype",
            },
        ],
        isVerfied: {
            type: Boolean,
            default: false,
        },
        forgotPasswordToken: String,
        forgotPasswordTokenExpiry: Date,
        verifyToken: String,
        verifyTokenExpiry: Date,
    },
    { timestamps: true }
);

const User: Model<IUserDocument> =
    mongoose.models.users || mongoose.model<IUserDocument>("users", userSchema);

export default User;
