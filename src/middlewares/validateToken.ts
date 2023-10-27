import { IUser } from '@src/models/userModel';
import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';

interface CustomRequest extends Request {
  user?: IUser;
}

const validateToken = asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
  let token;
  let authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer')) {
    token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, decoded) => {
      if (err) {
        res.status(401);
        throw new Error('User is not authorized');
      }
      req.user = (decoded as { user: IUser }).user;
      next();
    });

    if (!token) {
      res.status(401);
      throw new Error('User is not authorized or token is missing');
    }
  }
});

export default validateToken;
