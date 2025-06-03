import mongoose, { Document, Model } from "mongoose";

export interface IContactUs {
    name: string;
    email: string;
    message: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IContactUsDocument extends IContactUs, Document {}

const contactUsSchema = new mongoose.Schema(
    {
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
    },
    { timestamps: true }
);

const ContactUs: Model<IContactUsDocument> =
    (mongoose.models.contactus as Model<IContactUsDocument>) ||
    mongoose.model<IContactUsDocument>("contactus", contactUsSchema);

export default ContactUs;
