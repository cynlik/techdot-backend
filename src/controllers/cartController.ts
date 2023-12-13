import { Request, Response } from 'express';
import { CustomError } from '@src/utils/customError';
import { HttpStatus, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@src/utils/constant';
import { IProduct, Product } from '@src/models/productModel';
import { User, IUser } from '@src/models/userModel';
import { CartItem, ShoppingCart } from '@src/models/cartModel';
import { Error } from '@src/utils/errorCatch';

interface CustomRequest extends Request {
  user: IUser;
}

export default class CartController {
  private async transformCartItemForResponse(cartItem: CartItem, includeAdditionalFields: boolean = false): Promise<any> {
    const productDetails = await Product.findById(cartItem.product);

    if (!productDetails) {
      return null;
    }

    const transformedItem: any = {
      product: {
        id: productDetails._id,
        name: productDetails.name,
        price: productDetails.price,
      },
      quantity: cartItem.quantity,
      totalPrice: cartItem.totalPrice,
    };

    if (includeAdditionalFields) {
      transformedItem.promoCodeActive = cartItem.promoCodeActive || false;
      if (cartItem.promoCodeActive) {
        transformedItem.promoCodeType = cartItem.promoCodeType || 0;
        transformedItem.originalTotalPrice = cartItem.originalTotalPrice || 0;
      }
    }

    return transformedItem;
  }

  private calculateCartTotal(items: CartItem[]): number {
    return items.reduce((total: number, cartItem: CartItem) => total + cartItem.totalPrice, 0);
  }

  private addOrUpdateCartItem(items: CartItem[], productId: string | IProduct, parsedQuantity: number, productPrice: number): void {
    const existingCartItemIndex = items.findIndex((item: { product: any }) => {
      if (typeof item.product === 'object') {
        return item.product.equals(productId);
      } else {
        return item.product === productId;
      }
    });

    if (existingCartItemIndex !== -1) {
      items[existingCartItemIndex].quantity += parsedQuantity || 1;
      items[existingCartItemIndex].totalPrice = productPrice * items[existingCartItemIndex].quantity;
    } else {
      const newItem: CartItem = {
        product: productId,
        quantity: parsedQuantity || 1,
        totalPrice: productPrice * (parsedQuantity || 1),
      } as unknown as CartItem;

      items.push(newItem);
    }
  }

  private async updateCartInDatabase(userId: string, cartItems: CartItem[], cartTotal: number): Promise<IUser | null> {
    return User.findByIdAndUpdate(userId, {
      $set: { 'cart.items': cartItems, 'cart.total': cartTotal },
    });
  }

  private async handleGuestCart(req: CustomRequest, res: Response, next: Function, product: IProduct, parsedQuantity: number): Promise<void> {
    if (!req.session) {
      return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.UNEXPECTED_ERROR));
    }

    const cookieCart: ShoppingCart | null = req.session.cart || {
      items: [],
      total: 0,
    };

    if (!cookieCart) {
      return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.UNEXPECTED_ERROR));
    }

    const updatedCartItems = await Promise.all(
      cookieCart.items.map(async (cartItem: CartItem) => {
        const updatedProduct = await Product.findById(cartItem.product);

        if (updatedProduct) {
          const newProductDetails = await Product.findById(cartItem.product);

          if (newProductDetails) {
            const newTotalPrice = newProductDetails.price * cartItem.quantity;
            cartItem.totalPrice = newTotalPrice;
          }

          const newCartTotal = this.calculateCartTotal(cookieCart.items);
          cookieCart.total = newCartTotal;

          const transformedCartItem = this.transformCartItemForResponse(cartItem, true);

          return transformedCartItem;
        }
        return null;
      }),
    );

    const filteredCartItems = updatedCartItems.filter((item) => item !== null) as CartItem[];

    this.addOrUpdateCartItem(cookieCart.items, product.id, parsedQuantity, product.price);

    res.status(HttpStatus.OK).json({
      message: SUCCESS_MESSAGES.UPDATED_SUCCESSFULLY,
      cart: filteredCartItems,
      total: cookieCart.total,
    });

    req.session.cart = cookieCart;
  }

  private async handleUserCart(req: CustomRequest, res: Response, next: Function, product: IProduct, parsedQuantity: number): Promise<void> {
    const user = await User.findById(req.user.id).populate('cart.items');

    if (!user) {
      return next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND));
    }

    const userCart: ShoppingCart | null = user.cart || {
      items: [],
      total: 0,
    };

    const updatedCartItems = await Promise.all(
      userCart.items.map(async (cartItem: CartItem) => {
        const updatedProduct = await Product.findById(cartItem.product);

        if (updatedProduct) {
          const newProductDetails = await Product.findById(cartItem.product);

          if (newProductDetails) {
            const newTotalPrice = newProductDetails.price * cartItem.quantity;
            cartItem.totalPrice = newTotalPrice;
          }

          const newCartTotal = this.calculateCartTotal(userCart.items);
          userCart.total = newCartTotal;

          const transformedCartItem = this.transformCartItemForResponse(cartItem, true);

          return transformedCartItem;
        }
        return null;
      }),
    );

    const filteredCartItems = updatedCartItems.filter((item) => item !== null) as CartItem[];

    this.addOrUpdateCartItem(userCart.items, product.id, parsedQuantity, product.price);

    await this.updateCartInDatabase(req.user.id, userCart.items, userCart.total);

    res.cookie('cart', JSON.stringify(userCart), {
      maxAge: 3600000, // 1 hora
      httpOnly: true,
      secure: true,
    });

    res.status(HttpStatus.OK).json({
      message: SUCCESS_MESSAGES.UPDATED_SUCCESSFULLY,
      cart: userCart.items,
      total: userCart.total,
    });
  }

  public addToCart = async (req: CustomRequest, res: Response, next: Function) => {
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

      if (!req.session) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.UNEXPECTED_ERROR));
      }

      if (!req.user) {
        await this.handleGuestCart(req, res, next, product, parsedQuantity);
      } else {
        await this.handleUserCart(req, res, next, product, parsedQuantity);
      }
    } catch (error) {
      console.error(error);
      next(Error(error));
    }
  };

  public getCartItems = async (req: CustomRequest, res: Response, next: Function) => {
    try {
      if (!req.user) {
        const savedCart = req.session;

        if (!savedCart || !savedCart.cart || savedCart.cart.items.length === 0) {
          return res.status(HttpStatus.OK).json({ message: SUCCESS_MESSAGES.EMPTY_CART });
        }

        const updatedCartItems = await Promise.all(
          savedCart.cart.items.map(async (cartItem: CartItem) => {
            const updatedProduct = await Product.findById(cartItem.product);

            if (updatedProduct) {
              const newProductDetails = await Product.findById(cartItem.product);

              if (newProductDetails) {
                const newTotalPrice = newProductDetails.price * cartItem.quantity;
                cartItem.totalPrice = newTotalPrice;
              }

              const newCartTotal = this.calculateCartTotal(savedCart.cart.items);
              savedCart.cart.total = newCartTotal;

              const transformedCartItem = this.transformCartItemForResponse(cartItem, true);

              return transformedCartItem;
            }
            return null;
          }),
        );

        const filteredCartItems = updatedCartItems.filter((item) => item !== null) as CartItem[];

        return res.status(HttpStatus.OK).json({
          cart: filteredCartItems,
          total: savedCart.cart.total,
        });
      }

      const user = await User.findById(req.user.id);

      if (!user || !user.cart || user.cart.items.length === 0) {
        return res.status(HttpStatus.OK).json({ message: SUCCESS_MESSAGES.EMPTY_CART });
      }

      const updatedCartItems = await Promise.all(
        user.cart.items.map(async (cartItem: CartItem) => {
          const updatedProduct = await Product.findById(cartItem.product);
          if (updatedProduct) {
            const newProductDetails = await Product.findById(cartItem.product);

            if (newProductDetails) {
              const newTotalPrice = newProductDetails.price * cartItem.quantity;
              cartItem.totalPrice = newTotalPrice;
            }

            const newCartTotal = this.calculateCartTotal(user.cart.items);
            user.cart.total = newCartTotal;

            const transformedCartItem = this.transformCartItemForResponse(cartItem, req.user !== undefined);

            return transformedCartItem;
          }
          return null;
        }),
      );

      const filteredCartItems = updatedCartItems.filter((item) => item !== null) as CartItem[];

      return res.status(HttpStatus.OK).json({
        cart: filteredCartItems,
        cartTotal: user.cart.total,
      });
    } catch (error) {
      next(Error(error));
    }
  };

  public updateCart = async (req: CustomRequest, res: Response, next: Function) => {
    try {
      if (!req.session) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.UNEXPECTED_ERROR));
      }

      const { id, quantity, action } = req.body;
      const parsedQuantity = parseInt(quantity, 10);

      if (action === 'removeAll' && (id || quantity)) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.REMOVE_PRODUCT_ID + ERROR_MESSAGES.REMOVE_PRODUCT_QUANTITY));
      }

      if (action !== 'removeAll' && (!id || !quantity || !action)) {
        return next(new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.REMOVE_PRODUCT_ID + ERROR_MESSAGES.REMOVE_PRODUCT_ID));
      }

      if (!req.user) {
        const guestCart = req.session.cart || { items: [], total: 0 };

        if (action === 'removeAll') {
          guestCart.items = [];
        } else {
          const existingCartItemIndex = guestCart.items.findIndex((item: { product: any }) => item.product === id);

          const product = await Product.findById(id);

          if (!product) {
            return next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.PRODUCT_NOT_FOUND));
          }

          if (existingCartItemIndex !== -1) {
            const existingCartItem = guestCart.items[existingCartItemIndex];

            if (action === 'add') {
              existingCartItem.quantity += parsedQuantity || 1;
              existingCartItem.totalPrice = (product.price * existingCartItem.quantity).toFixed(2);
            } else if (action === 'remove') {
              if (existingCartItem.quantity >= quantity) {
                existingCartItem.quantity -= quantity;
                existingCartItem.totalPrice = (product.price * existingCartItem.quantity).toFixed(2);
              } else {
                guestCart.items.splice(existingCartItemIndex, 1);
              }
            } else if (action === 'removeProduct') {
              guestCart.items.splice(existingCartItemIndex, 1);
            }
          } else {
            if (action === 'add') {
              this.addOrUpdateCartItem(guestCart.items, id, parsedQuantity, product.price);
            } else {
              return next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.PRODUCT_NOT_IN_CART));
            }
          }
        }

        const newCartTotal = this.calculateCartTotal(guestCart.items);

        guestCart.total = newCartTotal;

        req.session.cart = guestCart;

        return res.status(HttpStatus.OK).json({
          message: SUCCESS_MESSAGES.UPDATED_SUCCESSFULLY,
          cart: guestCart.items,
          cartTotal: guestCart.total,
        });
      } else {
        const user = await User.findById(req.user.id).populate('cart.items');

        if (!user) {
          return next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND));
        }

        const userCart: ShoppingCart | null = user.cart || {
          items: [],
          total: 0,
        };

        if (action === 'removeAll') {
          userCart.items = [];
        } else {
          const existingCartItemIndex = userCart.items.findIndex((item) => item.product.equals(id));

          const product = await Product.findById(id);

          if (!product) {
            return next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.PRODUCT_NOT_FOUND));
          }

          if (existingCartItemIndex !== -1) {
            const existingCartItem = userCart.items[existingCartItemIndex];

            if (action === 'add') {
              existingCartItem.quantity += parsedQuantity || 1;
              existingCartItem.totalPrice = parseFloat((product.price * existingCartItem.quantity).toFixed(2));
            } else if (action === 'remove') {
              if (existingCartItem.quantity >= quantity) {
                existingCartItem.quantity -= quantity;
                existingCartItem.totalPrice = parseFloat((product.price * existingCartItem.quantity).toFixed(2));
              } else {
                userCart.items.splice(existingCartItemIndex, 1);
              }
            } else if (action === 'removeProduct') {
              userCart.items.splice(existingCartItemIndex, 1);
            }
          } else {
            if (action === 'add') {
              this.addOrUpdateCartItem(userCart.items, id, parsedQuantity, product.price);
            } else {
              return next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.PRODUCT_NOT_IN_CART));
            }
          }
        }

        const newCartTotal = this.calculateCartTotal(userCart.items);

        userCart.total = newCartTotal;

        await this.updateCartInDatabase(req.user.id, userCart.items, userCart.total);

        const updatedUser = await User.findById(req.user.id).populate('cart.items');

        if (!updatedUser) {
          return res.status(HttpStatus.NOT_FOUND).json({
            message: ERROR_MESSAGES.USER_NOT_FOUND,
          });
        }

        return res.status(HttpStatus.OK).json({
          message: SUCCESS_MESSAGES.UPDATED_SUCCESSFULLY,
          cart: updatedUser.cart.items,
          total: updatedUser.cart.total,
        });
      }
    } catch (error) {
      console.error(error);
      next(Error(error));
    }
  };
}
