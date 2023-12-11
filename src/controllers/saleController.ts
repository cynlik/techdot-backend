import { Request, Response } from "express";
import { SaleModel, ISale } from "@src/models/saleModel";
import { IUser, User, UserStatus } from "@src/models/userModel";
import { ERROR_MESSAGES, HttpStatus } from "@src/utils/constant";
import { CustomError } from "@src/utils/customError";
import { Product } from "@src/models/productModel";
import { ShoppingCart } from "@src/models/cartModel";

interface CustomRequest extends Request {
	user: IUser;
}

export class SaleController {
	public create = async (req: CustomRequest, res: Response, next: Function) => {
		try {
			const { userName, userEmail, userAdress, userPhone, paymentMethod } =
				req.body;
			const user = req.user;
			const guest = req.session;

			let shoppingCart: ShoppingCart;

			console.log("User:", user);
			console.log("Guest:", guest);

			if (user && user.cart && user.cart.items.length > 0) {
				console.log("User Cart Found");
				shoppingCart = user.cart;
			} else if (guest && guest.cart && guest.cart.items.length > 0) {
				console.log("Guest Cart Found");
				shoppingCart = guest.cart;
			} else {
				console.log("Cart Not Found");
				return next(new CustomError(HttpStatus.BAD_REQUEST, "Cart Not Found"));
			}

			const newSale = new SaleModel({
				userName,
				userEmail,
				userAdress,
				userPhone,
				paymentMethod,
				shoppingCart,
			} as ISale);

			// Subtrair a quantidade vendida do stock de cada produto
			for (const productItem of shoppingCart.items) {
				const product = await Product.findOne({
					name: productItem.product.name,
				});
				if (product) {
					product.stockQuantity -= productItem.quantity;
					await product.save();
				}
			}

			// // Limpar o carrinho, dependendo se o user está autenticado ou não
			// if (!user) {
			//   req.session.cart = null;
			// } else {
			//   req.user.cart = { items: [], total: 0 };
			//   await req.user.save();
			// }

			await newSale.save();

			const saleCart = await SaleModel.findById(newSale.id).populate(
				"shoppingCart"
			);

			if (!saleCart) {
				return next(
					new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND)
				);
			}

			res.status(HttpStatus.CREATED).json(newSale);
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

	public getSalesByName = async (
		req: Request,
		res: Response,
		next: Function
	) => {
		const userEmail = req.user.email;
		try {
			const {
				sort,
				page = "1",
				limit = "6",
			} = req.query as {
				sort?: string;
				page?: string;
				limit?: string;
			};

			const pageNumber = parseInt(page, 10);
			const limitNumber = parseInt(limit, 10);

			if (
				isNaN(pageNumber) ||
				pageNumber <= 0 ||
				isNaN(limitNumber) ||
				limitNumber <= 0
			) {
				return next(
					new CustomError(
						HttpStatus.BAD_REQUEST,
						"Parâmetros de paginação inválidos."
					)
				);
			}

			const viewUser = req.user.view;
			const userEmail = req.user.email;
			const conditions: any = {};

			if (viewUser === UserStatus.Admin) {
				// Se for um admin, não há restrições de acesso
			} else if (viewUser === UserStatus.Member) {
				// Se for um member, só terá acesso às vendas associadas ao seu email
				conditions.userEmail = userEmail;
			} else {
				// Caso o tipo de user não seja reconhecido
				return next(
					new CustomError(
						HttpStatus.UNAUTHORIZED,
						"Tipo de user não reconhecido."
					)
				);
			}

			if (viewUser !== UserStatus.Admin) {
				if (userEmail) {
					const regex = new RegExp(userEmail, "i");
					conditions.userEmail = regex;
				} else {
					console.error("userEmail is undefined");
				}
			}

			const count = await SaleModel.countDocuments(conditions);
			const totalPages = Math.ceil(count / limitNumber);

			let query = SaleModel.find(conditions);

			switch (sort) {
				case "preco_maior":
					query = query.sort({ price: -1 });
					break;
				case "preco_menor":
					query = query.sort({ price: 1 });
					break;
			}

			const sales = await query
				.limit(limitNumber)
				.skip((pageNumber - 1) * limitNumber);

			if (sales.length === 0) {
				next(new CustomError(HttpStatus.NOT_FOUND, "Nenhuma sale encontrada."));
			} else {
				res.status(200).send({ sales, totalPages });
			}
		} catch (error) {
			console.error(error);
			next(
				new CustomError(
					HttpStatus.INTERNAL_SERVER_ERROR,
					"Erro ao procurar produtos."
				)
			);
		}
	};

	public deleteById = async (req: Request, res: Response, next: Function) => {
		try {
			const saleId = req.params.id;
			const deletedSale = await SaleModel.findByIdAndDelete(saleId);
			if (!deletedSale) {
				return next(new CustomError(HttpStatus.NOT_FOUND, "Not Found"));
			}
			res.status(HttpStatus.NO_CONTENT).send();
		} catch (error) {
			return next(
				new CustomError(
					HttpStatus.INTERNAL_SERVER_ERROR,
					"Internal Server Error"
				)
			);
		}
	};

	//   public cancel = async (req: Request,  res: Response, next: Function) => {
	//   try{

	//   }catch(error){
	//     return next(new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'))
	//   }
	// }
}
