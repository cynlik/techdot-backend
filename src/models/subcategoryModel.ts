import mongoose, { Document, Schema, model } from "mongoose";
import { IProduct } from "./productModel";

export interface ISubcategory extends Document {
    name: string;
    products: IProduct[];
}

const subcategorySchema = new Schema<ISubcategory>({
    name: { type: String, required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }],
});

export const Subcategory = model<ISubcategory>("Subcategory", subcategorySchema);
