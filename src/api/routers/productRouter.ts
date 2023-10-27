import express, { Router } from "express";
import { ProductController } from "../../controllers/productController";

const router = express.Router();
const productController = new ProductController();

// Rota para devolver todos os Produtos
router.post('/', productController.createProduct);

export default router;