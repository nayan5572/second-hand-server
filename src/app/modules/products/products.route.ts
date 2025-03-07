import { Router } from 'express';
import auth from '../../middleware/auth';
import { ProductController } from './products.controller';
import { UserRole } from '../auth/auth.interface';
import { multerUpload } from '../../config/multer.config';
import { parseBody } from '../../middleware/bodyParser';
import validateRequest from '../../middleware/validateRequest';
import { productValidation } from './products.validation';
import alowAuth from '../../middleware/alowAuth';

const router = Router();

router.post(
    '/',
    alowAuth(UserRole.USER, UserRole.ADMIN),
    multerUpload.fields([{ name: 'images' }]),
    parseBody,
    validateRequest(productValidation.createProductValidationSchema),
    ProductController.createProduct
);

router.get('/', alowAuth(UserRole.USER, UserRole.ADMIN), ProductController.getAllProduct);
router.get('/by-admin', auth(UserRole.ADMIN), ProductController.getAllProductByAdmin);
router.get('/user-products', auth(UserRole.USER), ProductController.getAllUserProductHandler);
router.get('/:productId', ProductController.getSingleProduct);
router.patch('/:productId', auth(UserRole.USER), multerUpload.fields([{ name: 'images' }]), parseBody, ProductController.updateProduct);
router.delete('/:productId', auth(UserRole.USER), ProductController.deleteProduct);
router.patch('/:productId/permission', auth(UserRole.ADMIN), ProductController.permissionProduct)

export const ProductRoutes = router;
