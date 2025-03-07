import { StatusCodes } from 'http-status-codes';
import { TProduct } from './products.interface';
import { IImageFiles } from '../../interface/IImageFile';
import { IJwtPayload } from '../auth/auth.interface';
import AppError from '../../error/AppError';
import { Product } from './products.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { AuthUser } from '../auth/auth.model';
import mongoose, { Types } from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';
import { Wishlist } from '../wishlist/wishlist.model';
import { Transaction } from '../transactions/transactions.model';
import { sendEmail } from '../../utils/sendEmail';

const createProduct = async (
    productData: Partial<TProduct>,
    productImages: IImageFiles,
    authUser: IJwtPayload
) => {

    const { images } = productImages;
    if (!images || images.length === 0) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'Product images are required.'
        );
    }

    productData.images = images.map((image) => image.path);
    productData.userId = authUser.userId
    const newProduct = new Product(productData);
    const result = await newProduct.save();
    const replacements = {
        userName: authUser.name,
        adTitle: productData.title || 'No title available',
        condition: productData.condition || 'Unknown condition',
        adCategory: productData.category || 'Unknown category',
        adLink: `https://second-hand-client-dc3y.vercel.app/products/${result._id}`
    };
    await sendEmail(authUser.email, 'Your project created successfully', 'projectCreateHtml', replacements);

    return result;
};



const getAllProduct = async (query: Record<string, unknown>, authUser: JwtPayload) => {
    const {
        minPrice,
        maxPrice,
        categories,
        ...pQuery
    } = query;

    const productQuery = new QueryBuilder(
        Product.find({
            permission: { $nin: ['pending', 'reject'] },
            // status: {$ne: 'sold'}
        })
            .populate('userId', 'name phoneNumber'),
        pQuery
    )
        .search(['title', 'description'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .priceRange(Number(minPrice) || 0, Number(maxPrice) || Infinity);
    const products = await productQuery.modelQuery.lean();
    if (authUser) {
        const wishlist = await Wishlist.find({ userId: authUser.userId }).lean();
        const wishlistProductIds = new Set(wishlist.map((item) => item.product.toString()));
        products.forEach((product: any) => {
            product.wishlist = wishlistProductIds.has(product._id.toString());
        });
    }
    const meta = await productQuery.countTotal();

    return {
        meta,
        result: products,
    };
};



const getAllProductByAdmin = async (query: Record<string, unknown>) => {
    const {
        minPrice,
        maxPrice,
        categories,
        ...pQuery
    } = query;
    const productQuery = new QueryBuilder(
        Product.find()
            .populate('userId', 'name phoneNumber'),
        pQuery
    )
        .search(['title', 'description'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .priceRange(Number(minPrice) || 0, Number(maxPrice) || Infinity);

    const products = await productQuery.modelQuery.lean();

    const meta = await productQuery.countTotal();


    return {
        meta,
        result: products,
    };
};



const getAllUserProduct = async (query: Record<string, unknown>, userID: string) => {
    const {
        minPrice,
        maxPrice,
        categories,
        ...pQuery
    } = query;
    const productQuery = new QueryBuilder(
        Product.find({ userId: userID })
            .populate('userId', 'name phoneNumber'),
        pQuery
    )
        .search(['title', 'description'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .priceRange(Number(minPrice) || 0, Number(maxPrice) || Infinity);

    const products = await productQuery.modelQuery.lean();
    const meta = await productQuery.countTotal();

    return {
        meta,
        result: products,
    };
};

const getSingleProduct = async (productId: string) => {
    const product = await Product.findById(productId).populate('userId', 'name phoneNumber email _id')

    if (!product) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
    }
    return {
        product
    };
};

const updateProduct = async (
    productId: string,
    payload: Partial<TProduct>,
    productImages: IImageFiles,
    authUser: IJwtPayload
) => {
    const { images } = productImages;


    const user = await AuthUser.findById(authUser.userId);

    if (user?.ban) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'User is not active');
    }
    const product = await Product.findById(productId);

    if (!product) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Product Not Found');
    }

    if (images && images.length > 0) {
        payload.images = images.map((image) => image.path);
    }

    return await Product.findByIdAndUpdate(productId, payload, { new: true });
};


const deleteProduct = async (productId: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const product = await Product.findById(productId).session(session);
        const user = await AuthUser.findById(product?.userId);
        if (!product) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Product Not Found');
        }
        const wishlist = await Wishlist.deleteMany({ product: productId }).session(session);
        if (!wishlist) {
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete product');
        }

        const transaction = await Transaction.deleteMany({ item: productId }).session(session);
        if (!transaction) {
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete product');
        }
        const deletedProduct = await Product.findByIdAndDelete(productId).session(session);
        if (!deletedProduct) {
            throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete product');
        }

        const replacements = {
            userName: user?.name || "Dear",
            adTitle: product.title || 'No title available',
            condition: product.condition || 'Unknown condition',
            adCategory: product.category || 'Unknown category',
        };
        if (user) {
            await sendEmail(user.email, 'Your project has been delete successfully', 'deleteAdsHtml', replacements);
        }

        await session.commitTransaction();
        session.endSession();

        return deletedProduct;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const permissionProduct = async (productId: string, payload: { permission: string }) => {

    const product = await Product.findById(productId);
    const user = await AuthUser.findById(product?.userId);
    if (!product) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Product not found!');
    }
    const completePermission = await Product.findByIdAndUpdate(
        productId,
        { permission: payload.permission },
        { new: true }
    );
    const replacements = {
        userName: user?.name || "Dear",
        adTitle: product.title || 'No title available',
        condition: product.condition || 'Unknown condition',
        adCategory: product.category || 'Unknown category',
        adLink: `https://second-hand-client-dc3y.vercel.app/products/${product._id}`
    };
    if (user) {
        await sendEmail(user.email, 'Your project available for sell', 'ApprovedAdds', replacements);
    }

    return completePermission;
};



export const ProductService = {
    createProduct, getAllProduct, getAllUserProduct, getSingleProduct, updateProduct, deleteProduct, getAllProductByAdmin, permissionProduct
}
