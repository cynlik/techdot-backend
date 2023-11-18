import express from "express";
import { CategoryController } from "@src/controllers/categoryController";
import Validator from "@src/middlewares/validator";
import validateToken from "@src/middlewares/validateToken";
import { roleMiddleware } from "@src/middlewares/roleMiddleware";
import { UserRole } from "@src/utils/roles";
import { Constant } from "@src/utils/constant";
import { Category } from "@src/models/categoryModel";

const router = express.Router();
const categoryController = new CategoryController();

// Rotas Publicas

// Rota para obter todas as categorias
router.get('/', categoryController.getAllCategory)

// Rotas Admin

// Rota para cirar uma Categoria 
router.post('/', validateToken, roleMiddleware(UserRole.Manager), Validator.validateFields({ required: ['name']}), categoryController.createCategory);

// Rota para dar update no nome da categoria
router.put('/update/:id', validateToken, roleMiddleware(UserRole.Manager), Validator.validateFields({ optional: ['name']}), Validator.validateIds([{ paramName: "id", model: Category, type: Constant.Category }]), categoryController.updateCategory)

// Rota para eliminar uma categoria pelo seu id
router.delete('/delete/:id', validateToken, roleMiddleware(UserRole.Manager), Validator.validateIds([{ paramName: "id", model: Category, type: Constant.Category}]))


export default router;