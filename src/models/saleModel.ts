import mongoose, { Document, Schema, model } from "mongoose";

export interface ISaleProduct {
        product: mongoose.Types.ObjectId,
        quantity: number
}

export interface ISale extends Document {
        userId: mongoose.Types.ObjectId;
        products: ISaleProduct[];
        date: Date;
        totalAmount: number;
}

export const saleSchema = new Schema<ISale>({
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        products: [{
                product: { type: Schema.Types.ObjectId, ref: "Product" },
                quantity: { type: Number, required: true}
        }],
        date: {type: Date, default: Date.now},
        totalAmount: {type: Number, required: false, default: 0},
});

export const SaleModel = model<ISale>('Sales', saleSchema)