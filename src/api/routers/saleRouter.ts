import { SaleController } from '@src/controllers/saleController';
import { roleMiddleware } from '@src/middlewares/roleMiddleware';
import validateToken from '@src/middlewares/validateToken';
import Validator from '@src/middlewares/validator';
import { Product } from '@src/models/productModel';
import { SaleModel } from '@src/models/saleModel';
import { User, UserStatus } from '@src/models/userModel';
import { Constant } from '@src/utils/constant';
import express from 'express';

const router = express.Router();
const saleController = new SaleController();

/**
 * @openapi
 * /api/sale/create:
 *   post:
 *     tags:
 *       - Sale Routes
 *     summary: Create a sale
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/Sale'
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Sale'
 */
// Create Sale
router.post(
  '/create',
  Validator.validateFields({ required: ['userId', 'products'] }),
  Validator.validateIds([
    { paramName: 'userId', model: User, type: Constant.User },
    { paramName: 'product', model: Product, type: Constant.Product },
  ]),
  saleController.create
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
// Get all sales
router.get('/all/:id?', validateToken, saleController.getAll);

// Get Sales By Id
// router.get("/:id?", Validator.validateIds([{ paramName: "id", model: SaleModel, type: Constant.Sale },]),saleController.getById);

/**
 * @openapi
 * /api/sale/delete/{id}:
 *   delete:
 *     tags:
 *       - Sale Routes
 *     summary: Delete a sale by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     responses:
 *      204:
 *        description: Success
 */
// Delete Sale By Id
router.delete('/delete/:id', Validator.validateIds([{ paramName: 'id', model: SaleModel, type: Constant.Sale }]), validateToken, roleMiddleware(UserStatus.Manager), saleController.deleteById);

// Update Sale By Id
// router.put('/update/:id', validateToken, roleMiddleware(UserRole.Manager),saleController.updateById);

export default router;
