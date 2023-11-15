import { Request, Response, NextFunction } from "express";
import { User, IUser } from '@src/models/userModel';
import mongoose from "mongoose";

interface FieldValidationConfig {
  required?: string[];
  optional?: string[];
}

class Validator {

  // Validar campos (required: obrigatórios || optional: opcional)
  // Pode ser inserido apenas required ou optional como os dois
  // Como usar Validator.validateFields({ required: ['name', ...] , optional: ['name', ...]})
  static validateFields(config: FieldValidationConfig) {
    return (req: Request, res: Response, next: NextFunction) => {
      const errors: string[] = [];
      const bodyFields = Object.keys(req.body);

      if (config.required) {
        for (const field of config.required) {
          if (!bodyFields.includes(field)) {
            errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
          }
        }
      }

      const validFields = (config.required || []).concat(config.optional || []);
      const isValidOperation = bodyFields.every((field) => validFields.includes(field) || !field);

      if (!isValidOperation) {
        errors.push(`One or more fields are invalid: ${bodyFields.join(", ")}`);
      }

      if (errors.length > 0) {
        return res.status(400).send({ message: errors.join(", ") });
      }

      next();
    };
  }

  // Validação para validar os ids
  static validateIds(idsInfo: { paramName: string, model: mongoose.Model<any>, type: string, isOptional?: boolean }[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      for (const { paramName, model, type, isOptional } of idsInfo) {
        const id = req.params[paramName] || req.body[paramName] || req.query[paramName];

        if (isOptional && !id) {
          continue;
        }

        if (!isOptional && !id) {
          return res.status(400).send({ message: `${type} ID is required` });
        }

        if (id && !mongoose.Types.ObjectId.isValid(id)) {
          return res.status(422).send({ message: `Invalid ${type} ID` });
        }

        try {
          const exists = await model.findById(id).exec();
          if (!exists) {
            return res.status(404).send({ message: `${type} with ID ${id} not found` });
          }
        } catch (error) {
          console.error(error);
          return res.status(500).send({ message: "Internal Server Error" });
        }
      }

      next();
    };
  }


  static validateTokenMatch(queryTokenParam: string, userTokenField: keyof IUser) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const token = req.query[queryTokenParam] as string | undefined;

      if (!token) {
        return res.status(400).send({ message: "Token is required" });
      }

      try {
        const userConditions = { [userTokenField]: token };
        const user = await User.findOne(userConditions);

        if (!user) {
          return res.status(404).send({ message: "Invalid or expired token" });
        }

        next();
      } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
      }
    };
  }

}

export default Validator;