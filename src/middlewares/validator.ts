import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

class Validator {

  // Valida se todos os campos fornecidos estão preenchidos "Os campos fornecidos serão obrigatórios"
  static validateBody(fields: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const errors: string[] = [];
      for (const field of fields) {
        if (!req.body[field]) {
          errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        }
      }
      if (errors.length > 0) {
        return res.status(400).send({ message: errors.join(", ") });
      }
      next();
    };
  }

  // Validação para verificar se os campos opcionais fornecidos são válidos, mas não exigir todos eles.
  static validateOptionalBody(fields: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const updates = Object.keys(req.body);
      const allowedUpdates = fields;
      const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

      if (!isValidOperation) {
        return res.status(400).send({ message: `One or more fields are invalid: ${updates.join(", ")}` });
      }

      updates.forEach((field) => {
        if (req.body[field] === '') {
          return res.status(400).send({ message: `${field.charAt(0).toUpperCase() + field.slice(1)} cannot be empty` });
        }
      });

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

}

export default Validator;