import express from 'express';
import { PromoCodeController } from '@src/controllers/promoCodeController';
import validateToken from '@src/middlewares/validateToken';
import Validator from '@src/middlewares/validator';
import { roleMiddleware } from '@src/middlewares/roleMiddleware';
import { UserStatus } from '@src/models/userModel';

const router = express.Router();
const promoCodeController = new PromoCodeController();

// =================|USER|=================

// =================|ADMIN|=================~

router.post(
  '/create',
  validateToken(),
  roleMiddleware(UserStatus.Manager),
  Validator.validateFields({
    required: ['discountType', 'description', 'promoCode'],
    optional: ['applicableProducts', 'usageLimit', 'minimumPurchaseValue'],
  }),
  promoCodeController.createPromoCode,
);

export default router;
