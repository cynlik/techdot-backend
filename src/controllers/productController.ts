import { Request, Response } from "express";
import { Product } from "../models/productModel";
import { Subcategory } from "../models/subcategoryModel";

export class ProductController {
    
  public async createProduct(req: Request, res: Response): Promise<Response> {
    const { name, description, imageUrl, manufacturer, stockQuantity, price, subcategoryId } = req.body;

    if (!subcategoryId) {
      return res.status(400).send({ message: "Subcategory ID is required" });
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
        console.log(error)
      return res.status(500).send({ message: "Erro" });
    }
  }
}
