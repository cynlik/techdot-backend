import express from 'express';
import CartController from '@src/controllers/cartController';
import validateToken from '@src/middlewares/validateToken';
import Validator from '@src/middlewares/validator';
import { Product } from '@src/models/productModel';
import { Constant } from '@src/utils/constant';

const router = express.Router();
const cartController = new CartController();

// Add item to cart
router.post("/:id", validateToken(), Validator.validateIds([{ paramName: "id", model: Product, type: Constant.Product }]), cartController.addToCart);

// Get cart items
router.get("/", validateToken(), cartController.getCartItems);

// Update cart items
router.put("/", validateToken(), Validator.validateFields({ required: ["action"], optional: ["id", "quantity"] }), cartController.updateCart);

export default router;