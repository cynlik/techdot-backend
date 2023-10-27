import mongoose from "mongoose";
import { Request, Response } from 'express';
import asyncHandler from "express-async-handler";

//Dar import do schema

//@desc Get all Products details
//@route GET //api/product/
//@access private

const findAll = asyncHandler(async (req: Request, res: Response) => {
    res.json(console.log("a"));
});

export default {
    findAll
}