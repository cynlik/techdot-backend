import express, { Router } from "express";
import ProductController from "../../controllers/productController";

const router = express.Router();

// Rota para devolver todos os Produtos
router.get('/', ProductController.findAll);

export default Router;