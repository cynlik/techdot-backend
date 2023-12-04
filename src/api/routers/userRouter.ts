import express from "express";
import UserController from '@src/controllers/userController';
import { roleMiddleware } from '@src/middlewares/roleMiddleware';
import validateToken from '@src/middlewares/validateToken';
import Validator from "@src/middlewares/validator";
import { Constant } from "@src/utils/constant";
import { User, UserStatus } from "@src/models/userModel";
import { Product } from "@src/models/productModel";

const router = express.Router();
const userController = new UserController();

///  -- USER ROUTES --

// Register user
router.post('/register', Validator.validateFields({ required: ["name", "email", "password"] }), userController.registerUser);

// Verify user
router.put('/verify', Validator.validateTokenMatch("token", "verifyAccountToken"), userController.verifyAccount);

// Login
router.post("/login", Validator.validateFields({ required:["email", "password"] }), userController.loginUser);

// Forget
router.post("/forgetpassword", Validator.validateFields({ required:["email"] }), userController.forgetPassword);

// Reset
router.put("/resetpassword", Validator.validateFields({ required: ["newPassword", "confirmPassword"] }), Validator.validateTokenMatch("token", "resetPasswordToken"), userController.resetPassword);

// My information
router.get('/me', validateToken(), userController.me);

// Update my information
router.put('/me', validateToken(), Validator.validateFields({ optional: ["name","password","picture","address","country"]}), userController.meUpdate)

// Add item to wish list
router.post("/wishlist/:id", validateToken(), Validator.validateIds([{ paramName: "id", model: Product, type: Constant.Product }]), userController.addToWishList);

// Get wish list
router.get("/wishlist", validateToken(), userController.getWishList);

// Remove item from wish list
router.delete('/wishlist/:id', validateToken(), Validator.validateIds([{ paramName: "id", model: Product, type: Constant.Product }]), userController.removeFromWishList);

// Add item to cart
router.post("/cart/:id", validateToken(), Validator.validateIds([{ paramName: "id", model: Product, type: Constant.Product }]), userController.addToCart);

// Get cart items
router.get("/cart", validateToken(), userController.getCartItems);

// Update cart items
router.put("/cart", validateToken(), Validator.validateFields({ required: ["action"], optional: ["id", "quantity"] }), userController.updateCart);

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

export default router;
