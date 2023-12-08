import { Request, Response } from 'express';
import { SaleModel, ISale } from '@src/models/saleModel';
import { IUser, UserStatus } from '@src/models/userModel';
import { HttpStatus } from '@src/utils/constant';
import { CustomError } from '@src/utils/customError';
import { Product } from "@src/models/productModel";

interface CustomRequest extends Request {
  user: IUser;
}

export class SaleController {

public create = async (req: CustomRequest, res: Response, next: Function) => {
  try { 
    const {userName, userEmail, userAdress, userPhone, paymentMethod } = req.body
    const user = req.user
    const guest = req.session

    let shoppingCart;

    if(!user){
      if (guest && guest.cart) {
        shoppingCart = guest.cart;
      } else {        
        shoppingCart = req.user.cart;
      }  
    }
  
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

      await newSale.save();
      res.status(HttpStatus.CREATED).json(newSale);
      }
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
    }

}

public getSalesByName = async (req: Request, res: Response, next: Function) => {
  const userEmail = req.user.email
  try {
    const { sort, page = '1', limit = '6' } = req.query as {
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
    const userEmail = req.user.email;
    const conditions: any = {};

    if (viewUser === UserStatus.Admin) {
      // Se for um admin, não há restrições de acesso
    } else if (viewUser === UserStatus.Member) {
      // Se for um member, só terá acesso às vendas associadas ao seu email
      conditions.userEmail = userEmail;
    } else {
      // Caso o tipo de user não seja reconhecido
      return next(new CustomError(HttpStatus.UNAUTHORIZED, 'Tipo de user não reconhecido.'));
    }

     if (viewUser !== UserStatus.Admin) {
      if (userEmail) {
        const regex = new RegExp(userEmail, 'i');
        conditions.userEmail = regex;
      } else {
        console.error('userEmail is undefined');
      }
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
        return next(new CustomError(HttpStatus.NOT_FOUND, 'Not Found'));
      }
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
    }
}

//   public cancel = async (req: Request,  res: Response, next: Function) => {
//   try{
    
//   }catch(error){
//     return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'))
//   }
// }
}
