import { Request, Response, NextFunction } from 'express';
import { IUser } from '@src/models/userModel';
import { UserRole } from '@src/utils/roles';

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

      if (!userRoles) {
        return res
          .status(403)
          .json({ message: 'Access denied. User has no roles.' });
      }

      const allowedRoleIndex = Object.values(UserRole).indexOf(allowedRole);
      if (allowedRoleIndex === -1) {
        return res
          .status(403)
          .json({ message: `Invalid role: ${allowedRole}` });
      }

      const userRoleIndex = Math.max(
        ...userRoles.map((role) => Object.values(UserRole).indexOf(role))
      );

      if (userRoleIndex >= allowedRoleIndex) {
        next();
      } else {
        return res
          .status(403)
          .json({ message: `Access denied. Only ${allowedRole} users allowed.` });
      }
    } catch (error) {
      return res.status(500).json({ message: `Error in ${allowedRole} middleware` });
    }
  };
};

export { roleMiddleware };
