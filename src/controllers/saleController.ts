import { Request, Response } from "express";
import { SaleModel, ISale } from "@src/models/saleModel";
import { UserStatus } from "@src/models/userModel";
import { HttpStatus } from '@src/utils/constant';
import { CustomError } from '@src/utils/customError';
import { Product } from "@src/models/productModel";

export class SaleController {
public create = async (req: Request, res: Response, next: Function) => {
  try { 
    const {userName, userEmail, userAdress, userPhone, paymentMethod, shoppingCart } = req.body
    const user = req.user
      
    const newSale = new SaleModel({
      userName,
      userEmail,
      userAdress,
      userPhone,
      paymentMethod,
      shoppingCart,
    } as ISale);

    // Subtrair a quantidade vendida do stock de cada produto*
    for (const productItem of shoppingCart) {
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

public getSalesByName = async (req: Request, res: Response, next: Function) => {
  const userEmail = req.user.email
  try {
    const { userEmail, sort, page = '1', limit = '6' } = req.query as {
      userEmail?: string;
      sort?: string;
      page?: string;
      limit?: string;
    };

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || pageNumber <= 0 || isNaN(limitNumber) || limitNumber <= 0) {
      return next(new CustomError(HttpStatus.BAD_REQUEST ,'Parâmetros de paginação inválidos.'));
    }

    const viewUser = req.user.view;
    const conditions: any = {};

    if (viewUser !== UserStatus.Admin) {
      console.log(userEmail);
      
      conditions.userEmail = userEmail;
    }

    if (userEmail) {
      const regex = new RegExp(userEmail, 'i');
      conditions.name = regex;
    }

    const count = await SaleModel.countDocuments(conditions);
    const totalPages = Math.ceil(count / limitNumber);

    let query = SaleModel.find(conditions)

    switch (sort) {
      case 'preco_maior':
        query = query.sort({ price: -1 });
        break;
      case 'preco_menor':
        query = query.sort({ price: 1 });
        break;
    }

    const sales = await query
      .limit(limitNumber)
      .skip((pageNumber - 1) * limitNumber);

    if (sales.length === 0) {
      next(new CustomError(HttpStatus.NOT_FOUND, 'Nenhuma sale encontrada.'))
    } else {
      res.status(200).send({ sales, totalPages });
    }
  } catch (error) {
    console.error(error);
    next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Erro ao procurar produtos.'));
  }
};

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