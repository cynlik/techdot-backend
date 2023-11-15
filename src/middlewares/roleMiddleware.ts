import { Request, Response, NextFunction } from 'express';
import { IUser, UserRole } from '@src/models/userModel';

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

const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const requiredRoleOrder = calculateRoleOrder(requiredRole);
  const userRoleOrder = calculateRoleOrder(userRole);

  return userRoleOrder >= requiredRoleOrder;
};

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

export { roleMiddleware, hasPermission };
