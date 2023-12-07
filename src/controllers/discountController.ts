import { Request, Response } from "express";
import { IProduct, Product } from "@src/models/productModel";
import { CustomError } from "@src/utils/customError";
import { HttpStatus } from "@src/utils/constant";
import { Discount, IDiscount } from "@src/models/dicountModel";
import { IUser, UserStatus } from "@src/models/userModel";

export class DiscountController {

  // =================|USERS|=================



  public getDiscountByID = async (req: Request, res: Response, next: Function) => {
    const { id } = req.params;

    try {

      const discount = await Discount.findById(id);

      if (!discount) {
        return next(new CustomError(HttpStatus.NOT_FOUND, 'Discount not found'));
      }

      return res.status(200).send(discount);
    } catch (error) {
      console.error(error);
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'))
    }
  };

  // =================|ADMIN|=================

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
      console.error(error);
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error"));
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

      const discountDecimal = discount.discountType / 100

      const lenghtProducts = discount.applicableProducts.length


      if (!discount.isPromoCode) {
        if (updateFields.isActive) {

          for (let i = 0; i < lenghtProducts; i++) {
            let productId = discount.applicableProducts[i]

            let product = await Product.findById(productId)

            if (!product) {
              console.log("saiu")
              return;
            }

            let newPrice = product.price - (product.price * discountDecimal)

            let priceUpdated = await Product.findByIdAndUpdate( productId, { $set: {discountType: discount.discountType, onDiscount: true, price: newPrice, originalPrice: product.price} });


            return res.status(HttpStatus.OK).send(priceUpdated)
          }

        } else {

          for (let i = 0; i < lenghtProducts; i++) {
            let productId = discount.applicableProducts[i]

            let product = await Product.findById(productId)

            if (!product) {
              console.log("saiu")
              return;
            }

            let newPrice = product.originalPrice

            let priceUpdated = await Product.findByIdAndUpdate( productId, { $set: {discountType: 0, onDiscount: false, price: newPrice} });


            return res.status(HttpStatus.OK).send(priceUpdated)
          }
        }
      }

      const updateDiscount = await Discount.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });

      return res.status(HttpStatus.OK).json(updateDiscount);
    } catch (error) {
      console.error(error);
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error"))
    }
  };

  public deleteDiscount = async (req: Request, res: Response, next: Function) => {
    const { id } = req.params;

    try {

      await Discount.findByIdAndDelete(id);

      return res.status(204).json({ message: "Discount successfully deleted!" });
    } catch (error) {
      console.error(error);
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error"))
    }
  };

  public getDiscountByName = async (req: Request, res: Response, next: Function) => {
    try {
      const user = req.user

      const { name, sort, page = '1', limit = '6' } = req.query as {
        name?: string;
        sort?: string;
        page?: string;
        limit?: string;
      };

      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      if (isNaN(pageNumber) || pageNumber <= 0 || isNaN(limitNumber) || limitNumber <= 0) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, 'Parâmetros de paginação inválidos.'));
      }

      let viewUser = UserStatus.NonMember

      if (user) {
        viewUser = user.view
      }

      const conditions: any = {};

      if (viewUser !== UserStatus.Admin) {
        conditions.visible = true;
      }

      if (name) {
        const regex = new RegExp(name, 'i');
        conditions.name = regex;
      }

      const count = await Discount.countDocuments(conditions);
      const totalPages = Math.ceil(count / limitNumber);

      let query = Discount.find(conditions)

      switch (sort) {
        case 'isActive':
          query = query.sort({ price: -1 });
          break;
        case 'preco_menor':
          query = query.sort({ price: 1 });
          break;
      }

      const products = await query
        .limit(limitNumber)
        .skip((pageNumber - 1) * limitNumber);

      if (products.length === 0) {
        next(new CustomError(HttpStatus.NOT_FOUND, 'Nenhum desconto encontrado.'))
      } else {
        res.status(200).send({ products, totalPages });
      }
    } catch (error) {
      console.error(error);
      next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Erro ao procurar descontos.'));
    }
  };

}