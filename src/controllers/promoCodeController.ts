import { Request, Response } from 'express';
import { IProduct, Product } from '@src/models/productModel';
import { CustomError } from '@src/utils/customError';
import { HttpStatus } from '@src/utils/constant';
import { PromoCode, IPromoCode } from '@src/models/promoCodeMode';
import { IUser, UserStatus } from '@src/models/userModel';
import { Error } from '@src/utils/errorCatch';

export class PromoCodeController {
  // =================|USERS|=================

  public usePromoCode = async (req: Request, res: Response, next: Function) => {
    const { promoCode } = req.body;

    const existpromoCode = await PromoCode.findOne({ promoCode: promoCode });

    if (!existpromoCode) {
      return next(new CustomError(HttpStatus.NOT_FOUND, "This promo code doesn't exist."));
    }

    try {
      const userCart = req.session;
      if (!userCart) {
        return next(new CustomError(HttpStatus.NOT_FOUND, 'Session Not Found!'));
      } else if (!userCart.cart) {
        return next(new CustomError(HttpStatus.NOT_FOUND, 'You must have Products add to the cart to use the promoCode!'));
      }
    } catch (error) {
      next(Error(error));
    }
  };

  // =================|ADMIN|=================
  public createPromoCode = async (req: Request, res: Response, next: Function) => {
    const { promoCode, applicableProducts, usageLimit, minimumPurchaseValue, description, discountType } = req.body;

    try {
      const newPromoCode = new PromoCode({
        promoCode,
        applicableProducts,
        usageLimit,
        minimumPurchaseValue,
        description,
        discountType,
      });

      const savedPromo = await newPromoCode.save();

      return res.status(HttpStatus.CREATED).json(savedPromo);
    } catch (error) {
      next(Error(error));
    }
  };
}
