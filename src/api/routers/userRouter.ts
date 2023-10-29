import express, { Router } from "express";
import UserController from '@src/controllers/userController';
import asyncHandler from "express-async-handler";
import { IUser } from "@src/models/userModel";

const router = express.Router();
const userController = new UserController();

//Register user
router.post('/register', userController.registerUser);

//Verify user
router.put('/verify', userController.verifyAccount);

//Login
router.post("/login", userController.loginUser);

router.route('/id/:userId')
    .get(userController.getUserById)
    .post(userController.updateUserById)
    .delete(userController.deleteUserById);
    
export default router;