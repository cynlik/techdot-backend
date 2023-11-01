import { Request, Response } from "express";
import mongoose from "mongoose";
import { Product, IProduct } from "@src/models/productModel";
import { Subcategory, ISubcategory } from "@src/models/subcategoryModel";
import { Constant } from "@src/utils/constant"

export class ProductController {

  private async findProductById(id: string): Promise<IProduct | null> {
    return await Product.findById(id);
  }

  private async findSubcategoryById(id: string): Promise<ISubcategory | null> {
    return await Subcategory.findById(id);
  }

  private validateProductData(data: any): string[] {
    const errors: string[] = [];
    if (!data.name) errors.push('Name is required');
    if (!data.description) errors.push('Description is required');
    if (!data.imageUrl) errors.push('Image URL is required');
    if (!data.manufacturer) errors.push('Manufacturer is required');
    if (data.stockQuantity === undefined || data.stockQuantity === null) errors.push('Stock quantity is required');
    if (!data.price) errors.push('Price is required');
    if (!data.subcategoryId) errors.push('Subcategory ID is required');
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
      return res.status(400).send({ message: errors.join(', ') });
    }
    return null;

    // Adicionar Typo de mensagem global junto com o erro
    // Melhorar os códigos de status enviados para erro de ID 422, talvez fazer global
  }

  public createProduct = async (req: Request, res: Response) => {
    const { name, description, imageUrl, manufacturer, stockQuantity, price, subcategoryId } = req.body;

    const validations = [
      () => this.validateProductData(req.body),
      () => this.validateId(subcategoryId, Constant.Subcategory)
    ];
  
    for (const validate of validations) {
      const errors = validate();
      const response = this.sendErrorResponse(errors, res);
      if (response) return response;
    }

    try {
      const subcategory = await this.findSubcategoryById(subcategoryId);
      if (!subcategory) {
        return res.status(404).send({ message: 'Subcategory not found' });
      }

      const newProduct = new Product({ name, description, imageUrl, manufacturer, stockQuantity, price });
      const savedProduct = await newProduct.save();

      subcategory.products.push(savedProduct._id);
      await subcategory.save();

      return res.status(201).send(savedProduct);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Internal Server Error' });
    }
  }

  public updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, imageUrl, manufacturer, stockQuantity, price, subcategoryId } = req.body;
  
    const validations = [
      () => this.validateId(id, 'Product'),
      () => this.validateProductData(req.body),
      () => this.validateId(subcategoryId, 'Subcategory'),
    ];
  
    for (const validate of validations) {
      const errors = validate();
      const response = this.sendErrorResponse(errors, res);
      if (response) return response;
    }
  
    try {
      const product = await this.findProductById(id);
      if (!product) {
        return res.status(404).send({ message: 'Product not found' });
      }
  
      const newSubcategory = await this.findSubcategoryById(subcategoryId);
      if (!newSubcategory) {
        return res.status(404).send({ message: 'Subcategory not found' });
      }
  
      const oldSubcategories = await Subcategory.find({ products: product._id });
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
      await product.save();
  
      return res.status(200).send(product);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Internal Server Error' });
    }
  };
  

  public deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;

    // Antes de eliminar tem que ver onde está o produto a ser eliminado e tem que eliminar de todos os sitios

    const validations = [
      () => this.validateId(id, Constant.Product)
    ];
  
    for (const validate of validations) {
      const errors = validate();
      const response = this.sendErrorResponse(errors, res);
      if (response) return response;
    }

    try {
      const product = await this.findProductById(id);
      if (!product) {
        return res.status(404).send({ message: 'Product not found' });
      }

      await Product.findByIdAndDelete(id);
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Internal Server Error' });
    }
  }

  public getProductById = async (req: Request, res: Response) => {
    const { id } = req.params;

    const validations = [
      () => this.validateId(id, Constant.Product)
    ];
  
    for (const validate of validations) {
      const errors = validate();
      const response = this.sendErrorResponse(errors, res);
      if (response) return response;
    }

    try {
      const product = await this.findProductById(id);
      if (!product) {
        return res.status(404).send({ message: 'Product not found' });
      }

      return res.status(200).send(product);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Internal Server Error' });
    }
  }

  public getAllProducts = async (req: Request, res: Response) => {
    try {
      const products = await Product.find();
      return res.status(200).send(products);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Internal Server Error' });
    }
  }
}
