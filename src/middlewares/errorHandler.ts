import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '@src/utils/constant';

type CustomError = {
  status?: HttpStatus;
  message: string;
} & Error

export function errorHandler(err: CustomError, req: Request, res: Response, next: NextFunction): void {
  const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Something went wrong.';

  res.status(status).json({
    error: true,
    status,
    message,
  });
}
