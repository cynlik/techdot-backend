import { Request, Response, NextFunction } from "express";
import { IUser, UserStatus } from "@src/models/userModel";
import { HttpStatus, ERROR_MESSAGES } from "@src/utils/constant";

declare global {
	namespace Express {
		interface Request {
			user: IUser;
		}
	}
}

function calculateRoleOrder(role: UserStatus) {
	const roles = Object.values(UserStatus);
	const roleIndex = roles.indexOf(role);
	return roleIndex === -1 ? -1 : roles.length - roleIndex - 1;
}

const hasPermission = (
	userRole: UserStatus,
	requiredRole: UserStatus
): boolean => {
	const requiredRoleOrder = calculateRoleOrder(requiredRole);
	const userRoleOrder = calculateRoleOrder(userRole);

	return userRoleOrder >= requiredRoleOrder;
};

const roleMiddleware = (allowedRole: UserStatus) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const userRole = req.user?.role;

			if (!userRole) {
				return res
					.status(HttpStatus.FORBIDDEN)
					.json({ message: ERROR_MESSAGES.NO_VALID_ROLE });
			}

			const allowedRoleOrder = calculateRoleOrder(allowedRole);
			const userRoleOrder = calculateRoleOrder(userRole);

			if (userRoleOrder >= allowedRoleOrder) {
				next();
			} else {
				return res.status(HttpStatus.FORBIDDEN).json({
					message: `${ERROR_MESSAGES.ACCESS_DENIED} ${allowedRole} ${ERROR_MESSAGES.OR_HIGHER}`,
				});
			}
		} catch (error) {
			return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				message: `${ERROR_MESSAGES.ERROR_IN_MIDDLEWARE} ${allowedRole}`,
			});
		}
	};
};

export { roleMiddleware, hasPermission };
