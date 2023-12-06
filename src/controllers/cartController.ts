import * as _ from "lodash";
import { Request, Response } from "express";
import { User, IUser } from "@src/models/userModel";
import { CustomError } from "@src/utils/customError";
import { HttpStatus, ERROR_MESSAGES, SUCCESS_MESSAGES } from "@src/utils/constant";
import { Product } from "@src/models/productModel";
import { CartItem, ShoppingCart } from "@src/models/cartModel";

interface CustomRequest extends Request {
	user: IUser;
}

export default class CartController {
	public addToCart = async (
		req: CustomRequest,
		res: Response,
		next: Function
	) => {
		try {
			const { quantity } = req.body;
			const parsedQuantity = parseInt(quantity, 10);
			const product = await Product.findById(req.params.id);

			if (quantity <= 0) {
				return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.INVALID_QUANTITY));
			}

			if (!product) {
				return next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.PRODUCT_NOT_FOUND));
			}

			if (product.stockQuantity === 0) {
				return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.OUT_OF_STOCK));
			}

			if (!req.user) {
				// Lógica para usuário não autenticado
			} else {
				const user = await User.findById(req.user.id).populate(
					"cart.items.product"
				);

				if (!user) {
					return next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND));
				}

				const userCart: ShoppingCart | null = user.cart || {
					items: [],
					total: 0,
				};

				const existingCartItemIndex = userCart.items.findIndex((item) =>
					item.product.equals(product.id)
				);

				if (existingCartItemIndex !== -1) {
					userCart.items[existingCartItemIndex].quantity += parsedQuantity || 1;
					userCart.items[existingCartItemIndex].totalPrice = (
						product.price * userCart.items[existingCartItemIndex].quantity
					).toFixed(2);
				} else {
					const newItem: CartItem = {
						product: product.id,
						quantity: parsedQuantity || 1,
						totalPrice: (product.price * parsedQuantity).toFixed(2),
					} as CartItem;

					userCart.items.push(newItem);
				}

				const newCartTotal = userCart.items
					.reduce(
						(total, cartItem) => total + parseFloat(cartItem.totalPrice),
						0
					)
					.toFixed(2);

				userCart.total = parseFloat(newCartTotal);

				await User.findByIdAndUpdate(user.id, {
					$set: { cart: { items: userCart.items, total: userCart.total } },
				});

				const updatedUser = await User.findById(user.id).populate("cart.items");

				if (!updatedUser) {
					return next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND));
				}

				res.status(HttpStatus.OK).json({
					message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
					cart: updatedUser.cart.items,
					cartTotal: updatedUser.cart.total,
				});
			}
		} catch (error) {
			console.error(error);
			return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
		}
	};

	public getCartItems = async (
		req: CustomRequest,
		res: Response,
		next: Function
	) => {
		try {
			const user = await User.findById(req.user.id).populate("cart.items");

			if (!user) {
				return next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND));
			}

			if (!user.cart) {
				res.status(HttpStatus.OK).json({ message: SUCCESS_MESSAGES.EMPTY_CART });
			} else {
				res.status(HttpStatus.OK).json({
					cart: user.cart.items.map((cartItem) => ({
						product: cartItem.product,
						quantity: cartItem.quantity,
						total: cartItem.totalPrice,
					})),
					cartTotal: user.cart.total,
				});
			}
		} catch (error) {
			console.log(error);
			return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
		}
	};

	public updateCart = async (
		req: CustomRequest,
		res: Response,
		next: Function
	) => {
		try {
			const user = await User.findById(req.user.id).populate("cart.items");
			const { id, quantity, action } = req.body;
			const parsedQuantity = parseInt(quantity, 10);

			if (!user) {
				return next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND));
			}

			const userCart: ShoppingCart | null = user.cart || {
				items: [],
				total: 0,
			};

			if (action === "removeAll") {
				if (id) {
					return next(
						new CustomError(
							HttpStatus.BAD_REQUEST,
							ERROR_MESSAGES.REMOVE_PRODUCT_ID
						)
					);
				} else if (quantity) {
					return next(
						new CustomError(
							HttpStatus.BAD_REQUEST,
							ERROR_MESSAGES.REMOVE_PRODUCT_QUANTITY
						)
					);
				}
				userCart.items = [];
			} else {
				if (!quantity) {
					return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.QUANTITY_REQUIRED));
				}

				if (!id) {
					return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.PRODUCT_ID_REQUIRED));
				}

				const product = await Product.findById(id);

				if (!product) {
					return next(
						new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.PRODUCT_NOT_FOUND)
					);
				}

				if (product.stockQuantity === 0) {
					return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.OUT_OF_STOCK));
				}

				const existingCartItem = userCart.items.find((item) =>
					item.product.equals(product.id)
				);

				if (!existingCartItem) {
					return next(
						new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.PRODUCT_NOT_IN_CART)
					);
				}

				if (action === "add") {
					if (existingCartItem) {
						existingCartItem.quantity += parsedQuantity || 1;
						existingCartItem.totalPrice = (
							product.price * existingCartItem.quantity
						).toFixed(2);
					} else {
						const newItem: CartItem = {
							product: product.id,
							quantity: parsedQuantity || 1,
							totalPrice: (product.price * parsedQuantity).toFixed(2),
						} as CartItem;

						userCart.items.push(newItem);
					}
				} else if (action === "remove") {
					if (existingCartItem) {
						if (existingCartItem.quantity >= quantity) {
							existingCartItem.quantity -= quantity;
							existingCartItem.totalPrice = (
								product.price * existingCartItem.quantity
							).toFixed(2);
						} else {
							userCart.items = userCart.items.filter(
								(item) => !item.product.equals(product.id)
							);
						}
					}
				} else if (action === "removeProduct") {
					if (quantity) {
						return next(
							new CustomError(
								HttpStatus.BAD_REQUEST,
								ERROR_MESSAGES.REMOVE_PRODUCT_QUANTITY
							)
						);
					}
					userCart.items = userCart.items.filter(
						(item) => !item.product.equals(product.id)
					);
				}
			}

			const newCartTotal = userCart.items
				.reduce((total, cartItem) => total + parseFloat(cartItem.totalPrice), 0)
				.toFixed(2);

			userCart.total = parseFloat(newCartTotal);

			await User.findByIdAndUpdate(user.id, {
				$set: { cart: { items: userCart.items, total: userCart.total } },
			});

			const updatedUser = await User.findById(user.id).populate("cart.items");

			if (!updatedUser) {
				return res.status(HttpStatus.NOT_FOUND).json({
					message: ERROR_MESSAGES.USER_NOT_FOUND,
				});
			}

			res.status(HttpStatus.OK).json({
				message: SUCCESS_MESSAGES.UPDATED_SUCCESSFULLY,
				cart: updatedUser.cart.items,
				cartTotal: updatedUser.cart.total,
			});
		} catch (error) {
			console.error(error);
			return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
		}
	};
}
