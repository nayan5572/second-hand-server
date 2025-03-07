import { Router } from "express";
import { UserRoute } from "../modules/auth/auth.route";
import { AdminRoute } from "../modules/admin/admin.route";
import { ProductRoutes } from "../modules/products/products.route";
import { userRoutes } from "../modules/user/user.route";
import { messageRoute } from "../modules/message/message.route";
import { transactionsRoute } from "../modules/transactions/transactions.rotue";
import { wishlistRoute } from "../modules/wishlist/wishlist.route";
import { contactRoute } from "../modules/contact/contact.route";


const router = Router()

const moduleRoutes = [
    {
        path: '/auth',
        route: UserRoute
    },
    {
        path: '/admin',
        route: AdminRoute
    },
    {
        path: '/listings',
        route: ProductRoutes,
    },
    {
        path: '/users',
        route: userRoutes,
    },
    {
        path: '/message',
        route: messageRoute,
    },
    {
        path: '/transactions',
        route: transactionsRoute,
    },
    {
        path: '/wishlist',
        route: wishlistRoute,
    },
    {
        path: '/contact',
        route: contactRoute,
    },
]

moduleRoutes.forEach((route) => router.use(route.path, route.route))

export default router
