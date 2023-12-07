import * as _ from "lodash";
import { Request, Response } from "express";
import { User, IUser } from "@src/models/userModel";
import { CustomError } from "@src/utils/customError";
import {
	HttpStatus,
	ERROR_MESSAGES,
	SUCCESS_MESSAGES,
} from "@src/utils/constant";
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
				return next(
					new CustomError(
						HttpStatus.BAD_REQUEST,
						ERROR_MESSAGES.INVALID_QUANTITY
					)
				);
			}

			if (!product) {
				return next(
					new CustomError(
						HttpStatus.NOT_FOUND,
						ERROR_MESSAGES.PRODUCT_NOT_FOUND
					)
				);
			}

			if (product.stockQuantity === 0) {
				return next(
					new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.OUT_OF_STOCK)
				);
			}

			if (!req.session) {
				return next(
					new CustomError(
						HttpStatus.BAD_REQUEST,
						ERROR_MESSAGES.UNEXPECTED_ERROR
					)
				);
			}

			if (!req.user) {
				if (!req.session.cart) {
					req.session.cart = { items: [], total: 0 };
				}

				const guest = req.session.cart;

				const existingCartItemIndex = guest.items.findIndex(
					(item: { product: any }) => item.product === product.id
				);

				if (existingCartItemIndex !== -1) {
					guest.items[existingCartItemIndex].quantity += parsedQuantity || 1;
					guest.items[existingCartItemIndex].totalPrice = (
						product.price * guest.items[existingCartItemIndex].quantity
					).toFixed(2);
				} else {
					const newItem: CartItem = {
						product: product.id,
						quantity: parsedQuantity || 1,
						totalPrice: (product.price * parsedQuantity).toFixed(2),
					} as CartItem;

					guest.items.push(newItem);
				}

				const newCartTotal = guest.items
					.reduce(
						(total: number, cartItem: { totalPrice: string }) =>
							total + parseFloat(cartItem.totalPrice),
						0
					)
					.toFixed(2);

				guest.total = parseFloat(newCartTotal);

				res.status(HttpStatus.OK).json({
					message: SUCCESS_MESSAGES.UPDATED_SUCCESSFULLY,
					cart: guest.items || [],
					cartTotal: guest.total || 0,
				});

				req.session.cart = guest;
			} else {
				const user = await User.findById(req.user.id).populate(
					"cart.items.product"
				);

				if (!user) {
					return next(
						new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND)
					);
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
					return next(
						new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND)
					);
				}

				res.status(HttpStatus.OK).json({
					message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
					cart: updatedUser.cart.items,
					cartTotal: updatedUser.cart.total,
				});
			}
		} catch (error) {
			console.error(error);
			return next(
				new CustomError(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ERROR_MESSAGES.INTERNAL_SERVER_ERROR
				)
			);
		}
	};

	public getCartItems = async (
		req: CustomRequest,
		res: Response,
		next: Function
	) => {
		try {
			if (!req.user) {
				const savedCart = req.session;

				if (!savedCart || !savedCart.cart || !savedCart.cart.items) {
					return res
						.status(HttpStatus.OK)
						.json({ message: SUCCESS_MESSAGES.EMPTY_CART });
				}

				return res.status(HttpStatus.OK).json({
					cart: savedCart.cart.items.map(
						(cartItem: { product: any; quantity: any; totalPrice: any }) => ({
							product: cartItem.product,
							quantity: cartItem.quantity,
							total: cartItem.totalPrice,
						})
					),
					cartTotal: savedCart.cart.total,
				});
			}

			const user = await User.findById(req.user.id).populate("cart.items");

			if (!user || !user.cart || !user.cart.items) {
				return res
					.status(HttpStatus.OK)
					.json({ message: SUCCESS_MESSAGES.EMPTY_CART });
			}

			return res.status(HttpStatus.OK).json({
				cart: user.cart.items.map(
					(cartItem: { product: any; quantity: any; totalPrice: any }) => ({
						product: cartItem.product,
						quantity: cartItem.quantity,
						total: cartItem.totalPrice,
					})
				),
				cartTotal: user.cart.total,
			});
		} catch (error) {
			console.log(error);
			return next(
				new CustomError(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ERROR_MESSAGES.INTERNAL_SERVER_ERROR
				)
			);
		}
	};

	public updateCart = async (
		req: CustomRequest,
		res: Response,
		next: Function
	) => {
		try {
			if (!req.session) {
				return next(
					new CustomError(
						HttpStatus.BAD_REQUEST,
						ERROR_MESSAGES.UNEXPECTED_ERROR
					)
				);
			}

			const { id, quantity, action } = req.body;
			const parsedQuantity = parseInt(quantity, 10);

			if (action === "removeAll" && (id || quantity)) {
				return next(
					new CustomError(
						HttpStatus.BAD_REQUEST,
						ERROR_MESSAGES.REMOVE_PRODUCT_ID +
							ERROR_MESSAGES.REMOVE_PRODUCT_QUANTITY
					)
				);
			}

			if (action !== "removeAll" && (!id || !quantity || !action)) {
				return next(
					new CustomError(
						HttpStatus.BAD_REQUEST,
						ERROR_MESSAGES.REMOVE_PRODUCT_ID + ERROR_MESSAGES.REMOVE_PRODUCT_ID
					)
				);
			}

			if (!req.user) {
				const guestCart = req.session.cart || { items: [], total: 0 };

				if (action === "removeAll") {
					guestCart.items = [];
				} else {
					const existingCartItemIndex = guestCart.items.findIndex(
						(item: { product: any }) => item.product === id
					);

					const product = await Product.findById(id);

					if (!product) {
						return next(
							new CustomError(
								HttpStatus.NOT_FOUND,
								ERROR_MESSAGES.PRODUCT_NOT_FOUND
							)
						);
					}

					if (existingCartItemIndex !== -1) {
						const existingCartItem = guestCart.items[existingCartItemIndex];

						if (action === "add") {
							existingCartItem.quantity += parsedQuantity || 1;
							existingCartItem.totalPrice = (
								product.price * existingCartItem.quantity
							).toFixed(2);
						} else if (action === "remove") {
							if (existingCartItem.quantity >= quantity) {
								existingCartItem.quantity -= quantity;
								existingCartItem.totalPrice = (
									product.price * existingCartItem.quantity
								).toFixed(2);
							} else {
								guestCart.items.splice(existingCartItemIndex, 1);
							}
						} else if (action === "removeProduct") {
							guestCart.items.splice(existingCartItemIndex, 1);
						}
					} else {
						if (action === "add") {
							const newItem: CartItem = {
								product: id,
								quantity: parsedQuantity || 1,
								totalPrice: (product.price * parsedQuantity).toFixed(2),
							} as CartItem;

							guestCart.items.push(newItem);
						} else {
							return next(
								new CustomError(
									HttpStatus.NOT_FOUND,
									ERROR_MESSAGES.PRODUCT_NOT_IN_CART
								)
							);
						}
					}
				}

				const newCartTotal = guestCart.items
					.reduce(
						(total: number, cartItem: { totalPrice: string }) =>
							total + parseFloat(cartItem.totalPrice),
						0
					)
					.toFixed(2);

				guestCart.total = parseFloat(newCartTotal);

				req.session.cart = guestCart;

				return res.status(HttpStatus.OK).json({
					message: SUCCESS_MESSAGES.UPDATED_SUCCESSFULLY,
					cart: guestCart.items,
					cartTotal: guestCart.total,
				});
			} else {
				const user = await User.findById(req.user.id).populate("cart.items");

				if (!user) {
					return next(
						new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND)
					);
				}

				const userCart: ShoppingCart | null = user.cart || {
					items: [],
					total: 0,
				};

				if (action === "removeAll") {
					userCart.items = [];
				} else {
					const existingCartItemIndex = userCart.items.findIndex((item) =>
						item.product.equals(id)
					);

					const product = await Product.findById(id);

					if (!product) {
						return next(
							new CustomError(
								HttpStatus.NOT_FOUND,
								ERROR_MESSAGES.PRODUCT_NOT_FOUND
							)
						);
					}

					if (existingCartItemIndex !== -1) {
						const existingCartItem = userCart.items[existingCartItemIndex];

						if (action === "add") {
							existingCartItem.quantity += parsedQuantity || 1;
							existingCartItem.totalPrice = (
								product.price * existingCartItem.quantity
							).toFixed(2);
						} else if (action === "remove") {
							if (existingCartItem.quantity >= quantity) {
								existingCartItem.quantity -= quantity;
								existingCartItem.totalPrice = (
									product.price * existingCartItem.quantity
								).toFixed(2);
							} else {
								userCart.items.splice(existingCartItemIndex, 1);
							}
						} else if (action === "removeProduct") {
							userCart.items.splice(existingCartItemIndex, 1);
						}
					} else {
						if (action === "add") {
							const newItem: CartItem = {
								product: id,
								quantity: parsedQuantity || 1,
								totalPrice: (product.price * parsedQuantity).toFixed(2),
							} as CartItem;

							userCart.items.push(newItem);
						} else {
							return next(
								new CustomError(
									HttpStatus.NOT_FOUND,
									ERROR_MESSAGES.PRODUCT_NOT_IN_CART
								)
							);
						}
					}
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
					return res.status(HttpStatus.NOT_FOUND).json({
						message: ERROR_MESSAGES.USER_NOT_FOUND,
					});
				}

				return res.status(HttpStatus.OK).json({
					message: SUCCESS_MESSAGES.UPDATED_SUCCESSFULLY,
					cart: updatedUser.cart.items,
					cartTotal: updatedUser.cart.total,
				});
			}
		} catch (error) {
			console.error(error);
			return next(
				new CustomError(
					HttpStatus.INTERNAL_SERVER_ERROR,
					ERROR_MESSAGES.INTERNAL_SERVER_ERROR
				)
			);
		}
	};
}
