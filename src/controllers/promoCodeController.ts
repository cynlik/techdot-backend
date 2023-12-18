import { Request, Response } from 'express';
import { IProduct, Product } from '@src/models/productModel';
import { CustomError } from '@src/utils/customError';
import { HttpStatus } from '@src/utils/constant';
import { PromoCode } from '@src/models/promoCodeMode';
import { User } from '@src/models/userModel';
import { Error } from '@src/utils/errorCatch';

export class PromoCodeController {
  // =================|USERS|=================

  public removePromoCode = async (req: Request, res: Response, next: Function) => {
    const { promoCode } = req.params;
    const userId = req.user.id;
    const user = await User.findOne({ _id: userId });

    if (!promoCode) {
      return next(new CustomError(HttpStatus.NOT_FOUND, 'PromoCode not found!'));
    }

    const existpromoCode = await PromoCode.findOne({ promoCode: promoCode });
    console.log(user?.cart);

    if (!user) {
      return next(new CustomError(HttpStatus.NOT_FOUND, 'User not found!'));
    }

    if (!existpromoCode) {
      return next(new CustomError(HttpStatus.NOT_FOUND, "This promo code doesn't exist."));
    } else if (!existpromoCode.isActive) {
      return next(new CustomError(HttpStatus.NOT_ACCEPTABLE, 'This promo code is not active!'));
    }

    try {
      for (let i = 0; i < user.cart.items.length; i++) {
        let item = user.cart.items[i];

        item.totalPrice = item.originalTotalPrice;
        item.promoCodeActive = false;
        item.promoCodeType = 0;
      }

      await user.save();
      return res.status(HttpStatus.OK).json({ message: 'Promo code removed successfully from the cart' });
    } catch (error) {
      next(Error(error));
    }
  };

  public usePromoCode = async (req: Request, res: Response, next: Function) => {
    const { promoCode } = req.body;
    const userId = req.user.id;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return next(new CustomError(HttpStatus.NOT_FOUND, 'User not found'));
    }

    const existpromoCode = await PromoCode.findOne({ promoCode: promoCode });

    if (!existpromoCode) {
      return next(new CustomError(HttpStatus.NOT_FOUND, "This promo code doesn't exist."));
    } else if (!existpromoCode.isActive) {
      return next(new CustomError(HttpStatus.NOT_ACCEPTABLE, 'This promo code is not active!'));
    }

    try {
      if (user.cart.items.length < 1) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, 'No cart!'));
      }

      if (!user.cart.promoCodeID != null) {
        return next(new CustomError(HttpStatus.BAD_GATEWAY, 'PromoCode just Active!'));
      }

      for (let i = 0; i < user.cart.items.length; i++) {
        const item = user.cart.items[i];

        const product = await Product.findById(item.product);

        if (!product?.onDiscount) {
          if (!item.promoCodeActive) {
            const discountDecimal = existpromoCode.discountType / 100;

            item.originalTotalPrice = item.totalPrice;

            const newPrice = item.totalPrice - item.totalPrice * discountDecimal;
            item.totalPrice = newPrice;
            item.promoCodeActive = true;
            item.promoCodeType = existpromoCode.discountType;
          }
        } else {
          continue;
        }
      }
      user.cart.promoCodeID = existpromoCode.id;
      await user.save();

      return res.status(HttpStatus.OK).send(user.cart);
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
