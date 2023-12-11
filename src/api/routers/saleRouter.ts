import { SaleController } from "@src/controllers/saleController";
import express from "express";
import { roleMiddleware } from "@src/middlewares/roleMiddleware";
import { UserStatus } from "@src/models/userModel";
import validateToken from "@src/middlewares/validateToken";
import Validator from "@src/middlewares/validator";
import { Constant } from "@src/utils/constant";
import { SaleModel } from "@src/models/saleModel";

const router = express.Router();
const saleController = new SaleController();

// Create Sale
router.post(
	"/create",
	Validator.validateFields({
		required: [
			"userName",
			"userEmail",
			"userAdress",
			"userPhone",
			"paymentMethod",
		],
	}),
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
router.get("/all", validateToken(), saleController.getSalesByName);

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
router.delete(
	"/delete/:id",
	validateToken(),
	Validator.validateIds([
		{ paramName: "id", model: SaleModel, type: Constant.Sale },
	]),
	roleMiddleware(UserStatus.Manager),
	saleController.deleteById
);

// Cancel Sale
// router.put("/cancel/:id", validateToken(),Validator.validateIds([{ paramName: "id", model: SaleModel, type: Constant.Sale }]), saleController.cancel);

export default router;
