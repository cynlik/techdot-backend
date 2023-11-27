import express, { Router } from "express";
import { SubcategoryController } from "@src/controllers/subcategoryController";
import validateToken from "@src/middlewares/validateToken";
import Validator from "@src/middlewares/validator";
import { Category } from "@src/models/categoryModel";
import { Constant } from "@src/utils/constant";
import { Subcategory } from "@src/models/subcategoryModel";

const router = express.Router();
const subcategoryController = new SubcategoryController();

// Rota para criar um Produtos
router.post('/create', validateToken(), Validator.validateFields({ required: ['name', 'categoryId']}), Validator.validateIds([{ paramName: "categoryId", model: Category, type: Constant.Category}]),subcategoryController.createSubcategory);

router.get('/', subcategoryController.getAllSubcategory);

router.get('/:id', Validator.validateIds([{ paramName: 'id', model: Subcategory, type: Constant.Subcategory}]), subcategoryController.getAllProductBySubcategory);

export default router;