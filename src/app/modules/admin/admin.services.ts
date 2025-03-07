import mongoose from "mongoose"
import { AuthUser } from "../auth/auth.model"
import AppError from "../../error/AppError"

// user ban services
const adminBlockUserFromDB = async (id: string) => {
    const session = await mongoose.startSession()

    try {
        session.startTransaction()

        const user = await AuthUser.findById(id)
        if (!user || !user._id) {
            throw new AppError(404, 'User not found!')
        }

        const newBanStatus = !user.ban;
        const blockUser = await AuthUser.findByIdAndUpdate(
            id,
            { ban: newBanStatus },
            { new: true, session }
        )

        await session.commitTransaction()
        await session.endSession()

        return blockUser
    } catch (error: any) {
        await session.abortTransaction()
        await session.endSession()
        throw new AppError(500, error.message || error)
    }
}


export const adminServices = {
    adminBlockUserFromDB,
}
