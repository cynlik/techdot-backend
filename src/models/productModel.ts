import mongoose, { Document, Schema, model } from "mongoose";
import { ICaseSpecifications, ICpuSpecifications, IGpuSpecifications, IMotherboardSpecifications, IRamSpecifications, cpuSpecificationsSchema, gpuSpecificationSchema, caseSpecificationSchema, motherboardSpecificationSchema, ramSpecificationSchema } from "./productSpecifications"

interface ISpecifications {
  cpu?: ICpuSpecifications;
  gpu?: IGpuSpecifications;
  motherboard?: IMotherboardSpecifications;
  ram?: IRamSpecifications;
  case?: ICaseSpecifications;
}

export enum ProductType {
  CPU = 'CPU',
  RAM = 'RAM',
  Motherboard = 'Motherboard',
  GPU = 'GPU',
  Case = 'Case',
}

export interface IProduct extends Document {
  name: string;
  description: string;
  imageUrl: string;
  manufacturer: string;
  stockQuantity: number;
  price: number;
  originalPrice: number;
  visible: boolean;
  subcategoryId: mongoose.Types.ObjectId;
  productType: ProductType;
  discountType: number;
  onDiscount: boolean;
  specifications: ISpecifications;
  warranty: Date;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  manufacturer: { type: String, required: true },
  stockQuantity: { type: Number, required: true, min: [0, 'Invalid operation'] },
  price: { type: Number, required: true, min: [0, 'Invalid operation'] },
  originalPrice: { type: Number, required: true, default: 0 },
  visible: { type: Boolean, required: true, default: false },
  subcategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', required: true },
  productType: { type: String, enum: Object.values(ProductType), required: true },
  discountType: { type: Number, required: true, default: 0, min: 0, max: 100 },
  onDiscount: { type: Boolean, required: true, default: false },
  specifications: {
    type: {
      cpu: cpuSpecificationsSchema,
      gpu: gpuSpecificationSchema,
      motherboard: motherboardSpecificationSchema,
      ram: ramSpecificationSchema,
      case: caseSpecificationSchema,
    },
    required: true,
  },
  warranty: { type: Date, default: null },
});



export const Product = model<IProduct>("Product", productSchema);
