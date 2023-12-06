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
  },
  totalPrice: { type: String, default: null },
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
