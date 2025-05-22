import mongoose from "mongoose";

const measurementSchema = new mongoose.Schema(
    {
        arms: {
            type: Number,
            required: true,
        },
        chest: {
            type: Number,
            required: true,
        },
        abdomen: {
            type: Number,
            required: true,
        },
        waist: {
            type: Number,
            required: true,
        },
        hip: {
            type: Number,
            required: true,
        },
        thighs: {
            type: Number,
            required: true,
        },
        calves: {
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

const Measurements =
    mongoose.models.measurement ||
    mongoose.model("measurement", measurementSchema);

export default Measurements;
