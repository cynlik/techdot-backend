import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { config } from "@src/config";
import { User, IUser } from "@src/models/userModel";
import { sendMail } from "@src/services/emailConfig";
import { EmailType } from "@src/utils/emailType";

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

			const token = UserController.createToken(user, config.expiresIn);
			user.verifyAccountToken = token.token;
			user.verifyAccountTokenExpires = new Date(
				Date.now() + 24 * 60 * 60 * 1000
			); // 24 hours

			await user.save();

			sendMail(EmailType.VerifyAccount, user.email, res, token.token);

			res.status(201).json({
				message: `Account registered successfully. Please verify your account through the email sent to your email: ${user.email}`,
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Failed to register the user" });
		}
	}

	public async loginUser(req: Request, res: Response) {
		try {
		  const { email, password } = req.body;
	  
		  if (!email || !password) {
			res.status(400).json({ error: "All fields are mandatory!" });
			return;
		  }
	  
		  const user = await User.findOne({ email });
	  
		  if (!user) {
			res.status(400).json({ error: "User not found!" });
			return;
		  }
	  
		  if (!user.isVerified) {
			const token = UserController.createToken(user, config.expiresIn);
			user.verifyAccountToken = token.token;
			user.verifyAccountTokenExpires = new Date(
			  Date.now() + 24 * 60 * 60 * 1000
			); // 24 hours
	  
			await user.save();
	  
			sendMail(EmailType.VerifyAccount, user.email, res, token.token);
	  
			res.status(401).json({ error: "Verify your email" });
			return;
		  }
	  
		  const passwordMatch = await bcrypt.compare(password, user.password);
	  
		  if (passwordMatch) {
			const accessToken = UserController.createToken(user, config.expiresIn);
			res.status(200).json({ accessToken: accessToken });
		  } else {
			res.status(401).json({ error: "Invalid email or password" });
		  }
		} catch (error) {
		  res.status(500).json({ error: error });
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
				console.log(
					"Token inválido ou expirado: Token não encontrado no banco de dados."
				);
				return res.status(400).json({ error: "Token inválido ou expirado!" });
			}

			user.isVerified = true;
			user.verifyAccountToken = null;
			await user.save();

			return res
				.status(200)
				.json({ message: "Account verified successfully." });
		} catch (error) {
			console.error("Erro durante a verificação da conta:", error);
			return res
				.status(500)
				.json({ error: "An error occurred while verifying the account." });
		}
	}

	public async getUserById(req: Request, res: Response) {
		try {
		  let users;
	  
		  if (req.params.id) {
			const user = await User.findById(req.params.id).exec();
	  
			if (user === null) {
			  throw new Error("User not found!");
			}
	  
			users = [user];
		  } else {
			users = await User.find().exec();
		  }
	  
		  res.status(200).send(users);
		} catch (error) {
		  console.error(error);
		  res.status(404).json({ message: "User not found." });
		}
	  }
	  

	public async updateUserById(req: Request, res: Response) {
		try {
			const newUser: Partial<IUser> = req.body;
			const dbUser = await User.findById(req.params.userId);

			if (dbUser === null) {
				throw new Error("User not found!");
			}

			if (newUser.email && !(await this.isEmailUnique(newUser.email))) {
				throw new Error("Email already in use.");
			}

			if (
				newUser.password &&
				!(await bcrypt.compare(newUser.password, dbUser.password))
			) {
				newUser.password = await this.hashPassword(newUser.password);
			} else {
				newUser.password = dbUser.password;
			}

			res.status(200).send(newUser);
		} catch (error) {
			console.error(error);
			res.status(404).json({ message: "Failed to update user." });
		}
	}

	public async deleteUserById(req: Request, res: Response) {
		try {
			const user = await User.findByIdAndDelete(req.params.userId);

			if (user === null) {
				throw new Error("User not found!");
			}

			res.status(200).send(user);
		} catch (error) {
			res.status(404).json({ message: "Failed to delete user." });
		}
	}

	private static createToken(user: IUser, expiresIn = config.expiresIn) {
		let token = jwt.sign(
			{
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
			config.secret,
			{ expiresIn }
		);

		return { auth: true, token };
	}

	private async hashPassword(password: string): Promise<string> {
		try {
			return await bcrypt.hash(password, config.saltRounds);
		} catch (err: any) {
			err = err instanceof Error ? err : new Error(err);

			return Promise.reject(
				new Error(`Password not hashed, error: \n ${err.message}`)
			);
		}
	}

	private async isEmailUnique(email: string): Promise<boolean> {
		return (await User.find({ email }).exec()).length <= 0;
	}
}