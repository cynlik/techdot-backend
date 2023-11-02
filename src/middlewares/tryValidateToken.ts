import { Request, Response, NextFunction } from 'express';
import { IUser } from '@src/models/userModel';
import jwt from 'jsonwebtoken';

interface CustomRequest extends Request {
    user: IUser;
  }

const tryValidateToken = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      let token;
      let authHeader = req.headers.authorization || req.headers.Authorization;
      if (authHeader && typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer')) {
        token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.SECRET as string);
  
        if (typeof decoded === 'object') {
          (req as any).user = decoded;
        }
      }
    } finally {
      next();
    }
  };

  export default tryValidateToken;