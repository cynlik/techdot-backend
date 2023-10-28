import { IUser } from '@src/models/userModel';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface CustomRequest extends Request {
  user?: IUser;
}

const validateToken = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    let token;
    let authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer')) {
      token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
      req.user = (decoded as { user: IUser }).user;
      next();
    } else {
      res.status(401);
      throw new Error('User is not authorized or token is missing');
    }
  } catch (err: any) { // TODO: handle error message
    res.status(401).json({ error: err.message });
  }
};



export default validateToken;
