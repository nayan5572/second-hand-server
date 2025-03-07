import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { IJwtPayload } from "../auth/auth.interface";
import sendResponse from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { wishlistServices } from "./wishlist.services";


const addWishlist = catchAsync(async (req: Request, res: Response) => {
    const { item } = req.body;
    const authUser = req.user as IJwtPayload;
    const result = await wishlistServices.addWishlist({ authUser, item });

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Wishlist add successfully",
        data: result,
    });
});
const getWishlist = catchAsync(async (req: Request, res: Response) => {
    const authUser = req.user as IJwtPayload;
    const result = await wishlistServices.getUserWishlist(req.query, authUser);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Wishlist product are retrieved successfully",
        data: result,
    });
});

const removeWishlist = catchAsync(async (req, res) => {
    const {
        params: { wishlistId },
    } = req;
    const authUser = req.user as IJwtPayload;

    const result = await wishlistServices.removeWishlist({ authUser, wishlistId } );
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Wishlist remove successfully!",
        data: result,
    });
});

export const wishlistController = {
    addWishlist, getWishlist, removeWishlist
}
