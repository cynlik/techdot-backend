import mongoose, { Document, Schema, model } from "mongoose";

export interface ISaleProduct {
        product: mongoose.Types.ObjectId,
        quantity: number
}

export enum SaleStatus {
        Pending = 'pending',
        Registered = 'registered',
        Processing = 'processing',
        InTransit = 'in transit',
        Delay = 'delay',
        Lost = 'lost',
        Canceled = "canceled",
        Refused = "refused",
        Delivered = 'delivered',
        Refund = "refund",
      }

export interface ISale extends Document {
        userName: String;
        userEmail: String;
        userAdress: String;
        userPhone: String;
        paymentMethod: String;
        products: {
                imageProduct: String,
                nameProduct: String;  
                price: Number;
                quantity: Number;
        }[] 
        date: Date;
        totalAmount: number;
}

export const saleSchema = new Schema<ISale>({
        userName: {type: String, required: true},
        userEmail: {type: String, required: true},
        userAdress: {type: String, required: true},
        userPhone: {type: String, required: true},
        paymentMethod: {type: String, required: true},
        products: [{
                imageProduct: { type: String, required: true},
                nameProduct: { type: String, required: true},
                price: { type: Number, required: true},
                quantity: { type: Number, required: true}
        }],
        date: {type: Date, default: Date.now()},
        totalAmount: {type: Number, required: false, default: 0},
});

export const SaleModel = model<ISale>('Sales', saleSchema)