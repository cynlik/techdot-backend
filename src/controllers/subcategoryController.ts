import { Request, Response } from "express";
import { Category } from "@src/models/categoryModel";
import { Subcategory } from "@src/models/subcategoryModel";
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

     // category.subcategory.push(savedSubcategory._id);
      await category.save();

      return res.status(201).send(savedSubcategory);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Erro ao criar subcategoria" });
    }
  }

  public async getAllSubcategory(req: Request, res:Response) {
    try {
      const subcategorys = await Subcategory.find().populate({ path: 'products'});
      return res.status(200).send(subcategorys)
    } catch (error) {
      return res.status(500).send({ message: 'Internal Error' })
    }
  }
}
