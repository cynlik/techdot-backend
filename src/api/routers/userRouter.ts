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
    .get(asyncHandler(async (req, res, next) => {
        console.log("Get a user with user Id");
        let userId = req.params.userId;

        try {
            let user = await userController.findById(userId);
            res.status(200).send(user);
        }catch(err: any) {
            err = (err instanceof Error ? err : new Error(err));

            res.status(404).send(`Error: \n ${err.message}`);
        }
    }))
    .post(asyncHandler(async (req, res, next) => {
        console.log("Update a user with user Id");
        let userId = req.params.userId;
        let newUser: Partial<IUser> = req.body;

        try {
            const user = await userController.updateById(userId, newUser);
            res.status(200).send(user);
        } catch (err: any) {
            err = (err instanceof Error ? err : new Error(err));

            res.status(404).send(`Error: \n ${err.message}`);
        }
    }))
    .delete(asyncHandler(async (req, res, next) => {
        console.log("Remove a user with user Id");
        let userId = req.params.userId;

        try {
            const user = await userController.removeById(userId);
            res.status(200).send(user);
        } catch (err: any) {
            err = (err instanceof Error ? err : new Error(err));

            res.status(404).send(`Error: \n ${err.message}`);
        }
    }));
export default router;