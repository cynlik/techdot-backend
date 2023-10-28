import mongoose, { Document, Schema, model } from "mongoose";

export interface ISubcategory extends Document {
    name: string;
    products: mongoose.Types.ObjectId[];
}

const subcategorySchema = new Schema<ISubcategory>({
    name: { type: String, required: true, unique: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }],
});

export const Subcategory = model<ISubcategory>("Subcategory", subcategorySchema);