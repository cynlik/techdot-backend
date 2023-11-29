import express from "express";
import UserController from '@src/controllers/userController';
import { roleMiddleware } from '@src/middlewares/roleMiddleware';
import validateToken from '@src/middlewares/validateToken';
import Validator from "@src/middlewares/validator";
import { Constant } from "@src/utils/constant";
import { User, UserStatus } from "@src/models/userModel";

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
