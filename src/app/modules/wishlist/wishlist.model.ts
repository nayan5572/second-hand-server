import { model, Schema, Types } from "mongoose";
import { TWishlist } from "./wishlist.interface";


const wishlistSchema = new Schema<TWishlist>({
    product: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Product",
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
}, {
    timestamps: true,
});

export const Wishlist = model<TWishlist>("Wishlist", wishlistSchema);
