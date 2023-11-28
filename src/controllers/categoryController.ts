import { Request, Response } from "express";
import { Category } from "@src/models/categoryModel";
import { CustomError } from "@src/utils/customError";
import { HttpStatus } from "@src/utils/constant";
import { Subcategory } from "@src/models/subcategoryModel";
import { Product } from "@src/models/productModel";
import { hasPermission } from "@src/middlewares/roleMiddleware";
import { UserStatus } from "@src/models/userModel";
export class CategoryController {

  // =================|USERS|=================

  public getAllCategory = async (req: Request, res: Response, next: Function) => {
    try {
      const isAdmin = req.user && hasPermission(req.user.role, UserStatus.Manager);

      const conditions: any = {};

      if (!isAdmin) {
        conditions.visible = true;
      }

      const categories = await Category.find(conditions);

      if (categories.length < 1) {
        return next(new CustomError(HttpStatus.NOT_FOUND, 'Categories not found'))
      }

      return res.status(HttpStatus.OK).send(categories)
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Error'))
    }
  }

  public getAllSubcategoryByCategory = async (req: Request, res: Response, next: Function) => {
    const { categoryId } = req.params;

    try {
      const isAdmin = req.user && hasPermission(req.user.role, UserStatus.Manager);

      const conditions: any = { category: categoryId };

      if (!isAdmin) {
        conditions.visible = true;
      }

      const subcategories = await Subcategory.find(conditions)

      if (subcategories.length < 1) {
        return next(new CustomError(HttpStatus.NOT_FOUND, "Subcategories not found"))
      }

      return res.status(HttpStatus.OK).send(subcategories)
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error"))
    }
  }

  public getAllProductsByCategory = async (req: Request, res: Response, next: Function) => {
    const { categoryId } = req.params

    try {

      const subcategories = await Subcategory.find({ category: categoryId })

      const isAdmin = req.user && hasPermission(req.user.role, UserStatus.Manager);

      let conditions: any = { subcategoryId: { $in: subcategories.map(sc => sc._id) } };

      if (!isAdmin) {
        conditions.visible = true;
      }

      const products = await Product.find(conditions)

      if (products.length < 1) {
        return next(new CustomError(HttpStatus.NOT_FOUND, 'No Product found!'))
      }

      return res.status(HttpStatus.OK).send(products)

    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error!'))
    }
  }

  // =================|ADMIN|=================

  public createCategory = async (req: Request, res: Response, next: Function) => {
    const { name } = req.body;

    try {

      const compare = await Category.find({ name: name })

      if (compare.length > 0) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, "Name already exists"))
      }

      const newCategory = new Category({ name });
      const savedCategory = await newCategory.save();

      return res.status(HttpStatus.CREATED).send(savedCategory);
    } catch (error) {
      console.error(error);
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao criar categoria"));
    }
  }

  public updateCategory = async (req: Request, res: Response, next: Function) => {
    const { id } = req.params;
    const updateFields = req.body;

    try {
      const updateCategory = await Category.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });

      return res.status(HttpStatus.OK).send(updateCategory);
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Error'))
    }
  }

  public deleteCategory = async (req: Request, res: Response, next: Function) => {
    const { id } = req.params

    try {

      const subcategories = await Subcategory.find({ category: id })

      if (subcategories.length > 0) {
        return next(new CustomError(HttpStatus.FORBIDDEN, 'Categoria precisa de estar vazia'))
      }


      await Category.deleteOne({ _id: id });

      return res.status(HttpStatus.OK).send({ message: 'Category deleted successfully' })
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Error'))
    }
  }

  public getCategoryByName = async (req: Request, res: Response, next: Function) => {
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

      const count = await Category.countDocuments(conditions);
      const totalPages = Math.ceil(count / limitNumber);

      let query = Category.find(conditions);

      const category = await query
        .limit(limitNumber)
        .skip((pageNumber - 1) * limitNumber);

      if (category.length === 0) {
        next(new CustomError(HttpStatus.NOT_FOUND, 'No categories found.'))
      } else {
        res.status(200).send({ category, totalPages });
      }
    } catch (error) {
      console.error(error);
      next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error.'));
    }
  };

}
