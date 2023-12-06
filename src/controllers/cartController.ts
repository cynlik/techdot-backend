import * as _ from "lodash";
import { Request, Response } from "express";
import { User, IUser } from "@src/models/userModel";
import { CustomError } from "@src/utils/customError";
import { HttpStatus } from "@src/utils/constant";
import { Product } from "@src/models/productModel";
import { CartItem, CartItemModel } from "@src/models/cartModel";

interface CustomRequest extends Request {
	user: IUser;
}

export default class CategoryController {
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
					new CustomError(HttpStatus.BAD_REQUEST, "Invalid quantity")
				);
			}

			if (!product) {
				return next(
					new CustomError(HttpStatus.NOT_FOUND, "Product not found.")
				);
			}

			if (product.stockQuantity === 0) {
				return next(new CustomError(HttpStatus.BAD_REQUEST, "Out of stock."));
			}

			if (!req.user) {
				
			} else {
				const user = await User.findById(req.user.id).populate("cart.product");

				if (!user) {
					return next(new CustomError(HttpStatus.NOT_FOUND, "User not found."));
				}

				const userCart: CartItem[] = user.cart || [];

				const existingCartItemIndex = userCart.findIndex((item) =>
					item.product.equals(product.id)
				);

				if (existingCartItemIndex !== -1) {
					userCart[existingCartItemIndex].quantity += parsedQuantity || 1;
				} else {
					const newItem = new CartItemModel({
						product: product.id,
						quantity: parsedQuantity || 1,
					});

					userCart.push(newItem);
				}

				await User.findByIdAndUpdate(user.id, { $set: { cart: userCart } });

				const updatedUser = await User.findById(user.id).populate(
					"cart.product"
				);

				if (!updatedUser) {
					return res.status(HttpStatus.NOT_FOUND).json({
						message: "User not found",
					});
				}

				res.status(HttpStatus.OK).json({
					message: "Info updated successfully",
					cart: updatedUser.cart,
				});
			}
		} catch (error) {
			console.error(error);
			return next(
				new CustomError(
					HttpStatus.INTERNAL_SERVER_ERROR,
					"Internal Server Error"
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
			const user = await User.findById(req.user.id).populate("cart.product");

			if (!user) {
				return next(new CustomError(HttpStatus.NOT_FOUND, "User not found."));
			}

			if (!user.cart || user.cart.length === 0) {
				res.status(HttpStatus.OK).json({ message: "Your cart is empty" });
			} else {
				res.status(HttpStatus.OK).json({
					cart: user.cart.map((cartItem) => ({
						product: cartItem.product
							? cartItem.product.toObject()
							: "Product Not Found",
						quantity: cartItem.quantity,
					})),
				});
			}
		} catch (error) {
			console.log(error);
			return next(
				new CustomError(
					HttpStatus.INTERNAL_SERVER_ERROR,
					"Internal Server Error"
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
			const user = await User.findById(req.user.id).populate("cart.product");
			const { id, quantity, action } = req.body;

			if (!user) {
				return next(new CustomError(HttpStatus.NOT_FOUND, "User not found."));
			}

			const userCart: CartItem[] = user.cart || [];

			if (action == "removeAll") {
				if (id) {
					return next(
						new CustomError(
							HttpStatus.BAD_REQUEST,
							"Please provide only required fields. Remove id."
						)
					);
				} else if (quantity) {
					return next(
						new CustomError(
							HttpStatus.BAD_REQUEST,
							"Please provide only required fields. Remove quantity."
						)
					);
				}
				userCart.splice(0, userCart.length);
			} else {
				if (!quantity) {
					return next(
						new CustomError(
							HttpStatus.BAD_REQUEST,
							"Quantity is required for this action"
						)
					);
				}

				if (!id) {
					return next(
						new CustomError(HttpStatus.BAD_REQUEST, "Product ID is required")
					);
				}

				const product = await Product.findById(id);

				if (!product) {
					return next(
						new CustomError(HttpStatus.NOT_FOUND, "Product not found.")
					);
				}

				const existingCartItemIndex = userCart.findIndex((item) =>
					item.product.equals(id)
				);

				if (action === "add") {
					if (existingCartItemIndex !== -1) {
						userCart[existingCartItemIndex].quantity += quantity || 1;
					} else {
						const newItem = new CartItemModel({
							product: id,
							quantity: quantity || 1,
						});
						userCart.push(newItem);
					}
				} else if (action === "remove") {
					if (existingCartItemIndex !== -1) {
						if (
							quantity &&
							userCart[existingCartItemIndex].quantity >= quantity
						) {
							userCart[existingCartItemIndex].quantity -= quantity;
						} else {
							userCart.splice(existingCartItemIndex, 1);
						}
					}
				} else if (action === "removeProduct") {
					if (existingCartItemIndex !== -1) {
						userCart.splice(existingCartItemIndex, 1);
					}
				}
			}
			const updatedUser = await User.findByIdAndUpdate(
				user.id,
				{ $set: { cart: userCart } },
				{ new: true }
			).populate("cart.product");

			if (!updatedUser) {
				return res.status(HttpStatus.NOT_FOUND).json({
					message: "User not found",
				});
			}

			res.status(HttpStatus.OK).json({
				message: "Cart updated successfully",
				cart: updatedUser.cart,
			});
		} catch (error) {
			console.error(error);
			return next(
				new CustomError(
					HttpStatus.INTERNAL_SERVER_ERROR,
					"Internal Server Error"
				)
			);
		}
	};
}
