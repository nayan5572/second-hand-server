import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { contactServices } from "./contact.services";



const contactUs = catchAsync(async (req: Request, res: Response) => {
    const { name, email, phone, message } = req.body;
    const result = await contactServices.contactUs(name, email, phone, message);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Message sent successfully",
        data: result,
    });
});

export const contactController = {
    contactUs
}
