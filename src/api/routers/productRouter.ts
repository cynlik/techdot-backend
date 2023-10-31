import express from "express";
import { ProductController } from "../../controllers/productController";

const router = express.Router();
const productController = new ProductController();

// Rota para devolver todos os Produtos
router.post('/', productController.createProduct);

//Rota para dar update a um produto pelo ID
router.put('/:id', productController.updateProduct);

// Rota para eliminar um produto pelo ID
router.delete('/:id', productController.deleteProduct);

// Rota para devolver um produto pelo ID
router.get('/:id', productController.getProductById);

// Rota para devolver todos os produtos existentes
router.get('/', productController.getAllProducts);

//Rota para dar update a um produto pelo ID
router.put('/:id', productController.updateProduct);

// Rota para eliminar um produto pelo ID
router.delete('/:id', productController.deleteProduct);

// Rota para devolver um produto pelo ID
router.get('/:id', productController.getProductById);

// Rota para devolver todos os produtos existentes
router.get('/', productController.getAllProducts);

export default router;