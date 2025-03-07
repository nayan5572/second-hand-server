import { Types } from "mongoose";

export interface TTransaction {
    _id?: Types.ObjectId;
    buyerID: Types.ObjectId;
    sellerID: Types.ObjectId;
    item: Types.ObjectId;
    status?: 'pending' | 'completed'
}
