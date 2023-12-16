import express from 'express';
import { SubcategoryController } from '@src/controllers/subcategoryController';
import validateToken from '@src/middlewares/validateToken';
import Validator from '@src/middlewares/validator';
import { Category } from '@src/models/categoryModel';
import { Constant } from '@src/utils/constant';
import { Subcategory } from '@src/models/subcategoryModel';
import { roleMiddleware } from '@src/middlewares/roleMiddleware';
import { UserStatus } from '@src/models/userModel';

const router = express.Router();
const subcategoryController = new SubcategoryController();
/**
 * @openapi
 * tags:
 *   name: Subcategory
 */
// =================|USER|=================

/**
 * @openapi
 * /subcategory:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Returns all subcategories
 *     tags: [Subcategory]
 *     responses:
 *       200:
 *         description: The list of all subcategories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subcategory'
 */
// Rota para devolver todas as subcategorias
router.get('/', validateToken(true), subcategoryController.getAllSubcategory);

/**
 * @openapi
 * /subcategory/products/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Returns all products of a subcategory
 *     tags: [Subcategory]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Subcategory id
 *     responses:
 *       200:
 *         description: The list of products of the subcategory
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
// Rota para devolver todos os produtos de uma subcategorias
router.get('/products/:id', validateToken(true), Validator.validateIds([{ paramName: 'id', model: Subcategory, type: Constant.Subcategory }]), subcategoryController.getAllProductBySubcategory);

// =================|ADMIN|=================

/**
 * @openapi
 * /subcategory:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new subcategory
 *     tags: [Subcategory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subcategory'
 *     responses:
 *       200:
 *         description: The created subcategory
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subcategory'
 */
// Rota para criar uma Subcategoria
router.post('/', validateToken(), Validator.validateFields({ required: ['name', 'categoryId'] }), Validator.validateIds([{ paramName: 'categoryId', model: Category, type: Constant.Category }]), subcategoryController.createSubcategory);

/**
 * @openapi
 * /subcategory/update/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a subcategory
 *     tags: [Subcategory]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Subcategory id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subcategory'
 *     responses:
 *       200:
 *         description: The updated subcategory
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subcategory'
 */
// Rota para atualizar uma Subcategoria
router.put(
  '/update/:id',
  validateToken(),
  roleMiddleware(UserStatus.Manager),
  Validator.validateFields({ optional: ['name', 'visible'] }),
  Validator.validateIds([{ paramName: 'id', model: Subcategory, type: Constant.Subcategory }]),
  subcategoryController.updateSubcategory,
);

/**
 * @openapi
 * /subcategory/delete/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a subcategory
 *     tags: [Subcategory]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Subcategory id
 *     responses:
 *       200:
 *         description: The deleted subcategory
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subcategory'
 */
// Rota para eliminar uma Subcategoria
router.delete('/delete/:id', validateToken(), roleMiddleware(UserStatus.Manager), Validator.validateIds([{ paramName: 'id', model: Subcategory, type: Constant.Subcategory }]), subcategoryController.deleteSubcategory);

/**
 * @openapi
 * /subcategory/admin:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Returns all subcategories for admin
 *     tags: [Subcategory]
 *     responses:
 *       200:
 *         description: The list of all subcategories for admin
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subcategory'
 */
// Rota para devolver todas as subcategorias || DashBoard
router.get('/admin', validateToken(), roleMiddleware(UserStatus.Manager), subcategoryController.getSubcategoryByName);

export default router;
