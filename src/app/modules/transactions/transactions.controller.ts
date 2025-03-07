import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { IJwtPayload } from "../auth/auth.interface";
import { Request, Response } from "express";
import { transactionServices } from "./transactions.services";


const createNewTransaction = catchAsync(async (req: Request, res: Response) => {
    const { sellerID, item } = req.body;
    const authUser = req.user as IJwtPayload;
    const result = await transactionServices.createNewTransaction({ authUser, sellerID, item });

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Message sent successfully",
        data: result,
    });
});
const getUserBuyerTransactions = catchAsync(async (req: Request, res: Response) => {
    const result = await transactionServices.getUserBuyerTransactions(req.query, req.user as IJwtPayload);
    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Buyer transaction retrieved successfully",
        data: result,
    });
});
const getUserSellerTransactions = catchAsync(async (req: Request, res: Response) => {
    const result = await transactionServices.getUserSellerIdTransactions(req.query, req.user as IJwtPayload);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Seller transaction retrieved successfully",
        data: result,
    });
});
const getConfirmTransactions = catchAsync(async (req: Request, res: Response) => {
    const item = req.params.transactionId;
    const result = await transactionServices.transactionComplete(item, req.user as IJwtPayload);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Sell complete retrieved successfully",
        data: result,
    });
});
const deleteTransactions = catchAsync(async (req: Request, res: Response) => {
    const item = req.params.transactionId;
    const result = await transactionServices.deleteTransactions(item);
    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Transaction delete successfully",
        data: result,
    });
});

export const transactionsServices = {
    createNewTransaction,
    getUserBuyerTransactions,
    getUserSellerTransactions,
    getConfirmTransactions,
    deleteTransactions
}
