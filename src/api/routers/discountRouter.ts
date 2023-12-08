import express from "express";
import { DiscountController } from "@src/controllers/discountController";
import validateToken from "@src/middlewares/validateToken";
import Validator from "@src/middlewares/validator";
import { Discount } from "@src/models/dicountModel";
import { Constant } from "@src/utils/constant";
import { Product } from "@src/models/productModel";

const router = express.Router()
const discountController = new DiscountController();

// =================|USER|=================



// =================|ADMIN|=================

router.post('/', validateToken(), Validator.validateFields({ required: ['description', 'discountType', 'applicableProducts'], optional: ['isActive', 'promoCode', 'isPromoCode', 'usageLimit', 'minimumPurchaseValue'] }), discountController.createDiscount)

router.put('/update/:id', validateToken(), Validator.validateFields({ optional: ['description', 'discountType', 'isActive', 'promoCode', 'isPromoCode', 'usageLimit', 'minimumPurchaseValue'] }), Validator.validateIds([{ paramName: 'id', model: Discount, type: Constant.Discount }]), discountController.updateDiscount)

router.put('/add/:id', validateToken(), Validator.validateFields({ required: ['productId']}), Validator.validateIds([{ paramName: 'id', model: Discount, type: Constant.Discount}]) , discountController.addProductToDiscount)

router.put('/remove/:id', validateToken(), Validator.validateFields({ required: ['productId']}), Validator.validateIds([{ paramName: "id", model: Discount, type: Constant.Discount}]), discountController.removeProductFromDiscount)

router.delete('/:id', validateToken(), Validator.validateIds([{ paramName: 'id', model: Discount, type: Constant.Discount }]), discountController.deleteDiscount)


export default router;