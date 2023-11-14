import { Request, Response } from "express";
import { IProduct, Product } from "@src/models/productModel";
import { UserRole } from "@src/utils/roles";
import { hasPermission } from "@src/middlewares/roleMiddleware";

export class ProductController {

  public createProduct = async (req: Request, res: Response) => {
    const {
      name,
      description,
      imageUrl,
      manufacturer,
      stockQuantity,
      price,
      subcategoryId,
      productType,
      specifications,
      warranty
    }: Partial<IProduct> = req.body;

    try {
      const newProduct = new Product({
        name,
        description,
        imageUrl,
        manufacturer,
        stockQuantity,
        price,
        subcategoryId,
        productType,
        specifications,
        warranty,
      });

      // adicionar validação de data

      const savedProduct = await newProduct.save();

      return res.status(201).send(savedProduct);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  };

  public updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateFields = req.body;
  
    try {
      const updatedProduct = await Product.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
  
      if (!updatedProduct) {
        return res.status(404).send({ message: "Product not found" });
      }
  
      return res.status(200).send(updatedProduct);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  };
  
  public deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {

      await Product.findByIdAndDelete(id);

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  };

  public getProductsByName = async (req: Request, res: Response) => {
    try {
      const { name, sort, page = '1', limit = '6' } = req.query as {
        name?: string;
        sort?: string;
        page?: string;
        limit?: string;
      };
      
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      if (isNaN(pageNumber) || pageNumber <= 0 || isNaN(limitNumber) || limitNumber <= 0) {
        return res.status(400).send({ message: 'Parâmetros de paginação inválidos.' });
      }
  
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
      const totalPages = Math.ceil(count / limitNumber);
  
      let query = Product.find(conditions).populate({ path: 'subcategoryId', populate: [{ path: 'category' }] });
  
      switch (sort) {
        case 'preco_maior':
          query = query.sort({ price: -1 });
          break;
        case 'preco_menor':
          query = query.sort({ price: 1 });
          break;
      }
  
      const products = await query
        .limit(limitNumber)
        .skip((pageNumber - 1) * limitNumber);
  
      if (products.length === 0) {
        res.status(404).send({ message: 'Nenhum produto encontrado.' });
      } else {
        res.status(200).send({ products, totalPages });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Erro ao buscar produtos.' });
    }
  };

  public getProductById = async (req: Request, res: Response) => {
    const { id } = req.params;

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
