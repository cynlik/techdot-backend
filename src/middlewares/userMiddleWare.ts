import { Request, Response, NextFunction } from 'express';
import { IUser } from '@src/models/userModel';

interface CustomRequest extends Request {
  user: IUser;
}

const roleMiddleware = (allowedRole: string) => {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }

      const role = req.user.role;
      if (role !== allowedRole) {
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
 * Exemplo utilizaçao
 * 
 * @param {string}
 * const productManagerMiddleware = roleMiddleware('manage-products');
*/
