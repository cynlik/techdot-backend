import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as _ from "lodash";
import { Request, Response } from "express";
import { config } from "@src/config";
import { User, IUser, UserStatus } from "@src/models/userModel";
import { sendMail } from "@src/services/emailConfig";
import { EmailType } from "@src/utils/emailType";
import { RevokedToken } from "@src/models/revokedTokenModel";
import { getUserCountry } from "@src/services/geoLocation";
import { CustomError } from "@src/utils/customError";
import { HttpStatus } from "@src/utils/constant";

interface CustomRequest extends Request {
	user: IUser;
}

export default class UserController {
	public registerUser = async (req: Request, res: Response, next: Function) => {
		try {
			const { name, email, password } = req.body;

			const userExists = await User.findOne({ email });
			if (userExists) {
				return next(new CustomError(HttpStatus.BAD_REQUEST, "User already registered!" ));
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

			sendMail(EmailType.Welcome, user.email, res, token.token);
			sendMail(EmailType.VerifyAccount, user.email, res, token.token);

			return next(new CustomError(HttpStatus.OK, `Account registered successfully. Please verify your account through the email sent to your email: ${user.email}` ));
		} catch (error) {
			return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error" ));
		}
	};

	public loginUser = async (req: Request, res: Response, next: Function) => {
		try {
			const { email, password } = req.body;

			const user = await User.findOne({ email });

			if (!user) {
				return next(new CustomError(HttpStatus.NOT_FOUND, "User not found!" ));
			}

			if (!user.isVerified) {
				const token = UserController.createToken(user, config.expiresIn);
				user.verifyAccountToken = token.token;
				user.verifyAccountTokenExpires = new Date(
					Date.now() + 24 * 60 * 60 * 1000
				); // 24 hours

				await user.save();

				sendMail(EmailType.VerifyAccount, user.email, res, token.token);

				return next(new CustomError(HttpStatus.UNAUTHORIZED, "Verify your email" ));
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
				return res.status(HttpStatus.OK).json(accessToken);
			} else {
				return next(new CustomError(HttpStatus.UNAUTHORIZED, "Invalid email or password" ));
			}
		} catch (error) {
			return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error" ));
		}
	};

	public verifyAccount = async (req: Request, res: Response, next: Function) => {
		try {
			const user = req.user;
			user.isVerified = true;
			user.verifyAccountToken = null;
			await user.save();

			return res.status(HttpStatus.OK).json( "Account verified successfully!" );
		} catch (error) {
			return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error" ));
		}
	};

	public forgetPassword = async (req: Request, res: Response, next: Function) => {
		try {
			const { email } = req.body;

			const user = await User.findOne({ email });
			if (!user) {
				return next(new CustomError(HttpStatus.NOT_FOUND, "User not found!" ));
			}

			const token = UserController.createToken(user, config.expiresIn);
			user.resetPasswordToken = token.token;
			user.resetPasswordExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

			await user.save();

			sendMail(EmailType.ForgetPassword, user.email, res, token.token);
		} catch (error) {
			return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error" ));
		}
	};

	public resetPassword = async (req: Request, res: Response, next: Function) => {
		try {
			const { newPassword, confirmPassword } = req.body;
			const user = req.user;

			if (newPassword !== confirmPassword) {
				return next(new CustomError(HttpStatus.BAD_REQUEST, "The new password and confirm password fields must match." ));
			}

			const oldPasswordMatch = await bcrypt.compare(newPassword, user.password);

			if (oldPasswordMatch) {
				return next(new CustomError(HttpStatus.BAD_REQUEST, "The new password must be different from the old password." ));
			}

			try {
				const hashedNewPassword = await bcrypt.hash(
					newPassword,
					config.saltRounds
				);
				user.password = hashedNewPassword;
				user.resetPasswordToken = null;
				await user.save();
				return res.status(HttpStatus.OK).json({ message: "Password updated successfully." });
			} catch (error) {
				return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error" ));
			}
		} catch (error) {
			return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error" ));
		}
	};

	public me = async (req: CustomRequest, res: Response, next: Function) => {
		try {
			const user = req.user;
			res.status(HttpStatus.OK).json({ message: user });
		} catch (error) {
			return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error" ));
		}
	};

	public meUpdate = async (req: CustomRequest, res: Response, next: Function) => {
		try {
			const newUser = req.body;
			const user = req.user;

			if (newUser.name === user.name) {
				return next(new CustomError(HttpStatus.BAD_REQUEST, "The new name is the same as the current name" ));
			}

			if (newUser.password === user.password) {
				return next(new CustomError(HttpStatus.BAD_REQUEST, "The new password is the same as the current password" ));
			}

			const updateFields: { [key: string]: any } = {};
			if (newUser.name) updateFields.name = newUser.name;

			if (newUser.password) {
				const hashedNewPassword = await bcrypt.hash(newUser.password, 10);
				updateFields.password = hashedNewPassword;
			}

			if (newUser.picture) updateFields.picture = newUser.picture;
			if (newUser.address) updateFields.address = newUser.address;
			if (newUser.country) updateFields.country = newUser.country;

			const updatedUser = await User.findByIdAndUpdate(user._id, updateFields, {
				new: true,
			});

			res.status(HttpStatus.OK).json({ message: "Info updated successfully", user: updatedUser });
		} catch (error) {
			return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error" ));
		}
	};

	public getUserById = async (req: Request, res: Response, next: Function) => {
		try {
			const { id } = req.params;

			let users;

			if (id) {
				const user = await User.findById(id);
				users = [user];
			} else {
				users = await User.find();
			}

			res.status(HttpStatus.OK).send(users);
		} catch (error) {
			return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error" ));
		}
	};

	public updateUserById = async (req: Request, res: Response, next: Function) => {
		try {
			const newUser = req.body;
			const dbUser = await User.findById(req.params.id);

			if (dbUser === null) {
				return next(new CustomError(HttpStatus.NOT_FOUND, "User not found!" ));
			}

			if (newUser.email && !(await this.isEmailUnique(newUser.email))) {
				return next(new CustomError(HttpStatus.BAD_REQUEST, "Email already in use." ));
			}

			if (newUser.password) {
				if (await bcrypt.compare(newUser.password, dbUser.password)) {
					return next(new CustomError(HttpStatus.BAD_REQUEST, "New password must be different from the previous one." ));
				}

				const hashedNewPassword = await bcrypt.hash(newUser.password, 10);
				newUser.password = hashedNewPassword;
			} else {
				newUser.password = dbUser.password;
			}

			if (newUser.name && newUser.name.length > 50) {
				return next(new CustomError(HttpStatus.BAD_REQUEST, "Name must be 50 characters or less." ));
			}

			if (newUser.role && !Object.values(UserStatus).includes(newUser.role)) {
				return next(new CustomError(HttpStatus.BAD_REQUEST, "Invalid user role." ));
			}

			if (newUser.picture && !this.isValidPictureFormat(newUser.picture)) {
				return next(new CustomError(HttpStatus.BAD_REQUEST, "Invalid picture format. Allowed formats are jpg, jpeg, or png." ));
			}

			if (newUser.address && newUser.address.length > 100) {
				return next(new CustomError(HttpStatus.BAD_REQUEST, "Address must be 100 characters or less." ));
			}

			if (newUser.country && !this.isValidCountry(newUser.country)) {
				return next(new CustomError(HttpStatus.BAD_REQUEST, "Invalid country" ));
			}

			if (
				newUser.isVerified !== undefined &&
				typeof newUser.isVerified !== "boolean"
			) {
				return next(new CustomError(HttpStatus.BAD_REQUEST, "Invalid value for isVerified. Must be a boolean." ));
			}

			if (newUser.cart && !this.isValidCart(newUser.cart)) {
				return next(new CustomError(HttpStatus.BAD_REQUEST, "Invalid cart format." ));
			}

			const updatedUser = await User.findByIdAndUpdate(req.params.id, newUser, {
				new: true,
			});

			res.status(HttpStatus.OK).send(updatedUser);
		} catch (error) {
			return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error" ));
		}
	};

	public deleteUserById = async (req: Request, res: Response, next: Function) => {
		try {
			const { id } = req.params;

			const user = await User.findByIdAndDelete(id);

			res.status(HttpStatus.OK).send(user);
		} catch (error) {
			return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error" ));
		}
	};

	public changeView = async (req: Request, res: Response, next: Function) => {
		try {
			const user = req.user;
			const token = req.headers.authorization as string;

			if (!token) {
				return next(new CustomError(HttpStatus.UNAUTHORIZED, "No token provided." ));
			}

			if (!user) {
				return next(new CustomError(HttpStatus.UNAUTHORIZED, "No user." ));
			}

			const newView = user.view === user.role ? UserStatus.Member : user.role;

			const updatedUser = await User.findByIdAndUpdate(
				user.id,
				{ view: newView },
				{ new: true }
			);

			if (!updatedUser) {
				return next(new CustomError(HttpStatus.NOT_FOUND, "User not found." ));
			}

			await this.revokeUserToken(token);

			const accessToken = UserController.createToken(
				updatedUser,
				config.expiresIn
			);

			res.status(HttpStatus.OK).json({
					message: "View changed successfully",
					view: updatedUser.view,
					accessToken: accessToken,
				});
		} catch (error) {
			return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error" ));
		}
	};

	public logout = async (req: Request, res: Response, next: Function) => {
		try {
			const token = req.headers.authorization as string;

			if (!token) {
				return next(new CustomError(HttpStatus.UNAUTHORIZED, "No token provided." ));
			}
			await this.revokeUserToken(token);

			res.status(HttpStatus.OK).json({ message: "Logout successful" });
		} catch (error) {
			return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error" ));
		}
	};

	private isValidPictureFormat(picture: string): boolean {
		const allowedFormats = ["jpg", "jpeg", "png"];
		const format = picture.split(".").pop()?.toLowerCase();
		return format ? allowedFormats.includes(format) : false;
	}

	private isValidCountry(country: string): boolean {
		// Aceita tudo menos vazio
		return country.trim() !== "";
	}

	private isValidCart(cart: any): boolean {
		// Aceita tudo menos null
		return cart !== null && typeof cart === "object";
	}

	private isEmailUnique = async (email: string) => {
		return (await User.find({ email }).exec()).length <= 0;
	};

	private static createToken(user: IUser, expiresIn = config.expiresIn) {
		let token = jwt.sign(
			{
				id: user._id,
				name: user.name,
				email: user.email,
				country: user.country,
				role: user.role,
				view: user.view,
			},
			config.secret,
			{ expiresIn }
		);

		return { auth: true, token };
	}

	private revokeUserToken = async (token: string) => {
		const existingToken = await RevokedToken.findOne({ token });

		if (!existingToken) {
			const newRevokedToken = new RevokedToken({ token });
			await newRevokedToken.save();
		}
	};
}

