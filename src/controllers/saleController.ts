import { Request, Response } from "express";
import { SaleModel } from "@src/models/saleModel";

export class saleController {
  public async createSale(req: Request, res: Response) {
    try {
      const { user, products, purchaseDate, totalAmount } = req.body;
      const newSale = new SaleModel({
        user,
        products,
        purchaseDate,
        totalAmount,
      });
      await newSale.save();
      res.status(201).json(newSale);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar a venda" });
    }
  }

  
  public async listSales(req: Request, res: Response) {
    try {
      const sales = await SaleModel.find()
        .populate("user")
        .populate("products");
      res.status(200).json(sales);
    } catch (error) {
      res.status(500).json({ error: "Erro ao listar as vendas" });
    }
  }
}
 