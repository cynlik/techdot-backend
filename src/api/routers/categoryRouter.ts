import express from 'express';
import { CategoryController } from '@src/controllers/categoryController';
import Validator from '@src/middlewares/validator';
import validateToken from '@src/middlewares/validateToken';
import { roleMiddleware } from '@src/middlewares/roleMiddleware';
import { UserStatus } from '@src/models/userModel';
import { Constant } from '@src/utils/constant';
import { Category } from '@src/models/categoryModel';

const router = express.Router();
const categoryController = new CategoryController();
/**
 * @openapi
 * tags:
 *   name: Category
 */
// =================|USER|=================

/**
 * @openapi
 * /api/category:
 *   get:
 *     summary: Get all categories
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: An array of category objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
// Rota para obter todas as categorias
router.get('/', validateToken(true), categoryController.getAllCategory);

/**
 * @openapi
 * /api/category/subcategory/{categoryId}:
 *   get:
 *     summary: Get all subcategories of a category
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     responses:
 *       200:
 *         description: An array of subcategory objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subcategory'
 */
// Rota que devolve todas as subcategorias de uma categoria
router.get('/subcategory/:categoryId', validateToken(true), Validator.validateIds([{ paramName: 'categoryId', model: Category, type: Constant.Category }]), categoryController.getAllSubcategoryByCategory);

/**
 * @openapi
 * /api/category/products/{categoryId}:
 *   get:
 *     summary: Get all products of a category
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     responses:
 *       200:
 *         description: An array of product objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
// Rota que devolve todos os produtos de uma categoria
router.get('/products/:categoryId', validateToken(true), Validator.validateIds([{ paramName: 'categoryId', model: Category, type: Constant.Category }]), categoryController.getAllProductsByCategory);

// =================|ADMIN|=================

/**
 * @openapi
 * /api/category:
 *   post:
 *     summary: Create a new category
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: The created category object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 */
// Rota para cirar uma Categoria
router.post('/', validateToken(), roleMiddleware(UserStatus.Manager), Validator.validateFields({ required: ['name'] }), categoryController.createCategory);

/**
 * @openapi
 * /api/category/update/{id}:
 *   put:
 *     summary: Update the name of a category
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated category object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 */
// Rota para dar update no nome da categoria
router.put(
  '/update/:id',
  validateToken(),
  roleMiddleware(UserStatus.Manager),
  Validator.validateFields({ optional: ['name'] }),
  Validator.validateIds([{ paramName: 'id', model: Category, type: Constant.Category }]),
  categoryController.updateCategory,
);

/**
 * @openapi
 * /api/category/delete/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     responses:
 *       200:
 *         description: The deleted category object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 */
// Rota para eliminar uma categoria pelo seu id
router.delete('/delete/:id', validateToken(), roleMiddleware(UserStatus.Manager), Validator.validateIds([{ paramName: 'id', model: Category, type: Constant.Category }]), categoryController.deleteCategory);

/**
 * @openapi
 * /api/category/admin:
 *   get:
 *     summary: Get all categories for the dashboard
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: An array of category objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
// Rota para devolver todas as categorias || DashBoard
router.get('/admin', validateToken(), roleMiddleware(UserStatus.Manager), categoryController.getCategoryByName);

export default router;
