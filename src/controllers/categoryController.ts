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
      const categories = await Category.find();
      return res.status(200).send(categories)
    } catch (error) {
      return res.status(500).send({ message: 'Internal Error' })
    }
  }

  public updateCategory = async(req: Request, res: Response)  => {
    const { id } = req.params;
    const updateFields = req.body;

    try {
      const updateCategory = await Category.findByIdAndUpdate(id, updateFields, { new: true , runValidators: true});

      if (!updateCategory) {
        res.status(404).send({message: 'Category not found!'})
      }

      return res.status(200).send(updateCategory);
    } catch (error) {
      return res.status(500).send({ message: 'Internal Error'})
    }
  }

  public deleteCategory = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
      await Category.deleteOne({ _id: id});

      // ao eliminar uma categoria vai ter que eliminar na Categories e na Subcategories
      // algterar e adicionar visible para ambos, e ao eliminar todas as subcategorias de dentro da categoria teria que ficar visible: false || não permitir eliminar enquanto tem a subcategoria associada a categoria (cliente)
      
      return res.status(200).send({ message: 'Category deleted successfully'})
    } catch (error) {
      return res.status(500).send({ message: 'Internal Error'})
    }
  }

}
