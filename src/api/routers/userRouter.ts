import express from "express";
import UserController from '@src/controllers/userController';
import { roleMiddleware } from '@src/middlewares/roleMiddleware';
import { UserRole } from "@src/utils/roles";
import validateToken from '@src/middlewares/validateToken'; // Importe o middleware de validação de token

const router = express.Router();
const userController = new UserController();

// Register user
router.post('/register', userController.registerUser);

// Verify user
router.put('/verify', userController.verifyAccount);

// Login (Rota que não requer validação de token)
router.post("/login", userController.loginUser);

// User routes
router.get('/id/:userId', validateToken, roleMiddleware(UserRole.ManageClients), userController.getUserById);
router.post('/id/:userId', validateToken, roleMiddleware(UserRole.ManageClients), userController.updateUserById);
router.delete('/id/:userId', validateToken, roleMiddleware(UserRole.ManageClients), userController.deleteUserById);

export default router;
