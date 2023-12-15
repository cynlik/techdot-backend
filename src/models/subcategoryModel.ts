import mongoose, { Document, Schema, model } from 'mongoose';

export type ISubcategory = {
  name: string;
  category: mongoose.Types.ObjectId;
  visible: boolean;
} & Document

const subcategorySchema = new Schema<ISubcategory>(
  {
    name: { type: String, required: true, unique: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    visible: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  },
);

export const Subcategory = model<ISubcategory>('Subcategory', subcategorySchema);
