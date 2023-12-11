import express from 'express';
import CartController from '@src/controllers/cartController';
import validateToken from '@src/middlewares/validateToken';
import Validator from '@src/middlewares/validator';
import { Product } from '@src/models/productModel';
import { Constant } from '@src/utils/constant';

const router = express.Router();
const cartController = new CartController();

/**
 * @openapi
 * /api/cart/{id}:
 *   post:
 *     tags:
 *       - Cart Routes
 *     summary: Add item to cart
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/CartRequest'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartResponse'
 */
// Add item to cart
router.post('/:id', validateToken(true), Validator.validateIds([{ paramName: 'id', model: Product, type: Constant.Product }]), cartController.addToCart);

/**
 * @openapi
 * /api/cart/:
 *   get:
 *     tags:
 *       - Cart Routes
 *     summary: Get cart items
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartResponse'
 */
// Get cart items
router.get('/', validateToken(true), cartController.getCartItems);

/**
 * @openapi
 * /api/cart/:
 *   put:
 *     tags:
 *       - Cart Routes
 *     summary: Update cart items
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/CartPutRequest'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartResponse'
 */
// Update cart items
router.put(
  '/',
  validateToken(true),
  Validator.validateFields({
    required: ['action'],
    optional: ['id', 'quantity'],
  }),
  cartController.updateCart,
);

export default router;
