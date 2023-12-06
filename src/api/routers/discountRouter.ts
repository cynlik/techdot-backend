import express  from "express";
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

router.post('/', validateToken(), Validator.validateFields({ required: ['description', 'applicableProducts'], optional: ['isActive']}) ,Validator.validateIds([{ paramName: "applicableProducts", model: Product, type: Constant.Product}]), discountController.createDiscount)

router.put('/:id', validateToken(), Validator.validateFields({optional: ['description', 'applicableProducts', 'discountType']}), discountController.updateDiscount)

router.delete('/:id', validateToken(), Validator.validateIds([{ paramName: 'id', model: Discount, type: Constant.Discount}]), discountController.deleteDiscount)


export default router;