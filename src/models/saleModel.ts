import { Document, Schema, model } from 'mongoose';
import { shoppingCartSchema } from './cartModel';

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

export enum PaymentMethods {
  Paypal = 'paypal',
  CreditCard = 'creditCard',
  MBway = 'mbway',
  Klarna = 'klarna',
  Skrill = 'skrill',
}

export type ISale = {
  userName: string;
  userEmail: string;
  userAdress: string;
  userPhone: string;
  paymentMethod: PaymentMethods;
  shoppingCart: typeof shoppingCartSchema;
  date: Date;
  status: SaleStatus;
} & Document;

export const saleSchema = new Schema<ISale>({
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  userAdress: { type: String, required: true },
  userPhone: { type: String, required: true },
  paymentMethod: { type: String, enum: Object.values(PaymentMethods), required: true },
  shoppingCart: { type: shoppingCartSchema, required: true },
  date: { type: Date, default: Date.now(), required: true },
  status: { type: String, enum: Object.values(SaleStatus), default: SaleStatus.Pending, required: true },
});

export const SaleModel = model<ISale>('Sales', saleSchema);
