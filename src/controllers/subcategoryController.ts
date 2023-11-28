import { Request, Response } from "express";
import { Category } from "@src/models/categoryModel";
import { Subcategory } from "@src/models/subcategoryModel";
import { HttpStatus } from "@src/utils/constant";
import { CustomError } from "@src/utils/customError";
import { Product } from "@src/models/productModel";
export class SubcategoryController {

  // =================|USER|=================

  public getAllSubcategory = async(req: Request, res:Response, next: Function) => {
    try {
      const subcategorys = await Subcategory.find({ visible: true});
      return res.status(HttpStatus.OK).send(subcategorys)
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR ,'Internal Server Error'))
    }
  }

  public getAllProductBySubcategory = async(req: Request, res: Response, next: Function) => {
    const { id } = req.params
    try {
      const products = await Product.find({ subcategoryId: id, visible: true });

      if (products.length < 1) {
        return next(new CustomError(HttpStatus.NOT_FOUND, "Products Not Found In That Subcategory"))
      }
      
      return res.status(HttpStatus.OK).send(products)
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR ,'Internal Server Error'))
    }
  }

  // =================|ADMIN|=================

  public createSubcategory = async(req: Request, res: Response, next: Function): Promise<Response> => {
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

  public updateSubcategory = async(req: Request, res: Response, next: Function)  => {
    const subcategoryId = req.params.id;
    const updateFields = req.body;

    try {
      const updateSubcategory = await Subcategory.findByIdAndUpdate(subcategoryId, updateFields, { new: true , runValidators: true});

      return res.status(HttpStatus.OK).send(updateSubcategory);
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR ,'Internal Error'))
    }
  }

  public deleteSubcategory = async (req: Request, res: Response, next: Function) => {
    const { id } = req.params

    try {

      const product = await Product.find({ subcategoryId: id })

      if ( product.length > 0 ) {
        return next(new CustomError(HttpStatus.FORBIDDEN, 'Subcategoria precisa de estar vazia'))
      }

      await Subcategory.deleteOne({ _id: id});

      return res.status(HttpStatus.OK).send({ message: 'Subcategory deleted successfully'})
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Error'))
    }
  }

}
