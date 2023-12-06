import { Request, Response, NextFunction } from 'express';
import { IUser } from '@src/models/userModel';
import { RevokedToken } from '@src/models/revokedTokenModel';
import jwt from 'jsonwebtoken';
import { ERROR_MESSAGES, HttpStatus } from '@src/utils/constant';
import { CustomError } from '@src/utils/customError';

interface CustomRequest extends Request {
  user: IUser;
}

const validateToken = (isOptional: boolean = false) => {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
      if (isOptional) {
        return next();
      } else {
        return next(new CustomError(HttpStatus.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED_MISSING_TOKEN));
      }
    }

    try {
      if (typeof authHeader !== 'string' || !authHeader.toLowerCase().startsWith('bearer ')) {
        throw new CustomError(HttpStatus.UNAUTHORIZED, ERROR_MESSAGES.INVALID_TOKEN_FORMAT);
      }

      const token = authHeader.split(' ')[1];

      const isRevoked = await RevokedToken.findOne({ token: `Bearer ${token}` });

      if (isRevoked) {
        next(new CustomError(HttpStatus.UNAUTHORIZED, ERROR_MESSAGES.TOKEN_REVOKED));
      }

      const decoded = jwt.verify(token, process.env.SECRET as string) as IUser;
      req.user = decoded;
      next();
    } catch (err: any) {
      if (err instanceof jwt.JsonWebTokenError) {
        next(new CustomError(HttpStatus.UNAUTHORIZED, ERROR_MESSAGES.INVALID_EXPIRED_TOKEN));
      } else {
        next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.UNEXPECTED_ERROR));
      }
    }
  };
};

export default validateToken;
