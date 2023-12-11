import { Request, Response } from 'express';
import { IProduct, Product } from '@src/models/productModel';
import { CustomError } from '@src/utils/customError';
import { HttpStatus } from '@src/utils/constant';
import { Discount, IDiscount } from '@src/models/dicountModel';
import { IUser, UserStatus } from '@src/models/userModel';
import { Error } from '@src/utils/errorCatch';

interface CustomRequest extends Request {
  user: IUser;
}

export class DiscountController {
  // =================|USERS|=================

  public addPromoCode = async (req: Request, res: Response, next: Function) => {
    try {
    } catch (error) {
      next(Error(error));
    }
  };

  // =================|ADMIN|=================

  private async updateProducts(discount: IDiscount, discountDecimal: number, lengthProducts: number, isActive: boolean) {
    const updatedPrices = [];

    for (let i = 0; i < lengthProducts; i++) {
      const productId = discount.applicableProducts[i];
      const product = await Product.findById(productId);

      if (!product) {
        return updatedPrices;
      }

      if (product.onDiscount && isActive) {
        throw new CustomError(HttpStatus.CONFLICT, `O produto ${product.name} já tem um desconto aplicado.`);
      }

      let newPrice = isActive ? product.price - product.price * discountDecimal : product.originalPrice;

      const priceUpdated = await Product.findByIdAndUpdate(productId, {
        $set: {
          discountType: isActive ? discount.discountType : 0,
          onDiscount: isActive,
          price: newPrice,
        },
      });

      updatedPrices.push(priceUpdated);
    }

    return updatedPrices;
  }

  public createDiscount = async (req: Request, res: Response, next: Function) => {
    const { description, discountType, promoCode, isPromoCode, applicableProducts, usageLimit, minimumPurchaseValue } = req.body;

    try {
      const newDiscount = new Discount({
        description,
        discountType,
        promoCode,
        isPromoCode,
        usageLimit,
        minimumPurchaseValue,
        applicableProducts,
      });

      const savedDiscount = await newDiscount.save();

      return res.status(HttpStatus.CREATED).json(savedDiscount);
    } catch (error) {
      next(Error(error));
    }
  };

