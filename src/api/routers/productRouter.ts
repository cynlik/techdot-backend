import express from "express";
import { ProductController } from "../../controllers/productController";
import validateToken from "@src/middlewares/validateToken";
import { roleMiddleware } from "@src/middlewares/roleMiddleware";
import { UserStatus } from "@src/models/userModel";
import Validator from "@src/middlewares/validator";
import { Constant } from "@src/utils/constant";
import { Subcategory } from "@src/models/subcategoryModel";
import { Product, ProductType } from "@src/models/productModel";

const router = express.Router();
const productController = new ProductController();
// =================|USER|=================

/**
 * @openapi
 * /api/product/:
 *   get:
 *     tags:
 *       - Product Routes
 *     summary: Get products
 *     parameters:
 *       - in: header
 *         name: authorization
 *         schema:
 *           type: string
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Product'
 */
// Rota para devolver um produto pelo ID | devolver produtos todos
router.get("/", validateToken(true), productController.getProductsByName);

/**
 * @openapi
 * /api/product/{id}:
 *   get:
 *     tags:
 *       - Product Routes
 *     summary: Get product by ID
 *     parameters:
 *       - in: header
 *         name: authorization
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Product'
 */
// Rota para devolver um produto pelo ID
router.get(
	"/:id",
	validateToken(true),
	Validator.validateIds([
		{ paramName: "id", model: Product, type: Constant.Product },
	]),
	productController.getProductById
);

// =================|ADMIN|=================
/**
 * @openapi
 * /api/product/:
 *  post:
 *    tags:
 *      - Product Routes
 *    summary: Create product
 *    parameters:
 *      - in: header
 *        name: authorization
 *        schema:
 *          type: string
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/Product'
 *    responses:
 *      201:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Product'
 */
// Rota para criar Produtos
router.post(
	"/",
	validateToken(),
	roleMiddleware(UserStatus.Manager),
	Validator.validateFields({
		required: [
			"name",
			"description",
			"imageUrl",
			"manufacturer",
			"stockQuantity",
			"price",
			"subcategoryId",
			"specifications",
			"productType",
		],
		optional: ["warranty"],
	}),
	Validator.validateEnums([
		{ enumObject: ProductType, fieldName: "productType" },
	]),
	Validator.validateIds([
		{
			paramName: "subcategoryId",
			model: Subcategory,
			type: Constant.Subcategory,
		},
	]),
	productController.createProduct
);

/**
 * @openapi
 * /api/product/{id}:
 *  put:
 *    tags:
 *      - Product Routes
 *    summary: Create product
 *    parameters:
 *      - in: header
 *        name: authorization
 *        schema:
 *          type: string
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *    requestBody:
 *      required: false
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/Product'
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Product'
 */
// Rota para dar update a um produto pelo ID
router.put(
	"/:id",
	validateToken(),
	roleMiddleware(UserStatus.Manager),
	Validator.validateFields({
		optional: [
			"name",
			"description",
			"imageUrl",
			"manufacturer",
			"stockQuantity",
			"price",
			"subcategoryId",
			"visible",
		],
	}),
	Validator.validateIds([
		{ paramName: "id", model: Product, type: Constant.Product },
		{
			paramName: "subcategoryId",
			model: Subcategory,
			type: Constant.Subcategory,
			isOptional: true,
		},
	]),
	productController.updateProduct
);

/**
 * @openapi
 * /api/product/{id}:
 *  delete:
 *    tags:
 *      - Product Routes
 *    summary: Create product
 *    parameters:
 *      - in: header
 *        name: authorization
 *        schema:
 *          type: string
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *    requestBody:
 *      required: false
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/Product'
 *    responses:
 *      204:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/SingleMessageResponse'
 */
// Rota para eliminar um produto pelo ID
router.delete(
	"/:id",
	validateToken(),
	roleMiddleware(UserStatus.Manager),
	Validator.validateIds([
		{ paramName: "id", model: Product, type: Constant.Product },
	]),
	productController.deleteProduct
);

export default router;
