import mongoose from "mongoose";
import { HttpStatus } from "./constant";
import { CustomError } from "./customError";

export function Error(error: any, next: Function) {
    console.log(error)
    if (error instanceof mongoose.Error.ValidationError) {
        // Trata erros de validação
        return next(new CustomError(HttpStatus.BAD_REQUEST, error.message));
      } else if (error instanceof mongoose.Error.CastError) {
        // Trata erros de cast, como um ID inválido
        return next(new CustomError(HttpStatus.BAD_REQUEST, "ID inválido fornecido"));
      } else {
        // Trata outros tipos de erros internos do servidor
        return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error"));
      }
}
