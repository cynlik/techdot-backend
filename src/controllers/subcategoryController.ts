import { Request, Response } from "express";
import { Category } from "@src/models/categoryModel";
import { Subcategory } from "@src/models/subcategoryModel";
import { HttpStatus } from "@src/utils/constant";
import { CustomError } from "@src/utils/customError";
import { Product } from "@src/models/productModel";
export class SubcategoryController {
    
  public async createSubcategory(req: Request, res: Response, next: Function): Promise<Response> {
    const { name, categoryId } = req.body;

    try {
      const compare = await Subcategory.find({ name: name })

      if (compare.length > 0) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, "Name already exists"))
      }

      const newSubcategory = new Subcategory({ name, category: categoryId });
      const savedSubcategory = await newSubcategory.save();

      return res.status(HttpStatus.CREATED).send(savedSubcategory);
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR ,"Internal Server Error"));
    }
  }

  public async getAllSubcategory(req: Request, res:Response, next: Function) {
    try {
      const subcategorys = await Subcategory.find();
      return res.status(HttpStatus.OK).send(subcategorys)
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR ,'Internal Server Error'))
    }
  }

  public async getAllProductBySubcategory(req: Request, res: Response, next: Function) {
    const { id } = req.params
    try {
      const products = await Product.find({ subcategoryId: id });

      if (products.length < 1) {
        return next(new CustomError(HttpStatus.NOT_FOUND, "Products Not Found"))
      }
      
      return res.status(HttpStatus.OK).send(products)
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR ,'Internal Server Error'))
    }
  }
}
