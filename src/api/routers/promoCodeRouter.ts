import express from 'express';
import { PromoCodeController } from '@src/controllers/promoCodeController';
import validateToken from '@src/middlewares/validateToken';
import Validator from '@src/middlewares/validator';
import { roleMiddleware } from '@src/middlewares/roleMiddleware';
import { UserStatus } from '@src/models/userModel';

const router = express.Router();
const promoCodeController = new PromoCodeController();

// =================|USER|=================

router.post('/remove/r', validateToken(), promoCodeController.removePromoCode);

router.post('/use-promo-code', validateToken(), Validator.validateFields({ required: ['promoCode'] }), promoCodeController.usePromoCode);

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

router.put('/update/:id', validateToken(), promoCodeController.isActive);

export default router;
