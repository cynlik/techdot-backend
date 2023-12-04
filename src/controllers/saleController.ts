import { Request, Response } from "express";
import { SaleModel, ISale } from "@src/models/saleModel";
import { UserStatus } from "@src/models/userModel";
import { HttpStatus } from '@src/utils/constant';
import { CustomError } from '@src/utils/customError';
import { hasPermission } from "@src/middlewares/roleMiddleware";import { IProduct, Product } from "@src/models/productModel";


export class SaleController {
public create = async (req: Request, res: Response, next: Function) => {
  try { 
    const { userId, products } = req.body;
    console.log("---------------------------");
    console.log(userId);
    console.log(products);
    console.log("---------------------------");
    

    // Verificar o stock 
    for (const productItem of products) {
      const product = await Product.findById(productItem.product);
      
       if (!product) {
         return next(new CustomError(HttpStatus.NOT_FOUND, 'Not found'));
       }

      // Verificar se a quantidade na venda é maior do que o stock disponível
      if (productItem.quantity > product.stockQuantity) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, 'Bad Request'));
      }
    }

    // Se todos os produtos têm stock suficiente, criar a venda
    // const totalAmount = products.reduce((total, item) => total + item.quantity, 0);
    
    const newSale = new SaleModel({
      userId,
      products,
    } as ISale);

    // Subtrair a quantidade vendida do stock de cada produto
    for (const productItem of products) {
      const product = await Product.findById(productItem.product);
      if (product) {
        product.stockQuantity -= productItem.quantity;
        await product.save();
      }
    }

    await newSale.save();
    res.status(HttpStatus.CREATED).json(newSale);
  } catch (error) {
    return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
  }
}

  public getAll = async(req: Request, res: Response, next: Function) => {    
    try {
      const saleId = req.params.id;
      const user = req.user;
      
      if (!user) {
        return next(new CustomError(HttpStatus.UNAUTHORIZED,'Unauthorized'))
      }
  
      const isAdmin = hasPermission(user.role, UserStatus.Manager);
      const isMember = hasPermission(user.role, UserStatus.Member);
  
      if (saleId) {
        
        const sale = await SaleModel.findById(saleId);
        if (!sale) {
          return next(new CustomError(HttpStatus.NOT_FOUND, 'Not Found'))
        }
  
        if (isAdmin || (isMember && sale.userId.equals(user.id))) {
          return res.status(HttpStatus.OK).json(sale);
        } else {
          return next(new CustomError(HttpStatus.FORBIDDEN, 'Forbidden'))
        }
      } else {
        if (isAdmin) {
          const sales = await SaleModel.find();
          return res.status(HttpStatus.OK).json(sales);
        } else if (isMember) {
          const sales = await SaleModel.find({ userId: user.id });
           return res.status(HttpStatus.OK).send(sales)
        } else {
          return next(new CustomError(HttpStatus.FORBIDDEN, 'Forbidden'))
        }
      } 
    } catch (error) {
      console.error(error);
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR,'Internal Server Error'))
    }
  } 

  public deleteById = async (req: Request, res: Response, next: Function) => {
    try {
      const saleId = req.params.id;
      const deletedSale = await SaleModel.findByIdAndDelete(saleId);
      if (!deletedSale) {
        return next(new CustomError(HttpStatus.NOT_FOUND, 'Not Found'))
      }
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'))
    }
  }

  // public updateById = async (req: Request, res: Response, next: Function) =>  {
 //user, products, purchaseDate, totalAmount } = req.body;
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