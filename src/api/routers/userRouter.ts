import express from 'express';
import UserController from '@src/controllers/userController';
import { roleMiddleware } from '@src/middlewares/roleMiddleware';
import validateToken from '@src/middlewares/validateToken';
import Validator from '@src/middlewares/validator';
import { Constant } from '@src/utils/constant';
import { User, UserStatus } from '@src/models/userModel';
import { Product } from '@src/models/productModel';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const userController = new UserController();

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(process.cwd(), 'public/images/users/'));
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
});

///  -- USER ROUTES --
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
 *              $ref: '#/components/schemas/RegisterUser'
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/RegisterResponse'
 */
// Register user
router.post(
  '/register',
  upload.single('picture'),
  Validator.validateFields({
    required: ['name', 'email', 'password'],
    optional: ['address', 'picture'],
  }),
  userController.registerUser,
);

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

/**
 * @openapi
 * /api/user/resetpassword:
 *  put:
 *     tags:
 *      - User Routes
 *     summary: Reset user password
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/ResetPassword'
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/SingleMessageResponse'
 *      400:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/SingleMessageResponse'
 */
// Reset
router.put('/resetpassword', Validator.validateFields({ required: ['newPassword', 'confirmPassword'] }), Validator.validateTokenMatch('token', 'resetPasswordToken'), userController.resetPassword);

/**
 * @openapi
 * /api/user/me:
 *  get:
 *     tags:
 *      - User Routes
 *     summary: Get current user
 *     parameters:
 *       - in: header
 *         name: authorization
 *         schema:
 *           type: string
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      500:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/SingleMessageResponse'
 */
// My information
router.get('/me', validateToken(), userController.me);

/**
 * @openapi
 * /api/user/me:
 *  put:
 *     tags:
 *      - User Routes
 *     summary: Update me
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
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
 *                user:
 *                  type: object
 */
// Update my information
router.put(
  '/me',
  validateToken(),
  Validator.validateFields({
    optional: ['name', 'password', 'picture', 'address', 'country'],
  }),
  userController.meUpdate,
);

// Add item to wish list
router.post('/wishlist/:id', validateToken(), Validator.validateIds([{ paramName: 'id', model: Product, type: Constant.Product }]), userController.addToWishList);

// Get wish list
router.get('/wishlist', validateToken(), userController.getWishList);

// Remove item from wish list
router.delete('/wishlist/:id', validateToken(), Validator.validateIds([{ paramName: 'id', model: Product, type: Constant.Product }]), userController.removeFromWishList);

/**
 * @openapi
 * /api/user/logout:
 *  post:
 *    tags:
 *      - User Routes
 *    summary: Log out user
 *    parameters:
 *      - in: header
 *        name: authorization
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/SingleMessageResponse'
 */
// Logout
router.post('/logout', validateToken(), userController.logout);

///  -- ADMIN ROUTES --
/**
 * @openapi
 * /api/user/change-view:
 *   put:
 *    tags:
 *     - User Routes
 *    summary: Change user permissions to view content
 *    parameters:
 *      - in: header
 *        name: authorization
 *        schema:
 *          type: string
 *   responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ChangeView'
 */
// Change view
router.put('/change-view', validateToken(), roleMiddleware(UserStatus.Manager), userController.changeView);

/**
 * @openapi
 * /api/user/{id}:
 *  get:
 *     tags:
 *      - User Routes
 *     summary: Admin - Get user by ID
 *     parameters:
 *       - in: header
 *         name: authorization
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      500:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/SingleMessageResponse'
 */
// Get user by id
router.get('/:id?', validateToken(), roleMiddleware(UserStatus.Manager), Validator.validateIds([{ paramName: 'id', model: User, type: Constant.User, isOptional: true }]), userController.getUserById);

/**
 * @openapi
 * /api/user/{id}:
 *  put:
 *     tags:
 *      - User Routes
 *     summary: Admin - Edit user by ID
 *     parameters:
 *       - in: header
 *         name: authorization
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     requestBody:
 *      required: false
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
 *      500:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/SingleMessageResponse'
 */
// Update user by id
router.put(
  '/:id',
  validateToken(),
  roleMiddleware(UserStatus.Manager),
  Validator.validateIds([{ paramName: 'id', model: User, type: Constant.User }]),
  Validator.validateFields({
    optional: ['name', 'email', 'role', 'picture', 'address', 'country', 'isVerified', 'cart'],
  }),
  userController.updateUserById,
);

/**
 * @openapi
 * /api/user/{id}:
 *  delete:
 *     tags:
 *      - User Routes
 *     summary: Admin - Delete user by ID
 *     parameters:
 *       - in: header
 *         name: authorization
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      500:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/SingleMessageResponse'
 */
// Delete user by id
router.delete('/:id', validateToken(), roleMiddleware(UserStatus.Manager), Validator.validateIds([{ paramName: 'id', model: User, type: Constant.User }]), userController.deleteUserById);

export default router;
