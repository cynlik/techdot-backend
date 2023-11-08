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

  // Validar id (opcional)
  static validateOptionalId(paramName: string, type: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const id = req.params[paramName] || req.body[paramName];
      if (id && !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(422).send({ message: `Invalid ${type} ID` });
      }
      next();
    };
  }

  // Valida se o ID fornecido existe ou se é válido
  static validateId(paramName: string, type: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const id = req.params[paramName] || req.body[paramName];
      if (!id) {
        return res.status(400).send({ message: `${type} ID is required` });
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(422).send({ message: `Invalid ${type} ID` });
      }
      next();
    };
  }

  // Atualizar a validação de Id para poder receber mais que 1 ID/Tipo

  // Adicionar validação opcional para os updates 

}

export default Validator;