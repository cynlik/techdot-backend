import { Request, Response } from "express";
import { Product } from "../models/productModel";
import { Subcategory } from "../models/subcategoryModel";

export class ProductController {
  
  private validateRequest(req: Request): { isValid: boolean; message?: string } {
    const { name, description, imageUrl, manufacturer, stockQuantity, price, subcategoryId } = req.body;

    if (!name || !description || !imageUrl || !manufacturer || stockQuantity == null || price == null) {
      return { isValid: false, message: "All fields are required" };
    }

    if (typeof price !== 'number' || price <= 0) {
      return { isValid: false, message: "Price must be a positive number" };
    }

    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      return { isValid: false, message: "Stock quantity must be a non-negative integer" };
    }

    if (!subcategoryId || !/^[0-9a-fA-F]{24}$/.test(subcategoryId)) {
      return { isValid: false, message: "Invalid subcategory ID" };
    }

    try {
      new URL(imageUrl);
    } catch (_) {
      return { isValid: false, message: "Invalid image URL" };
    }

    return { isValid: true };
  }

  public async createProduct(req: Request, res: Response): Promise<Response> {
    const { name, description, imageUrl, manufacturer, stockQuantity, price, subcategoryId } = req.body;

    const { isValid, message } = this.validateRequest(req);
    if (!isValid) {
      return res.status(400).send({ message });
    }

    try {
      const subcategory = await Subcategory.findById(subcategoryId);

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
      console.log(error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }
}
