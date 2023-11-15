import express from "express";
import UserController from '@src/controllers/userController';
import { roleMiddleware } from '@src/middlewares/roleMiddleware';
import { UserRole } from "@src/utils/roles";
import validateToken from '@src/middlewares/validateToken';
import Validator from "@src/middlewares/validator";
import { Constant } from "@src/utils/constant";
import { User } from "@src/models/userModel";

const router = express.Router();
const userController = new UserController();

///  -- USER ROUTES --

// Register user
router.post('/register', Validator.validateBody(["name","email","password"]), userController.registerUser);

// Verify user
router.put('/verify', userController.verifyAccount);

// Login
router.post("/login", Validator.validateBody(["email","password"]), userController.loginUser);

// Forget
router.post("/forgetpassword", Validator.validateBody(["email"]), userController.forgetPassword);

// Reset
router.put("/resetpassword", Validator.validateBody(["newPassword","confirmPassword"]), userController.resetPassword);

// My information
router.get('/me', validateToken, userController.me);

// Logout
router.post('/logout', validateToken, userController.logout);

///  -- ADMIN ROUTES --

// Get user by id
router.get('/:id?', validateToken, roleMiddleware(UserRole.Manager), Validator.validateIds([{ paramName: "id", model: User, type: Constant.User, isOptional: true }]), userController.getUserById);

// Update user by id
router.put('/:id', validateToken, roleMiddleware(UserRole.Manager), Validator.validateIds([{ paramName: "id", model: User, type: Constant.User }]), Validator.validateOptionalBody(["name","email","role","picture","address","country","isVerified","cart"]), userController.updateUserById);

// Delete user by id
router.delete('/:id', validateToken, roleMiddleware(UserRole.Manager), Validator.validateIds([{ paramName: "id", model: User, type: Constant.User }]),userController.deleteUserById);

export default router;
