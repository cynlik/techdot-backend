import { Request, Response, NextFunction } from 'express';
import { IUser } from '@src/models/userModel';
import { UserRole } from '@src/utils/roles';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}

function calculateRoleOrder(role: UserRole) {
  const roles = Object.values(UserRole);
  const roleIndex = roles.indexOf(role);
  return roleIndex === -1 ? -1 : roles.length - roleIndex - 1;
}

const roleMiddleware = (allowedRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        return res.status(403).json({ message: 'Access denied. User has no valid role.' });
      }

      const allowedRoleOrder = calculateRoleOrder(allowedRole);
      const userRoleOrder = calculateRoleOrder(userRole);

      if (userRoleOrder >= allowedRoleOrder) {
        next();
      } else {
        return res.status(403).json({ message: `Access denied. Only ${allowedRole} or higher users allowed.` });
      }
    } catch (error) {
      return res.status(500).json({ message: `Error in ${allowedRole} middleware` });
    }
  };
};

export { roleMiddleware };
