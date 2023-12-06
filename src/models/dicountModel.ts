import mongoose, { Document, Schema, model } from "mongoose";

export interface IDiscount extends Document {
  description: string;
  discountType: number;
  startDate: Date;
  //endDate: Date;
  //isActive: boolean;
  promoCode: string;
  isPromoCode: boolean;
  applicableProducts: mongoose.Types.ObjectId[];
  usageLimit: number;
  minimumPurchaseValue: number;
}

const discountSchema = new Schema({
  description: { type: String, required: true },
  discountType: { type: Number, required: true }, // Ex: 'percentual', 'valor fixo'
  //startDate: { type: Date, required: true },
  //endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: false },
  promoCode: { type: String, unique: true, sparse: true }, // Código promocional
  isPromoCode: { type: Boolean, default: false }, // Indica se é um código promocional
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Produtos aplicáveis
  usageLimit: { type: Number, default: null }, // Limite de uso do código promocional
  minimumPurchaseValue: { type: Number, default: 0 } // Valor mínimo de compra para aplicação do desconto
});


export const Discount = model<IDiscount>("Discount", discountSchema);
