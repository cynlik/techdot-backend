import mongoose, { Document, Schema, model } from "mongoose";

export interface ISale extends Document {
        userId: mongoose.Types.ObjectId;
        productsId: mongoose.Types.ObjectId[];
        // totalAmount: number;
}

export const saleSchema = new Schema<ISale>({
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        productsId: [{ type: Schema.Types.ObjectId, ref: "Product" }],
        // totalAmount: Number,
});

export const SaleModel = model<ISale>('Sales', saleSchema)