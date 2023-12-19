import { DiscountController } from '@src/controllers/discountController';
import { roleMiddleware } from '@src/middlewares/roleMiddleware';
import validateToken from '@src/middlewares/validateToken';
import Validator from '@src/middlewares/validator';
import { Discount } from '@src/models/discountModel';
import { UserStatus } from '@src/models/userModel';
import { Constant } from '@src/utils/constant';
import express from 'express';

const router = express.Router();
const discountController = new DiscountController();

// =================|USER|=================

// =================|ADMIN|=================~
/**
 * @openapi
 * /create:
 *   post:
 *     tags:
 *       - Discount Routes
 *     summary: Create a new discount
 *     parameters:
 *       - in: body
 *         name: body
 *         schema:
 *           $ref: '#/components/schemas/CreateDiscount'
 *     responses:
 *      200:
 *        description: Discount created successfully
 */
router.post(
  '/create',
  validateToken(),
  roleMiddleware(UserStatus.Manager),
  Validator.validateFields({
    required: ['description', 'discountType', 'applicableProducts'],
  }),
  discountController.createDiscount,
);

/**
 * @openapi
 * /update/{id}:
 *   put:
 *     tags:
 *       - Discount Routes
 *     summary: Update a specific discount by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *             $ref: '#/components/schemas/UpdateDiscount'
 *     responses:
 *      200:
 *        description: Discount updated successfully
 *      400:
 *        description: Invalid ID or data supplied
 *      404:
 *        description: Discount not found
 */
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

/**
 * @openapi
 * /stateOfIsActive/{id}:
 *   put:
 *     tags:
 *       - Discount Routes
 *     summary: Update the active state of a specific discount by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StateOfIsActiveRequestBody'
 *     responses:
 *      200:
 *        description: Active state updated successfully
 *      400:
 *        description: Invalid ID or data supplied
 *      404:
 *        description: Discount not found
 */
router.put(
  '/stateOfIsActive/:id',
  validateToken(),
  roleMiddleware(UserStatus.Manager),
  Validator.validateFields({ required: ['isActive'] }),
  Validator.validateIds([{ paramName: 'id', model: Discount, type: Constant.Discount }]),
  discountController.stateOfIsActive,
);

/**
 * @openapi
 * /add/{id}:
 *   put:
 *     tags:
 *       - Discount Routes
 *     summary: Add a product to a specific discount by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddProductRequestBody'
 *     responses:
 *      200:
 *        description: Product added successfully
 *      400:
 *        description: Invalid ID or data supplied
 *      404:
 *        description: Discount not found
 */
router.put(
  '/add/:id',
  validateToken(),
  roleMiddleware(UserStatus.Manager),
  Validator.validateFields({ required: ['productId'] }),
  Validator.validateIds([{ paramName: 'id', model: Discount, type: Constant.Discount }]),
  discountController.addProductToDiscount,
);

/**
 * @openapi
 * /remove/{id}:
 *   put:
 *     tags:
 *       - Discount Routes
 *     summary: Remove a product from a specific discount by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RemoveProductRequestBody'
 *     responses:
 *      200:
 *        description: Product removed successfully
 *      400:
 *        description: Invalid ID or data supplied
 *      404:
 *        description: Discount not found
 */
router.put(
  '/remove/:id',
  validateToken(),
  roleMiddleware(UserStatus.Manager),
  Validator.validateFields({ required: ['productId'] }),
  Validator.validateIds([{ paramName: 'id', model: Discount, type: Constant.Discount }]),
  discountController.removeProductFromDiscount,
);

/**
 * @openapi
 * /{id}:
 *   delete:
 *     tags:
 *       - Discount Routes
 *     summary: Delete a specific discount by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *      200:
 *        description: Discount deleted successfully
 *      400:
 *        description: Invalid ID supplied
 *      404:
 *        description: Discount not found
 */
router.delete('/:id', validateToken(), roleMiddleware(UserStatus.Manager), Validator.validateIds([{ paramName: 'id', model: Discount, type: Constant.Discount }]), discountController.deleteDiscount);

/**
 * @openapi
 * /solo/{id}:
 *   get:
 *     tags:
 *       - Discount Routes
 *     summary: Get a specific discount by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *      200:
 *        description: Discount retrieved successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Discount'
 *      400:
 *        description: Invalid ID supplied
 *      404:
 *        description: Discount not found
 */
router.get('/solo/:id', validateToken(), roleMiddleware(UserStatus.Manager), Validator.validateIds([{ paramName: 'id', model: Discount, type: Constant.Discount }]), discountController.getDiscountByID);

/**
 * @openapi
 * /query/:
 *   get:
 *     tags:
 *       - Discount Routes
 *     summary: Get discounts by query parameters
 *     parameters:
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         required: false
 *       - in: query
 *         name: promoCode
 *         schema:
 *           type: string
 *         required: false
 *     responses:
 *      200:
 *        description: Discounts retrieved successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/DiscountArray'
 *      400:
 *        description: Invalid query parameters supplied
 */
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
