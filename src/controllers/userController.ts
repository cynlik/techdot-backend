import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as _ from 'lodash';
import { Request, Response } from 'express';
import { config } from '@src/config';
import { User, IUser, UserStatus } from '@src/models/userModel';
import { sendMail } from '@src/services/emailConfig';
import { EmailType } from '@src/utils/emailType';
import { RevokedToken } from '@src/models/revokedTokenModel';
import { getUserCountry } from '@src/services/geoLocation';
import { CustomError } from '@src/utils/customError';
import { HttpStatus, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@src/utils/constant';
import { Product } from '@src/models/productModel';
import { WishListItem, WishListItemModel } from '@src/models/wishListModel';
import { Error } from '@src/utils/errorCatch';

interface CustomRequest extends Request {
  user: IUser;
}

export default class UserController {
  public registerUser = async (req: Request, res: Response, next: Function) => {
    try {
      const { name, email, password, address } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.USER_ALREADY_EXISTS));
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        name,
        email,
        password: hashedPassword,
        address: address || {},
      });

      const token = UserController.createToken(user, config.expiresIn);
      user.verifyAccountToken = token.token;
      user.verifyAccountTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await user.save();

      sendMail(EmailType.Welcome, user.email, res, token.token);
      sendMail(EmailType.VerifyAccount, user.email, res, token.token);

      return res.status(HttpStatus.OK).json({
        message: SUCCESS_MESSAGES.ACCOUNT_REGISTERED_SUCCESSFULLY,
        email: user.email,
      });
    } catch (error) {
      next(Error(error));
    }
  };

  public loginUser = async (req: Request, res: Response, next: Function) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND));
      }

      if (!user.isVerified) {
        const token = UserController.createToken(user, config.expiresIn);
        user.verifyAccountToken = token.token;
        user.verifyAccountTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await user.save();

        sendMail(EmailType.VerifyAccount, user.email, res, token.token);

        return next(new CustomError(HttpStatus.UNAUTHORIZED, ERROR_MESSAGES.VERIFY_EMAIL));
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (typeof ip === 'string') {
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
        return next(new CustomError(HttpStatus.UNAUTHORIZED, ERROR_MESSAGES.INVALID_EMAIL_PASSWORD));
      }
    } catch (error) {
      next(Error(error));
    }
  };

  public verifyAccount = async (req: CustomRequest, res: Response, next: Function) => {
    try {
      const user = req.user;
      user.isVerified = true;
      user.verifyAccountToken = null;
      await user.save();

      return res.status(HttpStatus.OK).json(SUCCESS_MESSAGES.ACCOUNT_VERIFIED_SUCCESSFULLY);
    } catch (error) {
      next(Error(error));
    }
  };

  public forgetPassword = async (req: Request, res: Response, next: Function) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND));
      }

      const token = UserController.createToken(user, config.expiresIn);
      user.resetPasswordToken = token.token;
      user.resetPasswordExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await user.save();

      sendMail(EmailType.ForgetPassword, user.email, res, token.token);
    } catch (error) {
      next(Error(error));
    }
  };

  public resetPassword = async (req: CustomRequest, res: Response, next: Function) => {
    try {
      const { newPassword, confirmPassword } = req.body;
      const user = req.user;

      if (newPassword !== confirmPassword) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.EMAIL_PASSWORD_MATCH));
      }

      const oldPasswordMatch = await bcrypt.compare(newPassword, user.password);

      if (oldPasswordMatch) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.PASSWORD_SAME_AS_CURRENT));
      }

      try {
        const hashedNewPassword = await bcrypt.hash(newPassword, config.saltRounds);
        user.password = hashedNewPassword;
        user.resetPasswordToken = null;
        await user.save();
        return res.status(HttpStatus.OK).json({ message: 'Password updated successfully.' });
      } catch (error) {
        return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, SUCCESS_MESSAGES.PASSWORD_UPDATED_SUCCESSFULLY));
      }
    } catch (error) {
      next(Error(error));
    }
  };

  public me = async (req: CustomRequest, res: Response, next: Function) => {
    try {
      const user = req.user;
      res.status(HttpStatus.OK).json({ message: user });
    } catch (error) {
      next(Error(error));
    }
  };

  public meUpdate = async (req: CustomRequest, res: Response, next: Function) => {
    try {
      const newUser = req.body;
      const user = req.user;

      if (newUser.name === user.name) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.NAME_SAME_AS_CURRENT));
      }

      if (await bcrypt.compare(newUser.password, user.password)) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.PASSWORD_SAME_AS_CURRENT));
      }

      if (newUser.picture === user.picture) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.PICTURE_SAME_AS_CURRENT));
      }

      if (newUser.address === user.address) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.ADDRESS_SAME_AS_CURRENT));
      }

      if (newUser.country === user.country) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.COUNTRY_SAME_AS_CURRENT));
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

      res.status(HttpStatus.OK).json({
        message: SUCCESS_MESSAGES.INFO_UPDATED_SUCCESSFULLY,
        user: updatedUser,
      });
    } catch (error) {
      next(Error(error));
    }
  };

  public addToWishList = async (req: CustomRequest, res: Response, next: Function) => {
    try {
      const user = await User.findById(req.user.id).populate('wishList.product');
      const product = await Product.findById(req.params.id);

      if (!user) {
        return next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND));
      }

      if (!product) {
        return next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.PRODUCT_NOT_FOUND));
      }

      const userWishList: WishListItem[] = user.wishList || [];

      const existingWishListItemIndex = userWishList.findIndex((item) => item.product.equals(product.id));

      if (existingWishListItemIndex !== -1) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.PRODUCT_ALREADY_IN_WISHLIST));
      } else {
        const newItem = new WishListItemModel({
          product: product.id,
        });

        userWishList.push(newItem);
      }

      await User.findByIdAndUpdate(user.id, {
        $set: { wishList: userWishList },
      });

      const updatedUser = await User.findById(user.id).populate('wishList.product');

      if (!updatedUser) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: ERROR_MESSAGES.USER_NOT_FOUND,
        });
      }

      res.status(HttpStatus.OK).json({
        message: SUCCESS_MESSAGES.INFO_UPDATED_SUCCESSFULLY,
        wishList: updatedUser.wishList,
      });
    } catch (error) {
      console.error(error);
      next(Error(error));
    }
  };

  public getWishList = async (req: CustomRequest, res: Response, next: Function) => {
    try {
      const user = await User.findById(req.user.id).populate('wishList.product');

      if (!user) {
        return next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND));
      }

      if (!user.wishList || user.wishList.length === 0) {
        res.status(HttpStatus.OK).json({ message: SUCCESS_MESSAGES.EMPTY_WISH_LIST });
      } else {
        res.status(HttpStatus.OK).json({
          wishList: user.wishList.map((wishListItem) => ({
            product: wishListItem.product ? wishListItem.product.toObject() : ERROR_MESSAGES.PRODUCT_NOT_FOUND,
          })),
        });
      }
    } catch (error) {
      console.log(error);
      next(Error(error));
    }
  };

  public removeFromWishList = async (req: CustomRequest, res: Response, next: Function) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND));
      }

      const product = await Product.findById(req.params.id);

      if (!product) {
        return next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.PRODUCT_NOT_FOUND));
      }

      const existingWishListItemIndex = user.wishList.findIndex((item) => item.product.equals(product.id));

      if (existingWishListItemIndex === -1) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.PRODUCT_NOT_FOUND));
      } else {
        user.wishList.splice(existingWishListItemIndex, 1);
      }

      await user.save();

      const updatedUser = await User.findById(user.id).populate('wishList.product');

      if (!updatedUser) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: ERROR_MESSAGES.USER_NOT_FOUND,
        });
      }

      res.status(HttpStatus.OK).json({
        message: SUCCESS_MESSAGES.ITEM_REMOVED_FROM_WISHLIST_SUCCESSFULLY,
        wishList: updatedUser.wishList,
      });
    } catch (error) {
      console.error(error);
      next(Error(error));
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
      next(Error(error));
    }
  };

  public updateUserById = async (req: Request, res: Response, next: Function) => {
    try {
      const newUser = req.body;
      const dbUser = await User.findById(req.params.id);

      if (dbUser === null) {
        return next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND));
      }

      if (newUser.email && !(await this.isEmailUnique(newUser.email))) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.EMAIL_ALREADY_IN_USE));
      }

      if (newUser.password) {
        if (await bcrypt.compare(newUser.password, dbUser.password)) {
          return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.NEW_PASSWORD_DIFFERENT));
        }

        const hashedNewPassword = await bcrypt.hash(newUser.password, 10);
        newUser.password = hashedNewPassword;
      } else {
        newUser.password = dbUser.password;
      }

      if (newUser.name && newUser.name.length > 50) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.NAME_LENGTH_EXCEEDED));
      }

      if (newUser.role && !Object.values(UserStatus).includes(newUser.role)) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.INVALID_USER_ROLE));
      }

      if (newUser.picture && !this.isValidPictureFormat(newUser.picture)) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.INVALID_PICTURE_FORMAT));
      }

      if (newUser.address && newUser.address.length > 100) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.ADDRESS_LENGTH_EXCEEDED));
      }

      if (newUser.country && !this.isValidCountry(newUser.country)) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.INVALID_COUNTRY));
      }

      if (newUser.isVerified !== undefined && typeof newUser.isVerified !== 'boolean') {
        return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.INVALID_VALUE_IS_VERIFIED));
      }

      if (newUser.cart && !this.isValidCart(newUser.cart)) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.INVALID_CART_FORMAT));
      }

      const updatedUser = await User.findByIdAndUpdate(req.params.id, newUser, {
        new: true,
      });

      res.status(HttpStatus.OK).send(updatedUser);
    } catch (error) {
      next(Error(error));
    }
  };

  public deleteUserById = async (req: Request, res: Response, next: Function) => {
    try {
      const { id } = req.params;

      const user = await User.findByIdAndDelete(id);

      res.status(HttpStatus.OK).send(user);
    } catch (error) {
      next(Error(error));
    }
  };

  public changeView = async (req: CustomRequest, res: Response, next: Function) => {
    try {
      const user = req.user;
      const token = req.headers.authorization as string;

      if (!token) {
        return next(new CustomError(HttpStatus.UNAUTHORIZED, ERROR_MESSAGES.NO_TOKEN_PROVIDED));
      }

      if (!user) {
        return next(new CustomError(HttpStatus.UNAUTHORIZED, ERROR_MESSAGES.NO_USER));
      }

      const newView = user.view === user.role ? UserStatus.Member : user.role;

      const updatedUser = await User.findByIdAndUpdate(user.id, { view: newView }, { new: true });

      if (!updatedUser) {
        return next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND));
      }

      await this.revokeUserToken(token);

      const accessToken = UserController.createToken(updatedUser, config.expiresIn);

      res.status(HttpStatus.OK).json({
        message: SUCCESS_MESSAGES.VIEW_CHANGED_SUCCESSFULLY,
        view: updatedUser.view,
        accessToken: accessToken,
      });
    } catch (error) {
      next(Error(error));
    }
  };

  public logout = async (req: Request, res: Response, next: Function) => {
    try {
      const token = req.headers.authorization as string;

      if (!token) {
        return next(new CustomError(HttpStatus.UNAUTHORIZED, ERROR_MESSAGES.NO_TOKEN_PROVIDED));
      }
      await this.revokeUserToken(token);

      res.status(HttpStatus.OK).json({ message: SUCCESS_MESSAGES.LOGOUT_SUCCESSFUL });
    } catch (error) {
      next(Error(error));
    }
  };

  private isValidPictureFormat(picture: string): boolean {
    const allowedFormats = ['jpg', 'jpeg', 'png'];
    const format = picture.split('.').pop()?.toLowerCase();
    return format ? allowedFormats.includes(format) : false;
  }

  private isValidCountry = async (country: string): Promise<boolean> => {
    // Aceita tudo menos vazio
    return country.trim() !== '';
  };

  private isValidCart = async (cart: any): Promise<boolean> => {
    // Aceita tudo menos null
    return cart !== null && typeof cart === 'object';
  };

  private isEmailUnique = async (email: string) => {
    return (await User.find({ email }).exec()).length <= 0;
  };

  private static encryptEmail(email: string) {
    const saltRounds = config.saltRounds;
    const hashedEmail = bcrypt.hashSync(email, saltRounds);

    return hashedEmail;
  }

  private static decryptEmail(userProvidedEmail: string, hashedEmail: string) {
    const isEmailMatch = bcrypt.compareSync(userProvidedEmail, hashedEmail);
    return isEmailMatch;
  }

  private static createToken(user: IUser, expiresIn = config.expiresIn) {
    const hashedEmail = this.encryptEmail(user.email);

    let token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        hashedEmail,
        country: user.country,
        role: user.role,
        view: user.view,
      },
      config.secret,
      { expiresIn },
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
