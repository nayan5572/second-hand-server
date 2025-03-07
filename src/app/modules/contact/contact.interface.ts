import { Types } from "mongoose";


export interface TContact {
    _id?: Types.ObjectId;
    name: string;
    phone: string;
    message: string;
    email: string;
}
