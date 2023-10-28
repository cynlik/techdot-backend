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
      user.verifyAccountTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 15 minutes

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
    const token = req.query.token as string;

    try {
        const user = await User.findOne({
            verifyAccountToken: token,
            verifyAccountTokenExpires: { $gt: new Date() },
        });

        if (!user) {
            console.log("Token inválido ou expirado: Token não encontrado no banco de dados.");
            return res.status(400).json({ error: "Token inválido ou expirado!" });
        }

        user.isVerified = true;
        user.verifyAccountToken = null;
        await user.save();

        return res.status(200).json({ message: "Account verified successfully." });
    } catch (error) {
        console.error("Erro durante a verificação da conta:", error);
        return res.status(500).json({ error: "An error occurred while verifying the account." });
    }
}

  public async findById(id: string): Promise<IUser> {
    try {
      const user = await User.findById(id).exec();
      
      if(user === null) {
        throw new Error("User not found!");
      }

      return user;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public async updateById(id: string, newUser: Partial<IUser>): Promise<IUser> {
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
  }

  public async removeById(id: string): Promise<IUser> {
    try {
      const user = await User.findByIdAndRemove(id).exec();

      if(user === null) {
        throw new Error("User not found!");
      }

      return user;
    }catch (err) {
      return Promise.reject(err);
    }
  }

  // static async getUser(req: Request, res: Response) {
  //   try {
  //     const user = User.findById(req.body._id);
  //     if (user) {
  //       res.status(200).send(user);
  //     }
  //   } catch (error) {
  //     res.status(404).send('User not found');
  //   }
  // }

  // static async updateUser(req: Request, res: Response) {
  //   try {
  //     const user = User.findByIdAndRemove(req.body._id);
  //     if (user) {
  //       res.status(200).send(user);
  //     }
  //   } catch (error) {
  //     res.status(404).send('User not found');
  //   }
  // }

  // static async deleteUser(req: Request, res: Response) {
  //   try {
  //     const user = User.findByIdAndUpdate(req.body._id);
  //     if (user) {
  //       res.status(200).send(user);
  //     }
  //   } catch (error) {
  //     res.status(404).send('User not found');
  //   }
  // }

  private async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, config.saltRounds);
    }catch (err: any) {
      err = err instanceof Error ? err : new Error(err);

      return Promise.reject(new Error(`Password not hashed, error: \n ${err.message}`));
    }
  }
  
  private comparePassword(newPassword: string, hash: string) {
    return bcrypt.compare(newPassword, hash);
  }

  private async isEmailUnique(email: string): Promise<boolean> {
    return (await User.find({ email }).exec()).length <= 0;
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
