import { Contact } from "./contact.model";

const contactUs = async (name: string, email: string, phone: string, message: string) => {
    const newContact = new Contact({
        name, phone, email, message
    });
    const result = await newContact.save();
    return result
};


export const contactServices = {
    contactUs
}
