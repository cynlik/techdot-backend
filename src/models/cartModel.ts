import mongoose, { Schema, Document, model, Types } from 'mongoose';

export interface CartItem extends Document {
  product: Types.ObjectId;
  quantity: number;
}

export const cartItemSchema = new Schema({
  product: {
    type: Types.ObjectId,
    ref: 'Product',
  },
  quantity: {
    type: Number,
    default: 0,
  },
});

export const CartItemModel = mongoose.model<CartItem>('CartItem', cartItemSchema);

