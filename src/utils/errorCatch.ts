import mongoose from 'mongoose';
import { HttpStatus } from './constant';
import { CustomError } from './customError';

export function Error(error: any): CustomError {
  if (error instanceof mongoose.Error.ValidationError) {
    // Trata erros de validação
    return new CustomError(HttpStatus.BAD_REQUEST, error.message);
  } else if (error instanceof mongoose.Error.CastError) {
    // Trata erros de cast, como um ID inválido
    return new CustomError(HttpStatus.BAD_REQUEST, 'ID inválido fornecido');
  } else if (error.code === 11000) {
    // Trata erros de chave duplicada do MongoDB
    const duplicatedField = Object.keys(error.keyValue)[0];
    const duplicatedValue = error.keyValue[duplicatedField];
    const errorMessage = `Chave duplicada: ${duplicatedField} '${duplicatedValue}' já existe.`;
    return new CustomError(HttpStatus.BAD_REQUEST, errorMessage);
  } else {
    // Trata outros tipos de erros internos do servidor
    return new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');
  }
}
