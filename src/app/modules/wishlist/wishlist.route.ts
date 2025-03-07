import { Router } from 'express';
import auth from '../../middleware/auth';
import { UserRole } from '../auth/auth.interface';
import { wishlistController } from './wishlist.controller';

const router = Router();


router.post('/', auth(UserRole.USER , UserRole.ADMIN), wishlistController.addWishlist);
router.get('/', auth(UserRole.USER , UserRole.ADMIN), wishlistController.getWishlist);
router.delete('/:wishlistId', auth(UserRole.USER , UserRole.ADMIN), wishlistController.removeWishlist);


export const wishlistRoute = router;
