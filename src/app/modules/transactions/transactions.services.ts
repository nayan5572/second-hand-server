import { JwtPayload } from "jsonwebtoken";
import { Transaction } from "./transactions.model";
import AppError from "../../error/AppError";
import QueryBuilder from "../../builder/QueryBuilder";
import { StatusCodes } from "http-status-codes";
import { Product } from "../products/products.model";
import mongoose from "mongoose";
import { sendEmail } from "../../utils/sendEmail";



const createNewTransaction = async ({ authUser, sellerID, item }: { authUser: JwtPayload, sellerID: string, item: string }) => {
    const existingTransaction = await Transaction.findOne({ buyerID: authUser.userId, sellerID, item });
    const product = await Product.findById(item);
    if (existingTransaction) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'You have already purchased this item from this seller');
    }
    const data = {
        buyerID: authUser.userId,
        sellerID,
        item
    };
    const transaction = new Transaction(data);
    const result = await transaction.save();
    if (product) {
        const replacements = {
            userName: authUser?.name || "Dear",
            adTitle: product.title || 'No title available',
            condition: product.condition || 'Unknown condition',
            adCategory: product.category || 'Unknown category',
            adLink: `https://second-hand-client-dc3y.vercel.app/dashboard/purchase-history`
        };
        await sendEmail(authUser.email, 'Your project available for sell', 'PurchaseHtml', replacements);
    }

    return result;
};

const getUserBuyerTransactions = async (query: Record<string, unknown>, userId: JwtPayload) => {
    const { ...pQuery } = query;
    const userQuery = new QueryBuilder(Transaction.find({ buyerID: userId.userId }).populate('sellerID', 'name phoneNumber').populate('item').populate('buyerID', 'name phoneNumber')
        , pQuery)
        .search(['name', 'email'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const users = await userQuery.modelQuery.lean();
    const meta = await userQuery.countTotal();

    return {
        meta,
        result: users,
    };
};

const getUserSellerIdTransactions = async (query: Record<string, unknown>, userId: JwtPayload) => {
    const { ...pQuery } = query;
    const userQuery = new QueryBuilder(Transaction.find({ sellerID: userId.userId }).populate('sellerID', 'name phoneNumber').populate('item').populate('buyerID', 'name phoneNumber')
        , pQuery)
        .search(['name', 'email'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const users = await userQuery.modelQuery.lean();
    const meta = await userQuery.countTotal();

    return {
        meta,
        result: users,
    };
};

const transactionComplete = async (id: string, userId: JwtPayload) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const transaction = await Transaction.findById(id).session(session);
        if (!transaction) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Transaction not found!');
        }
        if (transaction.sellerID.toString() !== userId.userId) {
            throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized!');
        }
        const product = await Product.findByIdAndUpdate(
            transaction.item,
            { status: 'sold' },
            { new: true, session }
        );

        if (!product) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Product not found!');
        }
        const completeTransaction = await Transaction.findByIdAndUpdate(
            id,
            { status: 'completed' },
            { new: true, session }
        );

        if (!completeTransaction) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Transaction update failed!');
        }

        await session.commitTransaction();
        await session.endSession()
        return completeTransaction;
    } catch (error: any) {
        await session.abortTransaction()
        await session.endSession()
        throw new AppError(500, error.message || error)
    }
};

const deleteTransactions = async (transactionId: string) => {

    const product = await Transaction.findById(transactionId);
    if (!product) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Product Not Found');
    }

    const deletedProduct = await Transaction.findByIdAndDelete(transactionId);
    if (!deletedProduct) {
        throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete product');
    }
    return deletedProduct;
};

export const transactionServices = {
    createNewTransaction,
    getUserSellerIdTransactions,
    getUserBuyerTransactions,
    transactionComplete,
    deleteTransactions
}
