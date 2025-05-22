import mongoose from "mongoose";

const insulinSchema = new mongoose.Schema(
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
            type: mongoose.Types.ObjectId,
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

const Insulin =
    mongoose.models.insulin || mongoose.model("insulin", insulinSchema);

export default Insulin;
