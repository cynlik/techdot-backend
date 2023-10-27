import { Request, Response, NextFunction } from 'express';
import { IUser } from '@src/models/userModel'; 
import { UserRole } from '@src/utility/roles'; 

interface CustomRequest extends Request {
  user: IUser;
}

const roleMiddleware = (allowedRole: UserRole) => {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }

      const roles = req.user.roles;

      if (!roles.includes(allowedRole)) {
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

/**
 * Create a new role
 * 
 * @param {UserRole.role}
 * const productManagerMiddleware = roleMiddleware(UserRole.ManageProducts);
 * const clientManagerMiddleware = roleMiddleware(UserRole.ManageClients);
 */