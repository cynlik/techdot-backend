import { Request, Response } from 'express';
import { IProduct, Product } from '@src/models/productModel';
import { UserStatus } from '@src/models/userModel';
import { hasPermission } from '@src/middlewares/roleMiddleware';
import { CustomError } from '@src/utils/customError';
import { HttpStatus } from '@src/utils/constant';
import { Error } from '@src/utils/errorCatch';
import fs from 'fs/promises';
import path from 'path';

export class ProductController {
  // =================|USERS|=================

  public getProductsByName = async (req: Request, res: Response, next: Function) => {
    try {
      const user = req.user;

      const {
        name,
        sort,
        page = '1',
        limit = '6',
      } = req.query as {
        name?: string;
        sort?: string;
        page?: string;
        limit?: string;
      };

      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      if (isNaN(pageNumber) || pageNumber <= 0 || isNaN(limitNumber) || limitNumber <= 0) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, 'Parâmetros de paginação inválidos.'));
      }

      let viewUser = UserStatus.NonMember;

      if (user) {
        viewUser = user.view;
      }

      const conditions: any = {};

      if (viewUser !== UserStatus.Admin) {
        conditions.visible = true;
      }

      if (name) {
        const regex = new RegExp(name, 'i');
        conditions.name = regex;
      }

      const count = await Product.countDocuments(conditions);
      const totalPages = Math.ceil(count / limitNumber);

      let query = Product.find(conditions);

      switch (sort) {
        case 'preco_maior':
          query = query.sort({ price: -1 });
          break;
        case 'preco_menor':
          query = query.sort({ price: 1 });
          break;
      }

      const products = await query.limit(limitNumber).skip((pageNumber - 1) * limitNumber);

      if (products.length === 0) {
        next(new CustomError(HttpStatus.NOT_FOUND, 'Nenhum produto encontrado.'));
      } else {
        res.status(200).send({ products, totalPages });
      }
    } catch (error) {
      next(Error(error));
    }
  };

  public getProductById = async (req: Request, res: Response, next: Function) => {
    const { id } = req.params;

    try {
      const isAdmin = req.user && hasPermission(req.user.role, UserStatus.Manager);

      const conditions: any = { _id: id };

      if (!isAdmin) {
        conditions.visible = true;
      }

      const product = await Product.findOne(conditions);

      if (!product) {
        return next(new CustomError(HttpStatus.NOT_FOUND, 'Product not found'));
      }

      return res.status(200).send(product);
    } catch (error) {
      next(Error(error));
    }
  };

  // =================|ADMIN|=================

  public createProduct = async (req: Request, res: Response, next: Function) => {
    const { name, description, manufacturer, stockQuantity, price, subcategoryId, productType, specifications, warranty }: Partial<IProduct> = req.body;
    const image = req.file;

    try {
      const newProduct = new Product({
        name,
        description,
        manufacturer,
        stockQuantity,
        price,
        subcategoryId,
        productType,
        specifications,
        warranty,
      });

      const savedProduct = await newProduct.save();

      if (image) {
        const newFileName = savedProduct._id + path.extname(image.originalname);
        const oldPath = path.join(image.destination, image.originalname);
        const newPath = path.join(image.destination, newFileName);
        await fs.rename(oldPath, newPath);

        savedProduct.imageUrl = newFileName;

        await savedProduct.save();
      }

      return res.status(HttpStatus.CREATED).json(savedProduct);
    } catch (error) {
      next(Error(error));
    }
  };

  public updateProduct = async (req: Request, res: Response, next: Function) => {
    const { id } = req.params;
    const updateFields = req.body;

    try {
      const updatedProduct = await Product.findByIdAndUpdate(id, updateFields, {
        new: true,
        runValidators: true,
      });

      return res.status(HttpStatus.OK).json(updatedProduct);
    } catch (error) {
      next(Error(error));
    }
  };

  public deleteProduct = async (req: Request, res: Response, next: Function) => {
    const { id } = req.params;

    try {
      await Product.findByIdAndDelete(id);

      return res.status(204).json({ message: 'Product successfully deleted!' });
    } catch (error) {
      next(Error(error));
    }
  };
}
