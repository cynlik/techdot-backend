import { Request, Response } from "express";
import { Category } from "../models/categoryModel";

export class CategoryController {
    
  public async createCategory(req: Request, res: Response): Promise<Response> {
    const { name } = req.body;

    try {
      const newCategory = new Category({ name });
      const savedCategory = await newCategory.save();

      return res.status(201).send(savedCategory);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Erro ao criar categoria" });
    }
  }
}
