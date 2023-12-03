import mongoose, { Schema, Document, model, Types } from 'mongoose';
import { IProduct } from './productModel';

export interface CartItem extends Document {
  product: IProduct;
  quantity: number;
}

export const cartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
  },
  quantity: {
    type: Number,
    default: 0,
  },
});

export const CartItemModel = mongoose.model<CartItem>('CartItem', cartItemSchema, 'users');


