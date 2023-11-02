import express from "express";
import { ProductController } from "../../controllers/productController";
import validateToken from "@src/middlewares/validateToken";
import { roleMiddleware } from "@src/middlewares/roleMiddleware";
import { UserRole } from "@src/utils/roles";
import { User } from "@src/models/userModel";
import tryValidateToken from "@src/middlewares/tryValidateToken";

const router = express.Router();
const productController = new ProductController();

// ROTAS TANTO PARA ADMIN | USER | NONMEMBER

    // Rota para devolver um produto pelo ID | devolver produtos todos
    router.get('/products/', tryValidateToken, productController.getProductsByName);

    // Rota para devolver um produto pelo ID
    router.get('/:id', tryValidateToken, productController.getProductById);

// ROTAS DE ADMIN

    // Rota para criar Produtos
    router.post('/', validateToken, roleMiddleware( UserRole.Manager ), productController.createProduct);

    // Rota para dar update a um produto pelo ID
    router.put('/:id', validateToken, roleMiddleware( UserRole.Manager ), productController.updateProduct);

    // Rota para eliminar um produto pelo ID
    router.delete('/:id', validateToken, roleMiddleware( UserRole.Manager ), productController.deleteProduct);

    

export default router;