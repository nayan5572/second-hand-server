import { model, Schema } from "mongoose";
import { TTransaction } from "./transactions.interface";

const transactionSchema = new Schema<TTransaction>({
    buyerID: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Buyer ID is required']
    },
    sellerID: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Seller ID is required']
    },
    item: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Item ID is required']
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    }
}, {
    timestamps: true,
});

export const Transaction = model<TTransaction>("Transaction", transactionSchema);
