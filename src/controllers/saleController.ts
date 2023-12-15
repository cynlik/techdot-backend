import { Product } from '@src/models/productModel';
import { ISale, SaleModel, SaleStatus } from '@src/models/saleModel';
import { IUser, User, UserStatus } from '@src/models/userModel';
import { ERROR_MESSAGES, HttpStatus, SUCCESS_MESSAGES } from '@src/utils/constant';
import { CustomError } from '@src/utils/customError';
import { Request, Response } from 'express';
import { Error } from '@src/utils/errorCatch';
import { statusChangeTimes, startStatusChangeDelayed } from '@src/events/saleStatus';

type CustomRequest = {
  user: IUser;
} & Request;

export class SaleController {
  public create = async (req: CustomRequest, res: Response, next: Function) => {
    try {
      const { userName, userEmail, userAdress, userPhone, paymentMethod } = req.body;
      const user = await User.findById(req.user.id);
      const session = req.session;

      if (!session) {
        throw new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.SESSION_NOT_FOUND);
      }

      let shoppingCart;

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

      for (let i = 0; i < shoppingCart.items.length; i++) {
        const productArray = shoppingCart.items[i];

        const productId = productArray.product;
        const quantitySale = productArray.quantity;

        const product = await Product.findById(productId);

        if (product) {
          product.stockQuantity -= quantitySale;

          await product.save();
        } else {
          return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.PRODUCT_NOT_FOUND));
        }
      }

      await newSale.save();

      const delay = statusChangeTimes[SaleStatus.Registered];
      const delayToProcesing = statusChangeTimes[SaleStatus.Processing];
      startStatusChangeDelayed(newSale.id, SaleStatus.Registered, delay);
      startStatusChangeDelayed(newSale.id, SaleStatus.Processing, delayToProcesing);

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
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.USER_NOT_FOUND));
      }

      const {
        sort,
        page = '1',
        limit = '6',
        userEmail,
      } = req.query as {
        sort?: string;
        page?: string;
        limit?: string;
        userEmail?: string;
      };

      const viewUser = req.user.view;
      const conditions: any = {};

      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      if (isNaN(pageNumber) || pageNumber <= 0 || isNaN(limitNumber) || limitNumber <= 0) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.INVALID_PAGINATION));
      }

      if (viewUser !== UserStatus.Admin) {
        const regex = new RegExp(user.email, 'i');
        conditions.userEmail = regex;
      } else if (viewUser === UserStatus.Admin) {
        if (userEmail) {
          const regex = new RegExp(userEmail, 'i');
          conditions.userEmail = regex;
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
        next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.SALE_NOT_FOUND));
      } else {
        res.status(200).send({ sales, totalPages });
      }
    } catch (error) {
      console.error(error);
      next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  };

  private calculateStatusOrder(status: SaleStatus) {
    const statusList = Object.values(SaleStatus);
    const statusIndex = statusList.indexOf(status);
    return statusIndex === -1 ? -1 : statusList.length - statusIndex - 1;
  }

  public cancel = async (req: CustomRequest, res: Response, next: Function) => {
    try {
      const saleId = req.params.id;
      const sale = await SaleModel.findById(saleId);

      if (!sale) {
        return next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.SALE_NOT_FOUND));
      } else {
        const denyStatusChange = this.calculateStatusOrder(SaleStatus.Processing);
        const saleStatusOrder = this.calculateStatusOrder(sale.status);
        if (saleStatusOrder <= denyStatusChange) {
          return next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.SALE_IN_ADVANCED_STATUS));
        }
      }
      const updatedSale = await SaleModel.findByIdAndUpdate(saleId, { $set: { status: SaleStatus.Canceled } }, { new: true });
      res.status(HttpStatus.OK).json({ message: SUCCESS_MESSAGES.SALE_CANCELED_SUCCESSFUL, sale: updatedSale });
    } catch (error) {
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  };
}
