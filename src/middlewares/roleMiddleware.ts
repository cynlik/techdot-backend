import { Request, Response, NextFunction } from 'express';
import { IUser } from '@src/models/userModel';
import { UserRole } from '@src/utils/roles'; // Importe o enum UserRole
import jwt from 'jsonwebtoken';

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
        if (userRoles) {
          for (const role of userRoles) {
            if (role === allowedRole) {
              next();
              return;
            }
          }
        }

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
