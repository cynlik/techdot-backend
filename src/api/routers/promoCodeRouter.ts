import express from 'express';
import { PromoCodeController } from '@src/controllers/promoCodeController';
import validateToken from '@src/middlewares/validateToken';
import Validator from '@src/middlewares/validator';
import { roleMiddleware } from '@src/middlewares/roleMiddleware';
import { UserStatus } from '@src/models/userModel';

const router = express.Router();
const promoCodeController = new PromoCodeController();

// =================|USER|=================

router.post('/use-promo-code', validateToken(), roleMiddleware(UserStatus.Manager), Validator.validateFields({ required: ['promoCode'] }), promoCodeController.usePromoCode);

router.post('/remove/:id', validateToken(), roleMiddleware(UserStatus.Manager), promoCodeController.removePromoCode);

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
