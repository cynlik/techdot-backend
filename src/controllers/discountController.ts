import { Request, Response } from "express";
import { IProduct, Product } from "@src/models/productModel";
import { CustomError } from "@src/utils/customError";
import { HttpStatus } from "@src/utils/constant";
import { Discount } from "@src/models/dicountModel";

export class DiscountController {

  // =================|USERS|=================
  
  

  public getDiscountByID = async (req: Request, res: Response, next: Function) => {
    const { id } = req.params;

    try {

      const discount = await Discount.findById(id);

      if (!discount) {
        return next(new CustomError(HttpStatus.NOT_FOUND ,'Discount not found'));
      }

      return res.status(200).send(discount);
    } catch (error) {
      console.error(error);
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR ,'Internal Server Error'))
    }
  };

  // =================|ADMIN|=================

  public createDiscount = async (req: Request, res: Response, next: Function) => {
    const { description, isActive, applicableProducts, discountType }= req.body;

    try {
      const newDiscount = new Discount({
        description,
        isActive,
        applicableProducts,
        discountType
      });

      const savedDiscount = await newDiscount.save();

      return res.status(HttpStatus.CREATED).json(savedDiscount);
    } catch (error) {
      console.error(error);
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR ,"Internal Server Error" ));
    }
  };

  public updateDiscount = async (req: Request, res: Response, next: Function) => {
    const { id } = req.params;
    const updateFields = req.body;

    try {
      const updateDiscount = await Discount.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });

      return res.status(HttpStatus.OK).json(updateDiscount);
    } catch (error) {
      console.error(error);
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR ,"Internal Server Error"))
    }
  };

  public deleteDiscount = async (req: Request, res: Response, next: Function) => {
    const { id } = req.params;

    try {

      await Discount.findByIdAndDelete(id);

      return res.status(204).json({message: "Discount successfully deleted!"});
    } catch (error) {
      console.error(error);
      return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR ,"Internal Server Error"))
    }
  };

}