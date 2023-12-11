import mongoose, { Schema, Document } from 'mongoose';
import { IProduct, Product } from './productModel';

export interface CartItem extends Document {
  productId: IProduct;
  quantity: number;
  totalPrice: number;
}

const cartItemSchema = new Schema<CartItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    default: 0,
    validate: {
      validator: Number.isInteger,
      message: 'A quantidade deve ser um número inteiro.',
    },
  },
  totalPrice: {
    type: Number,
    default: 0,
    validate: {
      validator: function (v: number) {
        return v >= 0;
      },
      message: 'O preço total deve ser um número não negativo.',
    },
  },
});

export interface ShoppingCart extends Document {
  items: CartItem[];
  total: number;
}

export const shoppingCartSchema = new Schema<ShoppingCart>({
  items: [cartItemSchema],
  total: {
    type: Number,
    default: 0,
  },
});

export const ShoppingCartModel = mongoose.model<ShoppingCart>('ShoppingCart', shoppingCartSchema, 'users');
