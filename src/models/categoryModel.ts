import mongoose, { Document, Schema, model } from 'mongoose' ;

export interface ICategory extends Document {
    name: string; //adicionar array enum
    subcategory: mongoose.Types.ObjectId[];
}

const categorySchema = new Schema<ICategory>({
    name: { type: String, required: true },
    subcategory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' , required: true }],
});

export const Category = model<ICategory>('Category', categorySchema);