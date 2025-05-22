import mongoose from "mongoose";

const glucoseSchema = new mongoose.Schema(
    {
        value: {
            type: Number,
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

const Glucose =
    mongoose.models.glucose || mongoose.model("glucose", glucoseSchema);

export default Glucose;
