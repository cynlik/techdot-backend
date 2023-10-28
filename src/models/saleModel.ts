import mongoose, { Document, Schema, model } from "mongoose";
import { IProduct } from "./productModel";

export interface ISale extends Document {
        usaer: string;
        products: Array<IProduct | string>;
        purchaseDate: Date;
        totalAmount: number;
}

export const saleSchema = new Schema({
        user: { type: Schema.Types.ObjectId, ref: "User" },
        products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
        purchaseDate: Date,
        totalAmount: Number,
});

export const SaleModel = mongoose.model<ISale>('Sale', saleSchema)
