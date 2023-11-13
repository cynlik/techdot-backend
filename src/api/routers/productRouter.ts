import express from "express";
import { ProductController } from "../../controllers/productController";
import validateToken from "@src/middlewares/validateToken";
import { roleMiddleware } from "@src/middlewares/roleMiddleware";
import { UserRole } from "@src/utils/roles";
import tryValidateToken from "@src/middlewares/tryValidateToken";
import Validator from "@src/middlewares/validator";
import { Constant } from "@src/utils/constant";
import { Subcategory } from "@src/models/subcategoryModel";
import { Product } from "@src/models/productModel";

const router = express.Router();
const productController = new ProductController();

// ROTAS TANTO PARA ADMIN | USER | NONMEMBER

// Rota para devolver um produto pelo ID | devolver produtos todos
router.get("/products/", tryValidateToken, productController.getProductsByName);

// Rota para devolver um produto pelo ID
router.get("/:id", tryValidateToken, Validator.validateIds([{ paramName: "id", model: Product, type: Constant.Product }]), productController.getProductById);

// ROTAS DE ADMIN

// Rota para criar Produtos
router.post("/", validateToken, roleMiddleware(UserRole.Manager), Validator.validateBody(["name","description","imageUrl","manufacturer","stockQuantity","price","subcategoryId","productType","specifications","warranty"]), Validator.validateIds([{paramName: "subcategoryId", model: Subcategory, type: Constant.Subcategory}]), productController.createProduct);

// Rota para dar update a um produto pelo ID
router.put("/:id", validateToken, roleMiddleware(UserRole.Manager), Validator.validateOptionalBody(["name","description","imageUrl","manufacturer","stockQuantity","price","subcategoryId","visible"]), Validator.validateIds([{ paramName: "id", model: Product, type: Constant.Product }, {paramName: "subcategoryId", model: Subcategory, type: Constant.Subcategory, isOptional: true}]), productController.updateProduct);

// Rota para eliminar um produto pelo ID
router.delete("/:id", validateToken, roleMiddleware(UserRole.Manager), Validator.validateIds([{ paramName: "id", model: Product, type: Constant.Product }]), productController.deleteProduct);

export default router;
