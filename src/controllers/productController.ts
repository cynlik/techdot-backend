import { Request, Response } from "express";
import mongoose from "mongoose";
import { Product, IProduct } from "@src/models/productModel";
import { Subcategory, ISubcategory } from "@src/models/subcategoryModel";
import { Constant } from "@src/utils/constant";
import { UserRole } from "@src/utils/roles";
import { hasPermission } from "@src/middlewares/roleMiddleware";

export class ProductController {
  private async findProductById(id: string): Promise<IProduct | null> {
    return await Product.findById(id);
  }

  private async findSubcategoryById(id: string): Promise<ISubcategory | null> {
    return await Subcategory.findById(id);
  }

  private validateProductData(data: any): string[] {
    const errors: string[] = [];
    if (!data.name) errors.push("Name is required");
    if (!data.description) errors.push("Description is required");
    if (!data.imageUrl) errors.push("Image URL is required");
    if (!data.manufacturer) errors.push("Manufacturer is required");
    if (data.stockQuantity === undefined || data.stockQuantity === null)
      errors.push("Stock quantity is required");
    if (!data.price) errors.push("Price is required");
    if (!data.subcategoryId) errors.push("Subcategory ID is required");
    return errors;
  }

  private validateId(id: string, type: string): string[] {
    const errors: string[] = [];
    if (!id) errors.push(`${type} ID is required`);
    if (!mongoose.Types.ObjectId.isValid(id)) errors.push(`Invalid ${type} ID`);
    return errors;
  }

  private sendErrorResponse(errors: string[], res: Response): Response | null {
    if (errors.length > 0) {
      return res.status(400).send({ message: errors.join(", ") });
    }
    return null;

    // Adicionar Typo de mensagem global junto com o erro
    // Melhorar os códigos de status enviados para erro de ID 422, talvez fazer global
  }

  public createProduct = async (req: Request, res: Response) => {
    const {
      name,
      description,
      imageUrl,
      manufacturer,
      stockQuantity,
      price,
      subcategoryId,
    } = req.body;

    const validations = [
      () => this.validateProductData(req.body),
      () => this.validateId(subcategoryId, Constant.Subcategory),
    ];

    for (const validate of validations) {
      const errors = validate();
      const response = this.sendErrorResponse(errors, res);
      if (response) return response;
    }

    try {
      const subcategory = await this.findSubcategoryById(subcategoryId);
      if (!subcategory) {
        return res.status(404).send({ message: "Subcategory not found" });
      }

      const newProduct = new Product({
        name,
        description,
        imageUrl,
        manufacturer,
        stockQuantity,
        price,
      });
      const savedProduct = await newProduct.save();

      subcategory.products.push(savedProduct._id);
      await subcategory.save();

      return res.status(201).send(savedProduct);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  };

  public updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      name,
      description,
      imageUrl,
      manufacturer,
      stockQuantity,
      price,
      subcategoryId,
      visible,
    } = req.body;

    const validations = [
      () => this.validateId(id, Constant.Product),
      () => this.validateProductData(req.body),
      () => this.validateId(subcategoryId, Constant.Subcategory),
    ];

    for (const validate of validations) {
      const errors = validate();
      const response = this.sendErrorResponse(errors, res);
      if (response) return response;
    }

    try {
      const product = await this.findProductById(id);
      if (!product) {
        return res.status(404).send({ message: "Product not found" });
      }

      const newSubcategory = await this.findSubcategoryById(subcategoryId);
      if (!newSubcategory) {
        return res.status(404).send({ message: "Subcategory not found" });
      }

      const oldSubcategories = await Subcategory.find({
        products: product._id,
      });
      for (const oldSubcategory of oldSubcategories) {
        oldSubcategory.products = oldSubcategory.products.filter(
          (productId) => productId.toString() !== id
        );
        await oldSubcategory.save();
      }

      if (!newSubcategory.products.includes(product._id)) {
        newSubcategory.products.push(product._id);
        await newSubcategory.save();
      }

      product.name = name;
      product.description = description;
      product.imageUrl = imageUrl;
      product.manufacturer = manufacturer;
      product.stockQuantity = stockQuantity;
      product.price = price;
      product.visible = visible;
      await product.save();

      return res.status(200).send(product);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  };

  public deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;

    const validations = [() => this.validateId(id, Constant.Product)];

    for (const validate of validations) {
      const errors = validate();
      const response = this.sendErrorResponse(errors, res);
      if (response) return response;
    }

    try {
      const product = await this.findProductById(id);
      if (!product) {
        return res.status(404).send({ message: "Product not found" });
      }

      await Product.findByIdAndDelete(id);

      const subcategories = await Subcategory.find({ products: id });
      for (const subcategory of subcategories) {
        subcategory.products = subcategory.products.filter(
          (productId) => productId.toString() !== id
        );
        await subcategory.save();
      }

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  };

  public getProductsByName = async (req: Request, res: Response) => {
    const { name, sort, page = 1, limit = 6 } = req.query as {
        name?: string;
        sort: string;
        page: string;
        limit: string;
    };

    const isAdmin = req.user && hasPermission(req.user.role, UserRole.Manager);

    const conditions: any = {};

    if (!isAdmin) {
        conditions.visible = true;
    }

    if (name) {
        const regex = new RegExp(name, 'i');
        conditions.name = regex;
    }

    const count = await Product.countDocuments(conditions);
    const totalPages = Math.ceil(count / Number(limit));

    let query = Product.find(conditions);

    if (sort) {
        switch (sort) {
            case 'preco_maior':
                query = query.sort({ price: -1 });
                break;
            case 'preco_menor':
                query = query.sort({ price: 1 });
                break;
            default:
                break;
        }
    }

    let products = await query
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

    if (products.length === 0) {
        res.status(404).send({ message: 'Nenhum produto encontrado.' });
    } else {
        res.status(200).send({ products, totalPages });
    }
  };

  public getProductById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const validations = [() => this.validateId(id, Constant.Product)];
  
    for (const validate of validations) {
      const errors = validate();
      const response = this.sendErrorResponse(errors, res);
      if (response) return response;
    }
  
    try {
      const isAdmin = req.user && hasPermission(req.user.role, UserRole.Manager);
      
      const conditions: any = { _id: id };
      
      if (!isAdmin) {
        conditions.visible = true;
      }
      
      const product = await Product.findOne(conditions);
      
      if (!product) {
        return res.status(404).send({ message: 'Product not found' });
      }
  
      return res.status(200).send(product);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Internal Server Error' });
    }
  };

  
}
