import mongoose, { Document, Schema, model } from 'mongoose';

export interface IPromoCode extends Document {
  description: string;
  discountType: number;
  //startDate: Date;
  //endDate: Date;
  isActive: boolean;
  promoCode: string;
  applicableProducts: mongoose.Types.ObjectId[];
  usageLimit: number;
  minimumPurchaseValue: number;
}

const promoCodeSchema = new Schema({
  description: { type: String, required: true },
  discountType: {
    type: Number,
    required: true,
    min: [0, 'Minimo ultrapassado'],
    max: [100, 'Maximo ultrapassado'],
  }, // Ex: 'percentual', 'valor fixo'
  //startDate: { type: Date, required: true },
  //endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: false },
  promoCode: { type: String, unique: true, sparse: true }, // Código promocional
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Produtos aplicáveis
  usageLimit: { type: Number, default: null }, // Limite de uso do código promocional
  minimumPurchaseValue: { type: Number, default: 0 }, // Valor mínimo de compra para aplicação do desconto
});

export const PromoCode = model<IPromoCode>('PromoCode', promoCodeSchema);
