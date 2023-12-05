import { Request, Response } from "express";
import { SaleModel, ISale } from "@src/models/saleModel";
import { UserStatus } from "@src/models/userModel";
import { HttpStatus } from '@src/utils/constant';
import { CustomError } from '@src/utils/customError';
import { hasPermission } from "@src/middlewares/roleMiddleware";
import { IProduct, Product } from "@src/models/productModel";

export class SaleController {
public create = async (req: Request, res: Response, next: Function) => {
  try { 
    const {userName, userEmail, userAdress, userPhone, paymentMethod, products } = req.body
    const user = req.user

    // Verificar o stock*
    for (const productItem of products) {
      const product = await Product.findOne({ name: productItem.nameProduct });

       if (!product) {  
        console.log(products);      
         return next(new CustomError(HttpStatus.NOT_FOUND, 'Not found'));
       }

      // Verificar se a quantidade na sale é maior do que o stock disponível*
      if (productItem.quantity > product.stockQuantity) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, 'Out of stock'));
      }
    }

    // TotalAmount
    let totalAmount = 0;

    for (const productItem of products) {
      const product = await Product.findOne({ name: productItem.nameProduct });
    
      if (product) {
        // Adicionar o price do produto ao totalAmount
        console.log(`Quantidade: ${productItem.quantity}, Preço unitário: ${product.price}`);
        totalAmount += productItem.quantity * product.price;
        console.log(`Total atual: ${totalAmount}`);
      } else {
        console.log(`Produto não encontrado para ${productItem.nameProduct}`);
      }
    }
      
    const newSale = new SaleModel({
      userName,
      userEmail,
      userAdress,
      userPhone,
      paymentMethod,
      products,
    } as ISale);

    // Subtrair a quantidade vendida do stock de cada produto*
    for (const productItem of products) {
      const product = await Product.findOne({ name: productItem.nameProduct });
      if (product) {
        product.stockQuantity -= productItem.quantity;
        await product.save();
      }
    }

    await newSale.save();
    res.status(HttpStatus.CREATED).json(newSale);
  } catch (error) {
    console.error(error); 
    return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
  }
}

  public getAll = async(req: Request, res: Response, next: Function) => {    
    try {
      const userEmail = req.params.id;
      const user = req.user;
      
      if (!user) {
        return next(new CustomError(HttpStatus.UNAUTHORIZED,'Unauthorized'))
      }
  
      const isAdmin = hasPermission(user.role, UserStatus.Manager);
      const isMember = hasPermission(user.role, UserStatus.Member);
  
      if (userEmail) {
        
        const sale = await SaleModel.findById(userEmail);
        if (!sale) {
          return next(new CustomError(HttpStatus.NOT_FOUND, 'Not Found'))
        }
  
        if (isAdmin || (isMember && sale.userEmail === (user.email))) {
          return res.status(HttpStatus.OK).json(sale);
        } else {
          return next(new CustomError(HttpStatus.FORBIDDEN, 'Forbidden'))
        }
      } else {
        if (isAdmin) {
          const sales = await SaleModel.find();
          return res.status(HttpStatus.OK).json(sales);
        } else if (isMember) {
          const sales = await SaleModel.find({ userEmail: user.email });
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

//   public cancel = async (req: Request,  res: Response, next: Function) => {
//   try{
    
//   }catch(error){
//     return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'))
//   }
// }

}