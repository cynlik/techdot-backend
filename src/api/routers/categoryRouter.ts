import express, { Router } from "express";
import { CategoryController } from "@src/controllers/categoryController";

const router = express.Router();
const categoryController = new CategoryController();

// Rota para devolver todos os Produtos
router.post('/', categoryController.createCategory);

export default router;