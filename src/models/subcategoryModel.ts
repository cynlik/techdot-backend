import mongoose, { Document, Schema, model } from 'mongoose'

export interface ISubcategory extends Document {
  name: string
  category: mongoose.Types.ObjectId
  visible: boolean
}

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
)

export const Subcategory = model<ISubcategory>('Subcategory', subcategorySchema)
