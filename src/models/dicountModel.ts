import mongoose, { Document, Schema, model } from 'mongoose';

export interface IDiscount extends Document {
  description: string;
  discountType: number;
  //startDate: Date;
  //endDate: Date;
  isActive: boolean;
  applicableProducts: mongoose.Types.ObjectId[];
}

const discountSchema = new Schema({
  description: { type: String, required: true },
  discountType: {
    type: Number,
    required: true,
    min: [0, 'Minimo ultrapassado'],
    max: [100, 'Maximo ultrapassado'],
  }, // Ex: 'valor fixo'
  //startDate: { type: Date, required: true },
  //endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: false },
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Produtos aplicáveis
});

export const Discount = model<IDiscount>('Discount', discountSchema);
