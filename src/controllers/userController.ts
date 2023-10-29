import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { config } from '@src/config';
import { User, IUser } from '@src/models/userModel';
import { sendMail } from '@src/services/emailConfig';
import { EmailType } from '@src/utils/emailType';

export default class UserController {

  static async registerUser(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        res.status(400).json({ message: "All fields are mandatory!" });
        return;
      }

      if (!await this.isEmailUnique(email)) {
        res.status(400).json({ message: "User already registered with the same!" });
        return;
      }
      
      console.log("Password hashed!");
      const user = new User({
        name,
        email,
        password: await this.hashPassword(password),
      });

      console.log("User created: \n", user);

      const token = jwt.sign({ _id: user._id }, process.env.SECRET as string, {
        expiresIn: "15m",
      });
      user.verifyAccountToken = token;
      user.verifyAccountTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await user.save();

      sendMail(EmailType.VerifyAccount, user.email, res, token);

      res.status(201).json({
        message: `Account registered successfully. Please verify your account through the email sent to your email: ${user.email}`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to register the user" });
    }
  }

  static async verifyAccount(req: Request, res: Response) {
    //
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const user = await User.findById(req.params.userId).exec();
      
      if(user === null) {
        throw new Error("User not found!");
      }

      res.status(200).send(user);
    } catch (error) {
      console.error(error);
      res.status(404).json({ message: "User not found." });
    }
  }

  static async updateUserById(req: Request, res: Response) {
    try {
      const newUser: Partial<IUser> = req.body
      const dbUser = await User.findById(req.params.userId).exec();

      if(dbUser === null) {
        throw new Error("User not found!");
      }

      if(newUser.email && !(await this.isEmailUnique(newUser.email))) {
        throw new Error("Email already in use.");
      }

      if(newUser.password && !(await this.comparePassword(newUser.password, dbUser.password))) {
        newUser.password = await this.hashPassword(newUser.password);
      }else {
        newUser.password = dbUser.password;
      }

      res.status(200).send(newUser);
    } catch (error) {
      console.error(error);
      res.status(404).json({ message: "Failed to update user." });
    }
  }

  static async deleteUserById(req: Request, res: Response) {
    try {
      const user = await User.findByIdAndDelete(req.params.userId)
      
      if(user === null) {
        throw new Error("User not found!");
      }

      res.status(200).send(user);
    } catch (error) {
      res.status(404).json({ message: "Failed to delete user." });
    }
  }

  private static async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, config.saltRounds);
    }catch (err: any) {
      err = err instanceof Error ? err : new Error(err);

      return Promise.reject(new Error(`Password not hashed, error: \n ${err.message}`));
    }
  }
  
  private static async comparePassword(newPassword: string, hash: string) {
    return bcrypt.compare(newPassword, hash);
  }

  private static async isEmailUnique(email: string): Promise<boolean> {
    return (await User.find({ email }).exec()).length <= 0;
  }

  /*static async findById(id: string): Promise<IUser> {
    try {
      const user = await User.findById(id).exec();
      
      if(user === null) {
        throw new Error("User not found!");
      }

      return user;
    } catch (err) {
      return Promise.reject(err);
    }
  }*/

  /*static async updateById(id: string, newUser: Partial<IUser>): Promise<IUser> {
    try {
      const dbUser = await User.findById(id).exec();

      if(dbUser === null) {
        throw new Error("User not found!");
      }

      if(newUser.email && !(await this.isEmailUnique(newUser.email))) {
        throw new Error("Email already in use.");
      }

      if(newUser.password && !(await this.comparePassword(newUser.password, dbUser.password))) {
        newUser.password = await this.hashPassword(newUser.password);
      }else {
        newUser.password = dbUser.password;
      }

      return await User.findByIdAndUpdate(id, newUser).exec() as IUser;
    }catch (err) {
      return Promise.reject(err);
    }
  }*/

  /*static async removeById(id: string): Promise<IUser> {
    try {
      const user = await User.findByIdAndRemove(id).exec();

      if(user === null) {
        throw new Error("User not found!");
      }

      return user;
    }catch (err) {
      return Promise.reject(err);
    }
  }*/

  /*private static createToken(user: IUser, expiresIn = config.expiresIn) {
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
  }*/
}
