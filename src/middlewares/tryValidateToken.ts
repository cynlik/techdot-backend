import { Request, Response, NextFunction } from 'express';
import { IUser } from '@src/models/userModel';
import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

interface CustomRequest extends Request {
    user: IUser;
}

const tryValidateToken = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        let token;
        let authHeader = req.headers.authorization || req.headers.Authorization;
        if (authHeader && typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer')) {
            token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.SECRET as string);

            if (typeof decoded === 'object') {
                req.user = decoded as IUser;
            }
        }
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            return res.status(401).send({ message: 'Token expired' });
        } else if (error instanceof JsonWebTokenError) {
            return res.status(401).send({ message: 'Invalid token' });
        } else {
            // Outros possíveis erros de servidor
            return res.status(500).send({ message: 'Internal Server Error' });
        }
    }

    next();
};

export default tryValidateToken;
