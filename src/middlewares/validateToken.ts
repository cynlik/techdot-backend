import { Request, Response, NextFunction } from 'express';
import { IUser } from '@src/models/userModel';
import jwt from 'jsonwebtoken';

interface CustomRequest extends Request {
  user: IUser;
}

const validateToken = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    let token;
    let authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer')) {
      token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.SECRET as string);

      if (typeof decoded === 'object' && 'user' in decoded) {
        req.user = decoded.user;
        next();
      } else {
        res.status(401);
        throw new Error('User is not authorized or token is missing user information');
      }
    } else {
      res.status(401);
      throw new Error('User is not authorized or token is missing');
    }
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
};

export default validateToken;
