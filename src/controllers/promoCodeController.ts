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
    const userId = req.user.id;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return next(new CustomError(HttpStatus.NOT_FOUND, 'User not found!'));
    }

    if (!user.cart.promoCodeActive) {
      return next(new CustomError(HttpStatus.CONFLICT, 'PromoCode already removed!'));
    }

    try {
      for (let i = 0; i < user.cart.items.length; i++) {
        let item = user.cart.items[i];

        item.totalPrice = item.originalTotalPrice;
        item.promoCodeActive = false;
        item.promoCodeType = 0;
      }

      user.cart.promoCode = null;
      user.cart.promoCodeActive = false;

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
      if (user.cart.promoCodeActive) {
        return next(new CustomError(HttpStatus.CONFLICT, 'PromoCode active!'));
      }

      if (user.cart.items.length < 1) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, 'No cart!'));
      }

      for (let i = 0; i < user.cart.items.length; i++) {
        let item = user.cart.items[i];

        console.log('oaldas');

        let product = await Product.findById(item.product);

        if (!product?.onDiscount) {
          if (!item.promoCodeActive) {
            let discountDecimal = existpromoCode.discountType / 100;

            item.originalTotalPrice = item.totalPrice;

            let newPrice = item.totalPrice - item.totalPrice * discountDecimal;
            item.totalPrice = newPrice;
            item.promoCodeActive = true;
            item.promoCodeType = existpromoCode.discountType;
          }
        } else {
          continue;
        }
      }
      user.cart.promoCode = existpromoCode.promoCode;
      user.cart.promoCodeActive = true;
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

  public isActive = async (req: Request, res: Response, next: Function) => {
    const { id } = req.params;
    const { isActive } = req.body;
    const promoCode = await PromoCode.findById(id);

    if (!promoCode) {
      return next(new CustomError(HttpStatus.NOT_FOUND, 'PromoCode not found!'));
    }

    try {
      if (isActive) {
        if (promoCode.isActive) {
          return next(new CustomError(HttpStatus.BAD_REQUEST, 'This promo code is already active'));
        }

        promoCode.isActive = true;
        await promoCode.save();

        return res.status(HttpStatus.OK).send(`PromoCode ${promoCode.promoCode} activate!`);
      } else {
        if (!promoCode.isActive) {
          return next(new CustomError(HttpStatus.BAD_REQUEST, 'This promo code is already inactive'));
        }
        promoCode.isActive = false;

        await promoCode.save();

        const users = await User.find({ 'cart.promoCode': promoCode.promoCode });
        console.log(users.length);
        if (users) {
          for (let i = 0; i < users.length; i++) {
            let user = users[i];

            for (let j = 0; j < user.cart.items.length; j++) {
              let item = user.cart.items[j];

              item.totalPrice = item.originalTotalPrice;
              item.promoCodeActive = false;
              item.promoCodeType = 0;
            }
            user.cart.promoCode = null;
            user.cart.promoCodeActive = false;

            console.log('user: ', user);
            console.log(user);
            await user.save();
          }

          return res.status(HttpStatus.OK).send({ message: 'Operation OK!, Users Updated: ' });
        } else {
          return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error!'));
        }
      }
    } catch (error) {
      next(Error(error));
    }
  };
}
