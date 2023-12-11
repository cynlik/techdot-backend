import mongoose, { Document, Schema, model } from 'mongoose'
import { ShoppingCart, shoppingCartSchema } from './cartModel'

export enum SaleStatus {
  Pending = 'pending',
  Registered = 'registered',
  Processing = 'processing',
  InTransit = 'in transit',
  Delay = 'delay',
  Lost = 'lost',
  Canceled = 'canceled',
  Refused = 'refused',
  Delivered = 'delivered',
  Refund = 'refund',
}

export interface ISale extends Document {
  userName: String
  userEmail: String
  userAdress: String
  userPhone: String
  paymentMethod: String
  shoppingCart: ShoppingCart
  date: Date
  // status: SaleStatus;
}

export const saleSchema = new Schema<ISale>({
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  userAdress: { type: String, required: true },
  userPhone: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  shoppingCart: {
    type: Schema.Types.ObjectId,
    ref: 'ShoppingCart',
    required: true,
  },
  date: { type: Date, default: Date.now() },
  // status: { type: String, enum: Object.values(SaleStatus), default: SaleStatus.Pending },
})

export const SaleModel = model<ISale>('Sales', saleSchema)
