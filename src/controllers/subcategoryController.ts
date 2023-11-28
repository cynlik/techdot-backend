import { Request, Response } from "express";
import { Subcategory } from "@src/models/subcategoryModel";
import { HttpStatus } from "@src/utils/constant";
import { CustomError } from "@src/utils/customError";
import { Product } from "@src/models/productModel";
import { hasPermission } from "@src/middlewares/roleMiddleware";
import { UserStatus } from "@src/models/userModel";
export class SubcategoryController {

  // =================|USER|=================

  public getAllSubcategory = async (req: Request, res: Response, next: Function) => {
    try {
      const isAdmin = req.user && hasPermission(req.user.role, UserStatus.Manager);

      const conditions: any = {};

      if (!isAdmin) {
        conditions.visible = true;
      }

      const subcategorys = await Subcategory.find(conditions);

      if (subcategorys.length < 1) {
        return next(new CustomError(HttpStatus.NOT_FOUND, 'Subcategories not found!'))
      }
      return res.status(HttpStatus.OK).send(subcategorys)
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'))
    }
  }

  public getAllProductBySubcategory = async (req: Request, res: Response, next: Function) => {
    const { id } = req.params
    try {
      const isAdmin = req.user && hasPermission(req.user.role, UserStatus.Manager);

      const conditions: any = { subcategoryId: id };

      if (!isAdmin) {
        conditions.visible = true;
      }

      const products = await Product.find(conditions);

      if (products.length < 1) {
        return next(new CustomError(HttpStatus.NOT_FOUND, "Products Not Found In That Subcategory"))
      }

      return res.status(HttpStatus.OK).send(products)
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'))
    }
  }

  // =================|ADMIN|=================

  public createSubcategory = async (req: Request, res: Response, next: Function): Promise<Response> => {
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
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error"));
    }
  }

  public updateSubcategory = async (req: Request, res: Response, next: Function) => {
    const subcategoryId = req.params.id;
    const updateFields = req.body;

    try {
      const updateSubcategory = await Subcategory.findByIdAndUpdate(subcategoryId, updateFields, { new: true, runValidators: true });

      return res.status(HttpStatus.OK).send(updateSubcategory);
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Error'))
    }
  }

  public deleteSubcategory = async (req: Request, res: Response, next: Function) => {
    const { id } = req.params

    try {

      const product = await Product.find({ subcategoryId: id })

      if (product.length > 0) {
        return next(new CustomError(HttpStatus.FORBIDDEN, 'Subcategoria precisa de estar vazia'))
      }

      await Subcategory.deleteOne({ _id: id });

      return res.status(HttpStatus.OK).send({ message: 'Subcategory deleted successfully' })
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Error'))
    }
  }

  public getSubcategoryByName = async (req: Request, res: Response, next: Function) => {

    try {
      const { name, page = '1', limit = '6' } = req.query as {
        name?: string;
        page?: string;
        limit?: string;
      };

      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      if (isNaN(pageNumber) || pageNumber <= 0 || isNaN(limitNumber) || limitNumber <= 0) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, 'Invalid paging parameters.'));
      }

      const conditions: any = {};

      if (name) {
        const regex = new RegExp(name, 'i');
        conditions.name = regex;
      }

      const count = await Subcategory.countDocuments(conditions);
      const totalPages = Math.ceil(count / limitNumber);

      let query = Subcategory.find(conditions);

      const subcategory = await query
        .limit(limitNumber)
        .skip((pageNumber - 1) * limitNumber);

      if (subcategory.length === 0) {
        next(new CustomError(HttpStatus.NOT_FOUND, 'No subcategories found.'))
      } else {
        res.status(200).send({ subcategory, totalPages });
      }
    } catch (error) {
      console.error(error);
      next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error.'));
    }
  };

}
