import { Request, Response, NextFunction } from 'express';
import { IUser } from '@src/models/userModel'; 
import { UserRole } from '@src/utils/roles'; 
import jwt from 'jsonwebtoken';

// Estenda a definição de tipo do Express para incluir a propriedade 'user'
declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}

const roleMiddleware = (allowedRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRoles = req.user?.roles;

      if (!userRoles || !userRoles.includes(allowedRole)) {
        return res
          .status(403)
          .json({ message: `Access denied. Only ${allowedRole} users allowed.` });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: `Error in ${allowedRole} middleware` });
    }
  };
};


export { roleMiddleware };
