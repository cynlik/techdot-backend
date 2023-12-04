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
/**
 * @swagger
 * components:
 *  schemas:
 *   Product:
 *    type: object
 *    required:
 *        - name 
 *        - description
 *        - imageUrl
 *        - manufacturer
 *        - stockQuantity
 *        - price
 *        - visible
 *        - subcategoryId
 *        - productType
 *        - specifications
 *    properties:
 *      name:
 *        type: string
 *      description:
 *        type: string
 *      imageUrl:
 *        type: string
 *      manufacturer:
 *        type: string
 *      stockQuantity:
 *        type: string
 *      visible:
 *        type: number
 *      subcategoryId:
 *        type: string
 *      productType:
 *        type: string
 *      specifications:
 *        type: string
 *        enum: ['cpu', 'gpu', 'motherboard', 'ram', 'case'] 
 *      warranty: 
 *        type: string
 *      TODO: COMO DECLARAR O SPECIFICATIONS EM RELACAO AO ENUM DO PRODUCT TYPE
 */
// =================|USER|=================
/**
 * @openapi
 * /api/product:
 *  get:
 *    tags:
 *    - Product Router
 *    summary: Get all products
 *    parameters:
 *      - in: query
 *        name: token
 *        required: false
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/TODO:'
 *      
 */
// Rota para devolver um produto pelo ID | devolver produtos todos
router.get("/", validateToken(true), productController.getProductsByName);

// Rota para devolver um produto pelo ID
router.get("/:id", validateToken(true), Validator.validateIds([{ paramName: "id", model: Product, type: Constant.Product }]), productController.getProductById);

// =================|ADMIN|=================

// Rota para criar Produtos
router.post("/", validateToken(), roleMiddleware(UserStatus.Manager), Validator.validateFields({ required: ["name", "description", "imageUrl", "manufacturer", "stockQuantity", "price", "subcategoryId", "specifications", "productType"], optional: ["warranty"] }), Validator.validateEnums([{ enumObject: ProductType, fieldName: 'productType' }]), Validator.validateIds([{ paramName: "subcategoryId", model: Subcategory, type: Constant.Subcategory }]), productController.createProduct);

// Rota para dar update a um produto pelo ID
router.put("/:id", validateToken(), roleMiddleware(UserStatus.Manager), Validator.validateFields({ optional: ["name", "description", "imageUrl", "manufacturer", "stockQuantity", "price", "subcategoryId", "visible"] }), Validator.validateIds([{ paramName: "id", model: Product, type: Constant.Product }, { paramName: "subcategoryId", model: Subcategory, type: Constant.Subcategory, isOptional: true }]), productController.updateProduct);

// Rota para eliminar um produto pelo ID
router.delete("/:id", validateToken(), roleMiddleware(UserStatus.Manager), Validator.validateIds([{ paramName: "id", model: Product, type: Constant.Product }]), productController.deleteProduct);

export default router;