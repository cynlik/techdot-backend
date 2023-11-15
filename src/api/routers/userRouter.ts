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

// Register user
router.post('/register', Validator.validateBody(["name","email","password"]), userController.registerUser);

// Verify user
router.put('/verify', userController.verifyAccount);

// Login
router.post("/login", Validator.validateBody(["email","password"]), userController.loginUser);

// Forget
router.post("/forgetpassword", Validator.validateBody(["email"]), userController.forgetPassword);

// Reset
router.put("/resetpassword/:token", userController.resetPassword);

// My information
router.get('/me', validateToken, userController.me);

// User routes
router.get('/:id?', validateToken, roleMiddleware(UserRole.Manager), Validator.validateIds([{ paramName: "id", model: User, type: Constant.User, isOptional: true }]), userController.getUserById);
router.put('/:id', validateToken, roleMiddleware(UserRole.Manager), userController.updateUserById);
router.delete('/:id', validateToken, roleMiddleware(UserRole.Manager), userController.deleteUserById);

router.post('/logout', validateToken, userController.logout);

export default router;
