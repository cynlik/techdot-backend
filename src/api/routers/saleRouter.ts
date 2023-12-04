import { SaleController } from "@src/controllers/saleController";
import UserController from "@src/controllers/userController";
import express from "express";
import { roleMiddleware } from "@src/middlewares/roleMiddleware";
import { UserStatus } from "@src/models/userModel";
import validateToken from "@src/middlewares/validateToken";
import Validator from "@src/middlewares/validator";
import { Constant } from "@src/utils/constant";
import { User } from "@src/models/userModel";
import { Product } from "@src/models/productModel";
import { SaleModel } from "@src/models/saleModel";

const router = express.Router();
const saleController = new SaleController();

// Create Sale
router.post("/create", Validator.validateFields({ required: ["userId", "products"]}), Validator.validateIds([
    { paramName: "userId", model: User, type: Constant.User },
    { paramName: "product", model: Product, type: Constant.Product },
  ]),
  saleController.create
);

// Get all sales
router.get("/all/:id?", validateToken, saleController.getAll); 

// Get Sales By Id
// router.get("/:id?", Validator.validateIds([{ paramName: "id", model: SaleModel, type: Constant.Sale },]),saleController.getById);

// Delete Sale By Id
router.delete("/delete/:id",Validator.validateIds([{ paramName: "id", model: SaleModel, type: Constant.Sale },]),validateToken, roleMiddleware(UserStatus.Manager),saleController.deleteById
);

// Update Sale By Id
// router.put('/update/:id', validateToken, roleMiddleware(UserRole.Manager),saleController.updateById);

export default router;