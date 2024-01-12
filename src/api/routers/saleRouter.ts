import { SaleController } from '@src/controllers/saleController';
import express from 'express';
import validateToken from '@src/middlewares/validateToken';
import Validator from '@src/middlewares/validator';
import { Constant } from '@src/utils/constant';
import { SaleModel } from '@src/models/saleModel';

const router = express.Router();
const saleController = new SaleController();

/**
 * @openapi
 * /api/sale/create:
 *   post:
 *     tags:
 *       - Sale Routes
 *     summary: Create a new sale
 *     description: This route is used to create a new sale. It requires a valid token and certain fields in the request body.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               userEmail:
 *                 type: string
 *               userAdress:
 *                 type: string
 *               userPhone:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       200:
 *         description: The details of the newly created sale.
 *       401:
 *         description: Unauthorized. The token is missing or invalid.
 *       400:
 *         description: Bad Request. Some required fields are missing or invalid.
 */
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
