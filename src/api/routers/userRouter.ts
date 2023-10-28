import express, { Router } from "express";
import UserController from '@src/controllers/userController';

const router = express.Router();
const userController = new UserController();

router.post('/register', userController.registerUser);
router.post('/verify', userController.verifyAccount);

export default router;