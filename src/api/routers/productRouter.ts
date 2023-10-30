import express, { Router } from "express";
import { ProductController } from "../../controllers/productController";

const router = express.Router();
const productController = new ProductController();

// Rota para devolver todos os Produtos
router.post('/', productController.createProduct.bind(productController));
router.put('/:id', productController.updateProduct.bind(productController));
router.delete('/:id', productController.deleteProduct);
router.get('/:id', productController.getProductById);
router.get('/', productController.getAllProducts);

export default router;