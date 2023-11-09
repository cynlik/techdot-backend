import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as _ from "lodash";
import { Request, Response } from "express";
import { config } from "@src/config";
import { User, IUser } from "@src/models/userModel";
import { sendMail } from "@src/services/emailConfig";
import { EmailType } from "@src/utils/emailType";
import { getUserCountry } from "@src/services/geoLocation";
import axios from "axios";

interface CustomRequest extends Request {
	user: IUser;
}

export default class UserController {
	public registerUser = async (req: Request, res: Response) => {
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
	};

	public loginUser = async (req: Request, res: Response) => {
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
				const ip =
					req.headers["x-forwarded-for"] || req.connection.remoteAddress;
				if (typeof ip === "string") {
					if (user.lastLoginIP !== ip) {
						sendMail(EmailType.NewLocation, user.email, res, ip)
						user.lastLoginIP = ip;

						const userCountry = await getUserCountry(ip);
						user.country = userCountry;
					}

					try {
						await user.save();
					} catch (error) {
						console.error("Error saving user data:", error);
					}
				}

				const accessToken = UserController.createToken(user, config.expiresIn);
				res.status(200).json({ accessToken: accessToken });
			} else {
				res.status(401).json({ error: "Invalid email or password" });
			}
		} catch (error) {
			res.status(500).json({ error: error });
		}
	};

	public verifyAccount = async (req: Request, res: Response) => {
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

			res.clearCookie("token");

			return res
				.status(200)
				.json({ message: "Account verified successfully." });
		} catch (error) {
			console.error("Erro durante a verificação da conta:", error);
			return res
				.status(500)
				.json({ error: "An error occurred while verifying the account." });
		}
	};

	public forgetPassword = async (req: Request, res: Response) => {
		const { email } = req.body;

		const user = await User.findOne({ email });
		if (!user) {
			res.status(400);
			throw new Error("User with this email does not exist");
		}

		const token = UserController.createToken(user, config.expiresIn);
		user.resetPasswordToken = token.token;
		user.resetPasswordExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

		await user.save();

		sendMail(EmailType.ForgetPassword, user.email, res, token.token);
	};

	public resetPassword = async (req: Request, res: Response) => {
		const { newPassword, confirmPassword } = req.body;

		const token = req.query.token as string | undefined;

		if (!token) {
			res.status(400);
			throw new Error("Token not provided.");
		}

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpires: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ error: "Token inválido ou expirado!" });
		}

		if (!newPassword || !confirmPassword) {
			res.status(400).json({
				message:
					"Both the new password and confirm password fields are mandatory.",
			});
		}

		if (newPassword !== confirmPassword) {
			res.status(400).json({
				message: "The new password and confirm password fields must match.",
			});
		}

		const oldPasswordMatch = await bcrypt.compare(newPassword, user.password);

		if (oldPasswordMatch) {
			res.status(400).json({
				message: "The new password must be different from the old password.",
			});
		}

		try {
			const hashedNewPassword = await bcrypt.hash(
				newPassword,
				config.saltRounds
			);
			res.clearCookie("token");
			user.password = hashedNewPassword;
			user.resetPasswordToken = null;
			const updatedUser = await user.save();
			res.status(200).json({ message: "Password updated successfully." });
		} catch (error) {
			res
				.status(500)
				.json({ message: "An error occurred while updating the password." });
		}
	};

	public me = async (req: CustomRequest, res: Response) => {
		const user = req.user;
		res.status(200).json({ message: user });
	};

	public getUserById = async (req: Request, res: Response) => {
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
	};

	public updateUserById = async (req: Request, res: Response) => {
		try {
			const newUser = req.body;
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
				const hashedNewPassword = await bcrypt.hash(newUser.password, 10);
				newUser.password = hashedNewPassword;
			} else {
				newUser.password = dbUser.password;
			}

			res.status(200).send(newUser);
		} catch (error) {
			console.error(error);
			res.status(404).json({ message: "Failed to update user." });
		}
	};

	public deleteUserById = async (req: Request, res: Response) => {
		try {
			const user = await User.findByIdAndDelete(req.params.userId);

			if (user === null) {
				throw new Error("User not found!");
			}

			res.status(200).send(user);
		} catch (error) {
			res.status(404).json({ message: "Failed to delete user." });
		}
	};

	public logout = async (req: Request, res: Response) => {
		res.clearCookie("token");
		res.status(200).json({ message: "Logout" });
	};

	private static createToken(user: IUser, expiresIn = config.expiresIn) {
		let token = jwt.sign(
			{
				id: user._id,
				name: user.name,
				email: user.email,
				country: user.country,
				role: user.role,
			},
			config.secret,
			{ expiresIn }
		);

		return { auth: true, token };
	}

	private isEmailUnique = async (email: string) => {
		return (await User.find({ email }).exec()).length <= 0;
	};
}
