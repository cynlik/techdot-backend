import express from "express";
import { ProductController } from "../../controllers/productController";
import validateToken from "@src/middlewares/validateToken";
import { roleMiddleware } from "@src/middlewares/roleMiddleware";
import { UserRole } from "@src/utils/roles";
import tryValidateToken from "@src/middlewares/tryValidateToken";
import Validator from "@src/middlewares/validator";
import { Constant } from "@src/utils/constant";

const router = express.Router();
const productController = new ProductController();

// ROTAS TANTO PARA ADMIN | USER | NONMEMBER

    // Rota para devolver um produto pelo ID | devolver produtos todos
    router.get('/products/', tryValidateToken, productController.getProductsByName);

    // Rota para devolver um produto pelo ID
    router.get('/:id', tryValidateToken, Validator.validateId('id', Constant.Product), productController.getProductById);

// ROTAS DE ADMIN

    // Rota para criar Produtos
    router.post('/', validateToken, roleMiddleware( UserRole.Manager ), Validator.validateBody(['name', 'description', 'imageUrl', 'manufacturer', 'stockQuantity', 'price', 'subcategoryId']), Validator.validateId('subcategoryId', Constant.Subcategory), productController.createProduct);

    // Rota para dar update a um produto pelo ID
    router.put('/:id', validateToken, roleMiddleware( UserRole.Manager ), Validator.validateBody(['name', 'description', 'imageUrl', 'manufacturer', 'stockQuantity', 'price', 'subcategoryId', 'visible']), Validator.validateId('id', Constant.Product), Validator.validateId('subcategoryId', Constant.Subcategory), productController.updateProduct);

    // Rota para eliminar um produto pelo ID
    router.delete('/:id', validateToken, roleMiddleware( UserRole.Manager ), Validator.validateId('id', Constant.Product), productController.deleteProduct);

    

export default router;