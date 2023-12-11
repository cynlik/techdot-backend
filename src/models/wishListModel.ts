import mongoose, { Schema, Document, model, Types } from 'mongoose';
import { IProduct } from './productModel';

export interface WishListItem extends Document {
  product: IProduct;
}

export const wishListItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
  },
});

export const WishListItemModel = mongoose.model<WishListItem>('WishListItem', wishListItemSchema, 'users');
