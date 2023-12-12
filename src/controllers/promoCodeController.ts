import { Request, Response } from 'express';
import { IProduct, Product } from '@src/models/productModel';
import { CustomError } from '@src/utils/customError';
import { HttpStatus } from '@src/utils/constant';
import { PromoCode, IPromoCode } from '@src/models/promoCodeMode';
import { IUser, User, UserStatus } from '@src/models/userModel';
import { Error } from '@src/utils/errorCatch';

export class PromoCodeController {
  // =================|USERS|=================

  public usePromoCode = async (req: Request, res: Response, next: Function) => {
    const { promoCode } = req.body;
    const user = req.user;
    let id = user.id;

    if (!user) {
      return next(new CustomError(HttpStatus.NOT_FOUND, 'User not found'));
    }

    const existpromoCode = await PromoCode.findOne({ promoCode: promoCode });

    if (!existpromoCode) {
      return next(new CustomError(HttpStatus.NOT_FOUND, "This promo code doesn't exist."));
    }

    try {
      const user = User.findById({ id: id });
      console.log(user);
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
