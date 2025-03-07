import { Types } from "mongoose";

export interface TProduct {
    _id?: Types.ObjectId;
    title: string;
    description: string;
    price: number;
    condition: 'new' | 'used';
    images: string[];
    userId: string;
    location: string;
    address: string;
    wishlist?: boolean;
    status?: 'available' | 'sold';
    permission?: 'pending' | 'accepted' | 'reject';
    category: 'electronics' | 'fashion' | 'for kids' | 'gadget accessories' | 'health & beauty' | 'hobbies sports' | 'home appliance' | 'laptop pc' | 'mobile' | 'video game consoles' | 'others' | 'vehicles' | 'services';
}
