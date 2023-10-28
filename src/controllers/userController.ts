import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { config } from '@src/config';
import { User, IUser } from '@src/models/userModel';
import { sendMail } from '@src/services/emailConfig';
import { EmailType } from '@src/utils/emailType';

export default class UserController {

  public async registerUser(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        res.status(400).json({ message: "All fields are mandatory!" });
        return;
      }

      const userAvailable = await User.findOne({ email });
      if (userAvailable) {
        res.status(400).json({ message: "User already registered!" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("Hashed Password: ", hashedPassword);
      const user = new User({
        name,
        email,
        password: hashedPassword,
      });

      console.log(`User created ${user}`);

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

  public async verifyAccount(req: Request, res: Response) {
    //
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

  private async save(doc: IUser) {
    return doc.save();
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
}
