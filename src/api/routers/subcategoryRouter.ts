import express, { Router } from "express";
import { SubcategoryController } from "@src/controllers/subcategoryController";
import validateToken from "@src/middlewares/validateToken";
import Validator from "@src/middlewares/validator";
import { Category } from "@src/models/categoryModel";
import { Constant } from "@src/utils/constant";
import { Subcategory } from "@src/models/subcategoryModel";
import { roleMiddleware } from "@src/middlewares/roleMiddleware";
import { UserRole } from "@src/models/userModel";

const router = express.Router();
const subcategoryController = new SubcategoryController();

// =================|USER|=================

// Rota para devolver todas as subcategorias
router.get('/', validateToken(true), subcategoryController.getAllSubcategory);

// Rota para devolver todos os produtos de uma subcategorias
router.get('/:id', validateToken(true), Validator.validateIds([{ paramName: 'id', model: Subcategory, type: Constant.Subcategory}]), subcategoryController.getAllProductBySubcategory);

// =================|ADMIN|=================

// Rota para criar uma Subcategoria
router.post('/', validateToken(), Validator.validateFields({ required: ['name', 'categoryId']}), Validator.validateIds([{ paramName: "categoryId", model: Category, type: Constant.Category}]),subcategoryController.createSubcategory);

// Rota para atualizar uma Subcategoria
router.put('/update/:id', validateToken(), roleMiddleware(UserRole.Manager), Validator.validateFields({ optional: ['name', 'visible']}), Validator.validateIds([{ paramName: 'id', model: Subcategory, type: Constant.Subcategory}]), subcategoryController.updateSubcategory )

// Rota para eliminar uma Subcategoria
router.delete('/delete/:id', validateToken(), roleMiddleware(UserRole.Manager), Validator.validateIds([{ paramName: 'id', model: Subcategory, type: Constant.Subcategory}]), subcategoryController.deleteSubcategory)

export default router;