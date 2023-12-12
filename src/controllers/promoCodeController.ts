import { Request, Response } from 'express';
import { IProduct, Product } from '@src/models/productModel';
import { CustomError } from '@src/utils/customError';
import { HttpStatus } from '@src/utils/constant';
import { PromoCode, IPromoCode } from '@src/models/promoCodeMode';
import { IUser, UserStatus } from '@src/models/userModel';
import { Error } from '@src/utils/errorCatch';

export class PromoCodeController {
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
