import express from 'express';
import { DiscountController } from '@src/controllers/discountController';
import validateToken from '@src/middlewares/validateToken';
import Validator from '@src/middlewares/validator';
import { Discount } from '@src/models/dicountModel';
import { Constant } from '@src/utils/constant';
import { Product } from '@src/models/productModel';
import { roleMiddleware } from '@src/middlewares/roleMiddleware';
import { UserStatus } from '@src/models/userModel';

const router = express.Router();
const discountController = new DiscountController();

// =================|USER|=================

// =================|ADMIN|=================~

router.post(
  '/create',
  validateToken(),
  roleMiddleware(UserStatus.Manager),
  Validator.validateFields({
    required: ['description', 'discountType', 'applicableProducts'],
  }),
  discountController.createDiscount,
);

router.put(
  '/update/:id',
  validateToken(),
  roleMiddleware(UserStatus.Manager),
  Validator.validateFields({
    optional: ['description', 'discountType', 'promoCode', 'isPromoCode', 'usageLimit', 'minimumPurchaseValue'],
  }),
  Validator.validateIds([{ paramName: 'id', model: Discount, type: Constant.Discount }]),
  discountController.updateDiscount,
);

router.put(
  '/stateOfIsActive/:id',
  validateToken(),
  roleMiddleware(UserStatus.Manager),
  Validator.validateFields({ required: ['isActive'] }),
  Validator.validateIds([{ paramName: 'id', model: Discount, type: Constant.Discount }]),
  discountController.stateOfIsActive,
);

router.put(
  '/add/:id',
  validateToken(),
  roleMiddleware(UserStatus.Manager),
  Validator.validateFields({ required: ['productId'] }),
  Validator.validateIds([{ paramName: 'id', model: Discount, type: Constant.Discount }]),
  discountController.addProductToDiscount,
);

router.put(
  '/remove/:id',
  validateToken(),
  roleMiddleware(UserStatus.Manager),
  Validator.validateFields({ required: ['productId'] }),
  Validator.validateIds([{ paramName: 'id', model: Discount, type: Constant.Discount }]),
  discountController.removeProductFromDiscount,
);

router.delete('/:id', validateToken(), roleMiddleware(UserStatus.Manager), Validator.validateIds([{ paramName: 'id', model: Discount, type: Constant.Discount }]), discountController.deleteDiscount);

router.get('/solo/:id', validateToken(), roleMiddleware(UserStatus.Manager), Validator.validateIds([{ paramName: 'id', model: Discount, type: Constant.Discount }]), discountController.getDiscountByID);

router.get(
  '/query/',
  validateToken(),
  roleMiddleware(UserStatus.Manager),
  Validator.validateFields({
    optional: ['description', 'sort', 'page', 'limit', 'isActive', 'promoCode'],
  }),
  discountController.getDiscountByName,
);

export default router;
