import express from 'express';
import { PromoCodeController } from '@src/controllers/promoCodeController';
import validateToken from '@src/middlewares/validateToken';
import Validator from '@src/middlewares/validator';
import { roleMiddleware } from '@src/middlewares/roleMiddleware';
import { UserStatus } from '@src/models/userModel';

const router = express.Router();
const promoCodeController = new PromoCodeController();

// =================|USER|=================

/**
 * @openapi
 * /api/promo/remove:
 *   post:
 *     tags:
 *       - Promo Code
 *     summary: Remove a promo code
 *     description: This route is used to remove a promo code. It requires a valid token.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: The token for authentication.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               promoCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: The result of the removePromoCode method.
 */
router.post('/remove', validateToken(), promoCodeController.removePromoCode);

/**
 * @openapi
 * /api/promo/use-promo-code:
 *   post:
 *     tags:
 *       - Promo Code
 *     summary: Apply a promo code
 *     description: This route is used to apply a promo code. It requires a valid token.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: The token for authentication.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               promoCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: The result of the usePromoCode method.
 */
router.post('/use-promo-code', validateToken(), Validator.validateFields({ required: ['promoCode'] }), promoCodeController.usePromoCode);

// =================|ADMIN|=================~

/**
 * @openapi
 * /api/promo/create:
 *   post:
 *     tags:
 *       - Promo Code
 *     summary: Create a new promo code
 *     description: This route is used to create a new promo code. It requires a valid token and certain fields in the request body.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: The token for authentication.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               discountType:
 *                 type: string
 *               description:
 *                 type: string
 *               promoCode:
 *                 type: string
 *               applicableProducts:
 *                 type: array
 *                 items:
 *                   type: string
 *               usageLimit:
 *                 type: integer
 *               minimumPurchaseValue:
 *                 type: integer
 *     responses:
 *       200:
 *         description: The result of the createPromoCode method.
 */
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
