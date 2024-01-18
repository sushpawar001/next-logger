import mongoose from "mongoose";

const weightSchema = new mongoose.Schema({
    value: {
        type: Number,
        required: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: true
    },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: false });

const Weight = mongoose.models.weight || mongoose.model("weight", weightSchema);

export default Weight;