import mongoose, { Schema, Document } from 'mongoose';
import { IProduct, Product } from './productModel';

export interface CartItem extends Document {
  product: IProduct;
  quantity: number;
  totalPrice: string;
}

const cartItemSchema = new Schema<CartItem>({
  product: {
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
    type: String,
    default: null,
    validate: {
      validator: function (v: string) {
        return /^(\d+|\d+\.\d+)$/.test(v);
      },
      message: 'O preço total deve ser uma string numérica válida.',
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
