import { Request, Response } from "express";
import { SaleModel, ISale } from "@src/models/saleModel";

export class SaleController {
  public async create(req: Request, res: Response) {
    try {
      const { user, products, purchaseDate, totalAmount }:ISale = req.body;
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

  public async getAll(req: Request, res: Response) {
    try {
      const sales = await SaleModel.find()
        .populate("user")
        .populate("products");
      res.status(200).json(sales);
    } catch (error) {
      res.status(500).json({ error: "Erro ao listar as vendas" });
    }
  }

  public async getById(req: Request, res: Response) {
    try {
      const saleId = req.params.id;
      const sale = await SaleModel.findById(saleId)
        .populate("user")
        .populate("products");
      if (!sale) {
        return res.status(404).json({ error: "Sale not found" });
      }
      res.status(200).json(sale);
    } catch (error) {
      res.status(500).json({ error: "Error retrieving sale" });
    }
  }

  public async deleteById(req: Request, res: Response) {
    try {
      const saleId = req.params.id;
      const deletedSale = await SaleModel.findByIdAndDelete(saleId);
      if (!deletedSale) {
        return res.status(404).json({ error: "Sale not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Error deleting the sale" });
    }
  }

  public async updateById(req: Request, res: Response) {
    try {
      const saleId = req.params.id;
      const { user, products, purchaseDate, totalAmount } = req.body;
      const updatedSale = await SaleModel.findByIdAndUpdate(
        saleId,
        { user, products, purchaseDate, totalAmount },
        { new: true }
      )
        .populate("user")
        .populate("products");
      if (!updatedSale) {
        return res.status(404).json({ error: "Sale not found" });
      }
      res.status(200).json(updatedSale);
    } catch (error) {
      res.status(500).json({ error: "Error updating the sale" });
    }
  }
}
