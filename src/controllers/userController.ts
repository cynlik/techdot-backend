import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '@src/config';
import { User, IUser } from '@src/models/userModel';

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

  static async create(newUser: IUser) {
    if (!(await this.isEmailUnique(newUser))) {
      return Promise.reject(new Error("Email already exists."));
    }

    let newUserWithPassword = {
      ...newUser,
      password: this.hashPassword(newUser.password),
    };

    return this.save(new User(newUserWithPassword));
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
