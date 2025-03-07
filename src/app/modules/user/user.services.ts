import { StatusCodes } from "http-status-codes";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../error/AppError";
import { AuthUser } from "../auth/auth.model";

const getAllUser = async (query: Record<string, unknown>) => {
    const {...pQuery } = query;

    const userQuery = new QueryBuilder(AuthUser.find(), pQuery)
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
const deleteUser = async (userId: string) => {

    const user = await AuthUser.findById(userId);
    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, 'User Not Found');
    }

    const deletedUser = await AuthUser.findByIdAndDelete(userId);
    if (!deletedUser) {
        throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete product');
    }
    return deletedUser;
};


export const userServices = {
    getAllUser, deleteUser
}
