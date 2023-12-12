import express from 'express';
import { DiscountController } from '@src/controllers/discountController';
import validateToken from '@src/middlewares/validateToken';
import Validator from '@src/middlewares/validator';
import { roleMiddleware } from '@src/middlewares/roleMiddleware';
import { UserStatus } from '@src/models/userModel';

const router = express.Router();
const discountController = new DiscountController();

// =================|USER|=================

// =================|ADMIN|=================~

router.post(
  '/create-promo',
  validateToken(),
  roleMiddleware(UserStatus.Manager),
  Validator.validateFields({
    required: ['discountType', 'description', 'promoCode'],
    optional: ['applicableProducts', 'usageLimit', 'minimumPurchaseValue'],
  }),
  discountController.createPromoCode,
);

export default router;
