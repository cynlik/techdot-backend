import mongoose, { Document, Schema, model } from "mongoose";
import { ICaseSpecifications, ICpuSpecifications, IGpuSpecifications, IMotherboardSpecifications, IRamSpecifications, cpuSpecificationsSchema, gpuSpecificationSchema, caseSpecificationSchema, motherboardSpecificationSchema, ramSpecificationSchema } from "./productSpecifications"

type ISpecifications = {
  cpu?: ICpuSpecifications;
  gpu?: IGpuSpecifications;
  motherboard?: IMotherboardSpecifications;
  ram?: IRamSpecifications;
  case?: ICaseSpecifications;
}

export enum ProductType {
  CPU = 'CPU',
  RAM = 'RAM',
  MOTHERBOARD = 'Motherboard',
  GPU = 'GPU',
  CASE = 'Case',
}

export type IProduct = {
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
} & Document

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

productSchema.path('specifications').validate(function (specs) {
  if (this.productType === ProductType.GPU && !specs.gpu) {
    return false;
  }
  if (this.productType === ProductType.RAM && !specs.ram) {
    return false;
  }
  if (this.productType === ProductType.CPU && !specs.cpu) {
    return false;
  }
  if (this.productType === ProductType.MOTHERBOARD && !specs.motherboard) {
    return false;
  }
  if (this.productType === ProductType.CASE && !specs.case) {
    return false;
  }
  return true;
}, 'Especificações inadequadas para o tipo de produto');


export const Product = model<IProduct>("Product", productSchema);
