import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

class Validator {

    // Valida se todos os campos fornecidos estão prienchidos "Os campos fornecidos serão obrigatórios"
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