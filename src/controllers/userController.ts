import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as _ from "lodash";
import { Request, Response } from "express";
import { config } from "@src/config";
import { User, IUser } from "@src/models/userModel";
import { sendMail } from "@src/services/emailConfig";
import { EmailType } from "@src/utils/emailType";
import { RevokedToken } from "@src/models/revokedTokenModel";
import { getUserCountry } from "@src/services/geoLocation";

interface CustomRequest extends Request {
	user: IUser;
}

export default class UserController {
	public registerUser = async (req: Request, res: Response) => {
		try {
			const { name, email, password } = req.body;

			const userExists = await User.findOne({ email });
			if (userExists) {
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
			return res.status(500).send({ message: "Internal Server Error" });
		}
	};

	public loginUser = async (req: Request, res: Response) => {
		try {
			const { email, password } = req.body;

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
						sendMail(EmailType.NewLocation, user.email, res, ip);
						user.lastLoginIP = ip;
					}

					if (user.country === null) {
						const userCountry = await getUserCountry(ip);
						user.country = userCountry;
					}

					await user.save();
				}

				const accessToken = UserController.createToken(user, config.expiresIn);
				res.status(200).json({ accessToken: accessToken });
			} else {
				res.status(401).json({ error: "Invalid email or password" });
			}
		} catch (error) {
			console.error(error);
			return res.status(500).send({ message: "Internal Server Error" });
		}
	};

	public verifyAccount = async (req: Request, res: Response) => {
		try {
			const user = req.user;
			user.isVerified = true;
			user.verifyAccountToken = null;
			await user.save();

			return res
				.status(200)
				.json({ message: "Account verified successfully." });
		} catch (error) {
			console.error(error);
			return res.status(500).send({ message: "Internal Server Error" });
		}
	};

	public forgetPassword = async (req: Request, res: Response) => {
		try {
			const { email } = req.body;

			const user = await User.findOne({ email });
			if (!user) {
				return res
					.status(500)
					.json({ error: "User with this email does not exist." });
			}

			const token = UserController.createToken(user, config.expiresIn);
			user.resetPasswordToken = token.token;
			user.resetPasswordExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

			await user.save();

			sendMail(EmailType.ForgetPassword, user.email, res, token.token);
		} catch (error) {
			console.error(error);
			return res.status(500).send({ message: "Internal Server Error" });
		}
	};

	public resetPassword = async (req: Request, res: Response) => {
		try {
			const { newPassword, confirmPassword } = req.body;
			const user = req.user;
	
			if (newPassword !== confirmPassword) {
				return res.status(400).json({
					message: "The new password and confirm password fields must match.",
				});
			}
	
			const oldPasswordMatch = await bcrypt.compare(newPassword, user.password);
	
			if (oldPasswordMatch) {
				return res.status(400).json({
					message: "The new password must be different from the old password.",
				});
			}
	
			try {
				const hashedNewPassword = await bcrypt.hash(
					newPassword,
					config.saltRounds
				);
				user.password = hashedNewPassword;
				user.resetPasswordToken = null;
				await user.save();
				return res.status(200).json({ message: "Password updated successfully." });
			} catch (error) {
				console.error(error);
				return res
					.status(500)
					.json({ message: "An error occurred while updating the password." });
			}
		} catch (error) {
			console.error(error);
			return res.status(500).send({ message: "Internal Server Error" });
		}
	};	

	public me = async (req: CustomRequest, res: Response) => {
		try {
			const user = req.user;
			res.status(200).json({ message: user });
		} catch (error) {
			console.error(error);
			return res.status(500).send({ message: "Internal Server Error" });
		}
	};

	public getUserById = async (req: Request, res: Response) => {
		try {
			const { id } = req.params;

			let users;

			if (id) {
				const user = await User.findById(id);
				users = [user];
			} else {
				users = await User.find();
			}

			res.status(200).send(users);
		} catch (error) {
			console.error(error);
			return res.status(500).send({ message: "Internal Server Error" });
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
			return res.status(500).send({ message: "Internal Server Error" });
		}
	};

	public deleteUserById = async (req: Request, res: Response) => {
		try {
			const { id } = req.params;

			const user = await User.findByIdAndDelete(id);

			res.status(200).send(user);
		} catch (error) {
			console.error(error);
			return res.status(500).send({ message: "Internal Server Error" });
		}
	};

	public logout = async (req: Request, res: Response) => {
		try {
			const token = req.headers.authorization as string;

			if (!token) {
				res.status(401).json({ message: "Invalid token" });
			}
			await this.revokeUserToken(token);

			res.status(200).json({ message: "Logout successful" });
		} catch (error) {
			res.status(500).json({ message: "Failed to logout" });
		}
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

	private revokeUserToken = async (token: string) => {
		const existingToken = await RevokedToken.findOne({ token });

		if (!existingToken) {
			const newRevokedToken = new RevokedToken({ token });
			await newRevokedToken.save();
		}
	};
}
