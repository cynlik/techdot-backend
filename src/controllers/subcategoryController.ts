import { Request, Response } from "express";
import { Subcategory } from "../models/subcategoryModel";
import { Category } from "../models/categoryModel";

export class SubcategoryController {
    
  public async createSubcategory(req: Request, res: Response): Promise<Response> {
    const { name, categoryId } = req.body;

    if (!name || !categoryId) {
      return res.status(400).send({ message: "Name and Category ID are required" });
    }

    try {
      const category = await Category.findById(categoryId);

      if (!category) {
        return res.status(404).send({ message: "Category not found" });
      }

      const newSubcategory = new Subcategory({ name, category: categoryId });
      const savedSubcategory = await newSubcategory.save();

      category.subcategory.push(savedSubcategory._id);
      await category.save();

      return res.status(201).send(savedSubcategory);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Erro ao criar subcategoria" });
    }
  }
}
