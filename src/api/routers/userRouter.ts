import express, { Router } from "express";
import UserController from '@src/controllers/userController';

const router = express.Router();
const userController = new UserController();

router.post('/register', (req, res) => userController.registerUser(req, res));
router.post('/verify', (req, res) => userController.verifyAccount(req, res));

export default router;