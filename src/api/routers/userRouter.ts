import express from "express";
import UserController from '@src/controllers/userController';
import { roleMiddleware } from '@src/middlewares/roleMiddleware';
import { UserRole } from "@src/utils/roles";
import validateToken from '@src/middlewares/validateToken'; 

const router = express.Router();
const userController = new UserController();

// Register user
router.post('/register', userController.registerUser);

// Verify user
router.put('/verify', userController.verifyAccount);

// Login
router.post("/login", userController.loginUser);

// Forget
router.post("/forgetpassword/:email", userController.forgetPassword);

// Reset
router.put("/resetpassword/:token", userController.resetPassword);

// My information
router.get('/me', validateToken, userController.me);

// User routes
router.get('/:id?', validateToken, roleMiddleware(UserRole.Manager), userController.getUserById);
router.put('/:id', validateToken, roleMiddleware(UserRole.Manager), userController.updateUserById);
router.delete('/:id', validateToken, roleMiddleware(UserRole.Manager), userController.deleteUserById);

router.post('/logout', userController.logout);

export default router;
