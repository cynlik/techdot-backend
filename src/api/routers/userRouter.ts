import express from "express";
import UserController from '@src/controllers/userController';

const router = express.Router();

router.post('/register', UserController.registerUser);
router.post('/verify', UserController.verifyAccount);
router.route('/id/:userId')
    .get(UserController.getUserById)
    .post(UserController.updateUserById)
    .delete(UserController.deleteUserById);
export default router;