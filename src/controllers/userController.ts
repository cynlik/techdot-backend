import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { config } from '@src/config';
import { User, IUser } from '@src/models/userModel';
import { sendMail } from '@src/services/emailConfig';
import { EmailType } from '@src/utils/emailType';

export default class UserController {

  public async create(newUser: IUser, res: Response) {
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

  private hashPassword(password: string) {
    return bcrypt.hash(password, config.saltRounds).catch((err) => {
      return Promise.reject(new Error(`Password not hashed, error: \n ${err}`));
    });
  }
  
  private comparePassword(newPassword: string, hash: string) {
    return bcrypt.compare(newPassword, hash);
  }

  private async isEmailUnique(newUser: IUser) {
    return (await User.find({ email: newUser.email }).exec()).length <= 0;
  }

  public save(doc: IUser) {
    return doc
      .save()
      .catch((err: Error) =>
        Promise.reject(new Error(`There is a problem with saving information, error: \n ${err}`))
      );
  }

  private createToken(user: IUser, expiresIn = config.expiresIn) {
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

  private verifyToken(token: string) {
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
