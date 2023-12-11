import mongoose, { Document, Schema, model } from "mongoose";

// Definição das interfaces para cada especificação






interface IRamSpecifications {
  size?: number;
  frequency?: number;
  type?: string;
}

interface ICaseSpecifications {
  length?: number;
  width?: number;
  height?: number;
  material?: string;
}

// Interface para o campo specifications
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

// Interface para o documento do produto
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

// Esquemas para cada especificação
// Esquemas para cada especificação





const motherboardSpecificationSchema = new Schema<IMotherboardSpecifications>({
  manufacturer: { type: String, required: true },
  chipset: { type: String, required: true },
  formFactor: { type: String, required: true }
});

const ramSpecificationSchema = new Schema<IRamSpecifications>({
  size: { type: Number, required: true },
  frequency: { type: Number, required: true },
  type: { type: String, required: true }
});

const caseSpecificationSchema = new Schema<ICaseSpecifications>({
  length: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  material: { type: String, required: true }
});


// Esquema do produto
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
    validate: {
      validator: function (v: ISpecifications) {
        return v.cpu || v.gpu || v.motherboard || v.ram || v.case;
      },
      message: 'Pelo menos uma especificação (CPU, GPU, Motherboard, RAM, Case) é necessária.'
    }
  },
  warranty: { type: Date, default: null },
});

productSchema.pre('validate', function (next) {
  if (!this.specifications || Object.keys(this.specifications).length === 0) {
    this.invalidate('specifications', 'Pelo menos uma especificação é necessária.');
  }
  next();
});

export const Product = model<IProduct>("Product", productSchema);
