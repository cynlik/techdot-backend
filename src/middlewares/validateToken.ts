import { Request, Response, NextFunction } from 'express';
import { IUser } from '@src/models/userModel';
import { RevokedToken } from '@src/models/revokedTokenModel'; 
import jwt from 'jsonwebtoken';
import { HttpStatus } from '@src/utils/constant';

interface CustomRequest extends Request {
  user: IUser;
}

class CustomError extends Error {
  status: HttpStatus;

  constructor(status: HttpStatus, message: string) {
    super(message);
    this.status = status;
  }
}

const validateToken = (isOptional: boolean = false) => {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    let token;
    const authHeader = req.headers.authorization || req.headers.Authorization;

    // Se não há cabeçalho de autorização e o token é opcional, avança sem validar
    if (!authHeader) {
      if (isOptional) {
        return next();
      } else {
        return next(new CustomError(HttpStatus.UNAUTHORIZED, 'User is not authorized or token is missing'));
      }
    }

    try {
      if (authHeader && typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer')) {
        token = authHeader.split(' ')[1];
        
        const isRevoked = await RevokedToken.exists({ token: `Bearer ${token}` });
        if (isRevoked) {
          throw new CustomError(HttpStatus.UNAUTHORIZED, 'Token revoked. Login again');
        }
        
        const decoded = jwt.verify(token, process.env.SECRET as string) as IUser;
        req.user = decoded;
        next();
      } else {
        throw new CustomError(HttpStatus.UNAUTHORIZED, 'Invalid token format');
      }
    } catch (err: any) {
      if (err instanceof jwt.JsonWebTokenError) {
        next(new CustomError(HttpStatus.UNAUTHORIZED, 'Invalid or expired token'));
      } else {
        next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'An unexpected error occurred'));
      }
    }
  };
};

export default validateToken;
