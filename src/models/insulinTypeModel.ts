import mongoose from "mongoose";

const insulinTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: false });

const InsulinType = mongoose.models.insulintype || mongoose.model("insulintype", insulinTypeSchema);

export default InsulinType;