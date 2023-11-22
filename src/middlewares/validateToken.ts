import { Request, Response, NextFunction } from 'express';
import { IUser } from '@src/models/userModel';
import { RevokedToken } from '@src/models/revokedTokenModel'; 
import jwt from 'jsonwebtoken';

interface CustomRequest extends Request {
  user: IUser;
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
        return res.status(401).json({ message: 'User is not authorized or token is missing' });
      }
    }

    try {
      if (authHeader && typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer')) {
        token = authHeader.split(' ')[1];
        
        const isRevoked = await RevokedToken.exists({ token: `Bearer ${token}` });
        if (isRevoked) {
          return res.status(401).json({ message: 'Token revoked. Login again' });
        }
        
        const decoded = jwt.verify(token, process.env.SECRET as string);
        
        if (typeof decoded === 'object') {
          (req as any).user = decoded;
          return next();
        } else {
          return res.status(401).json({ message: 'User is not authorized or token is missing user information' });
        }
      } else {
        return res.status(401).json({ message: 'User is not authorized or token is missing' });
      }
    } catch (err: any) {
      return res.status(401).json({ error: err.message });
    }
  };
};

export default validateToken;
