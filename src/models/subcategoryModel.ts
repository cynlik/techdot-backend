import mongoose, { Document, Schema, model } from "mongoose";

export interface ISubcategory extends Document {
    name: string;
    category: mongoose.Types.ObjectId;
}

const subcategorySchema = new Schema<ISubcategory>({
    name: { type: String, required: true, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }
});

export const Subcategory = model<ISubcategory>("Subcategory", subcategorySchema);