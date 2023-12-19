import { SaleController } from '@src/controllers/saleController';
import express from 'express';
import validateToken from '@src/middlewares/validateToken';
import Validator from '@src/middlewares/validator';
import { Constant } from '@src/utils/constant';
import { SaleModel } from '@src/models/saleModel';

const router = express.Router();
const saleController = new SaleController();

// Create Sale
router.post(
  '/create',
  validateToken(true),
  Validator.validateFields({
    required: ['userName', 'userEmail', 'userAdress', 'userPhone', 'paymentMethod'],
  }),
  saleController.create,
);

/**
 * @openapi
 * /api/sale/all/{id}:
 *   get:
 *     tags:
 *       - Sale Routes
 *     summary: Get all sales or a specific sale by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: false
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Sale'
 */
// Get all sales and by email
router.get('/all', validateToken(), saleController.getSalesByName);

/**
 * @openapi
 * /api/sale/cancel/{id}:
 *   put:
 *     tags:
 *       - Sale Routes
 *     summary: Cancel a specific sale by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *      200:
 *        description: Sale cancelled successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Sale'
 *      400:
 *        description: Invalid ID supplied
 *      404:
 *        description: Sale not found
 */
// Cancel Sale
router.put('/cancel/:id', validateToken(), Validator.validateIds([{ paramName: 'id', model: SaleModel, type: Constant.Sale }]), saleController.cancel);

export default router;
