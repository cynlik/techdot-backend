import { Request, Response } from "express";
import { Category } from "@src/models/categoryModel";

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

  public async getAllCategory(req: Request, res:Response) {
    try {
      const categories = await Category.find().populate({ path: 'subcategory', populate: [{ path: 'products'}] });
      return res.status(200).send(categories)
    } catch (error) {
      return res.status(500).send({ message: 'Internal Error' })
    }
  }
  // Adicionar updateCategory | getCategoryByID 
}
