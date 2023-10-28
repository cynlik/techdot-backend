import { Request, Response } from "express";
import { Product } from "../models/productModel";
import { Subcategory } from "../models/subcategoryModel";

export class ProductController {

  public async createProduct(req: Request, res: Response): Promise<Response> {
    const { name, description, imageUrl, manufacturer, stockQuantity, price, subcategoryId } = req.body;

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

  public async updateProduct(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { name, description, imageUrl, manufacturer, stockQuantity, price, subcategoryId } = req.body;

    try {
      const product = await Product.findByIdAndUpdate(
        id,
        { name, description, imageUrl, manufacturer, stockQuantity, price },
        { new: true },
      );

      if (!product) {
        return res.status(404).send({ message: "Product not found" });
      }

      return res.status(200).send(product);
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }

  public async deleteProduct(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    try {
      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        return res.status(404).send({ message: "Product not found" });
      }

      return res.status(204).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }

  public async getProductById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    try {
      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).send({ message: "Product not found" });
      }

      return res.status(200).send(product);
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }

  public async getAllProducts(req: Request, res: Response): Promise<Response> {
    try {
      const products = await Product.find();

      return res.status(200).send(products);
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }
}

