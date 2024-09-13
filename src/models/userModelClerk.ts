import mongoose from "mongoose";

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
            default: Date.now() + 30 * 24 * 60 * 60 * 1000,
        },
    },
    { timestamps: true }
);

const ClerkUser = mongoose.models.users || mongoose.model("users", userSchema);

export default ClerkUser;
