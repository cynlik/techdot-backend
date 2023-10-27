import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { config } from '@src/config';
import { User, IUser } from '@src/models/userModel';
import { sendMail } from '@src/utility/emails';
import { EmailType } from '@src/utility/emailType';

export default class UserController {
  static hashPassword(password: string) {
    return bcrypt.hash(password, config.saltRounds).catch((err) => {
      return Promise.reject(new Error(`Password not hashed, error: \n ${err}`));
    });
  }
  
  static comparePassword(newPassword: string, hash: string) {
    return bcrypt.compare(newPassword, hash);
  }

  static async isEmailUnique(newUser: IUser) {
    return (await User.find({ email: newUser.email }).exec()).length <= 0;
  }

  static async create(newUser: IUser, res: Response) {
    if (!(await this.isEmailUnique(newUser))) {
      return Promise.reject(new Error("Email already exists."));
    }
  
    let newUserWithPassword = {
      ...newUser,
      password: await this.hashPassword(newUser.password),
    };
  
    const createdUser = new User(newUserWithPassword);
    await this.save(createdUser);
  
    try {
      sendMail(EmailType.Welcome, newUser.email, res);
      return createdUser;
    } catch (error) {
      console.error(error);
      return Promise.reject(new Error("Failed to send welcome email"));
    }
  }

  static save(doc: IUser) {
    return doc
      .save()
      .catch((err: Error) =>
        Promise.reject(new Error(`There is a problem with saving information, error: \n ${err}`))
      );
  }

  static createToken(user: IUser, expiresIn = config.expiresIn) {
    let token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        roles: user.roles,
      },
      config.secret,
      { expiresIn }
    );

    return { auth: true, token };
  }

  static verifyToken(token: string) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          reject(err);
        }
        return resolve(decoded);
      });
    });
  }
}