  public addProductToDiscount = async (req: Request, res: Response, next: Function) => {
    const { id } = req.params;
    const { productId } = req.body;

    try {
      const discount = await Discount.findById(id);

      if (!discount) {
        return next(new CustomError(HttpStatus.NOT_FOUND, 'Discount not found'));
      }

      if (discount.isActive) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, 'Discount needs to be disabled to update'));
      }

      discount.applicableProducts.push(productId);

      const updatedDiscount = await discount.save();

      return res.status(HttpStatus.OK).json(updatedDiscount);
    } catch (error) {
      next(Error(error));
    }
  };

  public removeProductFromDiscount = async (req: Request, res: Response, next: Function) => {
    const { id } = req.params;
    const { productId } = req.body;

    try {
      const discount = await Discount.findById(id);

      if (!discount) {
        return next(new CustomError(HttpStatus.NOT_FOUND, 'Discount not found'));
      }

      if (discount.isActive) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, 'Discount needs to be disabled to update'));
      }

      const index = discount.applicableProducts.indexOf(productId);

      if (index !== -1) {
        discount.applicableProducts.splice(index, 1);
        const updatedDiscount = await discount.save();
        return res.status(HttpStatus.OK).json(updatedDiscount);
      } else {
        return next(new CustomError(HttpStatus.NOT_FOUND, 'Product not found in applicableProducts'));
      }
    } catch (error) {
      next(Error(error));
    }
  };

  public stateOfIsActive = async (req: Request, res: Response, next: Function) => {
    const { id } = req.params;
    const { isActive } = req.body;

    try {
      const discount = await Discount.findById(id);

      if (!discount) {
        return next(new CustomError(HttpStatus.NOT_FOUND, 'Discount not found'));
      }

      const discountDecimal = discount.discountType / 100;

      const lenghtProducts = discount.applicableProducts.length;

      if (!discount.isPromoCode) {
        if (discount.applicableProducts.length < 1) {
          return next(new CustomError(HttpStatus.LENGTH_REQUIRED, 'Para ativar o desconto é necessário adicionar produtos'));
        }

        if (discount.isActive) {
          if (isActive) {
            return next(new CustomError(HttpStatus.CONFLICT, 'Já está ativo'));
          } else if (isActive == false) {
            try {
              const updatedPrices = await this.updateProducts(discount, discountDecimal, lenghtProducts, false);

              const updateDiscount = await Discount.findByIdAndUpdate(id, { isActive: isActive }, { new: true, runValidators: true });

              return res.status(HttpStatus.OK).send({ updatedPrices, updateDiscount });
            } catch (error) {
              return next(error);
            }
          }
        } else {
          if (isActive) {
            try {
              const updatedPrices = await this.updateProducts(discount, discountDecimal, lenghtProducts, true);

              const updateDiscount = await Discount.findByIdAndUpdate(id, { isActive: isActive }, { new: true, runValidators: true });

              return res.status(HttpStatus.OK).send({ updatedPrices, updateDiscount });
            } catch (error) {
              return next(error);
            }
          } else if (isActive == false) {
            return res.status(HttpStatus.OK).send({ message: 'O Desconto já está desativado!' });
          }
        }
      }
    } catch (error) {
      next(Error(error));
    }
  };

  public updateDiscount = async (req: Request, res: Response, next: Function) => {
    const { id } = req.params;
    const updateFields = req.body;

    try {
      const discount = await Discount.findById(id);

      if (!discount) {
        return next(new CustomError(HttpStatus.NOT_FOUND, 'Discount not found'));
      }

      if (discount.isActive) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, 'Discount needs to be disabled to update'));
      }

      const updateDiscount = await Discount.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });

      return res.status(HttpStatus.OK).json({ message: 'Desconto Atualizado: ', updateDiscount });
    } catch (error) {
      next(Error(error));
    }
  };

  public deleteDiscount = async (req: Request, res: Response, next: Function) => {
    const { id } = req.params;

    try {
      const discount = await Discount.findById(id);

      if (!discount) {
        return next(new CustomError(HttpStatus.NOT_FOUND, 'Discount not found!'));
      }

      if (discount.isActive) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, 'Discount needs to be disabled to update'));
      }

      await Discount.findByIdAndDelete(id);

      return res.status(204).json({ message: 'Discount successfully deleted!' });
    } catch (error) {
      next(Error(error));
    }
  };

  public getDiscountByID = async (req: Request, res: Response, next: Function) => {
    const { id } = req.params;

    try {
      const discount = await Discount.findById(id);

      if (!discount) {
        return next(new CustomError(HttpStatus.NOT_FOUND, 'Discount not found'));
      }

      return res.status(200).send(discount);
    } catch (error) {
      next(Error(error));
    }
  };

  public getDiscountByName = async (req: CustomRequest, res: Response, next: Function) => {
    try {
      const user = req.user;

      const {
        description,
        sort,
        page = '1',
        limit = '6',
        isActive,
        promoCode,
      } = req.query as {
        description?: string;
        sort?: string;
        page?: string;
        limit?: string;
        isActive?: string;
        promoCode?: string;
      };

      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      if (isNaN(pageNumber) || pageNumber <= 0 || isNaN(limitNumber) || limitNumber <= 0) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, 'Parâmetros de paginação inválidos.'));
      }

      const conditions: any = {};

      if (description) {
        conditions.description = new RegExp(description, 'i');
      }

      if (isActive) {
        conditions.isActive = isActive === 'true';
      }

      if (promoCode) {
        conditions.promoCode = new RegExp(promoCode, 'i');
      }

      const count = await Discount.countDocuments(conditions);
      const totalPages = Math.ceil(count / limitNumber);

      let query = Discount.find(conditions);

      if (sort) {
        switch (sort) {
          case 'discountType':
            query = query.sort({ discountType: -1 });
            break;
          case 'minimumPurchaseValue':
            query = query.sort({ minimumPurchaseValue: -1 });
            break;
          case 'isActive':
            query = query.sort({ isActive: -1 });
            break;
        }
      }

      const discounts = await query.limit(limitNumber).skip((pageNumber - 1) * limitNumber);

      if (discounts.length === 0) {
        next(new CustomError(HttpStatus.NOT_FOUND, 'Nenhum desconto encontrado.'));
      } else {
        res.status(200).send({ discounts, totalPages });
      }
    } catch (error) {
      next(Error(error));
    }
  };
}
