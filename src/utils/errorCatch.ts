import mongoose from 'mongoose';
import { HttpStatus } from './constant';
import { CustomError } from './customError';

export function Error(error: any): CustomError {
  console.log(error);
  if (error instanceof mongoose.Error.ValidationError) {
    // Trata erros de validação
    return new CustomError(HttpStatus.BAD_REQUEST, error.message);
  } else if (error instanceof mongoose.Error.CastError) {
    // Trata erros de cast, como um ID inválido
    return new CustomError(HttpStatus.BAD_REQUEST, 'ID inválido fornecido');
  } else {
    // Trata outros tipos de erros internos do servidor
    return new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');
  }
}
