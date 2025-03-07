import { Types } from "mongoose";
import { TProduct } from "../products/products.interface";

export interface TWishlist {
    _id?: Types.ObjectId;
    product: Types.ObjectId | TProduct
    userId: Types.ObjectId
}
