import express, { Router } from "express";
import { SubcategoryController } from "@src/controllers/subcategoryController";

const router = express.Router();
const subcategoryController = new SubcategoryController();

// Rota para devolver todos os Produtos
router.post('/', subcategoryController.createSubcategory);

export default router;