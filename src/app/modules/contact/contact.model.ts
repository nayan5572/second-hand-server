

import { model, Schema } from "mongoose";
import { TContact } from "./contact.interface";

const contactSchema = new Schema<TContact>({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required']
    },
    phone: {
        type: String,
        required: [true, 'Phone is required']
    },
    message: {
        type: String,
        required: [true, 'Message is required']
    },
}, {
    timestamps: true,
});

export const Contact = model<TContact>("Contact", contactSchema);
