import mongoose, { Document, Schema, model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  imageUrl: string;
  manufacturer: string;
  stockQuantity: number;
  price: number;
  visible: boolean;
}

export const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  manufacturer: { type: String, required: true },
  stockQuantity: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
  visible: { type: Boolean, required: true, default: false} 
  //  visible vai servir para ao criar o produto ele fique invisivel, depois o administrador vai poder
  //  alterar o estado para visibel e será listado nas rotas busca
});

export const Product = model<IProduct>("Product", productSchema);