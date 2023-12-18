import mongoose, { Schema, Document } from 'mongoose';
import { IProduct, Product } from './productModel';

export interface CartItem extends Document {
  product: IProduct;
  quantity: number;
  totalPrice: number;
  originalTotalPrice: number;
  promoCodeActive: boolean;
  promoCodeType: number;
}

export const cartItemSchema = new Schema<CartItem>({
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
    type: Number,
    default: 0,
    min: [0, 'Preço deve ser positivo!'],
  },

  originalTotalPrice: {
    type: Number,
    required: true,
    default: 0,
  },

  promoCodeActive: {
    type: Boolean,
    required: true,
    default: false,
  },

  promoCodeType: {
    type: Number,
    required: true,
    default: 0,
  },
});

export interface ShoppingCart extends Document {
  items: CartItem[];
  total: number;
  promoCode: string | null;
  promoCodeActive: boolean;
}

export const shoppingCartSchema = new Schema<ShoppingCart>({
  items: [cartItemSchema],
  total: {
    type: Number,
    default: 0,
  },
  promoCode: {
    type: String,
    default: null as string | null,
  },
  promoCodeActive: {
    type: Boolean,
    default: false,
  },
});

export const ShoppingCartModel = mongoose.model<ShoppingCart>('ShoppingCart', shoppingCartSchema, 'users');
