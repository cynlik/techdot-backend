import { Request, Response } from "express";
import { Category } from "@src/models/categoryModel";
import { CustomError } from "@src/utils/customError";
import { HttpStatus } from "@src/utils/constant";
import { Subcategory } from "@src/models/subcategoryModel";
import { Product } from "@src/models/productModel";
import { UserStatus } from "@src/models/userModel";
import { Error } from "@src/utils/errorCatch";
export class CategoryController {

  // =================|USERS|=================

  public getAllCategory = async (req: Request, res: Response, next: Function) => {
    
    try {
      const user = req.user;

      let viewUser = UserStatus.NonMember;
      
      if(user) {
        viewUser = user.view;
      }

      const conditions: any = {};

      if (viewUser !== UserStatus.Admin) {
        conditions.visible = true;
      }

      const categories = await Category.find(conditions);

      if (categories.length < 1) {
        return next(new CustomError(HttpStatus.NOT_FOUND, 'Categories not found'))
      }

      return res.status(HttpStatus.OK).send(categories)
    } catch (error) {
      Error(error, next)
    }
  }

  public getAllSubcategoryByCategory = async (req: Request, res: Response, next: Function) => {
    const { categoryId } = req.params;

    try {
      const user = req.user;

      let viewUser = UserStatus.NonMember;
      
      if(user) {
        viewUser = user.view;
      }

      const conditions: any = { category: categoryId};

      if (viewUser !== UserStatus.Admin) {
        conditions.visible = true;
      }

      const subcategories = await Subcategory.find(conditions)

      if (subcategories.length < 1) {
        return next(new CustomError(HttpStatus.NOT_FOUND, "Subcategories not found"))
      }

      return res.status(HttpStatus.OK).send(subcategories)
    } catch (error) {
      Error(error, next)
    }
  }

  public getAllProductsByCategory = async (req: Request, res: Response, next: Function) => {
    const { categoryId } = req.params

    try {

      const user = req.user;

      const subcategories = await Subcategory.find({ category: categoryId })

      let conditions: any = { subcategoryId: { $in: subcategories.map(sc => sc._id) } };
      
      let viewUser = UserStatus.NonMember;
      
      if(user) {
        viewUser = user.view;
      }

      if (viewUser !== UserStatus.Admin) {
        conditions.visible = true;
      }

      const products = await Product.find(conditions)

      if (products.length < 1) {
        return next(new CustomError(HttpStatus.NOT_FOUND, 'No Product found!'))
      }

      return res.status(HttpStatus.OK).send(products)

    } catch (error) {
      Error(error, next)
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
      Error(error, next)
    }
  }

  public updateCategory = async (req: Request, res: Response, next: Function) => {
    const { id } = req.params;
    const updateFields = req.body;

    try {
      const updateCategory = await Category.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });

      return res.status(HttpStatus.OK).send(updateCategory);
    } catch (error) {
      Error(error, next)
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
      Error(error, next)
    }
  }

  public getCategoryByName = async (req: Request, res: Response, next: Function) => {
    try {
      const { name, sort,page = '1', limit = '6' } = req.query as {
        sort?: string;
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

      switch (sort) {
        case 'Ordem A-Z':
          query = query.sort({ name: 1 });
          break;
        case 'Ordem Z-A':
          query = query.sort({ name: -1 });
          break;
        case 'Criado recentemente':
          query = query.sort({ createdAt: 1 });
          break;
        case 'Ultimo Criado':
          query = query.sort({ createdAt: -1 });
          break;
        case 'Modificado recentemente':
          query = query.sort({ updatedAt: 1});
          break;
        case 'Ultimo Modificado':
          query = query.sort({ updatedAt: -1});
          break;
      }

      const category = await query
        .limit(limitNumber)
        .skip((pageNumber - 1) * limitNumber);

      if (category.length === 0) {
        next(new CustomError(HttpStatus.NOT_FOUND, 'No categories found.'))
      } else {
        res.status(200).send({ category, totalPages });
      }
    } catch (error) {
      Error(error, next)
    }
  };

}
