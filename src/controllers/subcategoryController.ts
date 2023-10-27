import { Request, Response } from "express";
import { Subcategory } from "../models/subcategoryModel";

export class SubcategoryController {
    
  public async createSubcategory(req: Request, res: Response): Promise<Response> {
    const { name } = req.body;

    try {
      const newSubcategory = new Subcategory({ name });
      const savedSubcategory = await newSubcategory.save();

      return res.status(201).send(savedSubcategory);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Erro ao criar subcategoria" });
    }
  }
}
