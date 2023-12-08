import { Request, Response } from "express";
import { IProduct, Product } from "@src/models/productModel";
import { CustomError } from "@src/utils/customError";
import { HttpStatus } from "@src/utils/constant";
import { Discount, IDiscount } from "@src/models/dicountModel";
import { IUser, UserStatus } from "@src/models/userModel";

interface CustomRequest extends Request {
  user: IUser;
}


export class DiscountController {

  // =================|USERS|=================

  private async updateProducts(discount: IDiscount, discountDecimal: number, lengthProducts: number, isActive: boolean) {
    const updatedPrices = [];
  
    for (let i = 0; i < lengthProducts; i++) {
      const productId = discount.applicableProducts[i];
      const product = await Product.findById(productId);
  
      if (!product) {
        console.log("Product not found:", productId);
        return updatedPrices;
      }

      if (product.onDiscount && isActive) {
        throw new CustomError(HttpStatus.CONFLICT, `O produto ${ product.name} já tem um desconto aplicado.`);
      }

      let newPrice = isActive ? product.price - (product.price * discountDecimal) : product.originalPrice;
  
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

  public addProductToDiscount = async (req: Request, res: Response, next: Function) => {
    const { id } = req.params;
    const { productId } = req.body;

    try {
      const discount = await Discount.findById(id);

      if (!discount) {
        return next(new CustomError(HttpStatus.NOT_FOUND, 'Discount not found'));
      }

      discount.applicableProducts.push(productId); // Add the productId to the array

      const updatedDiscount = await discount.save();

      return res.status(HttpStatus.OK).json(updatedDiscount);
    } catch (error) {
      console.error(error);
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error"));
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

      const index = discount.applicableProducts.indexOf(productId);

      if (index !== -1) {
        discount.applicableProducts.splice(index, 1); // Remove the productId from the array
        const updatedDiscount = await discount.save();
        return res.status(HttpStatus.OK).json(updatedDiscount);
      } else {
        return next(new CustomError(HttpStatus.NOT_FOUND, 'Product not found in applicableProducts'));
      }
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

        //Implementar for com validação para ver se algum produto está com true em onDiscount caso esteja vai cancelar a operação 

        if(discount.isActive) {

          if (updateFields.isActive) {
            
            return next(new CustomError(HttpStatus.CONFLICT, "Já está ativo"))
  
          } else {
            
            try {
              const updatedPrices = await this.updateProducts(discount, discountDecimal, lenghtProducts, false)

              const updateDiscount = await Discount.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });

              return res.status(HttpStatus.OK).send({updatedPrices, updateDiscount})
            } catch (error) {
              return next(error)
            }
  
          }
        } else {

          if (updateFields.isActive) {
  
            try{
              const updatedPrices = await this.updateProducts(discount, discountDecimal, lenghtProducts, true)
    
              const updateDiscount = await Discount.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });

              return res.status(HttpStatus.OK).send({updatedPrices, updateDiscount})
            }catch (error) {
              return next(error);
            }

          } else {
  
            return res.status(HttpStatus.OK).send({ message: "O Desconto já está desativado!"})
  
          }
        }

      }

      const updateDiscount = await Discount.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });

      return res.status(HttpStatus.OK).json({message: "Bota: ", updateDiscount});
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

  public getDiscountByName = async (req: CustomRequest, res: Response, next: Function) => {
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