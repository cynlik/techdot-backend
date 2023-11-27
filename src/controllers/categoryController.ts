import { Request, Response } from "express";
import { Category } from "@src/models/categoryModel";
import { CustomError } from "@src/utils/customError";
import { HttpStatus } from "@src/utils/constant";
import { Subcategory } from "@src/models/subcategoryModel";

export class CategoryController {
    
  public createCategory = async(req: Request, res: Response, next: Function) =>{
    const { name } = req.body;

    try {
      
      const compare = await Category.find({ name: name})

      if (compare.length > 0){
        return next(new CustomError(HttpStatus.BAD_REQUEST , "Name already exists"))
      }

      const newCategory = new Category({ name });
      const savedCategory = await newCategory.save();

      return res.status(HttpStatus.CREATED).send(savedCategory);
    } catch (error) {
      console.error(error);
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR ,"Erro ao criar categoria"));
    }
  }

  public getAllCategory = async(req: Request, res:Response, next: Function) => {
    try {
      const categories = await Category.find();

      if (categories.length < 1) {
        return next(new CustomError(HttpStatus.NOT_FOUND, 'Categories not found'))
      }

      return res.status(HttpStatus.OK).send(categories)
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR ,'Internal Error'))
    }
  }

  public getAllSubcategoryByCategory = async(req: Request, res: Response, next: Function) => {
    const { categoryId } = req.params;

    try {
      const subcategories = await Subcategory.find({ category: categoryId })

      if (subcategories.length < 1) {
        return next(new CustomError(HttpStatus.NOT_FOUND, "Subcategories not found"))
      }

      return res.status(HttpStatus.OK).send(subcategories)
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error"))
    }
  }

  public updateCategory = async(req: Request, res: Response, next: Function)  => {
    const { id } = req.params;
    const updateFields = req.body;

    try {
      const updateCategory = await Category.findByIdAndUpdate(id, updateFields, { new: true , runValidators: true});

      return res.status(HttpStatus.OK).send(updateCategory);
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR ,'Internal Error'))
    }
  }

  public deleteCategory = async (req: Request, res: Response, next: Function) => {
    const { id } = req.params

    try {
      await Category.deleteOne({ _id: id});

      // ao eliminar uma categoria vai ter que eliminar na Categories e na Subcategories
      // algterar e adicionar visible para ambos, e ao eliminar todas as subcategorias de dentro da categoria teria que ficar visible: false || não permitir eliminar enquanto tem a subcategoria associada a categoria (cliente)
      
      return res.status(HttpStatus.OK).send({ message: 'Category deleted successfully'})
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Error'))
    }
  }

}
