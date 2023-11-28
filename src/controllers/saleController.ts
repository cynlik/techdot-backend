import { Request, Response } from "express";
import { SaleModel, ISale } from "@src/models/saleModel";
import { UserRole } from "@src/models/userModel";

export class SaleController {
  public async create(req: Request, res: Response) {
    try {
      const { productsId, userId, } = req.body;
      const newSale = new SaleModel({
        userId,
        productsId,
        // totalAmount,
      });
      await newSale.save();
      res.status(201).json(newSale);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar a venda" });
    }
  }

  public async getAll(req: Request, res: Response) {
    try {
      const saleId = req.params.id
      
      if ( !saleId  ) {
        
        // Se for um Manager, mostra todas as vendas
        res.status(200).json(await SaleModel.find())
      } else {
        
        // Se for um Member, mostra apenas as vendas relacionadas ao próprio user
        res.status(200).json(await SaleModel.findById(saleId));
      }
    } catch (error: any) {
      console.log(error);
      
      res.status(500).json({ error: 'Erro ao listar as vendas' });
    }
  }  
  
  public async getById(req: Request, res: Response) {
      try {
        const { id } = req.params;
  
        
          const sale = await SaleModel.findById(id);

  
        res.status(200).send(sale);
      } catch (error) {
        console.error(error);
        res.status(404).json({ message: "Sale not found." });
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

  // public async updateById(req: Request, res: Response) {
  //   try {
  //     const saleId = req.params.id;
  //     const { user, products, purchaseDate, totalAmount } = req.body;
  //     const updatedSale = await SaleModel.findByIdAndUpdate(
  //       saleId,
  //       { user, products, purchaseDate, totalAmount },
  //       { new: true }
  //     )
  //       .populate("user")
  //       .populate("products");
  //     if (!updatedSale) {
  //       return res.status(404).json({ error: "Sale not found" });
  //     }
  //     res.status(200).json(updatedSale);
  //   } catch (error) {
  //     res.status(500).json({ error: "Error updating the sale" });
  //   }
  // }
}