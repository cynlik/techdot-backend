import express from "express";
import { CategoryController } from "@src/controllers/categoryController";
import Validator from "@src/middlewares/validator";
import validateToken from "@src/middlewares/validateToken";
import { roleMiddleware } from "@src/middlewares/roleMiddleware";
import { UserStatus } from "@src/models/userModel";
import { Constant } from "@src/utils/constant";
import { Category } from "@src/models/categoryModel";

const router = express.Router();
const categoryController = new CategoryController();

// =================|USER|=================

// Rota para obter todas as categorias
router.get('/', validateToken(true), categoryController.getAllCategory)

// Rota que devolve todas as subcategorias de uma categoria
router.get('/subcategory/:categoryId', validateToken(true), Validator.validateIds([{ paramName: "categoryId", model: Category, type: Constant.Category }]), categoryController.getAllSubcategoryByCategory)

// Rota que devolve todos os produtos de uma categoria
router.get('/products/:categoryId', validateToken(true), Validator.validateIds([{ paramName: "categoryId", model: Category, type: Constant.Category }]), categoryController.getAllProductsByCategory)

// =================|ADMIN|=================

// Rota para cirar uma Categoria 
router.post('/', validateToken(), roleMiddleware(UserStatus.Manager), Validator.validateFields({ required: ['name'] }), categoryController.createCategory);

// Rota para dar update no nome da categoria
router.put('/update/:id', validateToken(), roleMiddleware(UserStatus.Manager), Validator.validateFields({ optional: ['name'] }), Validator.validateIds([{ paramName: "id", model: Category, type: Constant.Category }]), categoryController.updateCategory)

// Rota para eliminar uma categoria pelo seu id
router.delete('/delete/:id', validateToken(), roleMiddleware(UserStatus.Manager), Validator.validateIds([{ paramName: "id", model: Category, type: Constant.Category }]), categoryController.deleteCategory)

// Rota para devolver todas as categorias || DashBoard
router.get("/admin", validateToken(), roleMiddleware(UserStatus.Manager), categoryController.getCategoryByName);

export default router;