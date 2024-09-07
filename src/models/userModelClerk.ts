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
    },
    { timestamps: true }
);

const ClerkUser = mongoose.models.users || mongoose.model("users", userSchema);

export default ClerkUser;
