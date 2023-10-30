import express, { Router } from "express";
import { CategoryController } from "@src/controllers/categoryController";

const router = express.Router();
const categoryController = new CategoryController();

// Rota para cirar uma Categoria 
router.post('/', categoryController.createCategory);

router.get('/', categoryController.getAllCategory)

export default router;