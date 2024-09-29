import mongoose from "mongoose";

const contactUsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const ContactUs = mongoose.models.contactus || mongoose.model("contactus", contactUsSchema);

export default ContactUs;