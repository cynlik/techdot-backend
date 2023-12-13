import { Product } from '@src/models/productModel';
import { ISale, SaleModel } from '@src/models/saleModel';
import { IUser, User, UserStatus } from '@src/models/userModel';
import { ERROR_MESSAGES, HttpStatus, SUCCESS_MESSAGES } from '@src/utils/constant';
import { CustomError } from '@src/utils/customError';
import { Request, Response } from 'express';
import { Error } from '@src/utils/errorCatch';
import statusChange from '@src/events/saleStatus';

interface CustomRequest extends Request {
  user: IUser;
}

export class SaleController {
  public create = async (req: CustomRequest, res: Response, next: Function) => {
    try {
      const { userName, userEmail, userAdress, userPhone, paymentMethod } = req.body;

      const userMail = await User.findOne({ email: userEmail });
      const userToken = req.user;

      const user = await User.findById(userToken.id);
      const session = req.session;

      if (!session) {
        throw new CustomError(HttpStatus.BAD_REQUEST, 'sfa');
      }

      let shoppingCart;

      // Guest
      if (!user) {
        if (session.cart.items.length < 1) {
          return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.CART_NOT_FOUND));
        }
        shoppingCart = session.cart;
      } else {
        if (user.cart.items.length < 1) {
          return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.CART_NOT_FOUND));
        }

        shoppingCart = user.cart;
      }

      const newSale = new SaleModel({
        userName,
        userEmail,
        userAdress,
        userPhone,
        paymentMethod,
        shoppingCart,
      } as unknown as ISale);

      // Subtrair a quantidade vendida do stock de cada produto
      for (let i = 0; i < shoppingCart.items.length; i++) {
        const productArray = shoppingCart.items[i];

        let productId = productArray.product;
        const quantitySale = productArray.quantity;

        const product = await Product.findById(productId);

        if (product) {
          product.stockQuantity -= quantitySale;

          await product.save();
        } else {
          new CustomError(HttpStatus.NOT_FOUND, 'Product Id not found!');
        }
      }

      await newSale.save();

      statusChange.emit('changeToRegistered', newSale.id);

      const saleCart = await SaleModel.findById(newSale.id).populate('shoppingCart');

      if (!saleCart) {
        return next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.CART_NOT_FOUND));
      }

      if (!user) {
        session.cart.items = [];
      } else {
        user.cart.items = [];
        user.cart.total = 0;

        await user.save();
      }

      res.status(HttpStatus.CREATED).json(newSale);
    } catch (error) {
      next(Error(error));
    }
  };

  public getSalesByName = async (req: CustomRequest, res: Response, next: Function) => {
    const userEmail = req.user.email;
    try {
      const {
        sort,
        page = '1',
        limit = '6',
      } = req.query as {
        sort?: string;
        page?: string;
        limit?: string;
      };

      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      if (isNaN(pageNumber) || pageNumber <= 0 || isNaN(limitNumber) || limitNumber <= 0) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, 'Parâmetros de paginação inválidos.'));
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

      let query = SaleModel.find(conditions);

      switch (sort) {
        case 'preco_maior':
          query = query.sort({ price: -1 });
          break;
        case 'preco_menor':
          query = query.sort({ price: 1 });
          break;
      }

      const sales = await query.limit(limitNumber).skip((pageNumber - 1) * limitNumber);

      if (sales.length === 0) {
        next(new CustomError(HttpStatus.NOT_FOUND, 'Nenhuma sale encontrada.'));
      } else {
        res.status(200).send({ sales, totalPages });
      }
    } catch (error) {
      console.error(error);
      next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Erro ao procurar produtos.'));
    }
  };

  public deleteById = async (req: CustomRequest, res: Response, next: Function) => {
    try {
      const saleId = req.params.id;
      const deletedSale = await SaleModel.findByIdAndDelete(saleId);
      if (!deletedSale) {
        return next(new CustomError(HttpStatus.NOT_FOUND, 'Sale not found'));
      }
      return res.status(HttpStatus.OK).json(SUCCESS_MESSAGES.SALE_DELETED_SUCCESSFUL);
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
    }
  };

  public cancel = async (req: Request, res: Response, next: Function) => {
    try {
      const saleId = req.params.id;
      const updatedSale = await SaleModel.findByIdAndUpdate(saleId, { $set: { status: 'Canceled' } }, { new: true });

      if (!updatedSale) {
        return next(new CustomError(HttpStatus.NOT_FOUND, 'Sale not found'));
      }

      res.status(HttpStatus.OK).json({ message: 'Sale successfully canceled', sale: updatedSale });
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
    }
  };
}
