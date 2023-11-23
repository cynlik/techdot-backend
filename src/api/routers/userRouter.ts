import express from 'express';
import UserController from '@src/controllers/userController';
import { roleMiddleware } from '@src/middlewares/roleMiddleware';
import validateToken from '@src/middlewares/validateToken';
import Validator from "@src/middlewares/validator";
import { Constant } from "@src/utils/constant";
import { User, UserStatus } from "@src/models/userModel";
import { UserRole } from '@src/utils/roles';
import validateToken from '@src/middlewares/validateToken';
import Validator from '@src/middlewares/validator';
import { Constant } from '@src/utils/constant';
import { User } from '@src/models/userModel';

const router = express.Router();
const userController = new UserController();

/**
 * @swagger
 * components:
 *  schemas:
 *   User:
 *    type: object
 *    required:
 *      - name
 *      - email
 *      - password
 *    properties:
 *      name:
 *        type: string
 *      email:
 *        type: string
 *      password:
 *        type: string
 *      role:
 *        type: string
 *      picture:
 *        type: string
 *      age:
 *        type: number
 *      address:
 *        type: string
 *      country:
 *        type: string
 */

/**
 * @openapi
 * /api/user/register:
 *  post:
 *     tags:
 *      - User Routes
 *     summary: Register a user
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/User'
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 */
///  -- USER ROUTES --
// Register user
router.post('/register', Validator.validateFields({ required: ['name', 'email', 'password'] }), userController.registerUser);

/**
 * @openapi
 * /api/user/verify:
 *  put:
 *     tags:
 *      - User Routes
 *     summary: Verify a user
 *     parameters:
 *      - in: query
 *        name: token
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 */
// Verify user
router.put('/verify', Validator.validateTokenMatch('token', 'verifyAccountToken'), userController.verifyAccount);

// Login
router.post('/login', Validator.validateFields({ required: ['email', 'password'] }), userController.loginUser);

// Forget
router.post('/forgetpassword', Validator.validateFields({ required: ['email'] }), userController.forgetPassword);

// Reset
router.put('/resetpassword', Validator.validateFields({ required: ['newPassword', 'confirmPassword'] }), Validator.validateTokenMatch('token', 'resetPasswordToken'), userController.resetPassword);

// My information
router.get('/me', validateToken(), userController.me);

// Update my information
router.put('/me', validateToken(), Validator.validateFields({ optional: ["name","password","picture","address","country"]}), userController.meUpdate)

// Logout
router.post('/logout', validateToken(), userController.logout);

///  -- ADMIN ROUTES --

// Change view
router.put('/change-view', validateToken(), roleMiddleware(UserStatus.Manager), userController.changeView);

// Get user by id
router.get('/:id?', validateToken(), roleMiddleware(UserStatus.Manager), Validator.validateIds([{ paramName: "id", model: User, type: Constant.User, isOptional: true }]), userController.getUserById);

// Update user by id
router.put('/:id', validateToken(), roleMiddleware(UserStatus.Manager), Validator.validateIds([{ paramName: "id", model: User, type: Constant.User }]), Validator.validateFields({ optional: ["name","email","role","picture","address","country","isVerified","cart"] }), userController.updateUserById);

// Delete user by id
router.delete('/:id', validateToken(), roleMiddleware(UserStatus.Manager), Validator.validateIds([{ paramName: "id", model: User, type: Constant.User }]),userController.deleteUserById);
router.get('/:id?', validateToken, roleMiddleware(UserRole.Manager), Validator.validateIds([{ paramName: 'id', model: User, type: Constant.User, isOptional: true }]), userController.getUserById);

// Update user by id
router.put('/:id', validateToken, roleMiddleware(UserRole.Manager), Validator.validateIds([{ paramName: 'id', model: User, type: Constant.User }]), Validator.validateFields({ optional: ['name', 'email', 'role', 'picture', 'address', 'country', 'isVerified', 'cart'] }), userController.updateUserById);

// Delete user by id
router.delete('/:id', validateToken, roleMiddleware(UserRole.Manager), Validator.validateIds([{ paramName: 'id', model: User, type: Constant.User }]), userController.deleteUserById);

export default router;
