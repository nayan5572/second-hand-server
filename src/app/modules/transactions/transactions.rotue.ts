import { Router } from 'express';
import auth from '../../middleware/auth';
import { UserRole } from '../auth/auth.interface';
import { transactionsServices } from './transactions.controller';

const router = Router();


router.post('/', auth(UserRole.USER , UserRole.ADMIN), transactionsServices.createNewTransaction);
router.get('/purchases', auth(UserRole.USER , UserRole.ADMIN), transactionsServices.getUserBuyerTransactions);
router.get('/sales', auth(UserRole.USER , UserRole.ADMIN), transactionsServices.getUserSellerTransactions);
router.patch('/:transactionId', auth(UserRole.USER , UserRole.ADMIN), transactionsServices.getConfirmTransactions);
router.delete('/:transactionId', auth(UserRole.USER , UserRole.ADMIN), transactionsServices.deleteTransactions);

export const transactionsRoute = router;
