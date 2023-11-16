import mongoose, { Document, Schema, model } from "mongoose";

const cpuSpecificationsSchema = new Schema({
  brand: String,
  speed: Number,
  cores: Number,
});

const gpuSpecificationSchema = new Schema({
  name: String,
  memory: Number,
  type: String,
});

const motherboardSpecificationSchema = new Schema({
  manufacturer: String,
  chipset: String,
  formFactor: String,
});

const ramSpecificationSchema = new Schema({
  size: Number,
  frequency: Number,
  type: String,
});

const caseSpecificationSchema = new Schema({
  length: Number,
  width: Number,
  height: Number,
  material: String,
});

export interface IProduct extends Document {
  name: string;
  description: string;
  imageUrl: string;
  manufacturer: string;
  stockQuantity: number;
  price: number;
  visible: boolean;
  subcategoryId: mongoose.Types.ObjectId;
  productType: string;
  specifications: {
    cpu?: typeof cpuSpecificationsSchema,
    gpu?: typeof gpuSpecificationSchema,
    motherboard?: typeof motherboardSpecificationSchema,
    ram?: typeof ramSpecificationSchema,
    case?: typeof caseSpecificationSchema,
  };
  warranty: Date;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  manufacturer: { type: String, required: true },
  stockQuantity: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
  visible: { type: Boolean, required: true, default: false },
  subcategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', required: true },
  productType: { type: String, enum: ['CPU', 'RAM', 'Motherboard', 'GPU', 'Case'], required: true },
  specifications: {
    type: {
      cpu: cpuSpecificationsSchema,
      gpu: gpuSpecificationSchema,
      motherboard: motherboardSpecificationSchema,
      ram: ramSpecificationSchema,
      case: caseSpecificationSchema,
    },
    required: true
  },
  warranty: { type: Date, default: null },
});

export const Product = model<IProduct>("Product", productSchema);