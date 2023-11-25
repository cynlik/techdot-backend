import express from 'express';
import UserController from '@src/controllers/userController';
import { roleMiddleware } from '@src/middlewares/roleMiddleware';
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
 * 
 *   LoginUser:
 *     type: object
 *     required:
 *      - email
 *      - password
 *     properties:
 *      email:
 *        type: string
 *      password:
 *        type: string
 * 
 *   LoginUserResponse:
 *     type: object
 *     properties:
 *      accessToken:
 *        type: object
 *        properties:
 *          auth:
 *            type: boolean 
 *          token:
 *            type: string 
 * 
 *   ForgetPassword:
 *     type: object
 *     properties:
 *       email:
 *         type: string  
 * 
 *   ForgetPasswordResponse:
 *     type: object
 *     properties:
 *       message:
 *         type: string 
 *       email:
 *         type: string 
 *       token:
 *         type: string 
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

/**
 * @openapi
 * /api/user/login:
 *  post:
 *     tags:
 *      - User Routes
 *     summary: Login a user
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/LoginUser'
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/LoginUserResponse'
 */
// Login
router.post('/login', Validator.validateFields({ required: ['email', 'password'] }), userController.loginUser);

/**
 * @openapi
 * /api/user/forgetpassword:
 *  post:
 *     tags:
 *      - User Routes
 *     summary: Forgot password
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema: 
 *            $ref: '#/components/schemas/ForgetPassword'
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema: 
 *              $ref: '#/components/schemas/ForgetPasswordResponse'
 */
// Forget
router.post('/forgetpassword', Validator.validateFields({ required: ['email'] }), userController.forgetPassword);

// Reset
router.put('/resetpassword', Validator.validateFields({ required: ['newPassword', 'confirmPassword'] }), Validator.validateTokenMatch('token', 'resetPasswordToken'), userController.resetPassword);

// My information
router.get('/me', validateToken, userController.me);

// Logout
router.post('/logout', validateToken, userController.logout);

///  -- ADMIN ROUTES --

// Get user by id
router.get('/:id?', validateToken, roleMiddleware(UserRole.Manager), Validator.validateIds([{ paramName: 'id', model: User, type: Constant.User, isOptional: true }]), userController.getUserById);

// Update user by id
router.put('/:id', validateToken, roleMiddleware(UserRole.Manager), Validator.validateIds([{ paramName: 'id', model: User, type: Constant.User }]), Validator.validateFields({ optional: ['name', 'email', 'role', 'picture', 'address', 'country', 'isVerified', 'cart'] }), userController.updateUserById);

// Delete user by id
router.delete('/:id', validateToken, roleMiddleware(UserRole.Manager), Validator.validateIds([{ paramName: 'id', model: User, type: Constant.User }]), userController.deleteUserById);

export default router;
